const { body } = require('express-validator');

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const updateConfigValidator = [
    body('workStartTime')
        .exists()
        .withMessage('workStartTime is required')
        .bail()
        .isString()
        .withMessage('workStartTime must be a string')
        .matches(timePattern)
        .withMessage('workStartTime must be in HH:mm format'),
    body('workEndTime')
        .exists()
        .withMessage('workEndTime is required')
        .bail()
        .isString()
        .withMessage('workEndTime must be a string')
        .matches(timePattern)
        .withMessage('workEndTime must be in HH:mm format'),
    body('lateToleranceMinutes')
        .exists()
        .withMessage('lateToleranceMinutes is required')
        .bail()
        .isInt({ min: 0, max: 120 })
        .withMessage('lateToleranceMinutes must be between 0 and 120')
        .toInt(),
    body('earlyCheckInMaxHours')
        .exists()
        .withMessage('earlyCheckInMaxHours is required')
        .bail()
        .isFloat({ min: 0, max: 12 })
        .withMessage('earlyCheckInMaxHours must be between 0 and 12')
        .toFloat(),
    body('lateCheckInMaxHours')
        .exists()
        .withMessage('lateCheckInMaxHours is required')
        .bail()
        .isFloat({ min: 0, max: 12 })
        .withMessage('lateCheckInMaxHours must be between 0 and 12')
        .toFloat(),
    body('minWorkDurationHours')
        .exists()
        .withMessage('minWorkDurationHours is required')
        .bail()
        .isFloat({ min: 0, max: 24 })
        .withMessage('minWorkDurationHours must be between 0 and 24')
        .toFloat(),
];

module.exports = {
    updateConfigValidator,
};
