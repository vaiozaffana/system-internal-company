require('dotenv').config();
const express = require('express');
const db = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Company Internal System API',
        version: '1.0.0',
    });
});

app.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            timestamp: result.rows[0].now,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: error.message,
        });
    }
});

app.use('/api', routes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

const startServer = async () => {
    try {
        await db.createDatabaseIfNotExists();

        const testConnection = await db.query('SELECT NOW()');
        console.log('Database connection test successful');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Database: ${process.env.DB_NAME}`);
            console.log(`API Base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
