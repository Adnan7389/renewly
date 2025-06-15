const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;