const attendanceModel = require('../models/attendanceModel');
const employeeModel = require('../models/employeeModel');
const { isWithinOfficeRadius } = require('../utils/gpsHelper');

const attendanceService = {
    async checkIn(employeeId, latitude, longitude, notes) {
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        if (!employee.is_active) {
            throw new Error('Employee account is inactive');
        }

        const locationCheck = isWithinOfficeRadius(latitude, longitude);
        if (!locationCheck.isWithinRadius) {
            throw new Error(
                `You are ${locationCheck.distance}m away from office. Must be within ${locationCheck.allowedRadius}m radius`
            );
        }

        const today = new Date();
        const existingAttendance = await attendanceModel.findByEmployeeAndDate(employeeId, today);
        if (existingAttendance && !existingAttendance.check_out_time) {
            throw new Error('You have already checked in today. Please check out first');
        }

        const attendance = await attendanceModel.create({
            employeeId,
            checkInTime: new Date(),
            checkInLatitude: latitude,
            checkInLongitude: longitude,
            status: 'present',
            notes,
        });

        return {
            ...attendance,
            locationCheck,
        };
    },

    async checkOut(employeeId, latitude, longitude) {
        const today = new Date();
        const attendance = await attendanceModel.findByEmployeeAndDate(employeeId, today);

        if (!attendance) {
            throw new Error('No check-in record found for today');
        }

        if (attendance.check_out_time) {
            throw new Error('You have already checked out today');
        }

        const locationCheck = isWithinOfficeRadius(latitude, longitude);
        if (!locationCheck.isWithinRadius) {
            throw new Error(
                `You are ${locationCheck.distance}m away from office. Must be within ${locationCheck.allowedRadius}m radius`
            );
        }

        const updated = await attendanceModel.updateCheckOut(attendance.id, {
            checkOutTime: new Date(),
            checkOutLatitude: latitude,
            checkOutLongitude: longitude,
        });

        return {
            ...updated,
            locationCheck,
        };
    },

    async getAttendanceById(id) {
        const attendance = await attendanceModel.findById(id);
        if (!attendance) {
            throw new Error('Attendance record not found');
        }
        return attendance;
    },

    async getEmployeeAttendance(employeeId, filters) {
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        return await attendanceModel.findByEmployee(employeeId, filters);
    },

    async getAllAttendance(filters) {
        return await attendanceModel.findAll(filters);
    },

    async deleteAttendance(id) {
        const attendance = await attendanceModel.findById(id);
        if (!attendance) {
            throw new Error('Attendance record not found');
        }

        await attendanceModel.delete(id);
        return { message: 'Attendance record deleted successfully' };
    },
};

module.exports = attendanceService;
