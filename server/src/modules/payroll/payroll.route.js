const express = require('express');
const payrollController = require('./payroll.controller');

const router = express.Router();

router.post('/components', payrollController.createComponent);
router.get('/components', payrollController.getAllComponents);
router.get('/components/:id', payrollController.getComponentById);
router.put('/components/:id', payrollController.updateComponent);
router.delete('/components/:id', payrollController.deleteComponent);

router.get('/salaries', payrollController.getAllEmployeeSalaries);
router.post('/salaries/:userId', payrollController.setEmployeeSalary);
router.get('/salaries/:userId', payrollController.getEmployeeSalary);
router.post('/salaries/:userId/components', payrollController.addSalaryComponent);
router.delete(
    '/salaries/:userId/components/:componentId',
    payrollController.removeSalaryComponent
);

router.post('/overtime', payrollController.createOvertime);
router.get('/overtime', payrollController.getAllOvertime);
router.get('/overtime/user/:userId', payrollController.getOvertimeByUser);
router.patch('/overtime/:id/approve', payrollController.approveOvertime);
router.patch('/overtime/:id/reject', payrollController.rejectOvertime);
router.delete('/overtime/:id', payrollController.deleteOvertime);

router.post('/periods', payrollController.createPeriod);
router.get('/periods', payrollController.getAllPeriods);
router.get('/periods/:id', payrollController.getPeriodById);
router.patch('/periods/:id/close', payrollController.closePeriod);

router.post(
    '/generate/:periodId/user/:userId',
    payrollController.generatePayroll
);
router.post('/generate/:periodId/all', payrollController.generatePayrollForAll);

router.get('/', payrollController.getAllPayrolls);
router.get('/:id', payrollController.getPayrollById);
router.patch('/:id/approve', payrollController.approvePayroll);
router.patch('/:id/pay', payrollController.markAsPaid);
router.delete('/:id', payrollController.deletePayroll);

module.exports = router;
