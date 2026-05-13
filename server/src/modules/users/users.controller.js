const usersService = require('./users.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const usersController = {
    async create(req, res) {
        try {
            const user = await usersService.createUser(req.body);
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
            return successResponse(res, user, 'User updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async delete(req, res) {
        try {
            const result = await usersService.deleteUser(req.params.id);
            return successResponse(res, result, 'User deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async resetPassword(req, res) {
        try {
            const { newPassword } = req.body || {};
            const result = await usersService.resetPassword(req.params.id, newPassword);
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
