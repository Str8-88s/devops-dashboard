import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { Prisma } from '../generated/prisma/client'
import { AppError } from '../lib/AppError';
import { io } from '../lib/socket';
import { rateLimitByIp } from '../lib/rateLimiter';

export async function register(req: Request, res: Response, next: NextFunction) {
  console.log('register controller hit')
  try {
    await rateLimitByIp(req.ip ?? 'unknown', 'register');
    const { email, password, name } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true }
    })

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    console.log('about to emit')
    io.emit('activity', {
      type: 'user:registered',
      message: `${name || email} joined`,
      timestamp: new Date().toISOString(),
    })
    console.log('emitted, clients:', io.sockets.sockets.size)

    res.status(201).json({ status: 'success', data: { user, accessToken } })
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(new AppError(409, 'Email already in use'))
    }
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  console.log(req.ip)
  try {
    await rateLimitByIp(req.ip ?? 'unknown', 'login');
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return next(new AppError(401, 'Invalid credentials'))
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return next(new AppError(401, 'Invalid credentials'))
    }

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    const { password: _, ...userWithoutPassword } = user

      io.emit('activity', {
      type: 'user:login',
      message: `${user.name || user.email} logged in`,
      timestamp: new Date().toISOString(),
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ status: 'success', data: { user: userWithoutPassword, accessToken } })
  } catch (err: unknown) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return next(new AppError(401, 'Refresh token required'))
  }

  try {
    const payload = verifyRefreshToken(refreshToken)

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })

    if (!stored || stored.expiresAt < new Date()) {
      return next(new AppError(401, 'Invalid or expired refresh token'))
    }

    const accessToken = signAccessToken(payload.userId)
    const newRefreshToken = signRefreshToken(payload.userId)

    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ status: 'success', data: { accessToken } })
  } catch (err: unknown) {
    // verifyRefreshToken throws on malformed/expired token
    next(new AppError(401, 'Invalid or expired refresh token'))
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    res.status(200).json({ status: 'success', message: 'Logged out' })
  } catch (err: unknown) {
    next(err)
  }
}