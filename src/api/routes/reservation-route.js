const express = require('express');
const reservationController = require('../controllers/reservation-controller');

const router = express.Router();

// Book a reservation
router.post('/', reservationController.bookReservation);

// Get all reservations
router.get('/', reservationController.getReservations);

router.get('/available-days', reservationController.getAvailableDays);

module.exports = router;
