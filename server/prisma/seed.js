require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('../src/config/app');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const OFFICE_LAT = parseFloat(process.env.OFFICE_LATITUDE) || -6.2088;
const OFFICE_LNG = parseFloat(process.env.OFFICE_LONGITUDE) || 106.8456;

const ID_USERS = [
    { code: 'ADMIN001', name: 'Bagas Setiawan', dept: 'IT', pos: 'System Administrator', role: 'admin', phone: '081234500001', email: 'admin@company.com' },
    { code: 'EMP000', name: 'Pegawai Demo', dept: 'IT', pos: 'Software Engineer', role: 'user', phone: '081234500000', email: 'pegawai@company.com' },
    { code: 'EMP001', name: 'Rasya Rayhan', dept: 'IT', pos: 'Backend Developer', role: 'user', phone: '081234500002' },
    { code: 'EMP002', name: 'Vaio Prasa', dept: 'IT', pos: 'Fullstack Developer', role: 'user', phone: '081234500003' },
    { code: 'EMP003', name: 'Reyjuno', dept: 'IT', pos: 'Mobile Developer', role: 'user', phone: '081234500004' },
    { code: 'EMP004', name: 'Ahmad Nabil', dept: 'IT', pos: 'Frontend Developer', role: 'user', phone: '081234500005' },
    { code: 'EMP005', name: 'Aris Wibowo', dept: 'IT', pos: 'Frontend Developer', role: 'user', phone: '081234500006' },
    { code: 'EMP006', name: 'Dewi Lestari', dept: 'HR', pos: 'HR Manager', role: 'user', phone: '081234500007' },
    { code: 'EMP007', name: 'Andi Pratama', dept: 'Finance', pos: 'Senior Accountant', role: 'user', phone: '081234500008' },
    { code: 'EMP008', name: 'Siti Nurhaliza', dept: 'Marketing', pos: 'Marketing Lead', role: 'user', phone: '081234500009' },
    { code: 'EMP009', name: 'Budi Santoso', dept: 'Operations', pos: 'Operations Supervisor', role: 'user', phone: '081234500010' },
    { code: 'EMP010', name: 'Putri Anggraini', dept: 'HR', pos: 'HR Officer', role: 'user', phone: '081234500011' },
    { code: 'EMP011', name: 'Fajar Hidayat', dept: 'IT', pos: 'DevOps Engineer', role: 'user', phone: '081234500012' },
    { code: 'EMP012', name: 'Rina Kusuma', dept: 'Finance', pos: 'Finance Staff', role: 'user', phone: '081234500013' },
    { code: 'EMP013', name: 'Yoga Permana', dept: 'Marketing', pos: 'Content Specialist', role: 'user', phone: '081234500014' },
    { code: 'EMP014', name: 'Mega Wulandari', dept: 'Operations', pos: 'Operations Staff', role: 'user', phone: '081234500015' },
    { code: 'EMP015', name: 'Hendra Gunawan', dept: 'IT', pos: 'QA Engineer', role: 'user', phone: '081234500016' },
    { code: 'EMP016', name: 'Lia Marlina', dept: 'HR', pos: 'Recruiter', role: 'user', phone: '081234500017' },
    { code: 'EMP017', name: 'Galih Saputra', dept: 'Marketing', pos: 'Social Media Officer', role: 'user', phone: '081234500018' },
    { code: 'EMP018', name: 'Indah Permata', dept: 'Finance', pos: 'Junior Accountant', role: 'user', phone: '081234500019' },
];

async function seedUsers() {
    console.log('\n👤 Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    for (const u of ID_USERS) {
        const slug = u.name.toLowerCase().replace(/\s+/g, '.');
        const email = u.email || `${slug}@company.com`;

        await prisma.user.upsert({
            where: { employeeCode: u.code },
            update: {
                fullName: u.name,
                email,
                phoneNumber: u.phone,
                department: u.dept,
                position: u.pos,
                role: u.role,
                isActive: true,
            },
            create: {
                employeeCode: u.code,
                fullName: u.name,
                email,
                phoneNumber: u.phone,
                department: u.dept,
                position: u.pos,
                role: u.role,
                passwordHash,
            },
        });
        console.log(`  ✓ ${u.name} (${u.role})`);
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
        { code: 'ALW_TRANSPORT', name: 'Tunjangan Transport', type: 'allowance', isTaxable: true, description: 'Tunjangan transport bulanan' },
        { code: 'ALW_MEAL', name: 'Tunjangan Makan', type: 'allowance', isTaxable: true, description: 'Tunjangan makan bulanan' },
        { code: 'ALW_POSITION', name: 'Tunjangan Jabatan', type: 'allowance', isTaxable: true, description: 'Tunjangan berdasarkan jabatan' },
        { code: 'ALW_COMMUNICATION', name: 'Tunjangan Komunikasi', type: 'allowance', isTaxable: true, description: 'Tunjangan pulsa & internet' },
        { code: 'DED_BPJS_HEALTH', name: 'BPJS Kesehatan', type: 'deduction', isTaxable: false, description: 'Potongan BPJS Kesehatan' },
        { code: 'DED_BPJS_EMPLOYMENT', name: 'BPJS Ketenagakerjaan', type: 'deduction', isTaxable: false, description: 'Potongan BPJS Ketenagakerjaan' },
        { code: 'DED_INCOME_TAX', name: 'PPh 21', type: 'deduction', isTaxable: false, description: 'Potongan pajak penghasilan' },
    ];
    for (const comp of components) {
        await prisma.salaryComponent.upsert({
            where: { code: comp.code },
            update: {},
            create: comp,
        });
    }
    console.log(`  ✓ ${components.length} salary components`);
}

async function seedPayrollConfig() {
    console.log('\n💵 Seeding payroll config...');
    const existing = await prisma.payrollConfig.findFirst();
    if (existing) {
        console.log('  ✓ Payroll config already exists, skipping');
        return;
    }
    await prisma.payrollConfig.create({
        data: {
            overtimeHourlyRate: 50000,
            absenceDeductionPerDay: 50000,
            bpjsKetenagakerjaanPercent: 2,
            bpjsKesehatanPercent: 1,
            incomeTaxPercent: 21,
        },
    });
    console.log('  ✓ Default payroll config created');
}

async function seedEmployeeSalaries() {
    console.log('\n🧾 Seeding employee salaries...');
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const components = await prisma.salaryComponent.findMany({ where: { type: 'allowance' } });
    const compMap = Object.fromEntries(components.map((c) => [c.code, c]));

    const baseByPosition = {
        'Backend Developer': 8000000,
        'Frontend Developer': 7500000,
        'DevOps Engineer': 9000000,
        'QA Engineer': 7000000,
        'HR Manager': 9500000,
        'HR Officer': 5500000,
        'Recruiter': 5000000,
        'Senior Accountant': 8500000,
        'Finance Staff': 5500000,
        'Junior Accountant': 4500000,
        'Marketing Lead': 9000000,
        'Marketing Specialist': 5500000,
        'Content Specialist': 5000000,
        'Social Media Officer': 4500000,
        'Operations Supervisor': 7500000,
        'Operations Staff': 4500000,
    };

    const allowanceByPosition = {
        manager: { transport: 1000000, meal: 750000, position: 2500000, communication: 500000 },
        senior: { transport: 750000, meal: 600000, position: 1500000, communication: 300000 },
        regular: { transport: 500000, meal: 500000, position: 0, communication: 200000 },
    };

    for (const u of users) {
        const baseSalary = baseByPosition[u.position] || 5000000;
        let tier = 'regular';
        if (u.position?.includes('Manager') || u.position?.includes('Lead') || u.position?.includes('Supervisor')) tier = 'manager';
        else if (u.position?.includes('Senior') || u.position?.includes('DevOps')) tier = 'senior';
        const alw = allowanceByPosition[tier];

        const existing = await prisma.employeeSalary.findUnique({ where: { userId: u.id } });
        if (existing) continue;

        const salary = await prisma.employeeSalary.create({
            data: {
                userId: u.id,
                baseSalary,
                effectiveDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
        });

        const items = [];
        if (alw.transport > 0) items.push({ componentId: compMap.ALW_TRANSPORT.id, amount: alw.transport });
        if (alw.meal > 0) items.push({ componentId: compMap.ALW_MEAL.id, amount: alw.meal });
        if (alw.position > 0) items.push({ componentId: compMap.ALW_POSITION.id, amount: alw.position });
        if (alw.communication > 0) items.push({ componentId: compMap.ALW_COMMUNICATION.id, amount: alw.communication });

        if (items.length > 0) {
            await prisma.employeeSalaryComponent.createMany({
                data: items.map((it) => ({ employeeSalaryId: salary.id, ...it })),
            });
        }
    }
    console.log(`  ✓ Salary set for ${users.length} employees`);
}

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const buildCheckInTime = (date, hour, minute) => {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    return d;
};

async function seedAttendances() {
    console.log('\n📅 Seeding attendance records (1 month)...');
    const users = await prisma.user.findMany({ where: { role: 'user' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);

    let count = 0;
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        for (const user of users) {
            const skipChance = Math.random();
            if (skipChance < 0.08) continue;

            const existing = await prisma.attendance.findFirst({
                where: {
                    userId: user.id,
                    checkInTime: {
                        gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
                        lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
                    },
                },
            });
            if (existing) continue;

            const roll = Math.random();
            let status = 'present';
            let checkInHour = 8;
            let checkInMin = Math.floor(randomBetween(15, 44));
            let checkOutHour = 16;
            let checkOutMin = Math.floor(randomBetween(31, 59));
            let notes = null;

            if (roll < 0.7) {
                status = 'present';
                checkInHour = 8;
                checkInMin = Math.floor(randomBetween(15, 44));
            } else if (roll < 0.85) {
                status = 'late';
                checkInHour = 9;
                checkInMin = Math.floor(randomBetween(0, 30));
                notes = ['Macet', 'Hujan deras', 'Anak sakit', 'Antrean angkot'][Math.floor(Math.random() * 4)];
            } else if (roll < 0.95) {
                status = 'early-leave';
                checkOutHour = 15;
                checkOutMin = Math.floor(randomBetween(0, 59));
            } else {
                status = 'late-and-early-leave';
                checkInHour = 9;
                checkInMin = Math.floor(randomBetween(0, 30));
                checkOutHour = 15;
                checkOutMin = Math.floor(randomBetween(0, 59));
                notes = 'Ada keperluan keluarga';
            }

            const checkIn = buildCheckInTime(d, checkInHour, checkInMin);
            const checkOut = buildCheckInTime(d, checkOutHour, checkOutMin);

            const latJitter = randomBetween(-0.0003, 0.0003);
            const lngJitter = randomBetween(-0.0003, 0.0003);

            await prisma.attendance.create({
                data: {
                    userId: user.id,
                    checkInTime: checkIn,
                    checkOutTime: checkOut,
                    checkInLatitude: OFFICE_LAT + latJitter,
                    checkInLongitude: OFFICE_LNG + lngJitter,
                    checkOutLatitude: OFFICE_LAT + latJitter,
                    checkOutLongitude: OFFICE_LNG + lngJitter,
                    status,
                    notes,
                },
            });
            count++;
        }
    }
    console.log(`  ✓ ${count} attendance records created`);
}

async function seedLeaveRequests() {
    console.log('\n📋 Seeding leave requests...');
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    if (users.length < 5) return;

    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    const today = new Date();

    const requests = [
        {
            user: users[1],
            type: 'sakit',
            startOffset: -5,
            endOffset: -4,
            reason: 'Demam tinggi, surat dokter terlampir',
            status: 'approved',
            reviewNote: 'Disetujui, semoga lekas sembuh',
        },
        {
            user: users[3],
            type: 'cuti',
            startOffset: 7,
            endOffset: 9,
            reason: 'Liburan keluarga ke luar kota',
            status: 'pending',
            reviewNote: null,
        },
        {
            user: users[5],
            type: 'izin',
            startOffset: -2,
            endOffset: -2,
            reason: 'Mengurus dokumen pernikahan',
            status: 'approved',
            reviewNote: null,
        },
        {
            user: users[7],
            type: 'dinas',
            startOffset: 3,
            endOffset: 5,
            reason: 'Meeting client di Surabaya',
            status: 'approved',
            reviewNote: 'Tiket dan akomodasi sudah diatur HR',
        },
        {
            user: users[9],
            type: 'cuti',
            startOffset: 14,
            endOffset: 18,
            reason: 'Cuti tahunan untuk acara keluarga',
            status: 'rejected',
            reviewNote: 'Mohon ajukan ulang setelah project Q2 selesai',
        },
    ];

    for (const req of requests) {
        const start = new Date(today);
        start.setDate(today.getDate() + req.startOffset);
        const end = new Date(today);
        end.setDate(today.getDate() + req.endOffset);

        await prisma.leaveRequest.create({
            data: {
                userId: req.user.id,
                type: req.type,
                startDate: start,
                endDate: end,
                reason: req.reason,
                status: req.status,
                reviewedBy: req.status !== 'pending' ? admin?.id : null,
                reviewedAt: req.status !== 'pending' ? new Date() : null,
                reviewNote: req.reviewNote,
            },
        });
        console.log(`  ✓ ${req.user.fullName} - ${req.type} (${req.status})`);
    }
}

async function seedOvertimeRecords() {
    console.log('\n⏱️  Seeding overtime records...');
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const config = await prisma.payrollConfig.findFirst();
    const rate = Number(config?.overtimeHourlyRate || 50000);

    if (users.length < 5) return;

    const today = new Date();
    const records = [
        { user: users[0], hours: 2.5, daysAgo: 3, status: 'approved', notes: 'Deploy hotfix production' },
        { user: users[1], hours: 1.5, daysAgo: 5, status: 'approved', notes: 'Meeting client overtime' },
        { user: users[2], hours: 3, daysAgo: 7, status: 'pending', notes: 'Sprint deadline' },
        { user: users[6], hours: 2, daysAgo: 10, status: 'pending', notes: 'Closing month-end report' },
        { user: users[8], hours: 1, daysAgo: 12, status: 'rejected', notes: 'Tidak ada approval atasan sebelumnya' },
    ];

    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });

    for (const r of records) {
        const date = new Date(today);
        date.setDate(today.getDate() - r.daysAgo);

        await prisma.overtimeRecord.create({
            data: {
                userId: r.user.id,
                date,
                hours: r.hours,
                hourlyRate: rate,
                totalAmount: r.hours * rate,
                status: r.status,
                notes: r.notes,
                approvedBy: r.status !== 'pending' ? admin?.id : null,
                approvedAt: r.status !== 'pending' ? new Date() : null,
            },
        });
        console.log(`  ✓ ${r.user.fullName} - ${r.hours}h (${r.status})`);
    }
}

async function main() {
    console.log('🌱 Seeding database...');

    await seedUsers();
    await seedAttendanceConfig();
    await seedSalaryComponents();
    await seedPayrollConfig();
    await seedEmployeeSalaries();
    await seedAttendances();
    await seedLeaveRequests();
    await seedOvertimeRecords();

    console.log('\n✅ Seed completed successfully');
    console.log('📝 Default password: password123');
    console.log('👨‍💼 Admin login: admin@company.com');
    console.log('👤 User login: pegawai@company.com (or any other employee email)');
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
