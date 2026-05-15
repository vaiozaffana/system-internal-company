const attendanceConfigService = require('./attendanceConfig.service');
const auditLogService = require('../../shared/services/auditLog.service');
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
            const before = await attendanceConfigService.getCurrent();
            const updated = await attendanceConfigService.update(req.body, req.user.id);
            const changes = {};
            for (const key of Object.keys(req.body)) {
                const oldVal = before[key];
                const newVal = req.body[key];
                const oldStr = oldVal !== null && oldVal !== undefined ? String(oldVal) : '';
                const newStr = newVal !== null && newVal !== undefined ? String(newVal) : '';
                if (oldStr !== newStr) {
                    changes[key] = { from: oldVal, to: newVal };
                }
            }
            if (Object.keys(changes).length > 0) {
                await auditLogService.log({
                    userId: req.user.id,
                    action: 'attendance_config_updated',
                    entity: 'attendance_config',
                    entityId: updated.id,
                    details: changes,
                    ipAddress: req.ip,
                });
            }
            return successResponse(res, updated, 'Attendance config updated');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = attendanceConfigController;
