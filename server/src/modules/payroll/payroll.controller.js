const payrollService = require('./payroll.service');
const auditLogService = require('../../shared/services/auditLog.service');
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
            const before = await payrollService.getConfig();
            const updated = await payrollService.updateConfig(req.body, req.user.id);
            const changes = {};
            for (const key of Object.keys(req.body)) {
                const oldVal = Number(before[key]);
                const newVal = Number(req.body[key]);
                if (oldVal !== newVal) {
                    changes[key] = { from: oldVal, to: newVal };
                }
            }
            if (Object.keys(changes).length > 0) {
                await auditLogService.log({
                    userId: req.user.id,
                    action: 'payroll_config_updated',
                    entity: 'payroll_config',
                    entityId: updated.id,
                    details: changes,
                    ipAddress: req.ip,
                });
            }
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
                return errorResponse(res, 'Slip gaji belum tersedia untuk periode ini', 404);
            }
            return successResponse(res, slip);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async generateAll(req, res) {
        try {
            const month = parseInt(req.body.month) || new Date().getMonth() + 1;
            const year = parseInt(req.body.year) || new Date().getFullYear();
            const slips = await payrollService.generateAll(month, year);
            await auditLogService.log({
                userId: req.user.id,
                action: 'payroll_generated',
                entity: 'payroll',
                entityId: null,
                details: { month, year, count: slips.length },
                ipAddress: req.ip,
            });
            return successResponse(res, { month, year, slips }, `${slips.length} slip gaji berhasil dibuat`);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async getSlips(req, res) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const slips = await payrollService.getSlips(month, year);
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
            await auditLogService.log({
                userId: req.user.id,
                action: 'overtime_approved',
                entity: 'overtime',
                entityId: parseInt(req.params.id),
                details: { hours: result.hours, totalAmount: result.totalAmount },
                ipAddress: req.ip,
            });
            return successResponse(res, result, 'Overtime approved');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async rejectOvertime(req, res) {
        try {
            const result = await payrollService.rejectOvertime(req.params.id, req.user.id);
            await auditLogService.log({
                userId: req.user.id,
                action: 'overtime_rejected',
                entity: 'overtime',
                entityId: parseInt(req.params.id),
                details: null,
                ipAddress: req.ip,
            });
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
            await auditLogService.log({
                userId: req.user.id,
                action: 'employee_salary_updated',
                entity: 'employee_salary',
                entityId: parseInt(req.params.userId),
                details: {
                    baseSalary: req.body.baseSalary,
                    componentCount: Array.isArray(req.body.components) ? req.body.components.length : 0,
                },
                ipAddress: req.ip,
            });
            return successResponse(res, result, 'Gaji karyawan disimpan');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = payrollController;
