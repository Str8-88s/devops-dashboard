import { Router } from 'express';
import { getWorkflowRuns } from '../controllers/github.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/workflows', authenticate, getWorkflowRuns);

export default router; 