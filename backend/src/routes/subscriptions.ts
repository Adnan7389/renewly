import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
} from '../controllers/subscriptionController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;