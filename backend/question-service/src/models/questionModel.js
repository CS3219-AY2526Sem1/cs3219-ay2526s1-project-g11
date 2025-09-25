const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    titleSlug: { type: String, required: true },
    difficulty: { type: String, required: true }, // Easy, Medium, Hard
    topicTags: [{
        name: { type: String, required: true },
        slug: { type: String, required: true }
    }],
    question: { type: String, required: true },
    exampleTestcases: { type: String }
});

QuestionSchema.index({ difficulty: 1 });

QuestionSchema.index({ "topicTags.slug": 1 });

QuestionSchema.index({ difficulty: 1, "topicTags.slug": 1 });

module.exports = mongoose.model("Question", QuestionSchema);