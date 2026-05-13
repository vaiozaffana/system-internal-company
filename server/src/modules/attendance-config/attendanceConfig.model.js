const prisma = require('../../config/database');

const toPlain = (record) => {
    if (!record) return null;
    return {
        id: record.id,
        workStartTime: record.workStartTime,
        workEndTime: record.workEndTime,
        lateToleranceMinutes: record.lateToleranceMinutes,
        earlyCheckInMaxHours: Number(record.earlyCheckInMaxHours),
        lateCheckInMaxHours: Number(record.lateCheckInMaxHours),
        minWorkDurationHours: Number(record.minWorkDurationHours),
        updatedBy: record.updatedBy,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
};

const attendanceConfigModel = {
    async findCurrent() {
        const record = await prisma.attendanceConfig.findFirst({
            orderBy: { id: 'asc' },
        });
        return toPlain(record);
    },

    async create(data) {
        const record = await prisma.attendanceConfig.create({ data });
        return toPlain(record);
    },

    async update(id, data) {
        const record = await prisma.attendanceConfig.update({
            where: { id: parseInt(id) },
            data,
        });
        return toPlain(record);
    },
};

module.exports = attendanceConfigModel;
