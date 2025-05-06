// api/routes/order-route.js
const express = require('express');
const { createNewOrder, getOrders, getOrder, editOrder, getOrdersByUser } = require('../controllers/order-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

/**
 * @api {post} /api/v1/orders Create a new order
 * @apiName CreateNewOrder
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiPermission User or Admin
 * 
 * @apiBody {String} customer_name Name of the customer (required).
 * @apiBody {String} customer_phone Phone number of the customer in Finnish format (required).
 * @apiBody {String} customer_email Email address of the customer (required).
 * @apiBody {Array} items List of items in the order (required).
 * @apiBody {String} method Order method, either "pickup" or "delivery" (required).
 * @apiBody {Object} [address] Address details for delivery orders.
 * @apiBody {String} [address.street] Street name (required for delivery).
 * @apiBody {String} [address.city] City name (required for delivery, must be Helsinki, Espoo, or Vantaa).
 * @apiBody {String} [address.postalCode] Postal code (required for delivery, must be 5 digits).
 * @apiBody {String} scheduled_time Scheduled time for the order (ISO date string or "now").
 * @apiBody {String} [notes] Additional notes for the order (optional).
 * @apiBody {Number} total_price Total price of the order (required).
 * 
 * @apiSuccess (201 Created) {String} message Success message.
 * @apiSuccess (201 Created) {Number} order_id ID of the created order.
 * @apiSuccess (201 Created) {Object} order Details of the created order.
 * 
 * @apiError (400 Bad Request) {String} message Validation error message.
 * @apiError (500 Internal Server Error) {String} message Error message for server issues.
 */
// Route to create a new order
router.post('/', checkVisibleAccess, createNewOrder);

/**
 * @api {get} /api/v1/orders Get all orders
 * @apiName GetOrders
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiPermission Admin
 * 
 * @apiSuccess (200 OK) {Array} orders List of all orders with enriched details.
 * 
 * @apiError (500 Internal Server Error) {String} message Error message for server issues.
 */
// Route to get all orders
router.get('/', isAdmin, checkVisibleAccess, getOrders);

/**
 * @api {get} /api/v1/orders/:orderId Get a specific order by ID
 * @apiName GetOrder
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiPermission User or Admin
 * 
 * @apiParam {Number} orderId ID of the order to retrieve.
 * 
 * @apiSuccess (200 OK) {Object} order Details of the requested order.
 * 
 * @apiError (403 Forbidden) {String} message Access denied error message.
 * @apiError (404 Not Found) {String} message Order not found error message.
 * @apiError (500 Internal Server Error) {String} message Error message for server issues.
 */
router.get('/:orderId', isAdminOrUser, checkVisibleAccess, getOrder);

/**
 * @api {put} /api/v1/orders/:orderId Edit an order
 * @apiName EditOrder
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiPermission Admin
 * 
 * @apiParam {Number} orderId ID of the order to edit.
 * 
 * @apiBody {String} customer_name Name of the customer (required).
 * @apiBody {String} customer_phone Phone number of the customer in Finnish format (required).
 * @apiBody {String} customer_email Email address of the customer (required).
 * @apiBody {Array} items List of items in the order (required).
 * @apiBody {String} method Order method, either "pickup" or "delivery" (required).
 * @apiBody {Object} [address] Address details for delivery orders.
 * @apiBody {String} [address.street] Street name (required for delivery).
 * @apiBody {String} [address.city] City name (required for delivery, must be Helsinki, Espoo, or Vantaa).
 * @apiBody {String} [address.postalCode] Postal code (required for delivery, must be 5 digits).
 * @apiBody {String} scheduled_time Scheduled time for the order (ISO date string or "now").
 * @apiBody {String} [notes] Additional notes for the order (optional).
 * @apiBody {Number} total_price Total price of the order (required).
 * @apiBody {String} status Status of the order (required).
 * 
 * @apiSuccess (200 OK) {String} message Success message.
 * @apiSuccess (200 OK) {Object} order Details of the updated order.
 * 
 * @apiError (400 Bad Request) {String} message Validation error message.
 * @apiError (403 Forbidden) {String} message Access denied error message.
 * @apiError (404 Not Found) {String} message Order not found error message.
 * @apiError (500 Internal Server Error) {String} message Error message for server issues.
 */
router.put('/:orderId', isAdmin, checkVisibleAccess, editOrder);

/**
 * @api {get} /api/v1/orders/user/:userId Get orders for a specific user
 * @apiName GetOrdersByUser
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiPermission User or Admin
 * 
 * @apiParam {Number} userId ID of the user to retrieve orders for.
 * 
 * @apiSuccess (200 OK) {Array} orders List of orders for the specified user with enriched details.
 * 
 * @apiError (403 Forbidden) {String} message Access denied error message.
 * @apiError (500 Internal Server Error) {String} message Error message for server issues.
 */
// Add a new route to get orders for a specific user
router.get('/user/:userId', isAdminOrUser, checkVisibleAccess, getOrdersByUser);

module.exports = router;
