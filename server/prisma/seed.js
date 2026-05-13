require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('../src/config/app');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedUsers() {
    console.log('\n👤 Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
        {
            employeeCode: 'ADMIN001',
            fullName: 'System Admin',
            email: 'admin@company.com',
            phoneNumber: '081200000001',
            department: 'IT',
            position: 'System Administrator',
            role: 'admin',
        },
        {
            employeeCode: 'EMP001',
            fullName: 'John Doe',
            email: 'john.doe@company.com',
            phoneNumber: '081234567890',
            department: 'IT',
            position: 'Software Engineer',
            role: 'user',
        },
        {
            employeeCode: 'EMP002',
            fullName: 'Jane Smith',
            email: 'jane.smith@company.com',
            phoneNumber: '081234567891',
            department: 'HR',
            position: 'HR Manager',
            role: 'user',
        },
        {
            employeeCode: 'EMP003',
            fullName: 'Bob Johnson',
            email: 'bob.johnson@company.com',
            phoneNumber: '081234567892',
            department: 'Finance',
            position: 'Accountant',
            role: 'user',
        },
        {
            employeeCode: 'EMP004',
            fullName: 'Alice Williams',
            email: 'alice.williams@company.com',
            phoneNumber: '081234567893',
            department: 'IT',
            position: 'DevOps Engineer',
            role: 'user',
        },
        {
            employeeCode: 'EMP005',
            fullName: 'Charlie Brown',
            email: 'charlie.brown@company.com',
            phoneNumber: '081234567894',
            department: 'Marketing',
            position: 'Marketing Specialist',
            role: 'user',
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: { role: user.role },
            create: { ...user, passwordHash },
        });
        console.log(`  ✓ ${user.fullName} (${user.role})`);
    }
}

async function seedAttendanceConfig() {
    console.log('\n🕐 Seeding attendance config...');

    const existing = await prisma.attendanceConfig.findFirst();
    if (existing) {
        console.log('  ✓ Attendance config already exists, skipping');
        return;
    }

    await prisma.attendanceConfig.create({
        data: {
            workStartTime: '08:30',
            workEndTime: '16:30',
            lateToleranceMinutes: 15,
            earlyCheckInMaxHours: 3,
            lateCheckInMaxHours: 4,
            minWorkDurationHours: 4,
        },
    });
    console.log('  ✓ Default attendance config created');
}

async function seedSalaryComponents() {
    console.log('\n💰 Seeding salary components...');

    const components = [
        {
            code: 'ALW_TRANSPORT',
            name: 'Transport Allowance',
            type: 'allowance',
            isTaxable: true,
            description: 'Monthly transport allowance',
        },
        {
            code: 'ALW_MEAL',
            name: 'Meal Allowance',
            type: 'allowance',
            isTaxable: true,
            description: 'Monthly meal allowance',
        },
        {
            code: 'ALW_POSITION',
            name: 'Position Allowance',
            type: 'allowance',
            isTaxable: true,
            description: 'Allowance based on position',
        },
        {
            code: 'ALW_COMMUNICATION',
            name: 'Communication Allowance',
            type: 'allowance',
            isTaxable: true,
            description: 'Phone & internet allowance',
        },
        {
            code: 'DED_BPJS_HEALTH',
            name: 'BPJS Kesehatan',
            type: 'deduction',
            isTaxable: false,
            description: 'Health insurance deduction',
        },
        {
            code: 'DED_BPJS_EMPLOYMENT',
            name: 'BPJS Ketenagakerjaan',
            type: 'deduction',
            isTaxable: false,
            description: 'Employment insurance deduction',
        },
        {
            code: 'DED_INCOME_TAX',
            name: 'Income Tax (PPh21)',
            type: 'deduction',
            isTaxable: false,
            description: 'Monthly income tax',
        },
    ];

    for (const comp of components) {
        await prisma.salaryComponent.upsert({
            where: { code: comp.code },
            update: {},
            create: comp,
        });
        console.log(`  ✓ ${comp.name} (${comp.type})`);
    }
}

async function main() {
    console.log('🌱 Seeding database...');

    await seedUsers();
    await seedAttendanceConfig();
    await seedSalaryComponents();

    console.log('\n✅ Seed completed successfully');
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
