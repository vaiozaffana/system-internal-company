const salaryComponentModel = require('./salaryComponent.model');

const VALID_TYPES = ['allowance', 'deduction'];

const salaryComponentService = {
    async create(data) {
        if (!VALID_TYPES.includes(data.type)) {
            throw Object.assign(
                new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`),
                { statusCode: 400 }
            );
        }

        const existing = await salaryComponentModel.findByCode(data.code);
        if (existing) {
            throw Object.assign(new Error('Component code already exists'), { statusCode: 400 });
        }

        return await salaryComponentModel.create(data);
    },

    async getById(id) {
        const component = await salaryComponentModel.findById(id);
        if (!component) {
            throw Object.assign(new Error('Salary component not found'), { statusCode: 404 });
        }
        return component;
    },

    async getAll(filters) {
        return await salaryComponentModel.findAll(filters);
    },

    async update(id, data) {
        const component = await salaryComponentModel.findById(id);
        if (!component) {
            throw Object.assign(new Error('Salary component not found'), { statusCode: 404 });
        }

        if (data.type && !VALID_TYPES.includes(data.type)) {
            throw Object.assign(
                new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`),
                { statusCode: 400 }
            );
        }

        return await salaryComponentModel.update(id, data);
    },

    async delete(id) {
        const component = await salaryComponentModel.findById(id);
        if (!component) {
            throw Object.assign(new Error('Salary component not found'), { statusCode: 404 });
        }

        await salaryComponentModel.delete(id);
        return { message: 'Salary component deleted successfully' };
    },
};

module.exports = salaryComponentService;
