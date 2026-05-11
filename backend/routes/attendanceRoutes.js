const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/check-in/:employeeId', attendanceController.checkIn);
router.post('/check-out/:employeeId', attendanceController.checkOut);
router.get('/', attendanceController.getAll);
router.get('/:id', attendanceController.getById);
router.get('/employee/:employeeId', attendanceController.getByEmployee);
router.delete('/:id', attendanceController.delete);

module.exports = router;
