const prisma = require('../../config/database');

const attendanceInclude = {
    user: {
        select: {
            employeeCode: true,
            fullName: true,
            department: true,
        },
    },
};

const attendanceModel = {
    async create(attendanceData) {
        return await prisma.attendance.create({
            data: {
                userId: parseInt(attendanceData.userId),
                checkInTime: attendanceData.checkInTime,
                checkInLatitude: attendanceData.checkInLatitude,
                checkInLongitude: attendanceData.checkInLongitude,
                status: attendanceData.status || 'present',
                notes: attendanceData.notes || null,
            },
        });
    },

    async findById(id) {
        return await prisma.attendance.findUnique({
            where: { id: parseInt(id) },
            include: attendanceInclude,
        });
    },

    async findByUserAndDate(userId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.attendance.findFirst({
            where: {
                userId: parseInt(userId),
                checkInTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: { checkInTime: 'desc' },
        });
    },

    async findByUser(userId, filters = {}) {
        const where = { userId: parseInt(userId) };

        if (filters.startDate || filters.endDate) {
            where.checkInTime = {};
            if (filters.startDate) where.checkInTime.gte = new Date(filters.startDate);
            if (filters.endDate) where.checkInTime.lte = new Date(filters.endDate);
        }

        return await prisma.attendance.findMany({
            where,
            include: attendanceInclude,
            orderBy: { checkInTime: 'desc' },
            take: filters.limit ? parseInt(filters.limit) : undefined,
        });
    },

    async findAll(filters = {}) {
        const where = {};

        if (filters.department) {
            where.user = { department: filters.department };
        }

        if (filters.startDate || filters.endDate) {
            where.checkInTime = {};
            if (filters.startDate) where.checkInTime.gte = new Date(filters.startDate);
            if (filters.endDate) where.checkInTime.lte = new Date(filters.endDate);
        }

        return await prisma.attendance.findMany({
            where,
            include: attendanceInclude,
            orderBy: { checkInTime: 'desc' },
            take: filters.limit ? parseInt(filters.limit) : undefined,
        });
    },

    async updateCheckOut(id, checkOutData) {
        return await prisma.attendance.update({
            where: { id: parseInt(id) },
            data: {
                checkOutTime: checkOutData.checkOutTime,
                checkOutLatitude: checkOutData.checkOutLatitude,
                checkOutLongitude: checkOutData.checkOutLongitude,
            },
        });
    },

    async delete(id) {
        return await prisma.attendance.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = attendanceModel;
