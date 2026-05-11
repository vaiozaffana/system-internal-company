const express = require('express');
const usersRoutes = require('./modules/users/users.route');
const attendanceRoutes = require('./modules/attendance/attendance.route');

const router = express.Router();

router.use('/users', usersRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;
