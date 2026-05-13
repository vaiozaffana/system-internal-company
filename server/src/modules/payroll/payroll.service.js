const prisma = require('../../config/database');

const getPayrollConfig = async () => {
    const existing = await prisma.payrollConfig.findFirst({ orderBy: { id: 'asc' } });
    if (existing) return existing;
    return await prisma.payrollConfig.create({ data: {} });
};

const payrollService = {
    async getConfig() {
        const cfg = await getPayrollConfig();
        return {
            id: cfg.id,
            overtimeHourlyRate: Number(cfg.overtimeHourlyRate),
            absenceDeductionPerDay: Number(cfg.absenceDeductionPerDay),
            bpjsKetenagakerjaanPercent: Number(cfg.bpjsKetenagakerjaanPercent),
            bpjsKesehatanPercent: Number(cfg.bpjsKesehatanPercent),
            incomeTaxPercent: Number(cfg.incomeTaxPercent),
            updatedAt: cfg.updatedAt,
        };
    },

    async updateConfig(data, updatedBy) {
        const current = await getPayrollConfig();
        return await prisma.payrollConfig.update({
            where: { id: current.id },
            data: { ...data, updatedBy },
        });
    },

    async generateSlip(userId, month, year) {
        const config = await getPayrollConfig();

        const employeeSalary = await prisma.employeeSalary.findUnique({
            where: { userId: parseInt(userId) },
            include: { components: { include: { component: true } } },
        });

        if (!employeeSalary) {
            return null;
        }

        const baseSalary = Number(employeeSalary.baseSalary);

        const allowances = [];
        let totalAllowance = 0;
        if (employeeSalary.components) {
            for (const ec of employeeSalary.components) {
                if (ec.component.type === 'allowance') {
                    const amount = Number(ec.amount);
                    allowances.push({ name: ec.component.name, amount });
                    totalAllowance += amount;
                }
            }
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const approvedOvertime = await prisma.overtimeRecord.findMany({
            where: {
                userId: parseInt(userId),
                status: 'approved',
                date: { gte: startDate, lte: endDate },
            },
        });

        let totalOvertimeHours = 0;
        for (const ot of approvedOvertime) {
            totalOvertimeHours += Number(ot.hours);
        }
        const overtimeAmount = totalOvertimeHours * Number(config.overtimeHourlyRate);

        const totalEarnings = baseSalary + totalAllowance + overtimeAmount;

        const bpjsKetenagakerjaan = Math.round(totalEarnings * Number(config.bpjsKetenagakerjaanPercent) / 100);
        const bpjsKesehatan = Math.round(totalEarnings * Number(config.bpjsKesehatanPercent) / 100);
        const incomeTax = Math.round(totalEarnings * Number(config.incomeTaxPercent) / 100);

        const attendances = await prisma.attendance.findMany({
            where: {
                userId: parseInt(userId),
                checkInTime: { gte: startDate, lte: endDate },
            },
        });

        let absenceCount = 0;
        for (const att of attendances) {
            const status = (att.status || '').toLowerCase();
            if (status === 'late' || status === 'late-and-early-leave') {
                absenceCount++;
            }
        }
        const absenceDeduction = absenceCount * Number(config.absenceDeductionPerDay);

        const totalDeductions = bpjsKetenagakerjaan + bpjsKesehatan + incomeTax + absenceDeduction;
        const netSalary = totalEarnings - totalDeductions;

        return {
            userId: parseInt(userId),
            month,
            year,
            baseSalary,
            allowances,
            totalAllowance,
            overtimeHours: totalOvertimeHours,
            overtimeAmount,
            totalEarnings,
            deductions: {
                bpjsKetenagakerjaan,
                bpjsKesehatan,
                incomeTax,
                absenceCount,
                absenceDeduction,
            },
            totalDeductions,
            netSalary,
        };
    },

    async getMySlip(userId, month, year) {
        return await payrollService.generateSlip(userId, month, year);
    },

    async generateAll(month, year) {
        const users = await prisma.user.findMany({
            where: { isActive: true, role: 'user' },
            select: { id: true, employeeCode: true, fullName: true, department: true },
        });

        const slips = [];
        for (const user of users) {
            const slip = await payrollService.generateSlip(user.id, month, year);
            if (slip) {
                slips.push({ ...slip, employeeCode: user.employeeCode, fullName: user.fullName, department: user.department });
            }
        }
        return slips;
    },

    async getOvertimeRecords(filters = {}) {
        const where = {};
        if (filters.userId) where.userId = parseInt(filters.userId);
        if (filters.status) where.status = filters.status;
        if (filters.month && filters.year) {
            const start = new Date(filters.year, filters.month - 1, 1);
            const end = new Date(filters.year, filters.month, 0, 23, 59, 59);
            where.date = { gte: start, lte: end };
        }
        return await prisma.overtimeRecord.findMany({
            where,
            include: { user: { select: { employeeCode: true, fullName: true, department: true } } },
            orderBy: { date: 'desc' },
        });
    },

    async approveOvertime(id, approvedBy) {
        const record = await prisma.overtimeRecord.findUnique({ where: { id: parseInt(id) } });
        if (!record) throw Object.assign(new Error('Overtime record not found'), { statusCode: 404 });
        if (record.status !== 'pending') throw Object.assign(new Error('Already processed'), { statusCode: 400 });
        return await prisma.overtimeRecord.update({
            where: { id: parseInt(id) },
            data: { status: 'approved', approvedBy, approvedAt: new Date() },
        });
    },

    async rejectOvertime(id, approvedBy) {
        const record = await prisma.overtimeRecord.findUnique({ where: { id: parseInt(id) } });
        if (!record) throw Object.assign(new Error('Overtime record not found'), { statusCode: 404 });
        if (record.status !== 'pending') throw Object.assign(new Error('Already processed'), { statusCode: 400 });
        return await prisma.overtimeRecord.update({
            where: { id: parseInt(id) },
            data: { status: 'rejected', approvedBy, approvedAt: new Date() },
        });
    },
};

module.exports = payrollService;
