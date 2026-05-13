const attendanceModel = require('./attendance.model');
const usersModel = require('../users/users.model');
const config = require('../../config/app');
const { isWithinOfficeRadius } = require('../../shared/utils/gps.helper');
const {
    validateCheckInTime,
    validateCheckOutTime,
} = require('../../shared/utils/attendance.helper');
const prisma = require('../../config/database');

const getPayrollConfig = async () => {
    const existing = await prisma.payrollConfig.findFirst({ orderBy: { id: 'asc' } });
    if (existing) return existing;
    return await prisma.payrollConfig.create({ data: {} });
};

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

        if (timeCheck.isOvertime && timeCheck.overtimeHours >= 0.5) {
            const payrollConfig = await getPayrollConfig();
            const hours = timeCheck.overtimeHours;
            const hourlyRate = Number(payrollConfig.overtimeHourlyRate);
            await prisma.overtimeRecord.create({
                data: {
                    userId: parseInt(userId),
                    date: now,
                    hours,
                    hourlyRate,
                    totalAmount: hours * hourlyRate,
                    status: 'pending',
                    notes: `Auto-detected: ${hours} jam lembur setelah jam pulang`,
                },
            });
        }

        return {
            ...updated,
            workDurationHours: timeCheck.workDurationHours,
            earlyLeaveMinutes: timeCheck.earlyLeaveMinutes,
            overtimeHours: timeCheck.overtimeHours,
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
        return attendanceConfigService.getCurrent();
    },

    async getAllAttendance(filters) {
        return await attendanceModel.findAll(filters);
    },

    async getMonthlyReport(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const records = await attendanceModel.findAll({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });

        const userMap = {};
        for (const record of records) {
            const uid = record.userId;
            if (!userMap[uid]) {
                userMap[uid] = {
                    userId: uid,
                    employeeCode: record.user?.employeeCode ?? '',
                    fullName: record.user?.fullName ?? '',
                    department: record.user?.department ?? '',
                    totalPresent: 0,
                    totalLate: 0,
                    totalEarlyLeave: 0,
                    totalDays: 0,
                };
            }
            userMap[uid].totalDays++;
            const status = (record.status || '').toLowerCase();
            if (status === 'present') userMap[uid].totalPresent++;
            else if (status === 'late') userMap[uid].totalLate++;
            else if (status === 'early-leave' || status === 'late-and-early-leave') userMap[uid].totalEarlyLeave++;
        }

        return {
            month,
            year,
            summary: Object.values(userMap),
        };
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