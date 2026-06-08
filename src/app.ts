import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import logger from './lib/logger';
import prisma from './lib/prisma';
import redis from './lib/redis';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';
import githubRouter from './routes/github.routes';
import repoRouter from './routes/repo.routes'

export const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/repos', repoRouter)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRouter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`,
    });
  });
  next();
});

app.get('/health', async (req: Request, res: Response) => {
  const health: Record<string, string> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'healthy';
  } catch {
    health.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await redis.ping();
    health.redis = 'healthy';
  } catch {
    health.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'degraded' ? 503 : 200;
  res.status(statusCode).json(health);
});

// Serve React static build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all — return index.html for any non-API route
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.use(errorHandler);