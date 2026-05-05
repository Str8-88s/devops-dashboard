import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ status: 'error', message: 'No token provided' })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = verifyAccessToken(token)
        res.locals.userId = payload.userId
        next()
    } catch (err) {
        res.status(401).json({ status: 'error', message: 'Invalid or expired token' })
    }
}