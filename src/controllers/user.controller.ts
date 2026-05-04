import { Request, Response } from 'express'
import { CreateUserInput }  from '../schemas/user.schema'

export async function createUser(req: Request, res: Response) {
    const input = req.body as CreateUserInput

    //No DB yet - jsut echo back so you can verify the pipeline works
    res.status(201).json({
        status: 'success',
        data: {
            email: input.email,
            name: input.name
            // never echo password back, even in stubs - build the habit now
        }
    })
}

export async function getUser(req: Request, res: Response) {
    const { id } = req.params

    res.status(200).json({
        status: 'success',
        data: {
            id,
            email: 'thomas@example.com',
            name: 'Thomas'
        }
    })
}