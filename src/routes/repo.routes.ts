import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getTrackedRepo, upsertTrackedRepo, deleteTrackedRepo } from '../controllers/repo.controller'

const router = Router()

router.get('/', authenticate, getTrackedRepo)
router.post('/', authenticate, upsertTrackedRepo)
router.delete('/', authenticate, deleteTrackedRepo)

export default router