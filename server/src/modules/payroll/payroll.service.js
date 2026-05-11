const payrollModel = require('./payroll.model');
const employeeSalaryModel = require('./employeeSalary.model');
const overtimeModel = require('./overtime.model');
const usersModel = require('../users/users.model');
const prisma = require('../../config/database');

const calculateWorkDays = (startDate, endDate) => {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
};

const getAttendanceStats = async (userId, startDate, endDate) => {
    const attendances = await prisma.attendance.findMany({
        where: {
            userId: parseInt(userId),
            checkInTime: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        },
    });

    const totalPresent = attendances.filter((a) => a.status === 'present').length;
    const totalLate = attendances.filter((a) => a.status === 'late').length;

    return { totalPresent, totalLate, totalRecords: attendances.length };
};

const payrollService = {
    async createPeriod(data) {
        const { year, month } = data;

        if (!year || !month || month < 1 || month > 12) {
            throw Object.assign(new Error('Invalid year or month'), { statusCode: 400 });
        }

        const existing = await payrollModel.findPeriodByYearMonth(year, month);
        if (existing) {
            throw Object.assign(new Error('Payroll period already exists'), { statusCode: 400 });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return await payrollModel.createPeriod({
            year,
            month,
            startDate,
            endDate,
            status: 'open',
            notes: data.notes,
        });
    },

    async getAllPeriods(filters) {
        return await payrollModel.findAllPeriods(filters);
    },

    async getPeriodById(id) {
        const period = await payrollModel.findPeriodById(id);
        if (!period) {
            throw Object.assign(new Error('Payroll period not found'), { statusCode: 404 });
        }
        return period;
    },

    async closePeriod(id) {
        const period = await payrollModel.findPeriodById(id);
        if (!period) {
            throw Object.assign(new Error('Payroll period not found'), { statusCode: 404 });
        }

        if (period.status === 'closed') {
            throw Object.assign(new Error('Period already closed'), { statusCode: 400 });
        }

        return await payrollModel.updatePeriod(id, { status: 'closed' });
    },

    async generatePayroll(periodId, userId) {
        const period = await payrollModel.findPeriodById(periodId);
        if (!period) {
            throw Object.assign(new Error('Payroll period not found'), { statusCode: 404 });
        }

        if (period.status === 'closed') {
            throw Object.assign(new Error('Cannot generate payroll for closed period'), {
                statusCode: 400,
            });
        }

        const user = await usersModel.findById(userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        const salary = await employeeSalaryModel.findByUserId(userId);
        if (!salary) {
            throw Object.assign(new Error('Employee salary not set'), { statusCode: 400 });
        }

        const existing = await payrollModel.findByPeriodAndUser(periodId, userId);
        if (existing) {
            throw Object.assign(
                new Error('Payroll already exists for this user in this period'),
                { statusCode: 400 }
            );
        }

        const baseSalary = Number(salary.baseSalary);

        const items = [];
        let totalAllowance = 0;
        let totalDeduction = 0;

        for (const comp of salary.components) {
            const amount = Number(comp.amount);
            items.push({
                componentId: comp.componentId,
                type: comp.component.type,
                name: comp.component.name,
                amount,
            });

            if (comp.component.type === 'allowance') {
                totalAllowance += amount;
            } else if (comp.component.type === 'deduction') {
                totalDeduction += amount;
            }
        }

        const attendanceStats = await getAttendanceStats(
            userId,
            period.startDate,
            period.endDate
        );
        const totalWorkDays = calculateWorkDays(period.startDate, period.endDate);
        const totalAbsent = Math.max(0, totalWorkDays - attendanceStats.totalPresent);

        const dailyRate = baseSalary / totalWorkDays;
        const attendanceDeduction = dailyRate * totalAbsent;

        const overtimeData = await overtimeModel.getTotalApprovedInPeriod(
            userId,
            period.startDate,
            period.endDate
        );
        const overtimeAmount = overtimeData.totalAmount;

        const grossSalary = baseSalary + totalAllowance + overtimeAmount;
        const netSalary = grossSalary - totalDeduction - attendanceDeduction;

        return await payrollModel.create({
            periodId,
            userId,
            baseSalary,
            totalAllowance,
            totalDeduction,
            overtimeAmount,
            attendanceDeduction,
            grossSalary,
            netSalary,
            totalWorkDays,
            totalPresent: attendanceStats.totalPresent,
            totalAbsent,
            totalLate: attendanceStats.totalLate,
            totalOvertimeHours: overtimeData.totalHours,
            items,
        });
    },

    async generatePayrollForAll(periodId) {
        const period = await payrollModel.findPeriodById(periodId);
        if (!period) {
            throw Object.assign(new Error('Payroll period not found'), { statusCode: 404 });
        }

        const activeUsers = await prisma.user.findMany({
            where: {
                isActive: true,
                employeeSalary: { isNot: null },
            },
        });

        const results = { success: [], failed: [] };

        for (const user of activeUsers) {
            try {
                const payroll = await this.generatePayroll(periodId, user.id);
                results.success.push({ userId: user.id, payrollId: payroll.id });
            } catch (error) {
                results.failed.push({ userId: user.id, error: error.message });
            }
        }

        return results;
    },

    async getPayrollById(id) {
        const payroll = await payrollModel.findById(id);
        if (!payroll) {
            throw Object.assign(new Error('Payroll not found'), { statusCode: 404 });
        }
        return payroll;
    },

    async getAllPayrolls(filters) {
        return await payrollModel.findAll(filters);
    },

    async markAsPaid(id) {
        const payroll = await payrollModel.findById(id);
        if (!payroll) {
            throw Object.assign(new Error('Payroll not found'), { statusCode: 404 });
        }

        if (payroll.status === 'paid') {
            throw Object.assign(new Error('Payroll already paid'), { statusCode: 400 });
        }

        return await payrollModel.update(id, {
            status: 'paid',
            paidAt: new Date(),
        });
    },

    async approvePayroll(id) {
        const payroll = await payrollModel.findById(id);
        if (!payroll) {
            throw Object.assign(new Error('Payroll not found'), { statusCode: 404 });
        }

        if (payroll.status !== 'draft') {
            throw Object.assign(
                new Error(`Cannot approve payroll with status: ${payroll.status}`),
                { statusCode: 400 }
            );
        }

        return await payrollModel.update(id, { status: 'approved' });
    },

    async deletePayroll(id) {
        const payroll = await payrollModel.findById(id);
        if (!payroll) {
            throw Object.assign(new Error('Payroll not found'), { statusCode: 404 });
        }

        if (payroll.status === 'paid') {
            throw Object.assign(new Error('Cannot delete paid payroll'), { statusCode: 400 });
        }

        await payrollModel.delete(id);
        return { message: 'Payroll deleted successfully' };
    },
};

module.exports = payrollService;
