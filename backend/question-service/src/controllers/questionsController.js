const Question = require("../models/questionModel");

// @desc Fetch questions by difficulty and topicTag
// @route GET /api/questions
// @access Public
const getQuestionsByDifficultyAndTag = async (req, res) => {
    try {
        const { difficulty, tag, limit="5", page="1" } = req.query;

        // Validate input
        if (!difficulty || !tag) {
            return res.status(400).json({ error: "Query parameters 'difficulty' and 'tag' are required" });
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 5));
        const skip = (pageNum - 1) * pageSize;

        // Query MongoDB
        const questions = await Question.find({
            difficulty: difficulty,
            "topicTags.slug": tag
        })
        .select("title titleSlug difficulty topicTags question exampleTestcases")
        .skip(skip)
        .limit(pageSize)
        .lean();

        res.status(200).json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getQuestionsByDifficultyAndTag };