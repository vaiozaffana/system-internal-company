const overtimeModel = require('./overtime.model');
const usersModel = require('../users/users.model');
const employeeSalaryModel = require('./employeeSalary.model');

const STANDARD_WORK_HOURS_PER_MONTH = 173;

const calculateHourlyRate = (baseSalary) => {
    return Number(baseSalary) / STANDARD_WORK_HOURS_PER_MONTH;
};

const calculateOvertimeAmount = (hours, hourlyRate, multiplier = 1.5) => {
    return Number(hours) * Number(hourlyRate) * multiplier;
};

const overtimeService = {
    async create(data) {
        const user = await usersModel.findById(data.userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        if (!data.hours || data.hours <= 0) {
            throw Object.assign(new Error('Hours must be greater than 0'), { statusCode: 400 });
        }

        const salary = await employeeSalaryModel.findByUserId(data.userId);
        if (!salary) {
            throw Object.assign(
                new Error('Employee salary not set. Please set base salary first'),
                { statusCode: 400 }
            );
        }

        const hourlyRate = calculateHourlyRate(salary.baseSalary);
        const totalAmount = calculateOvertimeAmount(data.hours, hourlyRate);

        return await overtimeModel.create({
            userId: data.userId,
            date: data.date,
            hours: data.hours,
            hourlyRate,
            totalAmount,
            notes: data.notes,
        });
    },

    async getById(id) {
        const record = await overtimeModel.findById(id);
        if (!record) {
            throw Object.assign(new Error('Overtime record not found'), { statusCode: 404 });
        }
        return record;
    },

    async getByUser(userId, filters) {
        const user = await usersModel.findById(userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }
        return await overtimeModel.findByUser(userId, filters);
    },

    async getAll(filters) {
        return await overtimeModel.findAll(filters);
    },

    async approve(id, approvedBy) {
        const record = await overtimeModel.findById(id);
        if (!record) {
            throw Object.assign(new Error('Overtime record not found'), { statusCode: 404 });
        }

        if (record.status !== 'pending') {
            throw Object.assign(
                new Error(`Cannot approve record with status: ${record.status}`),
                { statusCode: 400 }
            );
        }

        return await overtimeModel.approve(id, approvedBy);
    },

    async reject(id, approvedBy) {
        const record = await overtimeModel.findById(id);
        if (!record) {
            throw Object.assign(new Error('Overtime record not found'), { statusCode: 404 });
        }

        if (record.status !== 'pending') {
            throw Object.assign(
                new Error(`Cannot reject record with status: ${record.status}`),
                { statusCode: 400 }
            );
        }

        return await overtimeModel.reject(id, approvedBy);
    },

    async delete(id) {
        const record = await overtimeModel.findById(id);
        if (!record) {
            throw Object.assign(new Error('Overtime record not found'), { statusCode: 404 });
        }

        if (record.status === 'approved') {
            throw Object.assign(new Error('Cannot delete approved overtime record'), {
                statusCode: 400,
            });
        }

        await overtimeModel.delete(id);
        return { message: 'Overtime record deleted successfully' };
    },
};

module.exports = overtimeService;
