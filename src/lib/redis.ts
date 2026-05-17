import Redis from 'ioredis';
import logger from './logger';

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { lazyConnect: true })
  : new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      lazyConnect: true,
      retryStrategy: process.env.NODE_ENV === 'test' ? () => null : undefined,
    });

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

export default redis;
