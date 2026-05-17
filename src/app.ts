import 'dotenv/config';
import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import logger from './lib/logger'
import prisma from './lib/prisma';
import redis from './lib/redis';

export const app = express();

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        logger.info({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${Date.now() - start}ms`,
        })
    })
    next()
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use(errorHandler)

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

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});