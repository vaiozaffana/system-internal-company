const payrollService = require('./payroll.service');
const salaryComponentService = require('./salaryComponent.service');
const employeeSalaryService = require('./employeeSalary.service');
const overtimeService = require('./overtime.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const payrollController = {
    async createComponent(req, res) {
        try {
            const component = await salaryComponentService.create(req.body);
            return successResponse(res, component, 'Component created successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAllComponents(req, res) {
        try {
            const filters = { type: req.query.type, isActive: req.query.is_active };
            const components = await salaryComponentService.getAll(filters);
            return successResponse(res, components);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getComponentById(req, res) {
        try {
            const component = await salaryComponentService.getById(req.params.id);
            return successResponse(res, component);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async updateComponent(req, res) {
        try {
            const component = await salaryComponentService.update(req.params.id, req.body);
            return successResponse(res, component, 'Component updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async deleteComponent(req, res) {
        try {
            const result = await salaryComponentService.delete(req.params.id);
            return successResponse(res, result, 'Component deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async setEmployeeSalary(req, res) {
        try {
            const salary = await employeeSalaryService.setSalary(req.params.userId, req.body);
            return successResponse(res, salary, 'Salary set successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getEmployeeSalary(req, res) {
        try {
            const salary = await employeeSalaryService.getByUserId(req.params.userId);
            return successResponse(res, salary);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAllEmployeeSalaries(req, res) {
        try {
            const salaries = await employeeSalaryService.getAll();
            return successResponse(res, salaries);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async addSalaryComponent(req, res) {
        try {
            const { componentId, amount } = req.body;
            const result = await employeeSalaryService.addComponent(
                req.params.userId,
                componentId,
                amount
            );
            return successResponse(res, result, 'Component added successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async removeSalaryComponent(req, res) {
        try {
            const result = await employeeSalaryService.removeComponent(
                req.params.userId,
                req.params.componentId
            );
            return successResponse(res, result, 'Component removed successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async createOvertime(req, res) {
        try {
            const overtime = await overtimeService.create(req.body);
            return successResponse(res, overtime, 'Overtime recorded successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAllOvertime(req, res) {
        try {
            const filters = {
                status: req.query.status,
                userId: req.query.user_id,
                startDate: req.query.start_date,
                endDate: req.query.end_date,
            };
            const records = await overtimeService.getAll(filters);
            return successResponse(res, records);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getOvertimeByUser(req, res) {
        try {
            const filters = {
                status: req.query.status,
                startDate: req.query.start_date,
                endDate: req.query.end_date,
            };
            const records = await overtimeService.getByUser(req.params.userId, filters);
            return successResponse(res, records);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async approveOvertime(req, res) {
        try {
            const approvedBy = req.body.approvedBy || 1;
            const record = await overtimeService.approve(req.params.id, approvedBy);
            return successResponse(res, record, 'Overtime approved');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async rejectOvertime(req, res) {
        try {
            const approvedBy = req.body.approvedBy || 1;
            const record = await overtimeService.reject(req.params.id, approvedBy);
            return successResponse(res, record, 'Overtime rejected');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async deleteOvertime(req, res) {
        try {
            const result = await overtimeService.delete(req.params.id);
            return successResponse(res, result, 'Overtime deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async createPeriod(req, res) {
        try {
            const period = await payrollService.createPeriod(req.body);
            return successResponse(res, period, 'Period created successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAllPeriods(req, res) {
        try {
            const filters = { year: req.query.year, status: req.query.status };
            const periods = await payrollService.getAllPeriods(filters);
            return successResponse(res, periods);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getPeriodById(req, res) {
        try {
            const period = await payrollService.getPeriodById(req.params.id);
            return successResponse(res, period);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async closePeriod(req, res) {
        try {
            const period = await payrollService.closePeriod(req.params.id);
            return successResponse(res, period, 'Period closed successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async generatePayroll(req, res) {
        try {
            const { periodId, userId } = req.params;
            const payroll = await payrollService.generatePayroll(periodId, userId);
            return successResponse(res, payroll, 'Payroll generated successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async generatePayrollForAll(req, res) {
        try {
            const result = await payrollService.generatePayrollForAll(req.params.periodId);
            return successResponse(res, result, 'Payroll generation completed');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getAllPayrolls(req, res) {
        try {
            const filters = {
                periodId: req.query.period_id,
                userId: req.query.user_id,
                status: req.query.status,
            };
            const payrolls = await payrollService.getAllPayrolls(filters);
            return successResponse(res, payrolls);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getPayrollById(req, res) {
        try {
            const payroll = await payrollService.getPayrollById(req.params.id);
            return successResponse(res, payroll);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async approvePayroll(req, res) {
        try {
            const payroll = await payrollService.approvePayroll(req.params.id);
            return successResponse(res, payroll, 'Payroll approved');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async markAsPaid(req, res) {
        try {
            const payroll = await payrollService.markAsPaid(req.params.id);
            return successResponse(res, payroll, 'Payroll marked as paid');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async deletePayroll(req, res) {
        try {
            const result = await payrollService.deletePayroll(req.params.id);
            return successResponse(res, result, 'Payroll deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = payrollController;
