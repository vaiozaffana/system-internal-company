const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersModel = require('../../modules/users/users.model');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authService = {
    async login(email, password) {
        if (!email || !password) {
            throw Object.assign(new Error('Email and password are required'), { statusCode: 400 });
        }

        const user = await usersModel.findByEmail(email);
        if (!user) {
            throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
        }

        if (!user.isActive) {
            throw Object.assign(new Error('Account is inactive'), { statusCode: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, employeeCode: user.employeeCode, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const { passwordHash: _passwordHash, ...safeUser } = user;

        return { token, user: safeUser };
    },

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (_error) {
            throw Object.assign(new Error('Invalid or expired token'), { statusCode: 401 });
        }
    },
};

module.exports = authService;
