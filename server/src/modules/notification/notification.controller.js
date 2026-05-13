const notificationService = require('../../shared/services/notification.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const notificationController = {
    async getMyNotifications(req, res) {
        try {
            const notifications = await notificationService.getByUser(req.user.id);
            return successResponse(res, notifications);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getUnreadCount(req, res) {
        try {
            const count = await notificationService.getUnreadCount(req.user.id);
            return successResponse(res, { count });
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async markAsRead(req, res) {
        try {
            await notificationService.markAsRead(req.params.id, req.user.id);
            return successResponse(res, null, 'Marked as read');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async markAllAsRead(req, res) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            return successResponse(res, null, 'All marked as read');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = notificationController;
