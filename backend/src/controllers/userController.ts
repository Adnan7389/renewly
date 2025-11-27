import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    userId?: string;
}

class UserController {
    async getPreferences(req: AuthRequest, res: Response) {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    reminderDays: true,
                },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ reminderDays: user.reminderDays });
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            res.status(500).json({ error: 'Failed to fetch preferences' });
        }
    }

    async updatePreferences(req: AuthRequest, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            const { reminderDays } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Validate reminderDays
            if (typeof reminderDays !== 'number' || reminderDays < 1 || reminderDays > 30) {
                return res.status(400).json({
                    error: 'Invalid reminderDays value. Must be a number between 1 and 30.'
                });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { reminderDays },
                select: {
                    reminderDays: true,
                },
            });

            res.json({
                message: 'Preferences updated successfully',
                reminderDays: updatedUser.reminderDays
            });
        } catch (error) {
            console.error('Error updating user preferences:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    }
}

export default new UserController();
