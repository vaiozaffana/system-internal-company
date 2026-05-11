const employeeSalaryModel = require('./employeeSalary.model');
const salaryComponentModel = require('./salaryComponent.model');
const usersModel = require('../users/users.model');

const employeeSalaryService = {
    async setSalary(userId, data) {
        const user = await usersModel.findById(userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        if (!data.baseSalary || data.baseSalary <= 0) {
            throw Object.assign(new Error('Base salary must be greater than 0'), {
                statusCode: 400,
            });
        }

        return await employeeSalaryModel.upsert(userId, {
            baseSalary: data.baseSalary,
            effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
        });
    },

    async getByUserId(userId) {
        const salary = await employeeSalaryModel.findByUserId(userId);
        if (!salary) {
            throw Object.assign(new Error('Employee salary not set'), { statusCode: 404 });
        }
        return salary;
    },

    async getAll() {
        return await employeeSalaryModel.findAll();
    },

    async addComponent(userId, componentId, amount) {
        const salary = await employeeSalaryModel.findByUserId(userId);
        if (!salary) {
            throw Object.assign(new Error('Employee salary not set. Set base salary first'), {
                statusCode: 404,
            });
        }

        const component = await salaryComponentModel.findById(componentId);
        if (!component) {
            throw Object.assign(new Error('Salary component not found'), { statusCode: 404 });
        }

        if (amount === undefined || amount < 0) {
            throw Object.assign(new Error('Amount must be 0 or greater'), { statusCode: 400 });
        }

        return await employeeSalaryModel.addComponent(salary.id, componentId, amount);
    },

    async removeComponent(userId, componentId) {
        const salary = await employeeSalaryModel.findByUserId(userId);
        if (!salary) {
            throw Object.assign(new Error('Employee salary not found'), { statusCode: 404 });
        }

        await employeeSalaryModel.removeComponent(salary.id, componentId);
        return { message: 'Component removed successfully' };
    },

    async delete(userId) {
        const salary = await employeeSalaryModel.findByUserId(userId);
        if (!salary) {
            throw Object.assign(new Error('Employee salary not found'), { statusCode: 404 });
        }

        await employeeSalaryModel.delete(userId);
        return { message: 'Employee salary deleted successfully' };
    },
};

module.exports = employeeSalaryService;
