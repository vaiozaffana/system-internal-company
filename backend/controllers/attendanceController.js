const attendanceService = require('../services/attendanceService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const attendanceController = {
    async checkIn(req, res) {
        try {
            const { latitude, longitude, notes } = req.body;
            const employeeId = req.params.employeeId;

            const attendance = await attendanceService.checkIn(
                employeeId,
                latitude,
                longitude,
                notes
            );
            return successResponse(res, attendance, 'Check-in successful', 201);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    },

    async checkOut(req, res) {
        try {
            const { latitude, longitude } = req.body;
            const employeeId = req.params.employeeId;

            const attendance = await attendanceService.checkOut(employeeId, latitude, longitude);
            return successResponse(res, attendance, 'Check-out successful');
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    },

    async getById(req, res) {
        try {
            const attendance = await attendanceService.getAttendanceById(req.params.id);
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    },

    async getByEmployee(req, res) {
        try {
            const employeeId = req.params.employeeId;
            const filters = {
                startDate: req.query.start_date,
                endDate: req.query.end_date,
                limit: req.query.limit,
            };

            const attendance = await attendanceService.getEmployeeAttendance(employeeId, filters);
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    },

    async getAll(req, res) {
        try {
            const filters = {
                department: req.query.department,
                startDate: req.query.start_date,
                endDate: req.query.end_date,
                limit: req.query.limit,
            };

            const attendance = await attendanceService.getAllAttendance(filters);
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    async delete(req, res) {
        try {
            const result = await attendanceService.deleteAttendance(req.params.id);
            return successResponse(res, result, 'Attendance record deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    },
};

module.exports = attendanceController;
