const { fetchRandomByDifficultyAndTag } = require('../models/repository');

// @desc Fetch questions by difficulty and topicTag
// @route GET /questions
// @access Public
const getQuestionsByDifficultyAndTag = async (req, res) => {
    try {
        const { difficulty, tag, size = "5" } = req.query;

        if (!difficulty || !tag) {
            return res.status(400).json({ error: "Query parameters 'difficulty' and 'tag' are required" });
        }

        const sampleSize = Math.min(100, Math.max(1, parseInt(size, 10) || 5));

        const rows = await fetchRandomByDifficultyAndTag({
          difficulty,
          tag,
          size: sampleSize,
        });

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getQuestionsByDifficultyAndTag };