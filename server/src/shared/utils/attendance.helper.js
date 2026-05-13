const config = require('../../config/app');

const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map((v) => parseInt(v, 10));
    return hours * 60 + minutes;
};

const getShiftBoundaries = (referenceDate = new Date()) => {
    const base = new Date(referenceDate);
    base.setSeconds(0, 0);

    const startMinutes = parseTimeToMinutes(config.attendance.workStartTime);
    const endMinutes = parseTimeToMinutes(config.attendance.workEndTime);

    const shiftStart = new Date(base);
    shiftStart.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

    const shiftEnd = new Date(base);
    shiftEnd.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    return { shiftStart, shiftEnd };
};

const formatHHmm = (date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const validateCheckInTime = (checkInTime = new Date()) => {
    const { shiftStart } = getShiftBoundaries(checkInTime);
    const { lateToleranceMinutes } = config.attendance;

    const diffMinutes = Math.floor((checkInTime - shiftStart) / 60000);
    const status = diffMinutes > lateToleranceMinutes ? 'late' : 'present';
    const lateMinutes = status === 'late' ? diffMinutes : 0;

    return { status, lateMinutes, shiftStart };
};

const validateCheckOutTime = (checkInTime, checkOutTime = new Date()) => {
    const { shiftEnd } = getShiftBoundaries(checkOutTime);
    const { minWorkDurationHours } = config.attendance;

    const workDurationMs = checkOutTime - new Date(checkInTime);
    const workDurationHours = workDurationMs / (60 * 60 * 1000);

    if (workDurationHours < minWorkDurationHours) {
        const err = new Error(
            `Durasi kerja minimal ${minWorkDurationHours} jam. Saat ini baru ${workDurationHours.toFixed(1)} jam. Hubungi atasan untuk izin pulang awal.`
        );
        err.statusCode = 400;
        throw err;
    }

    const isEarlyLeave = checkOutTime < shiftEnd;
    const earlyLeaveMinutes = isEarlyLeave ? Math.floor((shiftEnd - checkOutTime) / 60000) : 0;
    const isOvertime = checkOutTime > shiftEnd;
    const overtimeMinutes = isOvertime ? Math.floor((checkOutTime - shiftEnd) / 60000) : 0;

    return {
        isEarlyLeave,
        earlyLeaveMinutes,
        isOvertime,
        overtimeMinutes,
        overtimeHours: Number((overtimeMinutes / 60).toFixed(2)),
        workDurationHours: Number(workDurationHours.toFixed(2)),
    };
};

module.exports = {
    getShiftBoundaries,
    validateCheckInTime,
    validateCheckOutTime,
};
