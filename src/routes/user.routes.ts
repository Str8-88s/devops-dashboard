import { Router } from 'express'
import { createUser, getUserById, updateUser, deleteUser, getMe } from '../controllers/user.controller'
import { validate } from '../middleware/validate'
import { CreateUserSchema, UpdateUserSchema } from '../schemas/user.schema'
import { authenticate } from '../middleware/auth'

const router = Router()


router.get('/me', authenticate, getMe)
router.post('/', validate(CreateUserSchema), createUser)
router.get('/:id', authenticate, getUserById)
router.put('/:id', authenticate, validate(UpdateUserSchema), updateUser)
router.delete('/:id', authenticate, deleteUser)

export default router