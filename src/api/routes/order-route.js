// api/routes/order-route.js
const express = require('express');
const { createNewOrder, getOrders, getOrder, editOrder, getOrdersByUser } = require('../controllers/order-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

/**
 * @api {post} /api/v1/orders Create a New Order
 * @apiName CreateOrder
 * @apiGroup Orders
 * @apiDescription Create a new order with the provided details.
 *
 * @apiBody {String} customer_name The name of the customer.
 * @apiBody {Array} items List of items in the order.
 * @apiBody {String} method The method of order (pickup/delivery).
 * @apiBody {String} [address] The delivery address (required if method is delivery).
 * @apiBody {Number} total_price The total price of the order.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} order_id The ID of the created order.
 *
 * @apiError {String} error Error message if the order creation fails.
 */
// Route to create a new order
router.post('/', checkVisibleAccess, createNewOrder);

// Route to get all orders
router.get('/', isAdmin, checkVisibleAccess, getOrders);

/**
 * @api {get} /api/v1/orders/:id Get Order by ID
 * @apiName GetOrderById
 * @apiGroup Orders
 * @apiDescription Retrieve details of a specific order by its ID.
 *
 * @apiParam {String} id The unique identifier of the order.
 *
 * @apiSuccess {String} order_id The ID of the order.
 * @apiSuccess {String} customer_name The name of the customer.
 * @apiSuccess {String} status The status of the order.
 * @apiSuccess {Array} items List of items in the order.
 * @apiSuccess {Number} total_price The total price of the order.
 *
 * @apiError {String} error Error message if the order is not found.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.get('/:orderId', isAdminOrUser, checkVisibleAccess, getOrder);

router.put('/:orderId', isAdmin, checkVisibleAccess, editOrder);

// Add a new route to get orders for a specific user
router.get('/user/:userId', isAdminOrUser, checkVisibleAccess, getOrdersByUser);

module.exports = router;
