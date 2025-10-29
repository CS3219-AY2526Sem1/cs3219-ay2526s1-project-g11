const express = require('express');
const { getTopicTags } = require('../controllers/topicsController');
const router = express.Router();

router.get('/', getTopicTags);

module.exports = router;