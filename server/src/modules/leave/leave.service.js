const leaveModel = require('./leave.model');
const notificationService = require('../../shared/services/notification.service');
const auditLogService = require('../../shared/services/auditLog.service');

const LEAVE_TYPES = ['sakit', 'cuti', 'izin', 'dinas'];
const LEAVE_STATUSES = ['pending', 'approved', 'rejected'];

const leaveService = {
    async create(userId, data) {
        if (!LEAVE_TYPES.includes(data.type)) {
            throw Object.assign(new Error(`Type must be one of: ${LEAVE_TYPES.join(', ')}`), {
                statusCode: 400,
            });
        }

        return await leaveModel.create({
            userId: parseInt(userId),
            type: data.type,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            reason: data.reason,
            status: 'pending',
        });
    },

    async getMyRequests(userId, filters) {
        return await leaveModel.findByUser(userId, filters);
    },

    async getAll(filters) {
        return await leaveModel.findAll(filters);
    },

    async getById(id) {
        const leave = await leaveModel.findById(id);
        if (!leave) {
            throw Object.assign(new Error('Leave request not found'), { statusCode: 404 });
        }
        return leave;
    },

    async review(id, reviewerId, status, reviewNote) {
        if (!['approved', 'rejected'].includes(status)) {
            throw Object.assign(new Error('Status must be approved or rejected'), {
                statusCode: 400,
            });
        }

        const leave = await leaveModel.findById(id);
        if (!leave) {
            throw Object.assign(new Error('Leave request not found'), { statusCode: 404 });
        }
        if (leave.status !== 'pending') {
            throw Object.assign(new Error('Leave request already reviewed'), { statusCode: 400 });
        }

        const updated = await leaveModel.update(id, {
            status,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewNote: reviewNote || null,
        });

        const statusLabel = status === 'approved' ? 'disetujui' : 'ditolak';
        await notificationService.create(
            leave.userId,
            `Pengajuan ${leave.type} ${statusLabel}`,
            `Pengajuan ${leave.type} Anda (${new Date(leave.startDate).toLocaleDateString('id-ID')} - ${new Date(leave.endDate).toLocaleDateString('id-ID')}) telah ${statusLabel}.${reviewNote ? ` Catatan: ${reviewNote}` : ''}`,
            status === 'approved' ? 'success' : 'warning'
        );

        await auditLogService.log({
            userId: reviewerId,
            action: `leave_${status}`,
            entity: 'leave_request',
            entityId: id,
            details: {
                employeeName: leave.user?.fullName ?? `User #${leave.userId}`,
                leaveType: leave.type,
                startDate: new Date(leave.startDate).toLocaleDateString('id-ID'),
                endDate: new Date(leave.endDate).toLocaleDateString('id-ID'),
                reason: leave.reason,
                reviewNote: reviewNote || null,
            },
        });

        return updated;
    },

    async cancel(id, userId) {
        const leave = await leaveModel.findById(id);
        if (!leave) {
            throw Object.assign(new Error('Leave request not found'), { statusCode: 404 });
        }
        if (leave.userId !== parseInt(userId)) {
            throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
        }
        if (leave.status !== 'pending') {
            throw Object.assign(new Error('Only pending requests can be cancelled'), {
                statusCode: 400,
            });
        }

        await leaveModel.delete(id);
        return { message: 'Leave request cancelled' };
    },
};

module.exports = leaveService;
