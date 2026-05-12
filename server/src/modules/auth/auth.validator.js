const { body } = require('express-validator');

const loginValidator = [
    body('email')
        .exists({ checkNull: true })
        .withMessage('Email is required')
        .bail()
        .isString()
        .withMessage('Email must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .bail()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email is too long'),
    body('password')
        .exists({ checkNull: true })
        .withMessage('Password is required')
        .bail()
        .isString()
        .withMessage('Password must be a string')
        .bail()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters'),
];

module.exports = {
    loginValidator,
};
