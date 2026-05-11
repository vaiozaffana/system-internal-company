const prisma = require('../../config/database');

const payrollInclude = {
    user: {
        select: {
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
        },
    },
    period: {
        select: {
            year: true,
            month: true,
            startDate: true,
            endDate: true,
        },
    },
    items: true,
};

const payrollModel = {
    async createPeriod(data) {
        return await prisma.payrollPeriod.create({ data });
    },

    async findPeriodById(id) {
        return await prisma.payrollPeriod.findUnique({
            where: { id: parseInt(id) },
        });
    },

    async findPeriodByYearMonth(year, month) {
        return await prisma.payrollPeriod.findUnique({
            where: { year_month: { year, month } },
        });
    },

    async findAllPeriods(filters = {}) {
        const where = {};
        if (filters.year) where.year = parseInt(filters.year);
        if (filters.status) where.status = filters.status;

        return await prisma.payrollPeriod.findMany({
            where,
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
    },

    async updatePeriod(id, data) {
        return await prisma.payrollPeriod.update({
            where: { id: parseInt(id) },
            data,
        });
    },

    async create(data) {
        return await prisma.payroll.create({
            data: {
                periodId: parseInt(data.periodId),
                userId: parseInt(data.userId),
                baseSalary: data.baseSalary,
                totalAllowance: data.totalAllowance || 0,
                totalDeduction: data.totalDeduction || 0,
                overtimeAmount: data.overtimeAmount || 0,
                attendanceDeduction: data.attendanceDeduction || 0,
                grossSalary: data.grossSalary,
                netSalary: data.netSalary,
                totalWorkDays: data.totalWorkDays,
                totalPresent: data.totalPresent,
                totalAbsent: data.totalAbsent,
                totalLate: data.totalLate || 0,
                totalOvertimeHours: data.totalOvertimeHours || 0,
                status: data.status || 'draft',
                items: data.items ? { create: data.items } : undefined,
            },
            include: payrollInclude,
        });
    },

    async findById(id) {
        return await prisma.payroll.findUnique({
            where: { id: parseInt(id) },
            include: payrollInclude,
        });
    },

    async findByPeriodAndUser(periodId, userId) {
        return await prisma.payroll.findUnique({
            where: {
                periodId_userId: {
                    periodId: parseInt(periodId),
                    userId: parseInt(userId),
                },
            },
            include: payrollInclude,
        });
    },

    async findAll(filters = {}) {
        const where = {};
        if (filters.periodId) where.periodId = parseInt(filters.periodId);
        if (filters.userId) where.userId = parseInt(filters.userId);
        if (filters.status) where.status = filters.status;

        return await prisma.payroll.findMany({
            where,
            include: payrollInclude,
            orderBy: { createdAt: 'desc' },
        });
    },

    async update(id, data) {
        return await prisma.payroll.update({
            where: { id: parseInt(id) },
            data,
            include: payrollInclude,
        });
    },

    async delete(id) {
        return await prisma.payroll.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },

    async deleteByPeriod(periodId) {
        return await prisma.payroll.deleteMany({
            where: { periodId: parseInt(periodId) },
        });
    },
};

module.exports = payrollModel;
