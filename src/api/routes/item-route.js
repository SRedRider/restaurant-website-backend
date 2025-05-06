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

/**
 * @api {post} /api/v1/items/ Add a new item
 * @apiName AddItem
 * @apiGroup Items
 * @apiPermission Admin
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {String} category Category of the item (required).
 * @apiBody {String} name Name of the item (required).
 * @apiBody {String} description Description of the item (required).
 * @apiBody {String} ingredients Ingredients of the item (required).
 * @apiBody {String} allergens Allergens in the item (optional).
 * @apiBody {String} size Size of the item (optional).
 * @apiBody {Number} price Price of the item (required).
 * @apiBody {File} image Image file for the item (required).
 * @apiBody {String} stock Stock status of the item (required, either "yes" or "no").
 * @apiBody {String} visible Visibility status of the item (required, either "yes" or "no").
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} id ID of the created item.
 * @apiSuccess {String} image_url URL of the uploaded image.
 *
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.post('/', isAdmin, upload.single('image'), itemController.addItem);

/**
 * @api {get} /api/v1/items/ Get all items
 * @apiName GetAllItems
 * @apiGroup Items
 * @apiPermission Public
 *
 * @apiHeader {String} Authorization Bearer token (optional).
 *
 * @apiSuccess {Object[]} items List of items.
 * @apiSuccess {String} items.id ID of the item.
 * @apiSuccess {String} items.name Name of the item.
 * @apiSuccess {String} items.description Description of the item.
 * @apiSuccess {String} items.ingredients Ingredients of the item.
 * @apiSuccess {String} items.allergens Allergens in the item.
 * @apiSuccess {String} items.size Size of the item.
 * @apiSuccess {Number} items.price Price of the item.
 * @apiSuccess {String} items.image_url URL of the item's image.
 * @apiSuccess {String} items.stock Stock status of the item.
 * @apiSuccess {String} items.visible Visibility status of the item.
 *
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.get('/', checkVisibleAccess, itemController.getAllItems);

/**
 * @api {get} /api/v1/items/:id Get item by ID
 * @apiName GetItemById
 * @apiGroup Items
 * @apiPermission Public
 *
 * @apiHeader {String} Authorization Bearer token (optional).
 *
 * @apiParam {Number} id ID of the item (required).
 *
 * @apiSuccess {String} id ID of the item.
 * @apiSuccess {String} name Name of the item.
 * @apiSuccess {String} description Description of the item.
 * @apiSuccess {String} ingredients Ingredients of the item.
 * @apiSuccess {String} allergens Allergens in the item.
 * @apiSuccess {String} size Size of the item.
 * @apiSuccess {Number} price Price of the item.
 * @apiSuccess {String} image_url URL of the item's image.
 * @apiSuccess {String} stock Stock status of the item.
 * @apiSuccess {String} visible Visibility status of the item.
 *
 * @apiError (404) NotFound Item not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.get('/:id', checkVisibleAccess, itemController.getItemById);

/**
 * @api {delete} /api/v1/items/:id Delete an item
 * @apiName DeleteItem
 * @apiGroup Items
 * @apiPermission Admin
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id ID of the item (required).
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiError (404) NotFound Item not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.delete('/:id', isAdmin, itemController.deleteItem);

/**
 * @api {get} /api/v1/items/:id/checkMeal Check item-meal association
 * @apiName CheckItemMealAssociation
 * @apiGroup Items
 * @apiPermission Public
 *
 * @apiHeader {String} Authorization Bearer token (optional).
 *
 * @apiParam {Number} id ID of the item (required).
 *
 * @apiSuccess {Boolean} isAssociatedWithMeal Whether the item is associated with a meal.
 *
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.get('/:id/checkMeal', itemController.checkItemMealAssociation);

/**
 * @api {put} /api/v1/items/:id Update an item
 * @apiName UpdateItem
 * @apiGroup Items
 * @apiPermission Admin
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id ID of the item (required).
 *
 * @apiBody {String} category Category of the item (optional).
 * @apiBody {String} name Name of the item (optional).
 * @apiBody {String} description Description of the item (optional).
 * @apiBody {String} ingredients Ingredients of the item (optional).
 * @apiBody {String} allergens Allergens in the item (optional).
 * @apiBody {String} size Size of the item (optional).
 * @apiBody {Number} price Price of the item (optional).
 * @apiBody {File} image Image file for the item (optional).
 * @apiBody {String} stock Stock status of the item (optional, either "yes" or "no").
 * @apiBody {String} visible Visibility status of the item (optional, either "yes" or "no").
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiError (404) NotFound Item not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.put('/:id', isAdmin, checkVisibleAccess, upload.single('image'), itemController.updateItem);


module.exports = router;
