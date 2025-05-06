const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const { isAdmin, checkVisibleAccess } = require('../../middleware/auth-middleware');
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

/**
 * @api {get} /api/v1/items Get All Items
 * @apiName GetAllItems
 * @apiGroup Items
 * @apiDescription Retrieve a list of all items available in the menu.
 *
 * @apiSuccess {Array} items List of items.
 * @apiSuccess {String} items.id The ID of the item.
 * @apiSuccess {String} items.name The name of the item.
 * @apiSuccess {String} items.description The description of the item.
 * @apiSuccess {Number} items.price The price of the item.
 *
 * @apiError {String} error Error message if the retrieval fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.get('/', checkVisibleAccess, itemController.getAllItems);
router.get('/:id', checkVisibleAccess, itemController.getItemById);
router.delete('/:id', isAdmin, itemController.deleteItem);
router.get('/:id/checkMeal', itemController.checkItemMealAssociation);
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), itemController.updateItem);


module.exports = router;
