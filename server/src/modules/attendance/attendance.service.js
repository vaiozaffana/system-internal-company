const attendanceModel = require('./attendance.model');
const usersModel = require('../users/users.model');
const { isWithinOfficeRadius } = require('../../shared/utils/gps.helper');

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

        const today = new Date();
        const existing = await attendanceModel.findByUserAndDate(userId, today);
        if (existing && !existing.checkOutTime) {
            throw Object.assign(
                new Error('You have already checked in today. Please check out first'),
                { statusCode: 400 }
            );
        }

        const attendance = await attendanceModel.create({
            userId,
            checkInTime: new Date(),
            checkInLatitude: latitude,
            checkInLongitude: longitude,
            status: 'present',
            notes,
        });

        return { ...attendance, locationCheck };
    },

    async checkOut(userId, latitude, longitude) {
        const today = new Date();
        const attendance = await attendanceModel.findByUserAndDate(userId, today);

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

        const updated = await attendanceModel.updateCheckOut(attendance.id, {
            checkOutTime: new Date(),
            checkOutLatitude: latitude,
            checkOutLongitude: longitude,
        });

        return { ...updated, locationCheck };
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
