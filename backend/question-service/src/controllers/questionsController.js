const repository = require('../models/repository');

// @desc Fetch questions by difficulty and topicTag
// @route GET /questions
// @access Public
const getQuestionsByDifficultyAndTags = async (req, res) => {
    try {
        const { difficulty, tag, size = "5" } = req.query;

        if (!difficulty || !tag) {
            return res
                .status(400)
                .json({ error: "Query parameters 'difficulty' and 'tag' are required" });
        }

        // - User should pass ?tag=array&tag=math
        const tags = tag

        const sampleSize = Math.min(100, Math.max(1, parseInt(size, 10) || 5));

        const rows = await repository.fetchRandomByDifficultyAndTags({
            difficulty,
            tags,
            size: sampleSize,
        });

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

async function getQuestionById(req, res) {
    try {
        const id = req.params.id;
        const question = await repository.fetchQuestionById(id);
        res.status(200).json(question);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
}

async function createQuestion(req, res) {
    try {
        const { title, titleSlug, difficulty, question, exampleTestcases, topicTags } = req.body;
        const newQuestion = await repository.createQuestion({
            title,
            titleSlug,
            difficulty,
            question,
            exampleTestcases,
            topicTags
        });
        res.status(201).json(newQuestion);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function updateQuestion(req, res) {
    try {
        const id = req.params.id;
        const { title, titleSlug, difficulty, question, exampleTestcases, topicTags } = req.body;
        const updated = await repository.updateQuestion(id, {
            title,
            titleSlug,
            difficulty,
            question,
            exampleTestcases,
            topicTags
        });
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function deleteQuestion(req, res) {
    try {
        const id = req.params.id;
        await repository.deleteQuestion(id);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
}

module.exports = {
    getQuestionsByDifficultyAndTags,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion
};