const express = require('express')
const router = express.Router()

const { getQuestionsByDifficultyAndTag } = require("../controllers/questionsController");

router.route('/').get(getQuestionsByDifficultyAndTag);

module.exports = router;