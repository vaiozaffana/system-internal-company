const prisma = require('../config/prisma');

const attendanceModel = {
    async create(attendanceData) {
        return await prisma.attendanceRecord.create({
            data: {
                employeeId: parseInt(attendanceData.employeeId),
                checkInTime: attendanceData.checkInTime,
                checkInLatitude: attendanceData.checkInLatitude,
                checkInLongitude: attendanceData.checkInLongitude,
                status: attendanceData.status || 'present',
                notes: attendanceData.notes || null,
            },
        });
    },

    async findById(id) {
        return await prisma.attendanceRecord.findUnique({
            where: { id: parseInt(id) },
            include: {
                employee: {
                    select: {
                        employeeCode: true,
                        fullName: true,
                        department: true,
                    },
                },
            },
        });
    },

    async findByEmployeeAndDate(employeeId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.attendanceRecord.findFirst({
            where: {
                employeeId: parseInt(employeeId),
                checkInTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                checkInTime: 'desc',
            },
        });
    },

    async findByEmployee(employeeId, filters = {}) {
        const where = {
            employeeId: parseInt(employeeId),
        };

        if (filters.startDate) {
            where.checkInTime = {
                ...where.checkInTime,
                gte: new Date(filters.startDate),
            };
        }

        if (filters.endDate) {
            where.checkInTime = {
                ...where.checkInTime,
                lte: new Date(filters.endDate),
            };
        }

        return await prisma.attendanceRecord.findMany({
            where,
            include: {
                employee: {
                    select: {
                        employeeCode: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                checkInTime: 'desc',
            },
            take: filters.limit ? parseInt(filters.limit) : undefined,
        });
    },

    async findAll(filters = {}) {
        const where = {};

        if (filters.department) {
            where.employee = {
                department: filters.department,
            };
        }

        if (filters.startDate) {
            where.checkInTime = {
                ...where.checkInTime,
                gte: new Date(filters.startDate),
            };
        }

        if (filters.endDate) {
            where.checkInTime = {
                ...where.checkInTime,
                lte: new Date(filters.endDate),
            };
        }

        return await prisma.attendanceRecord.findMany({
            where,
            include: {
                employee: {
                    select: {
                        employeeCode: true,
                        fullName: true,
                        department: true,
                    },
                },
            },
            orderBy: {
                checkInTime: 'desc',
            },
            take: filters.limit ? parseInt(filters.limit) : undefined,
        });
    },

    async updateCheckOut(id, checkOutData) {
        return await prisma.attendanceRecord.update({
            where: { id: parseInt(id) },
            data: {
                checkOutTime: checkOutData.checkOutTime,
                checkOutLatitude: checkOutData.checkOutLatitude,
                checkOutLongitude: checkOutData.checkOutLongitude,
            },
        });
    },

    async delete(id) {
        return await prisma.attendanceRecord.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = attendanceModel;
