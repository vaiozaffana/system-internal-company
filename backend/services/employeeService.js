const bcrypt = require('bcrypt');
const employeeModel = require('../models/employeeModel');

const employeeService = {
    async createEmployee(employeeData) {
        const existingEmail = await employeeModel.findByEmail(employeeData.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        const existingCode = await employeeModel.findByEmployeeCode(employeeData.employeeCode);
        if (existingCode) {
            throw new Error('Employee code already exists');
        }

        const passwordHash = await bcrypt.hash(employeeData.password, 10);

        const employee = await employeeModel.create({
            employeeCode: employeeData.employeeCode,
            fullName: employeeData.fullName,
            email: employeeData.email,
            passwordHash,
            phoneNumber: employeeData.phoneNumber,
            department: employeeData.department,
            position: employeeData.position,
        });

        return employee;
    },

    async getEmployeeById(id) {
        const employee = await employeeModel.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return employee;
    },

    async getAllEmployees(filters) {
        return await employeeModel.findAll(filters);
    },

    async updateEmployee(id, employeeData) {
        const employee = await employeeModel.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        if (employeeData.email && employeeData.email !== employee.email) {
            const existingEmail = await employeeModel.findByEmail(employeeData.email);
            if (existingEmail) {
                throw new Error('Email already exists');
            }
        }

        const updated = await employeeModel.update(id, employeeData);
        return updated;
    },

    async deleteEmployee(id) {
        const employee = await employeeModel.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        await employeeModel.delete(id);
        return { message: 'Employee deleted successfully' };
    },

    async verifyPassword(email, password) {
        const employee = await employeeModel.findByEmail(email);
        if (!employee) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, employee.password_hash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const { password_hash, ...employeeWithoutPassword } = employee;
        return employeeWithoutPassword;
    },
};

module.exports = employeeService;
