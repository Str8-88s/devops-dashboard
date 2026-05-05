import { Request, Response } from 'express'
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema'
import prisma from '../lib/prisma'
import { Prisma } from '../generated/prisma/client'
import bcrypt from 'bcrypt'

export async function createUser(req: Request, res: Response) {
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
    } catch (err) {
    const error = err as Prisma.PrismaClientKnownRequestError
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json({ status: 'error', message: 'Email already in use' })
            return
        }
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}

export async function getUser(req: Request, res: Response) {
    const { id } = req.params as { id: string }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        })

        if (!user) {
            res.status(404).json({ status: 'error', message: 'User not found' })
            return
        }

        res.status(200).json({ status: 'success', data: user })
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}

export async function updateUser(req: Request, res: Response) {
    const { id } = req.params as { id: string }
    const input = req.body as UpdateUserInput

    try {
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

        res.status(200).json({ status: 'success', data: user })
    } catch (err) {
    const error = err as Prisma.PrismaClientKnownRequestError
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(404).json({ status: 'error', message: 'User not found' })
            return
        }
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}

export async function deleteUser(req: Request, res: Response) {
    const { id } = req.params as { id: string }

    try {
        await prisma.user.delete({
            where: { id }
        })

        res.status(204).send()
    }  catch (err) {
    const error = err as Prisma.PrismaClientKnownRequestError
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(404).json({ status: 'error', message: 'User not found' })
            return
        }
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}