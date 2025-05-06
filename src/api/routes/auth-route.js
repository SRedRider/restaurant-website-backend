const express = require('express');
const authController = require('../controllers/auth-controller');
const { isAdmin, isAdminOrUser } = require('../../middleware/auth-middleware');
const router = express.Router();

/**
 * @api {post} /api/v1/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email (required, valid email format).
 * @apiBody {String} name User's name (required).
 * @apiBody {String} password User's password (required, minimum 6 characters).
 * @apiBody {String} retype_password Retyped password (required, must match password).
 * 
 * @apiSuccess (201) {String} message Success message.
 * 
 * @apiError (400) {String} message Error message for invalid input or email already in use.
 * @apiError (500) {String} message Error message for server issues.
 */
router.post('/register', authController.registerUser);

/**
 * @api {post} /api/v1/login Login a user
 * @apiName LoginUser
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email (required, valid email format).
 * @apiBody {String} password User's password (required).
 * 
 * @apiSuccess (200) {String} message Success message.
 * @apiSuccess (200) {String} token JWT token for authentication.
 * @apiSuccess (200) {Object} data User details (id, name, email, role).
 * 
 * @apiError (400) {String} message Error message for invalid credentials or unverified account.
 * @apiError (500) {String} message Error message for server issues.
 */
router.post('/login', authController.loginUser);

/**
 * @api {get} /api/v1/verify Verify user email
 * @apiName VerifyEmail
 * @apiGroup Auth
 * 
 * @apiQuery {String} token Verification token (required).
 * 
 * @apiSuccess (200) {String} message Success message for verified email.
 * 
 * @apiError (400) {String} message Error message for invalid or expired token.
 * @apiError (500) {String} message Error message for server issues.
 */
router.get('/verify', authController.verifyEmail);

/**
 * @api {get} /api/v1/users Get all users
 * @apiName GetAllUsers
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required, admin only).
 * 
 * @apiSuccess (200) {Object[]} users List of users.
 * 
 * @apiError (500) {String} message Error message for server issues.
 */
router.get('/users', isAdmin, authController.getAllUsers);

/**
 * @api {post} /api/v1/forgot-password Request password reset
 * @apiName ForgotPassword
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email (required, valid email format).
 * 
 * @apiSuccess (200) {String} message Success message for password reset link sent.
 * 
 * @apiError (400) {String} message Error message for invalid email or unverified account.
 * @apiError (500) {String} message Error message for server issues.
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @api {post} /api/v1/reset-password Reset user password
 * @apiName ResetPassword
 * @apiGroup Auth
 * 
 * @apiQuery {String} token Reset token (required).
 * @apiBody {String} newPassword New password (required, minimum 6 characters).
 * @apiBody {String} retypePassword Retyped password (required, must match newPassword).
 * 
 * @apiSuccess (200) {String} message Success message for password reset.
 * 
 * @apiError (400) {String} message Error message for invalid token or mismatched passwords.
 * @apiError (500) {String} message Error message for server issues.
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @api {get} /api/v1/users/token Get current user by token
 * @apiName GetCurrentUser
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required).
 * 
 * @apiSuccess (200) {Object} user User details (id, name, email, role, status, verified).
 * 
 * @apiError (404) {String} message Error message for user not found.
 * @apiError (500) {String} message Error message for server issues.
 */
router.get('/users/token', isAdminOrUser, authController.getCurrentUser);

/**
 * @api {put} /api/v1/users/update Update current user
 * @apiName UpdateCurrentUser
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required).
 * @apiBody {String} email New email (required, valid email format).
 * @apiBody {String} name New name (required).
 * @apiBody {String} [password] New password (optional, minimum 6 characters).
 * @apiBody {String} [retypePassword] Retyped password (optional, must match password).
 * 
 * @apiSuccess (200) {String} message Success message for user update.
 * 
 * @apiError (400) {String} message Error message for invalid input or email already in use.
 * @apiError (500) {String} message Error message for server issues.
 */
router.put('/users/update', isAdminOrUser, authController.updateCurrentUser);

/**
 * @api {post} /api/v1/favourites Add favourite item
 * @apiName AddFavouriteItem
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required).
 * @apiBody {String} itemId ID of the item (required).
 * @apiBody {String} type Type of the item (required, must be 'item' or 'meal').
 * 
 * @apiSuccess (201) {String} message Success message for favourite added.
 * @apiSuccess (201) {Number} favouriteId ID of the added favourite.
 * 
 * @apiError (400) {String} message Error message for invalid input or duplicate favourite.
 * @apiError (500) {String} message Error message for server issues.
 */
router.post('/favourites', isAdminOrUser, authController.addFavouriteItem);

/**
 * @api {delete} /api/v1/favourites Remove favourite item
 * @apiName RemoveFavouriteItem
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required).
 * @apiBody {String} itemId ID of the item (required).
 * @apiBody {String} type Type of the item (required, must be 'item' or 'meal').
 * 
 * @apiSuccess (200) {String} message Success message for favourite removed.
 * 
 * @apiError (400) {String} message Error message for invalid input.
 * @apiError (404) {String} message Error message for favourite not found.
 * @apiError (500) {String} message Error message for server issues.
 */
router.delete('/favourites/', isAdminOrUser, authController.removeFavouriteItem);

/**
 * @api {get} /api/v1/favourites Get all favourite items
 * @apiName GetFavouriteItems
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required).
 * 
 * @apiSuccess (200) {Object[]} favourites List of favourite items.
 * 
 * @apiError (500) {String} message Error message for server issues.
 */
router.get('/favourites', isAdminOrUser, authController.getFavouriteItems);

/**
 * @api {get} /api/v1/users/:id Get user by ID
 * @apiName GetUserById
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required, admin only).
 * @apiParam {String} id User ID (required).
 * 
 * @apiSuccess (200) {Object} user User details.
 * 
 * @apiError (404) {String} message Error message for user not found.
 * @apiError (500) {String} message Error message for server issues.
 */
router.get('/users/:id', isAdmin, authController.getUserById);

/**
 * @api {put} /api/v1/users/:id Update user by ID
 * @apiName UpdateUserById
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required, admin only).
 * @apiParam {String} id User ID (required).
 * @apiBody {String} email New email (required, valid email format).
 * @apiBody {String} name New name (required).
 * @apiBody {String} role New role (required).
 * @apiBody {String} status New status (required).
 * 
 * @apiSuccess (200) {String} message Success message for user update.
 * 
 * @apiError (400) {String} message Error message for invalid input.
 * @apiError (404) {String} message Error message for user not found.
 * @apiError (500) {String} message Error message for server issues.
 */
router.put('/users/:id', isAdmin, authController.updateUserById);

/**
 * @api {delete} /api/v1/users/:id Delete user by ID
 * @apiName DeleteUserById
 * @apiGroup Auth
 * 
 * @apiHeader {String} Authorization Bearer token (required, admin only).
 * @apiParam {String} id User ID (required).
 * 
 * @apiSuccess (200) {String} message Success message for user deletion.
 * 
 * @apiError (404) {String} message Error message for user not found.
 * @apiError (500) {String} message Error message for server issues.
 */
router.delete('/users/:id', isAdmin, authController.deleteUserById);

module.exports = router;
