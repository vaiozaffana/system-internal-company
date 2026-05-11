const authService = require('../../shared/services/auth.service');
const usersService = require('../users/users.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            return successResponse(res, result, 'Login successful');
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
};

module.exports = authController;
