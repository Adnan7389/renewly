import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;