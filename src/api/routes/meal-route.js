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

router.post('/', isAdmin, upload.single('image'), mealController.addMeal);
router.get('/', checkVisibleAccess, mealController.getAllMeals);
router.get('/:id', checkVisibleAccess, mealController.getMealById);
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), mealController.updateMeal);

module.exports = router;
