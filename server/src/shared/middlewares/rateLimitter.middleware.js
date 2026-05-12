const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.helper');

const buildHandler = (message) => (req, res) => {
    return errorResponse(res, message, 429);
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: buildHandler('Too many requests, please try again later'),
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: buildHandler('Too many login attempts. Please try again in 15 minutes'),
});

module.exports = {
    apiLimiter,
    authLimiter,
};
