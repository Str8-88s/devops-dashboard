import { Router } from 'express';
import { getWorkflowRuns, getCommitActivity } from '../controllers/github.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/workflows', authenticate, getWorkflowRuns);
router.get('/commits', authenticate, getCommitActivity);

export default router;