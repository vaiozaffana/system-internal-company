const attendanceService = require('./attendance.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const attendanceController = {
    async checkIn(req, res) {
        try {
            const userId = req.params.userId ?? req.user?.id;
            const { latitude, longitude, notes } = req.body;
            const attendance = await attendanceService.checkIn(
                userId,
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
            const userId = req.params.userId ?? req.user?.id;
            const { latitude, longitude } = req.body;
            const attendance = await attendanceService.checkOut(
                userId,
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

    async getMyToday(req, res) {
        try {
            const attendance = await attendanceService.getUserTodayAttendance(req.user.id);
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getMyHistory(req, res) {
        try {
            const filters = {
                startDate: req.query.start_date,
                endDate: req.query.end_date,
                limit: req.query.limit,
            };
            const attendance = await attendanceService.getUserAttendance(
                req.user.id,
                filters
            );
            return successResponse(res, attendance);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async checkLocation(req, res) {
        try {
            const latitude = parseFloat(req.query.lat);
            const longitude = parseFloat(req.query.lng);
            if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
                return errorResponse(res, 'lat and lng query params are required', 400);
            }
            const result = await attendanceService.testLocation(latitude, longitude);
            return successResponse(res, { latitude, longitude, ...result });
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    getConfig(req, res) {
        try {
            return successResponse(res, attendanceService.getAttendanceConfig());
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
