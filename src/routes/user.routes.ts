import { Router } from 'express'
import { createUser, getUser } from '../controllers/user.controller'
import { validate } from '../middleware/validate'
import { CreateUserSchema } from '../schemas/user.schema'


const router = Router()


router.post('/', validate(CreateUserSchema), createUser)
router.get('/:id', getUser)

export default router