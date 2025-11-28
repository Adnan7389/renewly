import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getTags,
    createTag,
    deleteTag,
} from '../controllers/tagController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);

export default router;
