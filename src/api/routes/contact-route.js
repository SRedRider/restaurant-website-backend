const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact-controller');
const { isAdmin, isAdminOrUser, isUserOrAdmin } = require('../../middleware/auth-middleware');

router.post('/', isAdminOrUser, contactController.addContact);
router.get('/', isAdminOrUser, contactController.getAllContacts);
router.get('/user', isAdminOrUser, contactController.getUserContacts);
router.get('/:id', isAdminOrUser, contactController.getContactById);
module.exports = router;