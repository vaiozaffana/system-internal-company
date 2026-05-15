const usersService = require('./users.service');
const auditLogService = require('../../shared/services/auditLog.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const usersController = {
    async create(req, res) {
        try {
            const user = await usersService.createUser(req.body);
            await auditLogService.log({
                userId: req.user.id,
                action: 'user_created',
                entity: 'user',
                entityId: user.id,
                details: { fullName: user.fullName, email: user.email, role: user.role },
                ipAddress: req.ip,
            });
            return successResponse(res, user, 'User created successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAll(req, res) {
        try {
            const filters = {
                department: req.query.department,
                isActive: req.query.is_active,
            };
            const users = await usersService.getAllUsers(filters);
            return successResponse(res, users);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getById(req, res) {
        try {
            const user = await usersService.getUserById(req.params.id);
            return successResponse(res, user);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async update(req, res) {
        try {
            const user = await usersService.updateUser(req.params.id, req.body);
            await auditLogService.log({
                userId: req.user.id,
                action: 'user_updated',
                entity: 'user',
                entityId: parseInt(req.params.id),
                details: { fields: Object.keys(req.body), targetName: user.fullName },
                ipAddress: req.ip,
            });
            return successResponse(res, user, 'User updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async delete(req, res) {
        try {
            const result = await usersService.deleteUser(req.params.id);
            await auditLogService.log({
                userId: req.user.id,
                action: 'user_deleted',
                entity: 'user',
                entityId: parseInt(req.params.id),
                details: null,
                ipAddress: req.ip,
            });
            return successResponse(res, result, 'User deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async resetPassword(req, res) {
        try {
            const { newPassword } = req.body || {};
            const result = await usersService.resetPassword(req.params.id, newPassword);
            await auditLogService.log({
                userId: req.user.id,
                action: 'password_reset',
                entity: 'user',
                entityId: parseInt(req.params.id),
                details: { byAdmin: true, customPassword: !!newPassword && newPassword.length >= 6 },
                ipAddress: req.ip,
            });
            return successResponse(res, result, `Password reset to ${result.newPassword}`);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async count(req, res) {
        try {
            const users = await usersService.getAllUsers({});
            return successResponse(res, { total: users.length });
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = usersController;
