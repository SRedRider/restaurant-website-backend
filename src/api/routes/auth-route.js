const express = require('express');
const authController = require('../controllers/auth-controller');
const { isAdmin } = require('../../middleware/auth-middleware');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/verify', authController.verifyEmail);
router.get('/users', isAdmin, authController.getAllUsers);
// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

module.exports = router;
