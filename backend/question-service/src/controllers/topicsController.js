const { fetchTopicTags } = require('../models/repository');

// @desc Fetch all topicTags
// @route GET /topics
// @access Public
const getTopicTags = async (req, res) => {
    try {
        const rows = await fetchTopicTags();
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getTopicTags };