const attendanceConfigModel = require('./attendanceConfig.model');

const DEFAULT_CONFIG = {
    workStartTime: '08:30',
    workEndTime: '16:30',
    lateToleranceMinutes: 15,
    earlyCheckInMaxHours: 3,
    lateCheckInMaxHours: 4,
    minWorkDurationHours: 4,
};

const attendanceConfigService = {
    async getCurrent() {
        const existing = await attendanceConfigModel.findCurrent();
        if (existing) return existing;
        return await attendanceConfigModel.create(DEFAULT_CONFIG);
    },

    async update(payload, updatedBy) {
        const current = await attendanceConfigService.getCurrent();
        const data = {
            workStartTime: payload.workStartTime,
            workEndTime: payload.workEndTime,
            lateToleranceMinutes: payload.lateToleranceMinutes,
            earlyCheckInMaxHours: payload.earlyCheckInMaxHours,
            lateCheckInMaxHours: payload.lateCheckInMaxHours,
            minWorkDurationHours: payload.minWorkDurationHours,
            updatedBy: updatedBy ?? null,
        };
        return await attendanceConfigModel.update(current.id, data);
    },
};

module.exports = attendanceConfigService;
