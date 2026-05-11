const express = require('express');
const attendanceController = require('./attendance.controller');

const router = express.Router();

router.post('/check-in/:userId', attendanceController.checkIn);
router.post('/check-out/:userId', attendanceController.checkOut);
router.get('/', attendanceController.getAll);
router.get('/:id', attendanceController.getById);
router.get('/user/:userId', attendanceController.getByUser);
router.delete('/:id', attendanceController.delete);

module.exports = router;
