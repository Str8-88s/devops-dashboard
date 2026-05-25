import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import redis from '../lib/redis';
import logger from '../lib/logger';


const CACHE_KEY = 'github:workflow_runs';
const CACHE_TTL = 300; // 5 minutes

export async function getWorkflowRuns(req: Request, res: Response, next: NextFunction) {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/runs?per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      throw new AppError(response.status, `GitHub API error: ${response.statusText}`);
    }

    const data = await response.json() as { workflow_runs: any[] };

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
    }));

    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(runs));

    res.json(runs);
  } catch (err) {
    next(err);
  }
}