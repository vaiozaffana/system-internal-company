const prisma = require('../../config/database');

const overtimeInclude = {
    user: {
        select: {
            employeeCode: true,
            fullName: true,
            department: true,
        },
    },
};

const overtimeModel = {
    async create(data) {
        return await prisma.overtimeRecord.create({
            data: {
                userId: parseInt(data.userId),
                date: new Date(data.date),
                hours: data.hours,
                hourlyRate: data.hourlyRate,
                totalAmount: data.totalAmount,
                status: data.status || 'pending',
                notes: data.notes,
            },
            include: overtimeInclude,
        });
    },

    async findById(id) {
        return await prisma.overtimeRecord.findUnique({
            where: { id: parseInt(id) },
            include: overtimeInclude,
        });
    },

    async findByUser(userId, filters = {}) {
        const where = { userId: parseInt(userId) };

        if (filters.status) where.status = filters.status;

        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = new Date(filters.startDate);
            if (filters.endDate) where.date.lte = new Date(filters.endDate);
        }

        return await prisma.overtimeRecord.findMany({
            where,
            include: overtimeInclude,
            orderBy: { date: 'desc' },
        });
    },

    async findAll(filters = {}) {
        const where = {};

        if (filters.status) where.status = filters.status;
        if (filters.userId) where.userId = parseInt(filters.userId);

        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = new Date(filters.startDate);
            if (filters.endDate) where.date.lte = new Date(filters.endDate);
        }

        return await prisma.overtimeRecord.findMany({
            where,
            include: overtimeInclude,
            orderBy: { date: 'desc' },
        });
    },

    async getTotalApprovedInPeriod(userId, startDate, endDate) {
        const result = await prisma.overtimeRecord.aggregate({
            where: {
                userId: parseInt(userId),
                status: 'approved',
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            _sum: {
                hours: true,
                totalAmount: true,
            },
        });

        return {
            totalHours: Number(result._sum.hours || 0),
            totalAmount: Number(result._sum.totalAmount || 0),
        };
    },

    async update(id, data) {
        return await prisma.overtimeRecord.update({
            where: { id: parseInt(id) },
            data,
            include: overtimeInclude,
        });
    },

    async approve(id, approvedBy) {
        return await prisma.overtimeRecord.update({
            where: { id: parseInt(id) },
            data: {
                status: 'approved',
                approvedBy: parseInt(approvedBy),
                approvedAt: new Date(),
            },
            include: overtimeInclude,
        });
    },

    async reject(id, approvedBy) {
        return await prisma.overtimeRecord.update({
            where: { id: parseInt(id) },
            data: {
                status: 'rejected',
                approvedBy: parseInt(approvedBy),
                approvedAt: new Date(),
            },
            include: overtimeInclude,
        });
    },

    async delete(id) {
        return await prisma.overtimeRecord.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = overtimeModel;
