import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                status: 'error',
                errors: result.error.flatten().fieldErrors
            })
            return
        }

        //Replace req.body with the parsed, validated data
        req.body = result.data
        next()
    }
}