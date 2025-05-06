const express = require('express');
const { searchAll } = require('../controllers/search-controller');

const router = express.Router();

/**
 * @api {get} /api/v1/search Search All
 * @apiName SearchAll
 * @apiGroup Search
 * @apiDescription Search across announcements, items, and meals.
 *
 * @apiQuery {String} query The search term.
 *
 * @apiSuccess {Array} announcements List of matching announcements.
 * @apiSuccess {Array} items List of matching items.
 * @apiSuccess {Array} meals List of matching meals.
 *
 * @apiError {String} error Error message if the search fails.
 * @apiError (400) BadRequest Missing or invalid fields in the request.
 * @apiError (401) Unauthorized User is not authenticated.
 * @apiError (403) Forbidden User does not have permission to access this resource.
 * @apiError (404) NotFound The requested resource was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 */
router.get('/', searchAll);

module.exports = router;