const authService = require('../services/auth.service');
const { errorResponse } = require('../utils/response.helper');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Authorization token is required', 401);
        }

        const token = authHeader.substring(7);
        const decoded = authService.verifyToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        return errorResponse(res, error.message, error.statusCode || 401);
    }
};

module.exports = authMiddleware;
