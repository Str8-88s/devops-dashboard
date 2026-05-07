import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { AppError } from '../lib/AppError'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const messages = (Object.entries(result.error.flatten().fieldErrors) as [string, string[]][])
        .map(([field, errors]) => `${field}: ${(errors ?? []).join(', ')}`)
        .join('; ')

      return next(new AppError(400, messages))
    }

    req.body = result.data
    next()
  }
}