import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await prisma.tag.findMany({
            where: { userId: (req as any).user.userId },
            orderBy: { name: 'asc' },
        });

        res.json(tags);
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                userId: (req as any).user.userId,
            },
        });

        res.status(201).json(tag);
    } catch (error) {
        console.error('Create tag error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existingTag = await prisma.tag.findFirst({
            where: { id, userId: (req as any).user.userId },
        });

        if (!existingTag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        await prisma.tag.delete({
            where: { id },
        });

        res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Delete tag error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
