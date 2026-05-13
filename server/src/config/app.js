const buildDatabaseUrl = () => {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const encodedPassword = encodeURIComponent(DB_PASSWORD || '');
    return `postgresql://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`;
};

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = buildDatabaseUrl();
}

const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        url: process.env.DATABASE_URL,
    },
    office: {
        latitude: parseFloat(process.env.OFFICE_LATITUDE),
        longitude: parseFloat(process.env.OFFICE_LONGITUDE),
        radiusMeters: parseFloat(process.env.OFFICE_RADIUS_METERS) || 100,
    },
     attendance: {
        workStartTime: process.env.WORK_START_TIME || '08:30',
        workEndTime: process.env.WORK_END_TIME || '16:30',
        lateToleranceMinutes: parseInt(process.env.LATE_TOLERANCE_MINUTES, 10) || 15,
        earlyCheckInMaxHours: parseFloat(process.env.EARLY_CHECKIN_MAX_HOURS) || 3,
        lateCheckInMaxHours: parseFloat(process.env.LATE_CHECKIN_MAX_HOURS) || 4,
        minWorkDurationHours: parseFloat(process.env.MIN_WORK_DURATION_HOURS) || 4,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
};

module.exports = config;
