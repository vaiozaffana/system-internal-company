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

        if (!employeeSalary) return null;

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
            where: { userId: parseInt(userId), status: 'approved', date: { gte: startDate, lte: endDate } },
        });

        let totalOvertimeHours = 0;
        for (const ot of approvedOvertime) totalOvertimeHours += Number(ot.hours);
        const overtimeAmount = totalOvertimeHours * Number(config.overtimeHourlyRate);

        const totalEarnings = baseSalary + totalAllowance + overtimeAmount;

        const bpjsKetenagakerjaan = Math.round(totalEarnings * Number(config.bpjsKetenagakerjaanPercent) / 100);
        const bpjsKesehatan = Math.round(totalEarnings * Number(config.bpjsKesehatanPercent) / 100);
        const incomeTax = Math.round(totalEarnings * Number(config.incomeTaxPercent) / 100);

        const attendances = await prisma.attendance.findMany({
            where: { userId: parseInt(userId), checkInTime: { gte: startDate, lte: endDate } },
        });

        let absenceCount = 0;
        for (const att of attendances) {
            const status = (att.status || '').toLowerCase();
            if (status === 'late' || status === 'late-and-early-leave') absenceCount++;
        }
        const absenceDeduction = absenceCount * Number(config.absenceDeductionPerDay);

        const totalDeductions = bpjsKetenagakerjaan + bpjsKesehatan + incomeTax + absenceDeduction;
        const netSalary = totalEarnings - totalDeductions;

        return {
            userId: parseInt(userId),
            month, year, baseSalary, allowances, totalAllowance,
            overtimeHours: totalOvertimeHours, overtimeAmount, totalEarnings,
            deductions: { bpjsKetenagakerjaan, bpjsKesehatan, incomeTax, absenceCount, absenceDeduction },
            totalDeductions, netSalary,
        };
    },

    async getMySlip(userId, month, year) {
        const period = await prisma.payrollPeriod.findUnique({ where: { year_month: { year, month } } });
        if (!period) return null;

        const payroll = await prisma.payroll.findUnique({
            where: { periodId_userId: { periodId: period.id, userId: parseInt(userId) } },
            include: { items: { include: { component: true } } },
        });
        if (!payroll) return null;

        const allowances = payroll.items
            .filter((i) => i.type === 'allowance')
            .map((i) => ({ name: i.name, amount: Number(i.amount) }));

        const deductionItems = payroll.items.filter((i) => i.type === 'deduction');
        const bpjsKetenagakerjaan = Number(deductionItems.find((i) => i.name === 'BPJS Ketenagakerjaan')?.amount ?? 0);
        const bpjsKesehatan = Number(deductionItems.find((i) => i.name === 'BPJS Kesehatan')?.amount ?? 0);
        const incomeTax = Number(deductionItems.find((i) => i.name === 'PPh 21')?.amount ?? 0);

        return {
            baseSalary: Number(payroll.baseSalary),
            allowances,
            totalAllowance: Number(payroll.totalAllowance),
            overtimeHours: Number(payroll.totalOvertimeHours),
            overtimeAmount: Number(payroll.overtimeAmount),
            totalEarnings: Number(payroll.grossSalary),
            deductions: {
                bpjsKetenagakerjaan, bpjsKesehatan, incomeTax,
                absenceCount: payroll.totalLate,
                absenceDeduction: Number(payroll.attendanceDeduction),
            },
            totalDeductions: Number(payroll.totalDeduction),
            netSalary: Number(payroll.netSalary),
        };
    },

    async generateAll(month, year) {
        const users = await prisma.user.findMany({
            where: { isActive: true, role: 'user' },
            select: { id: true, employeeCode: true, fullName: true, department: true },
        });

        const period = await prisma.payrollPeriod.upsert({
            where: { year_month: { year, month } },
            update: {},
            create: {
                year, month,
                startDate: new Date(year, month - 1, 1),
                endDate: new Date(year, month, 0),
                status: 'open',
            },
        });

        const slips = [];
        for (const user of users) {
            const slip = await payrollService.generateSlip(user.id, month, year);
            if (!slip) continue;

            const config = await getPayrollConfig();
            const bpjsKetenagakerjaan = Math.round(Number(slip.totalEarnings) * Number(config.bpjsKetenagakerjaanPercent) / 100);
            const bpjsKesehatan = Math.round(Number(slip.totalEarnings) * Number(config.bpjsKesehatanPercent) / 100);
            const incomeTax = Math.round(Number(slip.totalEarnings) * Number(config.incomeTaxPercent) / 100);

            const payroll = await prisma.payroll.upsert({
                where: { periodId_userId: { periodId: period.id, userId: user.id } },
                update: {
                    baseSalary: slip.baseSalary, totalAllowance: slip.totalAllowance,
                    overtimeAmount: slip.overtimeAmount, totalOvertimeHours: slip.overtimeHours,
                    attendanceDeduction: slip.deductions.absenceDeduction, totalLate: slip.deductions.absenceCount,
                    totalDeduction: slip.totalDeductions, grossSalary: slip.totalEarnings,
                    netSalary: slip.netSalary, totalWorkDays: 0, totalPresent: 0, totalAbsent: 0, status: 'draft',
                },
                create: {
                    periodId: period.id, userId: user.id,
                    baseSalary: slip.baseSalary, totalAllowance: slip.totalAllowance,
                    overtimeAmount: slip.overtimeAmount, totalOvertimeHours: slip.overtimeHours,
                    attendanceDeduction: slip.deductions.absenceDeduction, totalLate: slip.deductions.absenceCount,
                    totalDeduction: slip.totalDeductions, grossSalary: slip.totalEarnings,
                    netSalary: slip.netSalary, totalWorkDays: 0, totalPresent: 0, totalAbsent: 0, status: 'draft',
                },
            });

            await prisma.payrollItem.deleteMany({ where: { payrollId: payroll.id } });

            const deductionComponents = await prisma.salaryComponent.findMany({ where: { type: 'deduction', isActive: true }, take: 1 });
            const fallbackComponentId = deductionComponents[0]?.id ?? (await prisma.salaryComponent.findFirst({ orderBy: { id: 'asc' } }))?.id ?? 1;

            const empSalary = await prisma.employeeSalary.findUnique({
                where: { userId: user.id },
                include: { components: { include: { component: true } } },
            });
            const allowanceComponentMap = new Map((empSalary?.components ?? []).map((ec) => [ec.component.name, ec.componentId]));

            const itemsData = [
                ...slip.allowances.map((a) => ({
                    payrollId: payroll.id,
                    componentId: allowanceComponentMap.get(a.name) ?? fallbackComponentId,
                    type: 'allowance', name: a.name, amount: a.amount,
                })),
                { payrollId: payroll.id, componentId: fallbackComponentId, type: 'deduction', name: 'BPJS Ketenagakerjaan', amount: bpjsKetenagakerjaan },
                { payrollId: payroll.id, componentId: fallbackComponentId, type: 'deduction', name: 'BPJS Kesehatan', amount: bpjsKesehatan },
                { payrollId: payroll.id, componentId: fallbackComponentId, type: 'deduction', name: 'PPh 21', amount: incomeTax },
            ];
            if (slip.deductions.absenceDeduction > 0) {
                itemsData.push({ payrollId: payroll.id, componentId: fallbackComponentId, type: 'deduction', name: 'Potongan Absensi', amount: slip.deductions.absenceDeduction });
            }
            if (itemsData.length > 0) await prisma.payrollItem.createMany({ data: itemsData });

            slips.push({ ...slip, employeeCode: user.employeeCode, fullName: user.fullName, department: user.department });
        }
        return slips;
    },

    async getSlips(month, year) {
        const period = await prisma.payrollPeriod.findUnique({ where: { year_month: { year, month } } });
        if (!period) return [];

        const payrolls = await prisma.payroll.findMany({
            where: { periodId: period.id },
            include: { user: { select: { employeeCode: true, fullName: true, department: true } } },
        });

        return payrolls.map((p) => ({
            userId: p.userId,
            employeeCode: p.user.employeeCode,
            fullName: p.user.fullName,
            department: p.user.department,
            baseSalary: Number(p.baseSalary),
            totalAllowance: Number(p.totalAllowance),
            overtimeAmount: Number(p.overtimeAmount),
            totalEarnings: Number(p.grossSalary),
            totalDeductions: Number(p.totalDeduction),
            netSalary: Number(p.netSalary),
        }));
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

    async getSalaryComponents() {
        return await prisma.salaryComponent.findMany({
            where: { isActive: true },
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });
    },

    async getEmployeeSalaries() {
        const users = await prisma.user.findMany({
            where: { isActive: true, role: 'user' },
            select: {
                id: true, employeeCode: true, fullName: true, department: true, position: true,
                employeeSalary: { include: { components: { include: { component: true } } } },
            },
            orderBy: { fullName: 'asc' },
        });

        return users.map((u) => ({
            userId: u.id, employeeCode: u.employeeCode, fullName: u.fullName,
            department: u.department, position: u.position,
            baseSalary: u.employeeSalary ? Number(u.employeeSalary.baseSalary) : 0,
            isConfigured: !!u.employeeSalary,
            effectiveDate: u.employeeSalary?.effectiveDate ?? null,
            components: u.employeeSalary
                ? u.employeeSalary.components.map((ec) => ({
                      componentId: ec.componentId, code: ec.component.code,
                      name: ec.component.name, type: ec.component.type, amount: Number(ec.amount),
                  }))
                : [],
        }));
    },

    async getEmployeeSalary(userId) {
        const salary = await prisma.employeeSalary.findUnique({
            where: { userId: parseInt(userId) },
            include: { components: { include: { component: true } } },
        });
        if (!salary) return null;
        return {
            userId: salary.userId,
            baseSalary: Number(salary.baseSalary),
            effectiveDate: salary.effectiveDate,
            components: salary.components.map((ec) => ({
                componentId: ec.componentId, code: ec.component.code,
                name: ec.component.name, type: ec.component.type, amount: Number(ec.amount),
            })),
        };
    },

    async upsertEmployeeSalary(userId, payload) {
        const uid = parseInt(userId);
        const baseSalary = Number(payload.baseSalary) || 0;
        const MIN_SALARY = 5288796; // UMK Surabaya 2026

        if (baseSalary < MIN_SALARY) {
            throw Object.assign(
                new Error(`Gaji pokok tidak boleh kurang dari ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(MIN_SALARY)} (UMK Surabaya 2026)`),
                { statusCode: 400 }
            );
        }

        const effectiveDate = payload.effectiveDate ? new Date(payload.effectiveDate) : new Date();
        const components = Array.isArray(payload.components) ? payload.components : [];

        return await prisma.$transaction(async (tx) => {
            const existing = await tx.employeeSalary.findUnique({ where: { userId: uid } });

            const salary = existing
                ? await tx.employeeSalary.update({ where: { userId: uid }, data: { baseSalary, effectiveDate } })
                : await tx.employeeSalary.create({ data: { userId: uid, baseSalary, effectiveDate } });

            await tx.employeeSalaryComponent.deleteMany({ where: { employeeSalaryId: salary.id } });

            if (components.length > 0) {
                await tx.employeeSalaryComponent.createMany({
                    data: components
                        .filter((c) => c.componentId && Number(c.amount) > 0)
                        .map((c) => ({
                            employeeSalaryId: salary.id,
                            componentId: parseInt(c.componentId),
                            amount: Number(c.amount),
                        })),
                });
            }

            return salary;
        });
    },
};

module.exports = payrollService;
