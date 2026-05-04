import { Router } from 'express'
import { createUser } from '../controllers/user.controller'
import { validate } from '../middleware/validate'
import { CreateUserSchema } from '../schemas/user.schema'

const router = Router()

router.post('/', validate(CreateUserSchema), createUser)

export default router