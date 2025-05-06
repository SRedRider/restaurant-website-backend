// routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant-schedule-controller');
const { isAdmin, checkVisibleAccess } = require('../../middleware/auth-middleware');

/**
 * @api {post} /api/v1/schedule/ Add a new schedule
 * @apiName AddSchedule
 * @apiGroup RestaurantSchedule
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiBody {String} date The date of the schedule (format: YYYY-MM-DD).
 * @apiBody {String} [open_time] The opening time (format: HH:mm:ss).
 * @apiBody {String} [close_time] The closing time (format: HH:mm:ss).
 * @apiBody {String="open","close"} status The status of the schedule.
 * @apiBody {String} [message] Additional message for the schedule.
 * 
 * @apiSuccess (201 Created) {String} message Success message.
 * @apiSuccess (201 Created) {Object} data The created schedule data.
 * @apiSuccess (201 Created) {Number} data.id The ID of the schedule.
 * @apiSuccess (201 Created) {String} data.date The date of the schedule.
 * @apiSuccess (201 Created) {String} [data.open_time] The opening time.
 * @apiSuccess (201 Created) {String} [data.close_time] The closing time.
 * @apiSuccess (201 Created) {String} data.status The status of the schedule.
 * @apiSuccess (201 Created) {String} [data.message] The additional message.
 * 
 * @apiError (400 Bad Request) {String} message Open time must be before close time.
 * @apiError (500 Internal Server Error) {String} message Error adding schedule.
 */
router.post('/', isAdmin, restaurantController.addSchedule);

/**
 * @api {get} /api/v1/schedule/ Get all schedules sorted by date
 * @apiName GetSchedules
 * @apiGroup RestaurantSchedule
 * @apiPermission Public
 * 
 * @apiHeader {String} [Authorization] Bearer token (optional for admin access).
 * 
 * @apiSuccess (200 OK) {Object[]} schedules List of schedules.
 * @apiSuccess (200 OK) {Number} schedules.id The ID of the schedule.
 * @apiSuccess (200 OK) {String} schedules.date The date of the schedule.
 * @apiSuccess (200 OK) {String} [schedules.open_time] The opening time.
 * @apiSuccess (200 OK) {String} [schedules.close_time] The closing time.
 * @apiSuccess (200 OK) {String} schedules.status The status of the schedule.
 * @apiSuccess (200 OK) {String} [schedules.message] The additional message.
 * 
 * @apiError (500 Internal Server Error) {String} message Error fetching schedules.
 */
router.get('/', checkVisibleAccess, restaurantController.getSchedules);

/**
 * @api {get} /api/v1/schedule/:id Get a specific schedule by ID
 * @apiName GetScheduleById
 * @apiGroup RestaurantSchedule
 * @apiPermission Public
 * 
 * @apiHeader {String} [Authorization] Bearer token (optional for admin access).
 * 
 * @apiParam {Number} id The ID of the schedule.
 * 
 * @apiSuccess (200 OK) {Number} id The ID of the schedule.
 * @apiSuccess (200 OK) {String} date The date of the schedule.
 * @apiSuccess (200 OK) {String} [open_time] The opening time.
 * @apiSuccess (200 OK) {String} [close_time] The closing time.
 * @apiSuccess (200 OK) {String} status The status of the schedule.
 * @apiSuccess (200 OK) {String} [message] The additional message.
 * 
 * @apiError (404 Not Found) {String} message Schedule not found.
 * @apiError (500 Internal Server Error) {String} message Error fetching schedule.
 */
router.get('/:id', checkVisibleAccess, restaurantController.getScheduleById);

/**
 * @api {put} /api/v1/schedule/:id Update an existing schedule
 * @apiName UpdateSchedule
 * @apiGroup RestaurantSchedule
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiParam {Number} id The ID of the schedule.
 * 
 * @apiBody {String} [date] The date of the schedule (format: YYYY-MM-DD).
 * @apiBody {String} [open_time] The opening time (format: HH:mm:ss).
 * @apiBody {String} [close_time] The closing time (format: HH:mm:ss).
 * @apiBody {String="open","close"} [status] The status of the schedule.
 * @apiBody {String} [message] Additional message for the schedule.
 * 
 * @apiSuccess (200 OK) {String} message Success message.
 * 
 * @apiError (400 Bad Request) {String} message Open time must be before close time.
 * @apiError (404 Not Found) {String} message Schedule not found.
 * @apiError (500 Internal Server Error) {String} message Error updating schedule.
 */
router.put('/:id', isAdmin, restaurantController.updateSchedule);

/**
 * @api {delete} /api/v1/schedule/:id Delete a schedule
 * @apiName DeleteSchedule
 * @apiGroup RestaurantSchedule
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiParam {Number} id The ID of the schedule.
 * 
 * @apiSuccess (200 OK) {String} message Success message.
 * 
 * @apiError (404 Not Found) {String} message Schedule not found.
 * @apiError (500 Internal Server Error) {String} message Error deleting schedule.
 */
router.delete('/:id', isAdmin, restaurantController.deleteSchedule);

module.exports = router;
