const express = require('express');
const { searchAll } = require('../controllers/search-controller');

const router = express.Router();

router.get('/', searchAll);

module.exports = router;