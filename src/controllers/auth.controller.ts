import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { Prisma } from '../generated/prisma/client'

export async function register(req: Request, res: Response) {
    const { email, password, name } = req.body

    try {
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

        res.status(201).json({ status: 'success', data: { user, accessToken, refreshToken } })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            res.status(409).json({ status: 'error', message: 'Email already in use' })
            return
        }
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' })
      return
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ status: 'success', data: { user: userWithoutPassword, accessToken } })
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    res.status(401).json({ status: 'error', message: 'Refresh token required' })
    return
  }

  try {
    const payload = verifyRefreshToken(refreshToken)

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })

    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' })
      return
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
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' })
  }
}

export async function logout(req: Request, res: Response) {
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
}