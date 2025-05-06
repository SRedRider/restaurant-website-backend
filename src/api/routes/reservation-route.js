const express = require('express');
const reservationController = require('../controllers/reservation-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

/**
 * @api {post} /api/v1/reservations Book a Reservation
 * @apiName BookReservation
 * @apiGroup Reservations
 * @apiDescription Book a new reservation for a table.
 *
 * @apiBody {String} name The name of the person making the reservation.
 * @apiBody {String} phone The phone number of the person making the reservation.
 * @apiBody {String} email The email address of the person making the reservation.
 * @apiBody {Number} guest_count The number of guests.
 * @apiBody {String} date The date of the reservation.
 * @apiBody {String} time The time of the reservation.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} reservation_id The ID of the created reservation.
 *
 * @apiError {String} error Error message if the reservation fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
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