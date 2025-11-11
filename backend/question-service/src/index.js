const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const { connectDB } = require('./db');
connectDB();

const app = express();

const corsOptions = {
  origin: ["https://cs3219-ay2526s1-project-g11.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8081;

app.use('/questions', require('./routes/questionRoutes'));
app.use('/topics', require('./routes/topicRoutes'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`)
});

module.exports = app;