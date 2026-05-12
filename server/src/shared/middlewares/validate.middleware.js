const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response.helper');

const validate = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            await validation.run(req);
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const formatted = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return errorResponse(res, 'Validation failed', 400, formatted);
    };
};

module.exports = validate;
