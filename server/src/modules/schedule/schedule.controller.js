const scheduleService = require('./schedule.service');
const auditLogService = require('../../shared/services/auditLog.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.helper');

const scheduleController = {
    async getAll(req, res) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return errorResponse(res, 'Query params start and end are required (YYYY-MM-DD)', 400);
            }
            const schedules = await scheduleService.getByDateRange(start, end);
            return successResponse(res, schedules);
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },

    async upsertDay(req, res) {
        try {
            const { date } = req.params;
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return errorResponse(res, 'Param date must be YYYY-MM-DD', 400);
            }
            const result = await scheduleService.upsertDate(date, req.body, req.user.id);

            let leaderName = null;
            if (req.body.leaderId) {
                const prisma = require('../../config/database');
                const leader = await prisma.user.findUnique({
                    where: { id: parseInt(req.body.leaderId) },
                    select: { fullName: true },
                });
                leaderName = leader?.fullName || null;
            }

            await auditLogService.log({
                userId: req.user.id,
                action: 'schedule_updated',
                entity: 'schedule',
                entityId: result.id,
                details: {
                    date,
                    shiftName: req.body.shiftName,
                    jam: req.body.isActive ? `${req.body.startTime} - ${req.body.endTime}` : 'OFF',
                    leader: leaderName,
                    anggota: Array.isArray(req.body.memberIds) ? req.body.memberIds.length : 0,
                },
                ipAddress: req.ip,
            });
            return successResponse(res, result, 'Jadwal disimpan');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    },
};

module.exports = scheduleController;
