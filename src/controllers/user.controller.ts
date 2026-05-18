import { Request, Response, NextFunction } from 'express'
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema'
import prisma from '../lib/prisma'
import { Prisma } from '../generated/prisma/client'
import bcrypt from 'bcrypt'
import { AppError } from '../lib/AppError';
import redis from '../lib/redis';

    export async function createUser(req: Request, res: Response, next: NextFunction) {
    const input = req.body as CreateUserInput

    try {
        const hashedPassword = await bcrypt.hash(input.password, 10)

        const user = await prisma.user.create({
        data: {
            email: input.email,
            name: input.name,
            password: hashedPassword
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
        })

        res.status(201).json({ status: 'success', data: user })
    } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return next(new AppError(409, 'Email already in use'))
        }
        next(err)
    }
}
    export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params as { id: string };
        const user = await prisma.user.findUniqueOrThrow({ where: { id } });
        res.json({ data: user });
    } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return next(new AppError(404, 'User not found'));
        }
        next(err);
    }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params as { id: string }
        const input = req.body as UpdateUserInput
        const user = await prisma.user.update({
            where: { id },
            data: input,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        })

        try { await redis.del(`user:${id}`); } catch {}

        res.json({ data: user });
    } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return next(new AppError(404, 'User not found'));
        }
        next(err);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params as { id: string }
        await prisma.user.delete({ where: { id } })

        try { await redis.del(`user:${id}`); } catch {}

        res.status(204).send()
    } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return next(new AppError(404, 'User not found'))
        }
        next(err)
    }
}
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId as string;

    const cached = await redis.get(`user:${userId}`);
    if (cached) {
      return res.json({ data: JSON.parse(cached) });
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300);

    res.json({ data: user });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return next(new AppError(404, 'User not found'));
    }
    next(err);
  }
}