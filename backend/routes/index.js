const express = require('express');
const router = express.Router();
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');

router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;
