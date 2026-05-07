import 'dotenv/config';
import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes';
import prisma from './lib/prisma'
import authRoutes from './routes/auth.routes'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import logger from './lib/logger'

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`
    })
  })
  next()
})

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use(errorHandler);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})