// routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant-schedule-controller');

// Add a new schedule
router.post('/', restaurantController.addSchedule);

// Get all schedules sorted by date
router.get('/', restaurantController.getSchedules);

module.exports = router;
