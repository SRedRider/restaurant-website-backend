const express = require('express');
const { searchAll } = require('../controllers/search-controller');

const router = express.Router();

/**
 * @api {get} /api/v1/search Search All
 * @apiName SearchAll
 * @apiGroup Search
 * @apiDescription Search across announcements, items, and meals.
 *
 * @apiHeader {String} Authorization Bearer token (optional).
 *
 * @apiQuery {String} query The search query string (required).
 *
 * @apiSuccess {Object[]} announcements List of announcements matching the query.
 * @apiSuccess {String} announcements.id The ID of the announcement.
 * @apiSuccess {String} announcements.title The title of the announcement.
 * @apiSuccess {String} announcements.content The content of the announcement.
 * @apiSuccess {Object[]} items List of items matching the query.
 * @apiSuccess {String} items.id The ID of the item.
 * @apiSuccess {String} items.name The name of the item.
 * @apiSuccess {String} items.description The description of the item.
 * @apiSuccess {Object[]} meals List of meals matching the query.
 * @apiSuccess {String} meals.id The ID of the meal.
 * @apiSuccess {String} meals.name The name of the meal.
 * @apiSuccess {String} meals.description The description of the meal.
 *
 *
 * @apiError {Object} error Error response object.
 * @apiError {String} error.error Error message.
 *
 */

router.get('/', searchAll);

module.exports = router;