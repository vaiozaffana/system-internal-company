const { body } = require('express-validator');

const createLeaveValidator = [
    body('type')
        .exists()
        .withMessage('Type is required')
        .bail()
        .isIn(['sakit', 'cuti', 'izin', 'dinas'])
        .withMessage('Type must be sakit, cuti, izin, or dinas'),
    body('startDate')
        .exists()
        .withMessage('Start date is required')
        .bail()
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .exists()
        .withMessage('End date is required')
        .bail()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('reason')
        .exists()
        .withMessage('Reason is required')
        .bail()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Reason is required')
        .isLength({ max: 1000 })
        .withMessage('Reason max 1000 characters'),
];

const reviewLeaveValidator = [
    body('status')
        .exists()
        .withMessage('Status is required')
        .bail()
        .isIn(['approved', 'rejected'])
        .withMessage('Status must be approved or rejected'),
    body('reviewNote')
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 }),
];

module.exports = {
    createLeaveValidator,
    reviewLeaveValidator,
};
