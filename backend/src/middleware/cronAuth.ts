import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to secure internal cron endpoints
 * Checks for a secret key in the x-cron-secret header
 */
export const cronAuth = (req: Request, res: Response, next: NextFunction) => {
    const cronSecret = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
        console.warn('⚠️ CRON_SECRET is not set in environment variables. Internal routes are inaccessible.');
        return res.status(500).json({ error: 'Internal server configuration error' });
    }

    if (!cronSecret || cronSecret !== expectedSecret) {
        console.warn(`🔒 Unauthorized cron trigger attempt from IP: ${req.ip}`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
};
