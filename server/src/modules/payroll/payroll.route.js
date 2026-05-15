const express = require('express');
const payrollController = require('./payroll.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/rbac.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/my-slip', payrollController.getMySlip);

router.get('/config', requireAdmin, payrollController.getConfig);
router.put('/config', requireAdmin, payrollController.updateConfig);
router.get('/slips', requireAdmin, payrollController.getSlips);
router.post('/generate', requireAdmin, payrollController.generateAll);
router.get('/overtime', requireAdmin, payrollController.getOvertimeRecords);
router.put('/overtime/:id/approve', requireAdmin, payrollController.approveOvertime);
router.put('/overtime/:id/reject', requireAdmin, payrollController.rejectOvertime);

router.get('/salary-components', requireAdmin, payrollController.getSalaryComponents);
router.get('/employee-salaries', requireAdmin, payrollController.getEmployeeSalaries);
router.get('/employee-salaries/:userId', requireAdmin, payrollController.getEmployeeSalary);
router.put('/employee-salaries/:userId', requireAdmin, payrollController.upsertEmployeeSalary);

module.exports = router;
