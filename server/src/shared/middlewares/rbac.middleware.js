const { errorResponse } = require('../utils/response.helper');

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Authentication required', 401);
        }

        const userRole = req.user.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return errorResponse(res, 'Insufficient permissions', 403);
        }

        next();
    };
};

const requireAdmin = requireRole('admin');

module.exports = {
    requireRole,
    requireAdmin,
};
