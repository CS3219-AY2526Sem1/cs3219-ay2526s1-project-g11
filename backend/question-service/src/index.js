const express = require('express');
const dotenv = require('dotenv').config();
const { connectDB } = require('./db');
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8080;

app.use('/questions', require('./routes/questionRoutes'));
app.use('/topics', require('./routes/topicRoutes'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`)
});

module.exports = app;