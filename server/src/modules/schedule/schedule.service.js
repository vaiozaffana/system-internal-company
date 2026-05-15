const prisma = require('../../config/database');

const scheduleService = {
    async getByDateRange(startDate, endDate) {
        const schedules = await prisma.schedule.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: { date: 'asc' },
            include: { members: true },
        });

        const userIds = new Set();
        for (const s of schedules) {
            if (s.leaderId) userIds.add(s.leaderId);
            for (const m of s.members) userIds.add(m.userId);
        }

        const users = userIds.size > 0
            ? await prisma.user.findMany({
                  where: { id: { in: [...userIds] } },
                  select: { id: true, fullName: true, employeeCode: true, department: true },
              })
            : [];
        const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

        return schedules.map((s) => ({
            id: s.id,
            date: s.date.toISOString().slice(0, 10),
            shiftName: s.shiftName,
            startTime: s.startTime,
            endTime: s.endTime,
            room: s.room,
            isActive: s.isActive,
            leaderId: s.leaderId,
            leader: s.leaderId ? userMap[s.leaderId] || null : null,
            members: s.members.map((m) => ({
                userId: m.userId,
                ...(userMap[m.userId] || {}),
            })),
        }));
    },

    async upsertDate(dateStr, payload, updatedBy) {
        const date = new Date(dateStr + 'T00:00:00.000Z');

        const data = {
            shiftName: payload.shiftName || 'PAGI',
            startTime: payload.startTime || '08:00',
            endTime: payload.endTime || '17:00',
            room: payload.room || null,
            isActive: payload.isActive !== undefined ? payload.isActive : true,
            leaderId: payload.leaderId ? parseInt(payload.leaderId) : null,
            updatedBy,
        };

        const schedule = await prisma.schedule.upsert({
            where: { date },
            create: { date, ...data },
            update: data,
        });

        await prisma.scheduleMember.deleteMany({ where: { scheduleId: schedule.id } });

        const memberIds = Array.isArray(payload.memberIds) ? payload.memberIds : [];
        if (memberIds.length > 0) {
            await prisma.scheduleMember.createMany({
                data: memberIds.map((uid) => ({
                    scheduleId: schedule.id,
                    userId: parseInt(uid),
                })),
            });
        }

        return schedule;
    },
};

module.exports = scheduleService;
