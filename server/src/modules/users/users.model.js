const prisma = require('../../config/database');

const userSelectFields = {
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
};

const usersModel = {
    async create(userData) {
        return await prisma.user.create({
            data: userData,
            select: userSelectFields,
        });
    },

    async findById(id) {
        const numericId = parseInt(id);
        if (Number.isNaN(numericId)) {
            return null;
        }
        return await prisma.user.findUnique({
            where: { id: numericId },
            select: userSelectFields,
        });
    },

    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    },

    async findByEmployeeCode(employeeCode) {
        return await prisma.user.findUnique({
            where: { employeeCode },
            select: userSelectFields,
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

        return await prisma.user.findMany({
            where,
            select: userSelectFields,
            orderBy: { createdAt: 'desc' },
        });
    },

    async update(id, userData) {
        return await prisma.user.update({
            where: { id: parseInt(id) },
            data: userData,
            select: userSelectFields,
        });
    },

    async delete(id) {
        return await prisma.user.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = usersModel;
