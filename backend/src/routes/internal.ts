import { Router, Request, Response } from 'express';
import { cronAuth } from '../middleware/cronAuth';
import cronService from '../services/cronService';

const router = Router();

/**
 * @route POST /api/internal/ping
 * @desc Securely wake up the server (warm-up)
 * @access Private (Cron Secret)
 */
router.post('/ping', cronAuth, (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Server is awake and warm',
        timestamp: new Date().toISOString()
    });
});

/**
 * @route POST /api/internal/run-reminders
 * @desc Externally trigger the daily subscription reminder email job
 * @access Private (Cron Secret)
 */
router.post('/run-reminders', cronAuth, (req: Request, res: Response) => {
    console.log('⚡ External trigger received: run-reminders');
    
    // Trigger the business logic in the background to avoid timeouts
    cronService.sendDailyReminders()
        .then(() => console.log('✅ Background reminder job finished'))
        .catch(error => console.error('❌ Background reminder job failed:', error));
    
    // Return 202 Accepted immediately
    res.status(202).json({
        success: true,
        message: 'Reminder job accepted and running in background',
        timestamp: new Date().toISOString()
    });
});

export default router;
