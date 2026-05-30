import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import redis from '../lib/redis';
import prisma from '../lib/prisma';
import { ApiResponse } from '../types/api'

const CACHE_TTL = 300; // 5 minutes

export async function getWorkflowRuns(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId

    // Pull repo config from DB, fall back to env vars
    const trackedRepo = await prisma.trackedRepo.findUnique({ where: { userId } })

    const owner = trackedRepo?.owner ?? process.env.GITHUB_REPO_OWNER
    const repo = trackedRepo?.repo ?? process.env.GITHUB_REPO_NAME
    const token = trackedRepo?.accessToken ?? process.env.GITHUB_TOKEN

    if (!owner || !repo) {
      throw new AppError(400, 'No GitHub repo configured. Add one in settings.')
    }

    // Scope cache key per user so different users get their own repo data
    const cacheKey = `github:workflow_runs:${userId}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.status(200).json({ status: 'success', data: JSON.parse(cached) } satisfies ApiResponse<typeof runs>)
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (!response.ok) {
      throw new AppError(response.status, `GitHub API error: ${response.statusText}`)
    }

    const data = await response.json() as { workflow_runs: any[] }

    const runs = data.workflow_runs.map((run: any) => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      url: run.html_url,
      duration: run.updated_at && run.created_at
        ? Math.round((new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000)
        : null,
    }))

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(runs))

    res.status(200).json({ status: 'success', data: runs } satisfies ApiResponse<typeof runs>)
  } catch (err) {
    next(err)
  }
}

export async function getCommitActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.userId

    const trackedRepo = await prisma.trackedRepo.findUnique({ where: { userId } })

    const owner = trackedRepo?.owner ?? process.env.GITHUB_REPO_OWNER
    const repo = trackedRepo?.repo ?? process.env.GITHUB_REPO_NAME
    const token = trackedRepo?.accessToken ?? process.env.GITHUB_TOKEN

    if (!owner || !repo) {
      throw new AppError(400, 'No GitHub repo configured. Add one in settings.')
    }

    const cacheKey = `github:commit_activity:${userId}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.status(200).json({ status: 'success', data: JSON.parse(cached) } satisfies ApiResponse<typeof result>)
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (!response.ok) {
      throw new AppError(response.status, `GitHub API error: ${response.statusText}`)
    }

    const data = await response.json() as any[]

    // Build a map of date -> commit count for the last 90 days
    const today = new Date()
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(today.getDate() - 90)

    const countsByDate: Record<string, number> = {}

    // Pre-fill all 90 days with 0
    for (let i = 0; i < 90; i++) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split('T')[0]
      countsByDate[key] = 0
    }

    // Count commits per day
   data.forEach((commit: any) => {
  const date = commit.commit?.author?.date?.split('T')[0]
  if (date && countsByDate[date] !== undefined) {
    countsByDate[date]++
  }
  })

    // Return as sorted array
    const result = Object.entries(countsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result))
    
    res.status(200).json({ status: 'success', data: result } satisfies ApiResponse<typeof result>)
  } catch (err) {
    next(err)
  }
}