const express = require('express');
const authController = require('../controllers/auth-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');
const router = express.Router();

/**
 * @api {post} /api/v1/auth/register Register User
 * @apiName RegisterUser
 * @apiGroup Authentication
 * @apiDescription Register a new user.
 *
 * @apiBody {String} email The email of the user.
 * @apiBody {String} password The password of the user.
 * @apiBody {String} name The name of the user.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} id The ID of the registered user.
 *
 * @apiError {String} error Error message if the registration fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/verify', authController.verifyEmail);
router.get('/users', isAdmin, authController.getAllUsers);
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
router.delete('/favourites/', isAdminOrUser, authController.removeFavouriteItem);
router.get('/favourites', isAdminOrUser, authController.getFavouriteItems);

// Add routes for viewing, editing, and deleting users
router.get('/users/:id', isAdmin, authController.getUserById);
router.put('/users/:id', isAdmin, authController.updateUserById);
router.delete('/users/:id', isAdmin, authController.deleteUserById);

module.exports = router;
