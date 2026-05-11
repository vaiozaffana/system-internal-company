const prisma = require('../config/prisma');

const employeeModel = {
    async create(employeeData) {
        return await prisma.employee.create({
            data: {
                employeeCode: employeeData.employeeCode,
                fullName: employeeData.fullName,
                email: employeeData.email,
                passwordHash: employeeData.passwordHash,
                phoneNumber: employeeData.phoneNumber,
                department: employeeData.department,
                position: employeeData.position,
            },
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
            },
        });
    },

    async findById(id) {
        return await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    },

    async findByEmail(email) {
        return await prisma.employee.findUnique({
            where: { email },
        });
    },

    async findByEmployeeCode(employeeCode) {
        return await prisma.employee.findUnique({
            where: { employeeCode },
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    },

    async findAll(filters = {}) {
        const where = {};

        if (filters.department) {
            where.department = filters.department;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        }

        return await prisma.employee.findMany({
            where,
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    async update(id, employeeData) {
        const data = {};

        if (employeeData.fullName) data.fullName = employeeData.fullName;
        if (employeeData.email) data.email = employeeData.email;
        if (employeeData.phoneNumber) data.phoneNumber = employeeData.phoneNumber;
        if (employeeData.department) data.department = employeeData.department;
        if (employeeData.position) data.position = employeeData.position;
        if (employeeData.isActive !== undefined) data.isActive = employeeData.isActive;

        if (Object.keys(data).length === 0) {
            return null;
        }

        return await prisma.employee.update({
            where: { id: parseInt(id) },
            data,
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    },

    async delete(id) {
        return await prisma.employee.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = employeeModel;
