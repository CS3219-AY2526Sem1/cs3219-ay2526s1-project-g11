const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey || apiKey !== process.env.QUESTION_SERVICE_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: invalid API key' });
    }

    next(); // proceed to the route handler
};

module.exports = apiKeyAuth;
