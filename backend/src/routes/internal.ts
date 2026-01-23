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
router.post('/run-reminders', cronAuth, async (req: Request, res: Response) => {
    console.log('⚡ External trigger received: run-reminders');
    
    try {
        // Trigger the business logic directly
        await cronService.sendDailyReminders();
        
        res.json({
            success: true,
            message: 'Reminder job triggered successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Failed to run external reminder job:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete reminder job'
        });
    }
});

export default router;
