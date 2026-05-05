import { Router } from 'express'
import { createUser, getUser, updateUser, deleteUser } from '../controllers/user.controller'
import { validate } from '../middleware/validate'
import { CreateUserSchema, UpdateUserSchema } from '../schemas/user.schema'
import { authenticate } from '../middleware/auth'

const router = Router()


router.post('/', validate(CreateUserSchema), createUser)
router.get('/:id', authenticate, getUser)
router.put('/:id', authenticate, validate(UpdateUserSchema), updateUser)
router.delete('/:id', authenticate, deleteUser)

export default router