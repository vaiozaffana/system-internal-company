const bcrypt = require('bcrypt');
const usersModel = require('./users.model');

const usersService = {
    async createUser(userData) {
        const existingEmail = await usersModel.findByEmail(userData.email);
        if (existingEmail) {
            throw Object.assign(new Error('Email already exists'), { statusCode: 400 });
        }

        const existingCode = await usersModel.findByEmployeeCode(userData.employeeCode);
        if (existingCode) {
            throw Object.assign(new Error('Employee code already exists'), { statusCode: 400 });
        }

        const passwordHash = await bcrypt.hash(userData.password, 10);

        return await usersModel.create({
            employeeCode: userData.employeeCode,
            fullName: userData.fullName,
            email: userData.email,
            passwordHash,
            phoneNumber: userData.phoneNumber,
            department: userData.department,
            position: userData.position,
        });
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
};

module.exports = usersService;
