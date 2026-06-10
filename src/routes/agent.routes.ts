import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { agentChat } from '../controllers/agent.controller';

const router = Router();

router.post('/chat', authenticate, agentChat);

export default router;