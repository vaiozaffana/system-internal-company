const payrollService = require('./payroll.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const payrollController = {
    async getConfig(req, res) {
        try {
            const config = await payrollService.getConfig();
            return successResponse(res, config);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async updateConfig(req, res) {
        try {
            const updated = await payrollService.updateConfig(req.body, req.user.id);
            return successResponse(res, updated, 'Payroll config updated');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getMySlip(req, res) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const slip = await payrollService.getMySlip(req.user.id, month, year);
            if (!slip) {
                return errorResponse(res, 'Salary data not configured for your account', 404);
            }
            return successResponse(res, slip);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async generateAll(req, res) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const slips = await payrollService.generateAll(month, year);
            return successResponse(res, { month, year, slips });
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getOvertimeRecords(req, res) {
        try {
            const filters = {
                userId: req.query.user_id,
                status: req.query.status,
                month: req.query.month ? parseInt(req.query.month) : undefined,
                year: req.query.year ? parseInt(req.query.year) : undefined,
            };
            const records = await payrollService.getOvertimeRecords(filters);
            return successResponse(res, records);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async approveOvertime(req, res) {
        try {
            const result = await payrollService.approveOvertime(req.params.id, req.user.id);
            return successResponse(res, result, 'Overtime approved');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async rejectOvertime(req, res) {
        try {
            const result = await payrollService.rejectOvertime(req.params.id, req.user.id);
            return successResponse(res, result, 'Overtime rejected');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getSalaryComponents(req, res) {
        try {
            const components = await payrollService.getSalaryComponents();
            return successResponse(res, components);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getEmployeeSalaries(req, res) {
        try {
            const list = await payrollService.getEmployeeSalaries();
            return successResponse(res, list);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getEmployeeSalary(req, res) {
        try {
            const data = await payrollService.getEmployeeSalary(req.params.userId);
            if (!data) return errorResponse(res, 'Belum dikonfigurasi', 404);
            return successResponse(res, data);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async upsertEmployeeSalary(req, res) {
        try {
            const result = await payrollService.upsertEmployeeSalary(req.params.userId, req.body);
            return successResponse(res, result, 'Gaji karyawan disimpan');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = payrollController;
