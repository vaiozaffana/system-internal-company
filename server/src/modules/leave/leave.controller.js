const leaveService = require('./leave.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const leaveController = {
    async create(req, res) {
        try {
            const leave = await leaveService.create(req.user.id, req.body);
            return successResponse(res, leave, 'Leave request submitted', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getMyRequests(req, res) {
        try {
            const filters = { status: req.query.status };
            const leaves = await leaveService.getMyRequests(req.user.id, filters);
            return successResponse(res, leaves);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAll(req, res) {
        try {
            const filters = {
                status: req.query.status,
                userId: req.query.user_id,
            };
            const leaves = await leaveService.getAll(filters);
            return successResponse(res, leaves);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async review(req, res) {
        try {
            const { status, reviewNote } = req.body;
            const leave = await leaveService.review(
                req.params.id,
                req.user.id,
                status,
                reviewNote
            );
            return successResponse(res, leave, `Leave request ${status}`);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async cancel(req, res) {
        try {
            const result = await leaveService.cancel(req.params.id, req.user.id);
            return successResponse(res, result, 'Leave request cancelled');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = leaveController;
