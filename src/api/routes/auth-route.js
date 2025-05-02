const express = require('express');
const authController = require('../controllers/auth-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/verify', authController.verifyEmail);
router.get('/users', authController.getAllUsers);
// Forgot password route
router.post('/forgot-password', authController.forgotPassword);
// Reset password route
router.post('/reset-password', authController.resetPassword);

// Get current user by token
router.get('/users/token', isAdminOrUser, authController.getCurrentUser);
// Add route to update current user
router.put('/users/update', isAdminOrUser, authController.updateCurrentUser);

// Add routes for managing favourites
router.post('/favourites', isAdminOrUser, authController.addFavouriteItem);
router.delete('/favourites', isAdminOrUser, authController.removeFavouriteItem);
router.get('/favourites', isAdminOrUser, authController.getFavouriteItems);

// Add routes for viewing, editing, and deleting users
router.get('/users/:id' , authController.getUserById);
router.put('/users/:id', authController.updateUserById);
router.delete('/users/:id', authController.deleteUserById);

module.exports = router;
