import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

/**
 * GET /api/analytics/spending-trends
 * Query params: range (number of months, default 12)
 */
export const getSpendingTrends = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const range = parseInt(req.query.range as string) || 12;

        if (range < 1 || range > 36) {
            return res.status(400).json({ error: 'Range must be between 1 and 36 months' });
        }

        const data = await analyticsService.calculateMonthlySpending(userId, range);
        res.json(data);
    } catch (error) {
        console.error('Get spending trends error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/analytics/category-breakdown
 */
export const getCategoryBreakdown = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const data = await analyticsService.getCategoryBreakdown(userId);
        res.json(data);
    } catch (error) {
        console.error('Get category breakdown error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/analytics/year-over-year
 * Query params: year1, year2 (default to current year and previous year)
 */
export const getYearOverYear = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const currentYear = new Date().getFullYear();

        const year1 = parseInt(req.query.year1 as string) || currentYear - 1;
        const year2 = parseInt(req.query.year2 as string) || currentYear;

        if (year1 < 2000 || year2 < 2000 || year1 > currentYear + 1 || year2 > currentYear + 1) {
            return res.status(400).json({ error: 'Invalid year range' });
        }

        if (year1 >= year2) {
            return res.status(400).json({ error: 'year1 must be less than year2' });
        }

        const data = await analyticsService.getYearOverYearComparison(userId, year1, year2);
        res.json(data);
    } catch (error) {
        console.error('Get year-over-year error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/analytics/upcoming-costs
 * Query params: days (default 30)
 */
export const getUpcomingCosts = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const days = parseInt(req.query.days as string) || 30;

        if (days < 1 || days > 365) {
            return res.status(400).json({ error: 'Days must be between 1 and 365' });
        }

        const data = await analyticsService.getUpcomingCosts(userId, days);
        res.json(data);
    } catch (error) {
        console.error('Get upcoming costs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/analytics/insights
 */
export const getInsights = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const data = await analyticsService.generateInsights(userId);
        res.json(data);
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
