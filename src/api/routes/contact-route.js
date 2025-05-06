const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');

/**
 * @api {post} /api/v1/contact Add a New Contact
 * @apiName AddContact
 * @apiGroup Contact
 * @apiDescription Add a new contact message.
 *
 * @apiBody {String} title The title of the contact message.
 * @apiBody {String} description The description of the contact message.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} id The ID of the created contact message.
 *
 * @apiError {String} error Error message if the contact creation fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.post('/', isAdminOrUser, contactController.addContact);
router.get('/', isAdmin, contactController.getAllContacts);
router.get('/user', isAdminOrUser, contactController.getUserContacts);
router.get('/:id', isAdmin, contactController.getContactById);
router.put('/:id', isAdmin, contactController.editContact);
module.exports = router;