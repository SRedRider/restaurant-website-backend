const express = require('express');
const reservationController = require('../controllers/reservation-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

// Book a reservation
router.post('/', reservationController.bookReservation);

// Get all reservations
router.get('/', isAdmin, reservationController.getReservations);

router.get('/available-days', reservationController.getAvailableDays);

// Fetch reservation tables
router.get('/tables', isAdmin, reservationController.getReservationTables);

// Add a new table
router.post('/tables', isAdmin, reservationController.addReservationTable);

// Fetch a reservation table by ID
router.get('/tables/:id', reservationController.getReservationTableById);

// Update a reservation table
router.put('/tables/:id', isAdmin, reservationController.updateReservationTable);

// Delete a table
router.delete('/tables/:id', isAdmin, reservationController.deleteReservationTable);

router.post('/test', reservationController.testReservationAvailability);

// Get reservation by ID
router.get('/:id', isAdmin, reservationController.getReservationById);

// Update reservation
router.put('/:id', isAdmin, reservationController.updateReservation);

// Delete reservation
router.delete('/:id', isAdmin, reservationController.deleteReservation);

module.exports = router;