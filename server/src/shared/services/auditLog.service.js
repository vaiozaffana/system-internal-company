const prisma = require('../../config/database');

const auditLogService = {
    async log({ userId, action, entity, entityId, details, ipAddress }) {
        return await prisma.auditLog.create({
            data: {
                userId: userId ? parseInt(userId) : null,
                action,
                entity,
                entityId: entityId ? parseInt(entityId) : null,
                details: details ? JSON.stringify(details) : null,
                ipAddress: ipAddress || null,
            },
        });
    },

    async getAll(filters = {}) {
        const where = {};
        if (filters.userId) where.userId = parseInt(filters.userId);
        if (filters.entity) where.entity = filters.entity;
        if (filters.action) where.action = filters.action;

        return await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: filters.limit ? parseInt(filters.limit) : 100,
        });
    },
};

module.exports = auditLogService;
