const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');

router.post('/', isAdminOrUser, contactController.addContact);
router.get('/', isAdmin, contactController.getAllContacts);
router.get('/user', isAdminOrUser, contactController.getUserContacts);
router.get('/:id', isAdmin, contactController.getContactById);
router.put('/:id', isAdmin, contactController.editContact);
module.exports = router;