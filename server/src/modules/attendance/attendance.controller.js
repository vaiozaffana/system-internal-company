const attendanceService = require('./attendance.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const attendanceController = {
    async checkIn(req, res) {
        try {
            const { latitude, longitude, notes } = req.body;
            const attendance = await attendanceService.checkIn(
                req.params.userId,
                latitude,
                longitude,
                notes
            );
            return successResponse(res, attendance, 'Check-in successful', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async checkOut(req, res) {
        try {
            const { latitude, longitude } = req.body;
            const attendance = await attendanceService.checkOut(
                req.params.userId,
                latitude,
                longitude
            );
            return successResponse(res, attendance, 'Check-out successful');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
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
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getById(req, res) {
        try {
            const attendance = await attendanceService.getAttendanceById(req.params.id);
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getByUser(req, res) {
        try {
            const filters = {
                startDate: req.query.start_date,
                endDate: req.query.end_date,
                limit: req.query.limit,
            };
            const attendance = await attendanceService.getUserAttendance(
                req.params.userId,
                filters
            );
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async delete(req, res) {
        try {
            const result = await attendanceService.deleteAttendance(req.params.id);
            return successResponse(res, result, 'Attendance deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = attendanceController;
