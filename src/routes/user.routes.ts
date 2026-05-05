import { Router } from 'express'
import { createUser, getUser, updateUser, deleteUser } from '../controllers/user.controller'
import { validate } from '../middleware/validate'
import { CreateUserSchema, UpdateUserSchema } from '../schemas/user.schema'


const router = Router()


router.post('/', validate(CreateUserSchema), createUser)
router.get('/:id', getUser)
router.put('/:id', validate(UpdateUserSchema), updateUser)
router.delete('/:id', deleteUser)

export default router