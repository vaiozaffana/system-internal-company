const express = require('express');
const authRoutes = require('./modules/auth/auth.route');
const usersRoutes = require('./modules/users/users.route');
const attendanceRoutes = require('./modules/attendance/attendance.route');
const attendanceConfigRoutes = require('./modules/attendance-config/attendanceConfig.route');
const leaveRoutes = require('./modules/leave/leave.route');
const notificationRoutes = require('./modules/notification/notification.route');
const auditRoutes = require('./modules/audit/audit.route');
const payrollRoutes = require('./modules/payroll/payroll.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/attendance-config', attendanceConfigRoutes);
router.use('/leave', leaveRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/payroll', payrollRoutes);

module.exports = router;
