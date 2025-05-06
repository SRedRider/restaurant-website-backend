const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { isAdmin, checkVisibleAccess } = require('../../middleware/auth-middleware');
const mealController = require('../controllers/meal-controller');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Set upload folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9); // Unique name
        cb(null, uniqueName + ext); // Save with correct extension
    }
});

const upload = multer({ storage });

/**
 * @api {post} /api/v1/meals/ Add a new meal
 * @apiName AddMeal
 * @apiGroup Meal
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 * @apiBody {String} name Name of the meal (required).
 * @apiBody {String} description Description of the meal (required).
 * @apiBody {Number} price Price of the meal (required, must be a positive number).
 * @apiBody {String} [hamburgerId] ID of the hamburger item (optional).
 * @apiBody {String} [wrapId] ID of the wrap item (optional).
 * @apiBody {String} [chicken_burgerId] ID of the chicken burger item (optional).
 * @apiBody {String} [veganId] ID of the vegan item (optional).
 * @apiBody {String} [sideId] ID of the side item (optional).
 * @apiBody {String} [breakfastId] ID of the breakfast item (optional).
 * @apiBody {String} [dessertId] ID of the dessert item (optional).
 * @apiBody {String} [drinkId] ID of the drink item (optional).
 * @apiBody {String} visible Visibility status of the meal (required).
 * @apiBody {File} image Image file for the meal (required).
 * @apiSuccess (201) {String} message Success message.
 * @apiSuccess (201) {Number} id ID of the newly created meal.
 * @apiSuccess (201) {String} image_url URL of the uploaded image.
 * @apiError (400) {String} message Validation error message.
 * @apiError (500) {String} error Database error message.
 */
router.post('/', isAdmin, upload.single('image'), mealController.addMeal);

/**
 * @api {get} /api/v1/meals/ Get all meals
 * @apiName GetAllMeals
 * @apiGroup Meal
 * @apiHeader {String} Authorization Bearer token for authentication (optional for public access).
 * @apiSuccess (200) {Object[]} meals List of meals.
 * @apiSuccess (200) {Number} meals.id ID of the meal.
 * @apiSuccess (200) {String} meals.name Name of the meal.
 * @apiSuccess (200) {String} meals.description Description of the meal.
 * @apiSuccess (200) {Number} meals.price Price of the meal.
 * @apiSuccess (200) {Object} meals.item_ids Consolidated item IDs.
 * @apiSuccess (200) {String} meals.type Type of the meal (always "meal").
 * @apiError (500) {String} error Database error message.
 */
router.get('/', checkVisibleAccess, mealController.getAllMeals);

/**
 * @api {get} /api/v1/meals/:id Get meal by ID
 * @apiName GetMealById
 * @apiGroup Meal
 * @apiHeader {String} Authorization Bearer token for authentication (optional for public access).
 * @apiParam {Number} id ID of the meal.
 * @apiSuccess (200) {Number} id ID of the meal.
 * @apiSuccess (200) {String} name Name of the meal.
 * @apiSuccess (200) {String} description Description of the meal.
 * @apiSuccess (200) {Number} price Price of the meal.
 * @apiSuccess (200) {Object} item_ids Consolidated item IDs.
 * @apiSuccess (200) {String} type Type of the meal (always "meal").
 * @apiError (404) {String} error Meal not found.
 * @apiError (500) {String} error Database error message.
 */
router.get('/:id', checkVisibleAccess, mealController.getMealById);

/**
 * @api {put} /api/v1/meals/:id Update a meal
 * @apiName UpdateMeal
 * @apiGroup Meal
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 * @apiParam {Number} id ID of the meal to update.
 * @apiBody {String} name Name of the meal (required).
 * @apiBody {String} description Description of the meal (required).
 * @apiBody {Number} price Price of the meal (required, must be a positive number).
 * @apiBody {String} [hamburger_id] ID of the hamburger item (optional).
 * @apiBody {String} [wrap_id] ID of the wrap item (optional).
 * @apiBody {String} [chicken_burger_id] ID of the chicken burger item (optional).
 * @apiBody {String} [vegan_id] ID of the vegan item (optional).
 * @apiBody {String} [side_id] ID of the side item (optional).
 * @apiBody {String} [breakfast_id] ID of the breakfast item (optional).
 * @apiBody {String} [dessert_id] ID of the dessert item (optional).
 * @apiBody {String} [drink_id] ID of the drink item (optional).
 * @apiBody {String} visible Visibility status of the meal (required).
 * @apiBody {File} [image] Image file for the meal (optional).
 * @apiSuccess (200) {String} message Success message.
 * @apiError (400) {String} message Validation error message.
 * @apiError (404) {String} message Meal not found.
 * @apiError (500) {String} error Database error message.
 */
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), mealController.updateMeal);

/**
 * @api {delete} /api/v1/meals/:id Delete a meal
 * @apiName DeleteMeal
 * @apiGroup Meal
 * @apiHeader {String} Authorization Bearer token for admin authentication.
 * @apiParam {Number} id ID of the meal to delete.
 * @apiSuccess (200) {String} message Success message.
 * @apiError (404) {String} message Meal not found.
 * @apiError (500) {String} error Database error message.
 */
router.delete('/:id', isAdmin, mealController.deleteMeal);

module.exports = router;
