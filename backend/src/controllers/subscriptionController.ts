import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: (req as any).user.userId },
            orderBy: { renewalDate: 'asc' },
        });

        res.json(subscriptions);
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const { name, cost, renewalDate, frequency, description } = req.body;

        if (!name || !cost || !renewalDate || !frequency) {
            return res.status(400).json({
                error: 'Name, cost, renewal date, and frequency are required'
            });
        }

        const subscription = await prisma.subscription.create({
            data: {
                name,
                cost: parseFloat(cost),
                renewalDate: new Date(renewalDate),
                frequency,
                description,
                userId: (req as any).user.userId,
            },
        });

        res.status(201).json(subscription);
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, cost, renewalDate, frequency, description } = req.body;

        // Check if subscription belongs to user
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id, userId: (req as any).user.userId },
        });

        if (!existingSubscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const subscription = await prisma.subscription.update({
            where: { id },
            data: {
                name,
                cost: cost ? parseFloat(cost) : undefined,
                renewalDate: renewalDate ? new Date(renewalDate) : undefined,
                frequency,
                description,
            },
        });

        res.json(subscription);
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if subscription belongs to user
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id, userId: (req as any).user.userId },
        });

        if (!existingSubscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await prisma.subscription.delete({
            where: { id },
        });

        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Delete subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};