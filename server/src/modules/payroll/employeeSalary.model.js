const prisma = require('../../config/database');

const employeeSalaryInclude = {
    user: {
        select: {
            employeeCode: true,
            fullName: true,
            department: true,
            position: true,
        },
    },
    components: {
        include: {
            component: true,
        },
    },
};

const employeeSalaryModel = {
    async upsert(userId, data) {
        return await prisma.employeeSalary.upsert({
            where: { userId: parseInt(userId) },
            update: {
                baseSalary: data.baseSalary,
                effectiveDate: data.effectiveDate,
            },
            create: {
                userId: parseInt(userId),
                baseSalary: data.baseSalary,
                effectiveDate: data.effectiveDate,
            },
            include: employeeSalaryInclude,
        });
    },

    async findByUserId(userId) {
        return await prisma.employeeSalary.findUnique({
            where: { userId: parseInt(userId) },
            include: employeeSalaryInclude,
        });
    },

    async findAll() {
        return await prisma.employeeSalary.findMany({
            include: employeeSalaryInclude,
            orderBy: { createdAt: 'desc' },
        });
    },

    async addComponent(employeeSalaryId, componentId, amount) {
        return await prisma.employeeSalaryComponent.upsert({
            where: {
                employeeSalaryId_componentId: {
                    employeeSalaryId: parseInt(employeeSalaryId),
                    componentId: parseInt(componentId),
                },
            },
            update: { amount },
            create: {
                employeeSalaryId: parseInt(employeeSalaryId),
                componentId: parseInt(componentId),
                amount,
            },
            include: { component: true },
        });
    },

    async removeComponent(employeeSalaryId, componentId) {
        return await prisma.employeeSalaryComponent.delete({
            where: {
                employeeSalaryId_componentId: {
                    employeeSalaryId: parseInt(employeeSalaryId),
                    componentId: parseInt(componentId),
                },
            },
        });
    },

    async delete(userId) {
        return await prisma.employeeSalary.delete({
            where: { userId: parseInt(userId) },
            select: { id: true },
        });
    },
};

module.exports = employeeSalaryModel;
