const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const { isAdmin } = require('../../middleware/auth-middleware');
const itemController = require('../controllers/item-controller');


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


router.post('/', isAdmin, upload.single('image'), itemController.addItem);
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.delete('/:id', isAdmin, itemController.deleteItem);
router.get('/:id/checkMeal', itemController.checkItemMealAssociation);
router.put('/:id', isAdmin, upload.single('image'), itemController.updateItem);


module.exports = router;
