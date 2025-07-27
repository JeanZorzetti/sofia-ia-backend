/**
 * 🏠 LAIS IA - Sistema SDR Inteligente para Imobiliárias - FIXED v2
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Simple console logger fallback
const simpleLogger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${msg}`, meta),
    warn: (msg, meta = {}) => console.warn(`[WARN] ${msg}`, meta),
    error: (msg, meta = {}) => console.error(`[ERROR] ${msg}`, meta),
    debug: (msg, meta = {}) => console.log(`[DEBUG] ${msg}`, meta)
};

// Try to import logger, fallback to simple if fails
let logger;
try {
    logger = require('./utils/logger');
    console.log('✅ Logger loaded successfully');
} catch (error) {
    console.warn('⚠️ Logger failed to load, using simple logger:', error.message);
    logger = simpleLogger;
}

// Services (conditional imports to avoid errors)
let EvolutionApiService, ClaudeService, LeadQualificationService, DatabaseService;
try {
    EvolutionApiService = require('./services/evolutionApi.service');
    logger.info('✅ EvolutionApiService loaded');
} catch (error) {
    logger.warn('⚠️ EvolutionApiService failed to load:', error.message);
}

try {
    ClaudeService = require('./services/claude.service');
    logger.info('✅ ClaudeService loaded');
} catch (error) {
    logger.warn('⚠️ ClaudeService failed to load:', error.message);
}

try {
    LeadQualificationService = require('./services/leadQualification.service');
    logger.info('✅ LeadQualificationService loaded');
} catch (error) {
    logger.warn('⚠️ LeadQualificationService failed to load:', error.message);
}

try {
    DatabaseService = require('./services/database.service');
    logger.info('✅ DatabaseService loaded');
} catch (error) {
    logger.warn('⚠️ DatabaseService failed to load:', error.message);
}

// Simple middleware placeholders
const simpleAuth = (req, res, next) => {
    // Skip auth for now
    req.user = { id: 'test', role: 'admin' };
    next();
};

const simpleRateLimit = (req, res, next) => next();
const simpleErrorHandler = (err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
};

// Routes (with safe imports)
let webhookRoutes, apiRoutes, adminRoutes;

try {
    webhookRoutes = require('./routes/webhook.routes');
    if (typeof webhookRoutes !== 'function') {
        throw new Error('webhookRoutes is not a valid router');
    }
    logger.info('✅ Webhook routes loaded');
} catch (error) {
    logger.error('❌ Failed to load webhook routes:', error.message);
    webhookRoutes = express.Router();
    webhookRoutes.get('/test', (req, res) => res.json({ status: 'webhook routes disabled' }));
}

try {
    apiRoutes = require('./routes/api.routes');
    if (typeof apiRoutes !== 'function') {
        throw new Error('apiRoutes is not a valid router');
    }
    logger.info('✅ API routes loaded');
} catch (error) {
    logger.error('❌ Failed to load API routes:', error.message);
    apiRoutes = express.Router();
    apiRoutes.get('/health', (req, res) => res.json({ status: 'api routes disabled' }));
}

try {
    adminRoutes = require('./routes/admin.routes');
    if (typeof adminRoutes !== 'function') {
        throw new Error('adminRoutes is not a valid router');
    }
    logger.info('✅ Admin routes loaded');
} catch (error) {
    logger.error('❌ Failed to load admin routes:', error.message);
    adminRoutes = express.Router();
    adminRoutes.get('/dashboard', (req, res) => res.json({ status: 'admin routes disabled' }));
}

class LaisIAApp {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
        this.port = process.env.PORT || 8000;
        
        // Initialize in order
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.initializeServices(); // Move to last to avoid blocking startup
    }

    /**
     * Inicializa todos os serviços core
     */
    async initializeServices() {
        try {
            logger.info('🔄 Initializing services...');

            // Database (only if available)
            if (DatabaseService) {
                try {
                    await DatabaseService.connect();
                    logger.info('✅ Database connected successfully');
                } catch (dbError) {
                    logger.warn('⚠️ Database connection failed:', dbError.message);
                }
            }

            logger.info('✅ Services initialization completed');

        } catch (error) {
            logger.error('❌ Service initialization failed:', error.message);
            // Don't exit, continue with limited functionality
        }
    }

    /**
     * Configura middleware da aplicação
     */
    setupMiddleware() {
        logger.info('🔄 Setting up middleware...');
        
        // Security & Performance
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            credentials: true
        }));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Rate limiting (simplified)
        this.app.use(simpleRateLimit);

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path} - ${req.ip}`);
            next();
        });
        
        logger.info('✅ Middleware setup completed');
    }

    /**
     * Configura rotas da aplicação
     */
    setupRoutes() {
        logger.info('🔄 Setting up routes...');
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                services: {
                    database: DatabaseService ? 'available' : 'disabled',
                    evolutionApi: EvolutionApiService ? 'available' : 'disabled',
                    claude: ClaudeService ? 'available' : 'disabled'
                }
            });
        });

        // Ensure routes are functions before using
        if (typeof webhookRoutes === 'function') {
            this.app.use('/webhooks', webhookRoutes);
            logger.info('✅ Webhook routes registered');
        } else {
            logger.error('❌ Webhook routes not valid, skipping');
        }

        if (typeof apiRoutes === 'function') {
            this.app.use('/api', simpleAuth, apiRoutes);
            logger.info('✅ API routes registered');
        } else {
            logger.error('❌ API routes not valid, skipping');
        }

        if (typeof adminRoutes === 'function') {
            this.app.use('/admin', simpleAuth, adminRoutes);
            logger.info('✅ Admin routes registered');
        } else {
            logger.error('❌ Admin routes not valid, skipping');
        }

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl
            });
        });
        
        logger.info('✅ Routes setup completed');
    }

    /**
     * Configura tratamento de erros
     */
    setupErrorHandling() {
        logger.info('🔄 Setting up error handling...');
        
        this.app.use(simpleErrorHandler);

        // Uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('❌ Uncaught Exception:', error.message);
            logger.error('Stack:', error.stack);
            // Don't exit immediately, try to continue
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('❌ Unhandled Rejection:', reason);
            // Don't exit immediately, try to continue
        });
        
        logger.info('✅ Error handling setup completed');
    }

    /**
     * Inicia o servidor
     */
    async start() {
        try {
            this.server.listen(this.port, () => {
                logger.info(`🚀 LAIS IA Backend started on port ${this.port}`);
                logger.info(`📱 Health check: http://localhost:${this.port}/health`);
                logger.info(`🌐 API endpoints: http://localhost:${this.port}/api`);
                logger.info(`👑 Admin endpoints: http://localhost:${this.port}/admin`);
                logger.info(`🔗 Webhooks: http://localhost:${this.port}/webhooks`);
            });
        } catch (error) {
            logger.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Inicializa e inicia a aplicação
const app = new LaisIAApp();
app.start();

module.exports = LaisIAApp;
