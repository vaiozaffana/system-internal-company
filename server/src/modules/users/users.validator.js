const { body } = require('express-validator');

const createUserValidator = [
    body('employeeCode')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .isLength({ max: 50 })
        .withMessage('Employee code max 50 characters'),
    body('fullName')
        .exists()
        .withMessage('Full name is required')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ max: 255 })
        .withMessage('Full name max 255 characters'),
    body('email')
        .exists()
        .withMessage('Email is required')
        .bail()
        .isString()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail()
        .isLength({ max: 255 }),
    body('password')
        .exists()
        .withMessage('Password is required')
        .bail()
        .isString()
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be 6-128 characters'),
    body('phoneNumber')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 20 }),
    body('department')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 100 }),
    body('position')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 100 }),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be user or admin'),
];

const updateUserValidator = [
    body('fullName')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .isLength({ max: 255 }),
    body('email')
        .optional()
        .isString()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail()
        .isLength({ max: 255 }),
    body('phoneNumber')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 20 }),
    body('department')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 100 }),
    body('position')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 100 }),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be user or admin'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be boolean'),
];

module.exports = {
    createUserValidator,
    updateUserValidator,
};
