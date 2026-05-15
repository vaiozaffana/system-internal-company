const scheduleService = require('./schedule.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const scheduleController = {
    async getAll(req, res) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return errorResponse(res, 'Query params start and end are required (YYYY-MM-DD)', 400);
            }
            const schedules = await scheduleService.getByDateRange(start, end);
            return successResponse(res, schedules);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async upsertDay(req, res) {
        try {
            const { date } = req.params;
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return errorResponse(res, 'Param date must be YYYY-MM-DD', 400);
            }
            const result = await scheduleService.upsertDate(date, req.body, req.user.id);
            return successResponse(res, result, 'Jadwal disimpan');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = scheduleController;
