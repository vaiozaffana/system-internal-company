const attendanceModel = require('./attendance.model');
const usersModel = require('../users/users.model');
const config = require('../../config/app');
const { isWithinOfficeRadius } = require('../../shared/utils/gps.helper');
const {
    validateCheckInTime,
    validateCheckOutTime,
} = require('../../shared/utils/attendance.helper');

const attendanceService = {
    async checkIn(userId, latitude, longitude, notes) {
        const user = await usersModel.findById(userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }

        if (!user.isActive) {
            throw Object.assign(new Error('User account is inactive'), { statusCode: 403 });
        }

        const locationCheck = isWithinOfficeRadius(latitude, longitude);
        if (!locationCheck.isWithinRadius) {
            throw Object.assign(
                new Error(
                    `You are ${locationCheck.distance}m away from office. Must be within ${locationCheck.allowedRadius}m radius`
                ),
                { statusCode: 400 }
            );
        }

        const now = new Date();
        const existing = await attendanceModel.findByUserAndDate(userId, now);
        if (existing && !existing.checkOutTime) {
            throw Object.assign(
                new Error('You have already checked in today. Please check out first'),
                { statusCode: 400 }
            );
        }
        if (existing && existing.checkOutTime) {
            throw Object.assign(new Error('You have already completed attendance today'), {
                statusCode: 400,
            });
        }

        const timeCheck = validateCheckInTime(now);

        const attendance = await attendanceModel.create({
            userId,
            checkInTime: now,
            checkInLatitude: latitude,
            checkInLongitude: longitude,
            status: timeCheck.status,
            notes,
        });

        return {
            ...attendance,
            lateMinutes: timeCheck.lateMinutes,
            locationCheck,
        };
    },

    async checkOut(userId, latitude, longitude) {
        const now = new Date();
        const attendance = await attendanceModel.findByUserAndDate(userId, now);

        if (!attendance) {
            throw Object.assign(new Error('No check-in record found for today'), {
                statusCode: 404,
            });
        }

        if (attendance.checkOutTime) {
            throw Object.assign(new Error('You have already checked out today'), {
                statusCode: 400,
            });
        }

        const locationCheck = isWithinOfficeRadius(latitude, longitude);
        if (!locationCheck.isWithinRadius) {
            throw Object.assign(
                new Error(
                    `You are ${locationCheck.distance}m away from office. Must be within ${locationCheck.allowedRadius}m radius`
                ),
                { statusCode: 400 }
            );
        }

        const timeCheck = validateCheckOutTime(attendance.checkInTime, now);

        let finalStatus = attendance.status;
        if (timeCheck.isEarlyLeave) {
            finalStatus =
                attendance.status === 'late' ? 'late-and-early-leave' : 'early-leave';
        }

        const updated = await attendanceModel.updateCheckOut(attendance.id, {
            checkOutTime: now,
            checkOutLatitude: latitude,
            checkOutLongitude: longitude,
            status: finalStatus,
        });

        return {
            ...updated,
            workDurationHours: timeCheck.workDurationHours,
            earlyLeaveMinutes: timeCheck.earlyLeaveMinutes,
            locationCheck,
        };
    },

    async getAttendanceById(id) {
        const attendance = await attendanceModel.findById(id);
        if (!attendance) {
            throw Object.assign(new Error('Attendance record not found'), { statusCode: 404 });
        }
        return attendance;
    },

    async getUserAttendance(userId, filters) {
        const user = await usersModel.findById(userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }
        return await attendanceModel.findByUser(userId, filters);
    },

    async getUserTodayAttendance(userId) {
        return await attendanceModel.findByUserAndDate(userId, new Date());
    },

    async testLocation(latitude, longitude) {
        return isWithinOfficeRadius(latitude, longitude);
    },

    getAttendanceConfig() {
        return {
            workStartTime: config.attendance.workStartTime,
            workEndTime: config.attendance.workEndTime,
            lateToleranceMinutes: config.attendance.lateToleranceMinutes,
            minWorkDurationHours: config.attendance.minWorkDurationHours,
        };
    },

    async getAllAttendance(filters) {
        return await attendanceModel.findAll(filters);
    },

    async deleteAttendance(id) {
        const attendance = await attendanceModel.findById(id);
        if (!attendance) {
            throw Object.assign(new Error('Attendance record not found'), { statusCode: 404 });
        }
        await attendanceModel.delete(id);
        return { message: 'Attendance record deleted successfully' };
    },
};

module.exports = attendanceService;