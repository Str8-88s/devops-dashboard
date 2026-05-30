import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { Prisma } from '../generated/prisma/client'
import { AppError } from '../lib/AppError';
import { io } from '../lib/socket';
import { rateLimitByIp } from '../lib/rateLimiter';
import redis from '../lib/redis';
import { ApiResponse } from '../types/api'
import logger from '../lib/logger'

export async function register(req: Request, res: Response, next: NextFunction) {
  logger.debug('register controller hit')
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

    
    io.emit('activity', {
      type: 'user:registered',
      message: `${name || email} joined`,
      timestamp: new Date().toISOString(),
    })
    logger.debug({ clients: io.sockets.sockets.size }, 'activity emitted: user registered')

    res.status(201).json({ 
    status: 'success', 
    data: { user, accessToken } 
  } satisfies ApiResponse<{ user: typeof user; accessToken: string }>)
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(new AppError(409, 'Email already in use'))
    }
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  logger.debug({ ip: req.ip }, 'login attempt')
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

    res.status(200).json({ 
    status: 'success', 
    data: { user: userWithoutPassword, accessToken } 
  } satisfies ApiResponse<{ user: typeof userWithoutPassword; accessToken: string }>)
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

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId as string;

    const cached = await redis.get(`user:${userId}`);
    if (cached) {
      logger.debug({ userId }, 'cache hit for user')
    return res.status(200).json({ 
      status: 'success', 
      data: JSON.parse(cached) 
    } satisfies ApiResponse<typeof user>)
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300);

    res.status(200).json({ 
    status: 'success', 
    data: user 
  } satisfies ApiResponse<typeof user>)
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return next(new AppError(404, 'User not found'));
    }
    next(err);
  }
}