// api/routes/order-route.js
const express = require('express');
const { createNewOrder, getOrders, getOrder, editOrder, getOrdersByUser } = require('../controllers/order-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

// Route to create a new order
router.post('/', checkVisibleAccess, createNewOrder);

// Route to get all orders
router.get('/', isAdmin, getOrders);

router.get('/:orderId', isAdminOrUser, checkVisibleAccess, getOrder);

router.put('/:orderId', isAdmin, editOrder);

// Add a new route to get orders for a specific user
router.get('/user/:userId', isAdminOrUser, checkVisibleAccess, getOrdersByUser);

module.exports = router;
