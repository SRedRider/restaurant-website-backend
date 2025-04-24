// api/routes/order-route.js
const express = require('express');
const { createNewOrder, getOrders, getOrder } = require('../controllers/order-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

// Route to create a new order
router.post('/', checkVisibleAccess, createNewOrder);

// Route to get all orders
router.get('/', checkVisibleAccess, getOrders);

router.get('/:orderId', isAdminOrUser, checkVisibleAccess, getOrder);

module.exports = router;
