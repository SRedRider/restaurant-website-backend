// routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant-schedule-controller');
const { isAdmin, checkVisibleAccess } = require('../../middleware/auth-middleware');

/**
 * @api {post} /api/v1/schedule Add a New Schedule
 * @apiName AddSchedule
 * @apiGroup Restaurant Schedule
 * @apiDescription Add a new schedule for the restaurant.
 *
 * @apiBody {String} date The date of the schedule.
 * @apiBody {String} opening_time The opening time.
 * @apiBody {String} closing_time The closing time.
 * @apiBody {String} status The status of the schedule (e.g., open/close).
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} id The ID of the created schedule.
 *
 * @apiError {String} error Error message if the schedule creation fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
// Add a new schedule
router.post('/', isAdmin, restaurantController.addSchedule);

// Get all schedules sorted by date
router.get('/', checkVisibleAccess, restaurantController.getSchedules);

router.get('/:id', checkVisibleAccess, restaurantController.getScheduleById);
// Update an existing schedule
router.put('/:id', isAdmin, restaurantController.updateSchedule);

// Delete a schedule
router.delete('/:id', isAdmin, restaurantController.deleteSchedule);

module.exports = router;
