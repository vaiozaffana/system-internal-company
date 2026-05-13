const bcrypt = require('bcrypt');
const usersModel = require('./users.model');

const usersService = {
    async createUser(userData) {
        const existingEmail = await usersModel.findByEmail(userData.email);
        if (existingEmail) {
            throw Object.assign(new Error('Email already exists'), { statusCode: 400 });
        }

        const employeeCode = userData.employeeCode || (await usersService.generateEmployeeCode());

        const existingCode = await usersModel.findByEmployeeCode(employeeCode);
        if (existingCode) {
            throw Object.assign(new Error('Employee code already exists'), { statusCode: 400 });
        }

        const passwordHash = await bcrypt.hash(userData.password, 10);

        return await usersModel.create({
            employeeCode,
            fullName: userData.fullName,
            email: userData.email,
            passwordHash,
            phoneNumber: userData.phoneNumber,
            department: userData.department,
            position: userData.position,
            role: userData.role || 'user',
        });
    },

    async generateEmployeeCode() {
        let code;
        let exists = true;
        while (exists) {
            const random = Math.floor(100000 + Math.random() * 900000);
            code = `EMP${random}`;
            exists = !!(await usersModel.findByEmployeeCode(code));
        }
        return code;
    },

    async getUserById(id) {
        const user = await usersModel.findById(id);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }
        return user;
    },

    async getAllUsers(filters) {
        return await usersModel.findAll(filters);
    },

    async updateUser(id, userData) {
        const user = await usersModel.findById(id);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        if (userData.email && userData.email !== user.email) {
            const existingEmail = await usersModel.findByEmail(userData.email);
            if (existingEmail) {
                throw Object.assign(new Error('Email already exists'), { statusCode: 400 });
            }
        }

        const updateData = {};
        if (userData.fullName) updateData.fullName = userData.fullName;
        if (userData.email) updateData.email = userData.email;
        if (userData.phoneNumber) updateData.phoneNumber = userData.phoneNumber;
        if (userData.department) updateData.department = userData.department;
        if (userData.position) updateData.position = userData.position;
        if (userData.role) updateData.role = userData.role;
        if (userData.isActive !== undefined) updateData.isActive = userData.isActive;

        return await usersModel.update(id, updateData);
    },

    async deleteUser(id) {
        const user = await usersModel.findById(id);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        await usersModel.delete(id);
        return { message: 'User deleted successfully' };
    },

    async resetPassword(id, newPassword) {
        const user = await usersModel.findById(id);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        const password = newPassword && newPassword.length >= 6 ? newPassword : 'password123';
        const passwordHash = await bcrypt.hash(password, 10);
        await require('../../config/database').user.update({
            where: { id: parseInt(id) },
            data: { passwordHash },
        });

        return { message: 'Password reset successfully', newPassword: password };
    },
};

module.exports = usersService;
