import Anthropic from '@anthropic-ai/sdk';
import { Request, Response, NextFunction } from 'express';
import  prisma  from '../lib/prisma';
import  redis  from '../lib/redis';
import { AppError } from '../lib/AppError';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'get_pipeline_health',
    description: 'Returns recent GitHub Actions workflow runs for the authenticated user\'s configured repo.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_commit_activity',
    description: 'Returns commit counts for the last 90 days for the authenticated user\'s configured repo.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_repo_config',
    description: 'Returns the repo the authenticated user has configured in the dashboard.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_system_health',
    description: 'Returns the current health status of the API and its dependencies (database, Redis).',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

async function executeTool(toolName: string, userId: string): Promise<string> {
  switch (toolName) {
    case 'get_pipeline_health': {
      const cacheKey = `github:workflow_runs:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const repo = await prisma.trackedRepo.findUnique({ where: { userId } });
      if (!repo) return JSON.stringify({ error: 'No repo configured' });

      const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/runs?per_page=10`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const data = await res.json() as { workflow_runs?: unknown[] };
      const result = JSON.stringify(data.workflow_runs ?? []);
      await redis.set(cacheKey, result, 'EX', 300);
      return result;
    }

    case 'get_commit_activity': {
      const cacheKey = `github:commit_activity:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const repo = await prisma.trackedRepo.findUnique({ where: { userId } });
      if (!repo) return JSON.stringify({ error: 'No repo configured' });

      const since = new Date();
      since.setDate(since.getDate() - 90);
      const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?since=${since.toISOString()}&per_page=100`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const commits = await res.json() as Array<{ commit: { author: { date: string } } }>;
      const activity: Record<string, number> = {};
      for (const c of commits) {
        const date = c.commit.author.date.split('T')[0];
        activity[date] = (activity[date] ?? 0) + 1;
      }
      const result = JSON.stringify(activity);
      await redis.set(cacheKey, result, 'EX', 300);
      return result;
    }

    case 'get_repo_config': {
      const repo = await prisma.trackedRepo.findUnique({ where: { userId } });
      if (!repo) return JSON.stringify({ error: 'No repo configured' });
      return JSON.stringify({ owner: repo.owner, repo: repo.repo });
    }

    case 'get_system_health': {
      const health: Record<string, string> = { api: 'healthy' };
      try {
        await prisma.$queryRaw`SELECT 1`;
        health.database = 'healthy';
      } catch {
        health.database = 'unhealthy';
      }
      try {
        await redis.ping();
        health.redis = 'healthy';
      } catch {
        health.redis = 'unhealthy';
      }
      return JSON.stringify(health);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

export async function agentChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = res.locals.userId as string;
    const { message, history = [] } = req.body as {
      message: string;
      history: Anthropic.MessageParam[];
    };

    if (!message) {
      throw new AppError(400, 'message is required');
    }

    const messages: Anthropic.MessageParam[] = [
      ...history,
      { role: 'user', content: message },
    ];

    let response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a helpful assistant embedded in a DevOps Dashboard. Answer questions about the user\'s pipeline health, commit activity, repo configuration, and system health using the tools available. Be concise and specific.',
      tools,
      messages,
    });

    // Agentic loop — keep going until no more tool calls
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: await executeTool(block.name, userId),
        }))
      );

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'You are a helpful assistant embedded in a DevOps Dashboard. Answer questions about the user\'s pipeline health, commit activity, repo configuration, and system health using the tools available. Be concise and specific.',
        tools,
        messages,
      });
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    const answer = textBlock?.text ?? 'No response generated.';

    messages.push({ role: 'assistant', content: answer });

    res.json({ reply: answer, history: messages });
  } catch (err) {
    next(err);
  }
}