const auditLogService = require('../../shared/services/auditLog.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const auditController = {
    async getAll(req, res) {
        try {
            const filters = {
                userId: req.query.user_id,
                entity: req.query.entity,
                action: req.query.action,
                limit: req.query.limit,
            };
            const logs = await auditLogService.getAll(filters);
            return successResponse(res, logs);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = auditController;
