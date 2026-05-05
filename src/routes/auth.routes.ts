import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import { CreateUserSchema } from '../schemas/user.schema'
import { LoginSchema } from '../schemas/auth.schema'

const router = Router()

router.post('/register', validate(CreateUserSchema), register)
router.post('/login', validate(LoginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router