require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('../src/config/app');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
        {
            employeeCode: 'EMP001',
            fullName: 'John Doe',
            email: 'john.doe@company.com',
            phoneNumber: '081234567890',
            department: 'IT',
            position: 'Software Engineer',
        },
        {
            employeeCode: 'EMP002',
            fullName: 'Jane Smith',
            email: 'jane.smith@company.com',
            phoneNumber: '081234567891',
            department: 'HR',
            position: 'HR Manager',
        },
        {
            employeeCode: 'EMP003',
            fullName: 'Bob Johnson',
            email: 'bob.johnson@company.com',
            phoneNumber: '081234567892',
            department: 'Finance',
            position: 'Accountant',
        },
        {
            employeeCode: 'EMP004',
            fullName: 'Alice Williams',
            email: 'alice.williams@company.com',
            phoneNumber: '081234567893',
            department: 'IT',
            position: 'DevOps Engineer',
        },
        {
            employeeCode: 'EMP005',
            fullName: 'Charlie Brown',
            email: 'charlie.brown@company.com',
            phoneNumber: '081234567894',
            department: 'Marketing',
            position: 'Marketing Specialist',
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: { ...user, passwordHash },
        });
        console.log(`✓ Created user: ${user.fullName}`);
    }

    console.log('\n✅ Seed completed');
    console.log('📝 Default password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
