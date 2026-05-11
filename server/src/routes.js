const express = require('express');
const usersRoutes = require('./modules/users/users.route');
const attendanceRoutes = require('./modules/attendance/attendance.route');
const payrollRoutes = require('./modules/payroll/payroll.route');

const router = express.Router();

router.use('/users', usersRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payroll', payrollRoutes);

module.exports = router;
