const { body } = require('express-validator');

const gpsBody = () => [
    body('latitude')
        .exists({ checkNull: true })
        .withMessage('Latitude is required')
        .bail()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be a number between -90 and 90')
        .toFloat(),
    body('longitude')
        .exists({ checkNull: true })
        .withMessage('Longitude is required')
        .bail()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be a number between -180 and 180')
        .toFloat(),
];

const checkInValidator = [
    ...gpsBody(),
    body('notes')
        .optional({ nullable: true })
        .isString()
        .withMessage('Notes must be a string')
        .isLength({ max: 500 })
        .withMessage('Notes must be at most 500 characters')
        .trim(),
];

const checkOutValidator = gpsBody();

module.exports = {
    checkInValidator,
    checkOutValidator,
};