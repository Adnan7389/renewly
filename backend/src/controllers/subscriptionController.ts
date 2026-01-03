import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { calculateNextFutureRenewalDate } from '../utils/renewalUtils';

export const getSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: (req as any).user.userId },
            include: {
                category: true,
                tags: true,
            },
            orderBy: { startDate: 'asc' },
        });

        const mappedSubscriptions = subscriptions.map(sub => ({
            ...sub,
            nextRenewalDate: calculateNextFutureRenewalDate(sub.startDate, sub.frequency)
        }));

        res.json(mappedSubscriptions);
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const { name, cost, startDate, frequency, description, categoryId, tags } = req.body;

        if (!name || !cost || !startDate || !frequency) {
            return res.status(400).json({
                error: 'Name, cost, start date, and frequency are required'
            });
        }

        const subscription = await prisma.subscription.create({
            data: {
                name,
                cost: parseFloat(cost),
                startDate: new Date(startDate),
                frequency,
                description,
                userId: (req as any).user.userId,
                categoryId,
                tags: tags ? {
                    connect: tags.map((tagId: string) => ({ id: tagId }))
                } : undefined,
            },
            include: {
                category: true,
                tags: true,
            },
        });

        const mappedSubscription = {
            ...subscription,
            nextRenewalDate: calculateNextFutureRenewalDate(subscription.startDate, subscription.frequency)
        };

        res.status(201).json(mappedSubscription);
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, cost, startDate, frequency, description, categoryId, tags } = req.body;

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
                startDate: startDate ? new Date(startDate) : undefined,
                frequency,
                description,
                categoryId,
                tags: tags ? {
                    set: tags.map((tagId: string) => ({ id: tagId }))
                } : undefined,
            },
            include: {
                category: true,
                tags: true,
            },
        });

        const mappedSubscription = {
            ...subscription,
            nextRenewalDate: calculateNextFutureRenewalDate(subscription.startDate, subscription.frequency)
        };

        res.json(mappedSubscription);
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