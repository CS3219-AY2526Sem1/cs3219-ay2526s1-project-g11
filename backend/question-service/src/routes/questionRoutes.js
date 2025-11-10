const express = require('express')
const router = express.Router()

const {
    getQuestionsByDifficultyAndTags,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionsController');

const apiKeyAuth = require('../middlewares/authMiddleware');

router.get('/', getQuestionsByDifficultyAndTags);
router.get('/:id', getQuestionById);
router.post('/', apiKeyAuth, createQuestion);
router.put('/:id', apiKeyAuth, updateQuestion);
router.delete('/:id', apiKeyAuth, deleteQuestion);

module.exports = router;