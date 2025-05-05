// routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant-schedule-controller');
const { isAdmin, checkVisibleAccess } = require('../../middleware/auth-middleware');

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
