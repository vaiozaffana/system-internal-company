require('dotenv').config();
const express = require('express');
const prisma = require('./src/config/database');
const routes = require('./src/routes');
const config = require('./src/config/app');
const {
    notFoundHandler,
    errorHandler,
} = require('./src/shared/middlewares/errorHandler.middleware');

const app = express();

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
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
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

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            console.log(`Environment: ${config.env}`);
            console.log(`API Base URL: http://localhost:${config.port}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
