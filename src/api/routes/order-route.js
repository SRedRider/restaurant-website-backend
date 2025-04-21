// api/routes/order-route.js
const express = require('express');
const { createNewOrder, getOrders, getOrder } = require('../controllers/order-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');

const router = express.Router();

// Route to create a new order
router.post('/', createNewOrder);

// Route to get all orders
router.get('/', getOrders);

router.get('/:orderId', isAdminOrUser, getOrder);

module.exports = router;
