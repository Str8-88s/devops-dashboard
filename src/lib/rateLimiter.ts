import redis from './redis';
import { AppError } from './AppError';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

export async function rateLimitByIp(ip: string, route: string): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;

  try {
    const key = `rate:${route}:${ip}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    if (requests > MAX_REQUESTS) {
      throw new AppError(429, 'Too many requests — try again in a minute');
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    // Redis unavailable — fail open, don't block the request
  }
}