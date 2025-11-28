import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getCategories,
    createCategory,
    deleteCategory,
} from '../controllers/categoryController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);

export default router;
