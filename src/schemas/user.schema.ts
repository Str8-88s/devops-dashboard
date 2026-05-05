import { z } from 'zod'

export const CreateUserSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100)
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    email: z.email('Invalid email format').optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>