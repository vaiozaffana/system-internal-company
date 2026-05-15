const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.helper');

const buildHandler = (message) => (req, res) => {
    return errorResponse(res, message, 429);
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: buildHandler('Too many requests, please try again later'),
});

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: buildHandler('Too many login attempts. Please try again in 5 minutes'),
});

module.exports = {
    apiLimiter,
    authLimiter,
};
