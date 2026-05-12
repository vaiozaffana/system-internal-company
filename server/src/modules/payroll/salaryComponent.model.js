const prisma = require('../../config/database');

const salaryComponentModel = {
    async create(data) {
        return await prisma.salaryComponent.create({ data });
    },

    async findById(id) {
        return await prisma.salaryComponent.findUnique({
            where: { id: parseInt(id) },
        });
    },

    async findByCode(code) {
        return await prisma.salaryComponent.findUnique({
            where: { code },
        });
    },

    async findAll(filters = {}) {
        const where = {};
        if (filters.type) where.type = filters.type;
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        }

        return await prisma.salaryComponent.findMany({
            where,
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });
    },

    async update(id, data) {
        return await prisma.salaryComponent.update({
            where: { id: parseInt(id) },
            data,
        });
    },

    async delete(id) {
        return await prisma.salaryComponent.delete({
            where: { id: parseInt(id) },
            select: { id: true },
        });
    },
};

module.exports = salaryComponentModel;
