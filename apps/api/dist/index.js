"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./routes/index"));
const prisma_1 = require("./lib/prisma");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
});
const redisUrl = process.env.REDIS_URL || '';
const redis = redisUrl ? new ioredis_1.default(redisUrl) : null;
const port = process.env.PORT || 4001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        var _a;
        // Allow requests with no origin (same-origin requests, mobile apps, Postman)
        if (!origin)
            return callback(null, true);
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        // In production, check allowed origins
        const allowedOrigins = ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',').map(o => o.trim()).filter(Boolean)) || [];
        // If no allowed origins configured, allow all (for same-origin requests)
        if (allowedOrigins.length === 0) {
            return callback(null, true);
        }
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Allow Vercel preview deployments (same base domain)
        try {
            const originHost = new URL(origin).hostname;
            const isVercelDomain = originHost.includes('.vercel.app') || originHost.includes('.vercel.com');
            // Check if any allowed origin is from same Vercel project
            const isSameProject = allowedOrigins.some(allowed => {
                try {
                    const allowedHost = new URL(allowed).hostname;
                    // Extract project name from Vercel URLs (e.g., board-xxx-aman-manhars-projects.vercel.app)
                    const originProject = originHost.split('.')[0].split('-').slice(0, -3).join('-');
                    const allowedProject = allowedHost.split('.')[0].split('-').slice(0, -3).join('-');
                    return originProject === allowedProject && isVercelDomain;
                }
                catch {
                    return false;
                }
            });
            if (isSameProject) {
                return callback(null, true);
            }
        }
        catch (e) {
            // Invalid origin URL, deny
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Logging
app.use((0, pino_http_1.default)({ logger }));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// Debug endpoint to test API is working (must be before main routes)
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});
// Debug: Log all registered routes
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api', index_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message
    });
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
// Start server
const server = app.listen(port, async () => {
    try {
        // Test the database connection
        await prisma_1.prisma.$connect();
        logger.info('Database connected successfully');
        if (redis) {
            await redis.ping();
            logger.info('Redis connected successfully');
        }
        else {
            logger.warn('REDIS_URL not set; caching disabled');
        }
    }
    catch (error) {
        logger.error({ error }, 'Startup connectivity error');
        process.exit(1);
    }
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught Exception');
    server.close(() => {
        process.exit(1);
    });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        if (redis) {
            redis.quit().catch(() => { });
        }
        logger.info('Process terminated');
    });
});
// Export for Vercel
exports.default = app;
//# sourceMappingURL=index.js.map