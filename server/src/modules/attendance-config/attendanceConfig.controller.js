const attendanceConfigService = require('./attendanceConfig.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const attendanceConfigController = {
    async get(req, res) {
        try {
            const config = await attendanceConfigService.getCurrent();
            return successResponse(res, config);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async update(req, res) {
        try {
            const updated = await attendanceConfigService.update(req.body, req.user.id);
            return successResponse(res, updated, 'Attendance config updated');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = attendanceConfigController;
