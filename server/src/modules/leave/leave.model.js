const prisma = require('../../config/database');

const leaveInclude = {
    user: {
        select: {
            employeeCode: true,
            fullName: true,
            department: true,
        },
    },
};

const leaveModel = {
    async create(data) {
        return await prisma.leaveRequest.create({
            data,
            include: leaveInclude,
        });
    },

    async findById(id) {
        return await prisma.leaveRequest.findUnique({
            where: { id: parseInt(id) },
            include: leaveInclude,
        });
    },

    async findByUser(userId, filters = {}) {
        const where = { userId: parseInt(userId) };
        if (filters.status) where.status = filters.status;
        return await prisma.leaveRequest.findMany({
            where,
            include: leaveInclude,
            orderBy: { createdAt: 'desc' },
        });
    },

    async findAll(filters = {}) {
        const where = {};
        if (filters.status) where.status = filters.status;
        if (filters.userId) where.userId = parseInt(filters.userId);
        return await prisma.leaveRequest.findMany({
            where,
            include: leaveInclude,
            orderBy: { createdAt: 'desc' },
        });
    },

    async update(id, data) {
        return await prisma.leaveRequest.update({
            where: { id: parseInt(id) },
            data,
            include: leaveInclude,
        });
    },

    async delete(id) {
        return await prisma.leaveRequest.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = leaveModel;
