const Question = require("../models/questionModel");

// @desc Fetch questions by difficulty and topicTag
// @route GET /api/questions
// @access Public
const getQuestionsByDifficultyAndTag = async (req, res) => {
    try {
        const { difficulty, tag, size = "5" } = req.query;

        // Validate input
        if (!difficulty || !tag) {
            return res.status(400).json({ error: "Query parameters 'difficulty' and 'tag' are required" });
        }

        const sampleSize = Math.min(100, Math.max(1, parseInt(size, 10) || 5));

        const difficultyRegex = new RegExp(`^${difficulty}$`, "i");
        const tagRegex = new RegExp(`^${tag}$`, "i");

        const matchStage = {
            $and: [
                { difficulty: { $regex: difficultyRegex } },
                { "topicTags.slug": { $regex: tagRegex } }
            ],
        };

        // Query MongoDB
        const questions = await Question.aggregate([
            { $match: matchStage },
            { $sample: { size: sampleSize } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    titleSlug: 1,
                    difficulty: 1,
                    topicTags: 1,
                    question: 1,
                    exampleTestcases: 1
                }
            }
        ]);

        res.status(200).json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getQuestionsByDifficultyAndTag };