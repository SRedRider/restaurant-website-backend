const express = require('express');
const reservationController = require('../controllers/reservation-controller');

const router = express.Router();

// Book a reservation
router.post('/', reservationController.bookReservation);

// Get all reservations
router.get('/', reservationController.getReservations);

router.get('/available-days', reservationController.getAvailableDays);

// Fetch reservation tables
router.get('/tables', reservationController.getReservationTables);

// Fetch a reservation table by ID
router.get('/tables/:id', reservationController.getReservationTableById);

// Update a reservation table
router.put('/tables/:id', reservationController.updateReservationTable);

router.post('/test', reservationController.testReservationAvailability);

// Get reservation by ID
router.get('/:id', reservationController.getReservationById);

// Update reservation
router.put('/:id', reservationController.updateReservation);

// Delete reservation
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;