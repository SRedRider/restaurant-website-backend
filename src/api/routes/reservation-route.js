const express = require('express');
const reservationController = require('../controllers/reservation-controller');

const router = express.Router();

// Book a reservation
router.post('/', reservationController.bookReservation);

// Get all reservations
router.get('/', reservationController.getReservations);

router.get('/available-days', reservationController.getAvailableDays);

router.post('/test', reservationController.testReservationAvailability);

module.exports = router;
