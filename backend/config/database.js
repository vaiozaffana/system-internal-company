const { Pool, Client } = require('pg');
require('dotenv').config();

const createDatabaseIfNotExists = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres',
    });

    try {
        await client.connect();
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [process.env.DB_NAME]
        );

        if (result.rowCount === 0) {
            console.log(`Database '${process.env.DB_NAME}' not found. Creating...`);
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database '${process.env.DB_NAME}' created successfully`);
        } else {
            console.log(`Database '${process.env.DB_NAME}' already exists`);
        }
    } catch (error) {
        console.error('Error checking/creating database:', error.message);
        throw error;
    } finally {
        await client.end();
    }
};

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('Database pool connected');
});

pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

module.exports = {
    query,
    getClient,
    pool,
    createDatabaseIfNotExists,
};
