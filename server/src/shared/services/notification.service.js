const prisma = require('../../config/database');

const notificationService = {
    async create(userId, title, message, type = 'info') {
        return await prisma.notification.create({
            data: { userId: parseInt(userId), title, message, type },
        });
    },

    async getByUser(userId, limit = 20) {
        return await prisma.notification.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    },

    async getUnreadCount(userId) {
        return await prisma.notification.count({
            where: { userId: parseInt(userId), isRead: false },
        });
    },

    async markAsRead(id, userId) {
        return await prisma.notification.updateMany({
            where: { id: parseInt(id), userId: parseInt(userId) },
            data: { isRead: true },
        });
    },

    async markAllAsRead(userId) {
        return await prisma.notification.updateMany({
            where: { userId: parseInt(userId), isRead: false },
            data: { isRead: true },
        });
    },
};

module.exports = notificationService;
