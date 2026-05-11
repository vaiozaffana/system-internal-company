const employeeService = require('../services/employeeService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const employeeController = {
    async create(req, res) {
        try {
            const employee = await employeeService.createEmployee(req.body);
            return successResponse(res, employee, 'Employee created successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    },

    async getById(req, res) {
        try {
            const employee = await employeeService.getEmployeeById(req.params.id);
            return successResponse(res, employee);
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    },

    async getAll(req, res) {
        try {
            const filters = {
                department: req.query.department,
                isActive: req.query.is_active,
            };
            const employees = await employeeService.getAllEmployees(filters);
            return successResponse(res, employees);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    async update(req, res) {
        try {
            const employee = await employeeService.updateEmployee(req.params.id, req.body);
            return successResponse(res, employee, 'Employee updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    },

    async delete(req, res) {
        try {
            const result = await employeeService.deleteEmployee(req.params.id);
            return successResponse(res, result, 'Employee deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    },
};

module.exports = employeeController;
