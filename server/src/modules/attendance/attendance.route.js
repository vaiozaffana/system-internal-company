const express = require('express');
const attendanceController = require('./attendance.controller');
const { checkInValidator, checkOutValidator } = require('./attendance.validator');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const validate = require('../../shared/middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/check-in', validate(checkInValidator), attendanceController.checkIn);
router.post('/check-out', validate(checkOutValidator), attendanceController.checkOut);
router.get('/check-location', attendanceController.checkLocation);
router.get('/config', attendanceController.getConfig);
router.get('/me/today', attendanceController.getMyToday);
router.get('/me', attendanceController.getMyHistory);

router.get('/', attendanceController.getAll);
router.get('/:id', attendanceController.getById);
router.get('/user/:userId', attendanceController.getByUser);
router.delete('/:id', attendanceController.delete);

module.exports = router;
