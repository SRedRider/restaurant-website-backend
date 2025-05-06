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
 * @api {post} /api/v1/meals Add a New Meal
 * @apiName AddMeal
 * @apiGroup Meals
 * @apiDescription Add a new meal to the menu.
 *
 * @apiBody {String} name The name of the meal.
 * @apiBody {String} description The description of the meal.
 * @apiBody {Number} price The price of the meal.
 * @apiBody {String} image_url The URL of the meal's image.
 * @apiBody {String} visible Visibility status of the meal (yes/no).
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} id The ID of the created meal.
 *
 * @apiError {String} error Error message if the meal creation fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.post('/', isAdmin, upload.single('image'), mealController.addMeal);
router.get('/', checkVisibleAccess, mealController.getAllMeals);
router.get('/:id', checkVisibleAccess, mealController.getMealById);
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), mealController.updateMeal);
router.delete('/:id', isAdmin, mealController.deleteMeal);

module.exports = router;
