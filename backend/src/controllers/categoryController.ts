import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: (req as any).user.userId },
            orderBy: { name: 'asc' },
        });

        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const category = await prisma.category.create({
            data: {
                name,
                color,
                userId: (req as any).user.userId,
            },
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existingCategory = await prisma.category.findFirst({
            where: { id, userId: (req as any).user.userId },
        });

        if (!existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await prisma.category.delete({
            where: { id },
        });

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
