import { Request, Response, NextFunction } from 'express'
import  prisma  from '../lib/prisma'
import { AppError } from '../lib/AppError'

export async function getTrackedRepo(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId

    const repo = await prisma.trackedRepo.findUnique({
      where: { userId },
    })

    res.json(repo ?? null)
  } catch (err) {
    next(err)
  }
}

export async function upsertTrackedRepo(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId
    const { owner, repo, accessToken } = req.body

    if (!owner || !repo) {
      throw new AppError(400, 'owner and repo are required')
    }

    // TODO: encrypt accessToken at rest before production use — requires key management strategy
    const tracked = await prisma.trackedRepo.upsert({
      where: { userId },
      update: { owner, repo, accessToken: accessToken ?? null },
      create: { userId, owner, repo, accessToken: accessToken ?? null },
    })

    res.json(tracked)
  } catch (err) {
    next(err)
  }
}

export async function deleteTrackedRepo(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId

    const existing = await prisma.trackedRepo.findUnique({ where: { userId } })
    if (!existing) throw new AppError(404, 'No tracked repo found')

    await prisma.trackedRepo.delete({ where: { userId } })

    res.json({ message: 'Tracked repo removed' })
  } catch (err) {
    next(err)
  }
}