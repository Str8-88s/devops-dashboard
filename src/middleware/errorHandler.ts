import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import logger from '../lib/logger';
import { Sentry } from '../lib/sentry';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, 'Client error')
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  Sentry.captureException(err);
  logger.error({ err }, 'Unhandled error')
  res.status(500).json({ error: 'Internal server error' });
}