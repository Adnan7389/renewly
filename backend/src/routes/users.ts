import express from 'express';
import userController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user preferences
router.get('/preferences', authenticateToken, (req, res) => {
    userController.getPreferences(req, res);
});

// Update user preferences
router.put('/preferences', authenticateToken, (req, res) => {
    userController.updatePreferences(req, res);
});

export default router;
