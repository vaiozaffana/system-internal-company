const { errorResponse } = require('../utils/response.helper');

const notFoundHandler = (req, res) => {
    return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return errorResponse(
        res,
        message,
        statusCode,
        process.env.NODE_ENV === 'development' ? err.stack : null
    );
};

module.exports = {
    notFoundHandler,
    errorHandler,
};
