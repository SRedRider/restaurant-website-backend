const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');

/**
 * @api {post} /api/v1/contacts/ Add a new contact
 * @apiName AddContact
 * @apiGroup Contact
 * @apiPermission AdminOrUser
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiBody {String} title The title of the contact (required).
 * @apiBody {String} description The description of the contact (required).
 * 
 * @apiSuccess (201 Created) {String} message Success message.
 * @apiSuccess (201 Created) {Number} id The ID of the newly created contact.
 * 
 * @apiError (400 Bad Request) {String} error All fields are required.
 * @apiError (500 Internal Server Error) {String} error Database error.
 * @apiError (500 Internal Server Error) {String} details Error details.
 */
router.post('/', isAdminOrUser, contactController.addContact);

/**
 * @api {get} /api/v1/contacts/ Get all contacts
 * @apiName GetAllContacts
 * @apiGroup Contact
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiSuccess (200 OK) {Object[]} contacts List of all contacts.
 * 
 * @apiError (500 Internal Server Error) {String} error Database error.
 * @apiError (500 Internal Server Error) {String} details Error details.
 */
router.get('/', isAdmin, contactController.getAllContacts);

/**
 * @api {get} /api/v1/contacts/user Get contacts for the authenticated user
 * @apiName GetUserContacts
 * @apiGroup Contact
 * @apiPermission AdminOrUser
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiSuccess (200 OK) {Object[]} contacts List of user-specific contacts.
 * 
 * @apiError (500 Internal Server Error) {String} error Database error.
 * @apiError (500 Internal Server Error) {String} details Error details.
 */
router.get('/user', isAdminOrUser, contactController.getUserContacts);

/**
 * @api {get} /api/v1/contacts/:id Get a contact by ID
 * @apiName GetContactById
 * @apiGroup Contact
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiParam {Number} id The ID of the contact (required).
 * 
 * @apiSuccess (200 OK) {Object} contact The contact details.
 * 
 * @apiError (403 Forbidden) {String} error Access denied.
 * @apiError (404 Not Found) {String} error Contact not found.
 * @apiError (500 Internal Server Error) {String} error Database error.
 * @apiError (500 Internal Server Error) {String} details Error details.
 */
router.get('/:id', isAdmin, contactController.getContactById);

/**
 * @api {put} /api/v1/contacts/:id Edit a contact
 * @apiName EditContact
 * @apiGroup Contact
 * @apiPermission Admin
 * 
 * @apiHeader {String} Authorization Bearer token.
 * 
 * @apiParam {Number} id The ID of the contact (required).
 * 
 * @apiBody {String} title The updated title of the contact (required).
 * @apiBody {String} description The updated description of the contact (required).
 * @apiBody {String} status The updated status of the contact (required).
 * 
 * @apiSuccess (200 OK) {String} message Success message.
 * 
 * @apiError (400 Bad Request) {String} error Title, description, and status are required.
 * @apiError (403 Forbidden) {String} error Access denied.
 * @apiError (404 Not Found) {String} error Contact not found.
 * @apiError (500 Internal Server Error) {String} error Database error.
 * @apiError (500 Internal Server Error) {String} details Error details.
 */
router.put('/:id', isAdmin, contactController.editContact);

module.exports = router;