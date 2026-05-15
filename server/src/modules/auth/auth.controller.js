const authService = require('../../shared/services/auth.service');
const usersService = require('../users/users.service');
const auditLogService = require('../../shared/services/auditLog.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            await auditLogService.log({
                userId: result.user.id,
                action: 'login_success',
                entity: 'user',
                entityId: result.user.id,
                details: { email },
                ipAddress: req.ip,
            });
            return successResponse(res, result, 'Login successful');
        } catch (error) {
            await auditLogService.log({
                userId: null,
                action: 'login_failed',
                entity: 'user',
                entityId: null,
                details: { email: req.body?.email, reason: error.message },
                ipAddress: req.ip,
            });
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async logout(req, res) {
        try {
            await auditLogService.log({
                userId: req.user.id,
                action: 'logout',
                entity: 'user',
                entityId: req.user.id,
                details: { email: req.user.email },
                ipAddress: req.ip,
            });
            return successResponse(res, null, 'Logout successful');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async me(req, res) {
        try {
            const user = await usersService.getUserById(req.user.id);
            return successResponse(res, user);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async updateProfile(req, res) {
        try {
            const allowedFields = {};
            if (req.body.fullName) allowedFields.fullName = req.body.fullName;
            if (req.body.email) allowedFields.email = req.body.email;
            if (req.body.phoneNumber !== undefined) allowedFields.phoneNumber = req.body.phoneNumber;

            const user = await usersService.updateUser(req.user.id, allowedFields);
            await auditLogService.log({
                userId: req.user.id,
                action: 'profile_updated',
                entity: 'user',
                entityId: req.user.id,
                details: { fields: Object.keys(allowedFields) },
                ipAddress: req.ip,
            });
            return successResponse(res, user, 'Profile updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return errorResponse(res, 'Current password and new password are required', 400);
            }
            if (newPassword.length < 6) {
                return errorResponse(res, 'New password must be at least 6 characters', 400);
            }
            await authService.changePassword(req.user.id, currentPassword, newPassword);
            await auditLogService.log({
                userId: req.user.id,
                action: 'password_changed',
                entity: 'user',
                entityId: req.user.id,
                details: { byUser: true },
                ipAddress: req.ip,
            });
            return successResponse(res, null, 'Password changed successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = authController;
