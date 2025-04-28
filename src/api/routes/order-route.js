// api/routes/order-route.js
const express = require('express');
const { createNewOrder, getOrders, getOrder, editOrder } = require('../controllers/order-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

// Route to create a new order
router.post('/', checkVisibleAccess, createNewOrder);

// Route to get all orders
router.get('/', isAdmin, getOrders);

router.get('/:orderId', isAdminOrUser, checkVisibleAccess, getOrder);

router.put('/:orderId', isAdminOrUser, editOrder);

module.exports = router;
