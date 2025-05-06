const express = require('express');
const reservationController = require('../controllers/reservation-controller');
const { isAdmin, isAdminOrUser, checkVisibleAccess } = require('../../middleware/auth-middleware');

const router = express.Router();

/**
 * @api {post} /api/v1/reservations Book a reservation
 * @apiName BookReservation
 * @apiGroup Reservations
 * @apiDescription Books a reservation for a specific date and time.
 *
 * @apiHeader {String} Authorization Bearer token for authentication.
 *
 * @apiBody {String} date Reservation date in YYYY-MM-DD format. (required)
 * @apiBody {String} time Reservation time in HH:mm format. (required)
 * @apiBody {Number} guest_count Number of guests. (required, 1-10)
 * @apiBody {String} name Name of the person making the reservation. (required)
 * @apiBody {String} phone Phone number in Finnish format (+358XXXXXXXXX or 0XXXXXXXXX). (required)
 * @apiBody {String} email Email address. (required, valid email format)
 * @apiBody {String} [notes] Additional notes for the reservation. (optional)
 *
 * @apiSuccess {Boolean} success Indicates if the reservation was successful.
 * @apiSuccess {String} reservationId Unique ID of the reservation.
 * @apiSuccess {Array} allocatedTables List of allocated table IDs.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "reservationId": "12345",
 *      "allocatedTables": [1, 2]
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Validation Error:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "success": false,
 *      "message": "Invalid phone number format."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "An error occurred while booking the reservation."
 *    }
 */
router.post('/', reservationController.bookReservation);

/**
 * @api {get} /api/v1/reservations Get all reservations
 * @apiName GetReservations
 * @apiGroup Reservations
 * @apiDescription Fetches all reservations.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiSuccess {Array} reservations List of all reservations.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "reservationId": "12345",
 *        "name": "John Doe",
 *        "date": "2025-05-06",
 *        "time": "18:00",
 *        "guest_count": 4
 *      }
 *    ]
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error fetching reservations."
 *    }
 */
router.get('/', isAdmin, reservationController.getReservations);

/**
 * @api {get} /api/v1/reservations/available-days Get available reservation days
 * @apiName GetAvailableDays
 * @apiGroup Reservations
 * @apiDescription Fetches days with available chairs and tables.
 *
 * @apiSuccess {Array} data List of available days with details.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "data": [
 *        {
 *          "date": "06.05.2025",
 *          "remainingChairs": 20,
 *          "allocatedTables": [1, 2],
 *          "status": "available"
 *        }
 *      ]
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error fetching available days."
 *    }
 */
router.get('/available-days', reservationController.getAvailableDays);

/**
 * @api {get} /api/v1/reservations/tables Fetch reservation tables
 * @apiName GetReservationTables
 * @apiGroup Reservations
 * @apiDescription Fetches all reservation tables.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiSuccess {Array} tables List of all tables.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "id": 1,
 *        "table_number": 101,
 *        "chairs": 4
 *      }
 *    ]
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error fetching reservation tables."
 *    }
 */
router.get('/tables', isAdmin, reservationController.getReservationTables);

/**
 * @api {post} /api/v1/reservations/tables Add a new table
 * @apiName AddReservationTable
 * @apiGroup Reservations
 * @apiDescription Adds a new reservation table.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiBody {Number} chairs Number of chairs for the table. (required)
 *
 * @apiSuccess {Boolean} success Indicates if the table was added successfully.
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 201 Created
 *    {
 *      "success": true,
 *      "message": "Table added successfully."
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Validation Error:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "success": false,
 *      "message": "All fields are required."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error adding table."
 *    }
 */
router.post('/tables', isAdmin, reservationController.addReservationTable);

/**
 * @api {get} /api/v1/reservations/tables/:id Fetch a reservation table by ID
 * @apiName GetReservationTableById
 * @apiGroup Reservations
 * @apiDescription Fetches a reservation table by its ID.
 *
 * @apiParam {Number} id Table ID. (required)
 *
 * @apiSuccess {Object} table Details of the table.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "id": 1,
 *      "table_number": 101,
 *      "chairs": 4
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Not Found:
 *    HTTP/1.1 404 Not Found
 *    {
 *      "success": false,
 *      "message": "Table not found."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error fetching table by ID."
 *    }
 */
router.get('/tables/:id', reservationController.getReservationTableById);

/**
 * @api {put} /api/v1/reservations/tables/:id Update a reservation table
 * @apiName UpdateReservationTable
 * @apiGroup Reservations
 * @apiDescription Updates a reservation table.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiParam {Number} id Table ID. (required)
 *
 * @apiBody {Number} table_number Table number. (required)
 * @apiBody {Number} chairs Number of chairs. (required)
 *
 * @apiSuccess {Boolean} success Indicates if the table was updated successfully.
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Table updated successfully."
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Validation Error:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "success": false,
 *      "message": "All fields are required."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error updating table."
 *    }
 */
router.put('/tables/:id', isAdmin, reservationController.updateReservationTable);

/**
 * @api {delete} /api/v1/reservations/tables/:id Delete a table
 * @apiName DeleteReservationTable
 * @apiGroup Reservations
 * @apiDescription Deletes a reservation table.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiParam {Number} id Table ID. (required)
 *
 * @apiSuccess {Boolean} success Indicates if the table was deleted successfully.
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Table deleted successfully."
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Not Found:
 *    HTTP/1.1 404 Not Found
 *    {
 *      "success": false,
 *      "message": "Table not found."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error deleting table."
 *    }
 */
router.delete('/tables/:id', isAdmin, reservationController.deleteReservationTable);

/**
 * @api {post} /api/v1/reservations/test Test reservation availability
 * @apiName TestReservationAvailability
 * @apiGroup Reservations
 * @apiDescription Tests reservation availability for a specific date and time.
 *
 * @apiBody {String} date Reservation date in YYYY-MM-DD format. (required)
 * @apiBody {String} time Reservation time in HH:mm format. (required)
 *
 * @apiSuccess {Boolean} success Indicates if the test was successful.
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Reservation availability tested successfully."
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Validation Error:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "success": false,
 *      "message": "Invalid date or time format."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error testing reservation availability."
 *    }
 */
router.post('/test', reservationController.testReservationAvailability);

/**
 * @api {get} /api/v1/reservations/:id Get reservation by ID
 * @apiName GetReservationById
 * @apiGroup Reservations
 * @apiDescription Fetches a reservation by its ID.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiParam {String} id Reservation ID. (required)
 *
 * @apiSuccess {Object} reservation Details of the reservation.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "reservationId": "12345",
 *      "name": "John Doe",
 *      "date": "2025-05-06",
 *      "time": "18:00",
 *      "guest_count": 4
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Not Found:
 *    HTTP/1.1 404 Not Found
 *    {
 *      "success": false,
 *      "message": "Reservation not found."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error fetching reservation by ID."
 *    }
 */
router.get('/:id', isAdmin, reservationController.getReservationById);

/**
 * @api {put} /api/v1/reservations/:id Update reservation
 * @apiName UpdateReservation
 * @apiGroup Reservations
 * @apiDescription Updates a reservation.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiParam {String} id Reservation ID. (required)
 *
 * @apiBody {String} date Reservation date in YYYY-MM-DD format. (required)
 * @apiBody {String} time Reservation time in HH:mm format. (required)
 * @apiBody {Number} guest_count Number of guests. (required, 1-10)
 * @apiBody {String} name Name of the person making the reservation. (required)
 * @apiBody {String} phone Phone number in Finnish format (+358XXXXXXXXX or 0XXXXXXXXX). (required)
 * @apiBody {String} email Email address. (required, valid email format)
 * @apiBody {String} [notes] Additional notes for the reservation. (optional)
 *
 * @apiSuccess {Boolean} success Indicates if the reservation was updated successfully.
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Reservation updated successfully."
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Validation Error:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "success": false,
 *      "message": "Invalid input data."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error updating reservation."
 *    }
 */
router.put('/:id', isAdmin, reservationController.updateReservation);

/**
 * @api {delete} /api/v1/reservations/:id Delete reservation
 * @apiName DeleteReservation
 * @apiGroup Reservations
 * @apiDescription Deletes a reservation.
 *
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 *
 * @apiParam {String} id Reservation ID. (required)
 *
 * @apiSuccess {Boolean} success Indicates if the reservation was deleted successfully.
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Reservation deleted successfully."
 *    }
 *
 * @apiError {Boolean} success Indicates if the operation failed.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Not Found:
 *    HTTP/1.1 404 Not Found
 *    {
 *      "success": false,
 *      "message": "Reservation not found."
 *    }
 *
 * @apiErrorExample {json} Server Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      "success": false,
 *      "message": "Error deleting reservation."
 *    }
 */
router.delete('/:id', isAdmin, reservationController.deleteReservation);

module.exports = router;