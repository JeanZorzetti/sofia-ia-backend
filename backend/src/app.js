/**
 * 🏠 LAIS IA - Sistema SDR Inteligente para Imobiliárias - N8N INTEGRATION v5
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
let webhookRoutes, apiRoutes, adminRoutes, testRoutes, whatsappRoutes;

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

// 🧪 TEST ROUTES - Critical for AI demonstration
try {
    testRoutes = require('./routes/test.routes');
    if (typeof testRoutes !== 'function') {
        throw new Error('testRoutes is not a valid router');
    }
    logger.info('✅ Test AI routes loaded');
} catch (error) {
    logger.error('❌ Failed to load test routes:', error.message);
    testRoutes = express.Router();
    testRoutes.get('/capabilities', (req, res) => res.json({ status: 'test routes disabled' }));
}

// 📱 WHATSAPP ROUTES - N8N Integration
try {
    whatsappRoutes = require('./routes/whatsapp.routes');
    if (typeof whatsappRoutes !== 'function') {
        throw new Error('whatsappRoutes is not a valid router');
    }
    logger.info('✅ WhatsApp N8N routes loaded');
} catch (error) {
    logger.error('❌ Failed to load WhatsApp routes:', error.message);
    whatsappRoutes = express.Router();
    whatsappRoutes.get('/test', (req, res) => res.json({ status: 'whatsapp routes disabled' }));
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
        this.dbConnected = false;
        
        // Initialize in order
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * 💾 Inicializa DATABASE PRIMEIRO (crítico)
     */
    async initializeDatabase() {
        if (!DatabaseService) {
            logger.warn('⚠️ DatabaseService not available');
            return false;
        }

        try {
            logger.info('🔄 Connecting to database...');
            
            // Conecta ao banco
            await DatabaseService.connect();
            
            // Roda migrations automaticamente
            await DatabaseService.runMigrations();
            
            // Teste de conexão
            const health = await DatabaseService.healthCheck();
            if (health.status === 'healthy') {
                this.dbConnected = true;
                logger.info('✅ Database connected and migrations completed');
                
                // Log estatísticas iniciais
                const stats = await DatabaseService.getStats();
                logger.info('📊 Database stats:', stats);
                
                return true;
            }
            
        } catch (error) {
            logger.error('❌ Database initialization failed:', error.message);
            this.dbConnected = false;
            return false;
        }
    }

    /**
     * 🤖 Inicializa serviços IA após database
     */
    async initializeAIServices() {
        try {
            logger.info('🔄 Initializing AI services...');

            // Claude IA
            if (ClaudeService) {
                logger.info('✅ Claude AI service available');
            }

            // Lead Qualification 
            if (LeadQualificationService) {
                logger.info('✅ Lead Qualification service available');
            }

            // Evolution API (WhatsApp)
            if (EvolutionApiService) {
                logger.info('✅ Evolution API (WhatsApp) service available');
            }

            logger.info('✅ AI services initialization completed');

        } catch (error) {
            logger.error('❌ AI services initialization failed:', error.message);
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
        
        // Health check DETALHADO
        this.app.get('/health', async (req, res) => {
            const health = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                services: {
                    database: this.dbConnected ? 'connected' : 'disconnected',
                    evolutionApi: EvolutionApiService ? 'available' : 'disabled',
                    claude: ClaudeService ? 'available' : 'disabled',
                    leadQualification: LeadQualificationService ? 'available' : 'disabled'
                }
            };

            // Teste database em tempo real
            if (DatabaseService && this.dbConnected) {
                try {
                    const dbHealth = await DatabaseService.healthCheck();
                    health.database = dbHealth;
                    
                    // Estatísticas rápidas
                    const stats = await DatabaseService.getStats();
                    health.stats = stats;
                    
                } catch (error) {
                    health.database = { status: 'error', error: error.message };
                    health.services.database = 'error';
                }
            }

            const statusCode = health.services.database === 'connected' ? 200 : 206;
            res.status(statusCode).json(health);
        });

        // 🆕 NOVO: Endpoint para testar database
        this.app.get('/test-db', async (req, res) => {
            if (!this.dbConnected || !DatabaseService) {
                return res.status(503).json({
                    error: 'Database not available',
                    connected: this.dbConnected
                });
            }

            try {
                // Teste básico
                const testResult = await DatabaseService.query('SELECT NOW() as current_time, version() as pg_version');
                
                // Teste inserção (lead teste)
                const testLead = {
                    phone: '+5511999887766',
                    name: 'João Teste',
                    source: 'test',
                    status: 'new',
                    qualification_score: 75,
                    temperature: 'warm'
                };

                // Insere lead teste
                const insertedLead = await DatabaseService.insert('leads', testLead);
                
                // Busca o lead inserido
                const foundLead = await DatabaseService.findById('leads', insertedLead.id);
                
                // Remove o lead teste
                await DatabaseService.delete('leads', insertedLead.id, true);

                res.json({
                    status: 'Database fully functional',
                    tests: {
                        connection: testResult.rows[0],
                        insert: 'SUCCESS',
                        select: 'SUCCESS', 
                        delete: 'SUCCESS'
                    },
                    testLead: {
                        inserted: insertedLead.id,
                        found: foundLead?.id === insertedLead.id
                    }
                });

            } catch (error) {
                logger.error('❌ Database test failed:', error);
                res.status(500).json({
                    error: 'Database test failed',
                    details: error.message
                });
            }
        });

        // 🧪 AI TEST ROUTES - Most important!
        if (typeof testRoutes === 'function') {
            this.app.use('/test', testRoutes);
            logger.info('✅ AI Test routes registered - /test/*');
        } else {
            logger.error('❌ AI Test routes not valid, skipping');
        }

        // 📱 WHATSAPP N8N INTEGRATION ROUTES - Critical for production!
        if (typeof whatsappRoutes === 'function') {
            this.app.use('/api/whatsapp', whatsappRoutes);
            logger.info('✅ WhatsApp N8N routes registered - /api/whatsapp/*');
        } else {
            logger.error('❌ WhatsApp routes not valid, skipping');
        }

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

        // 📖 Landing page with ALL endpoints
        this.app.get('/', (req, res) => {
            res.json({
                message: '🤖 LAIS IA - Sistema SDR Inteligente',
                version: '1.0.0',
                status: 'RUNNING',
                services: {
                    database: this.dbConnected ? '✅ Connected' : '❌ Disconnected',
                    claude: ClaudeService ? '✅ Available' : '❌ Disabled',
                    leadQualification: LeadQualificationService ? '✅ Available' : '❌ Disabled',
                    whatsapp: EvolutionApiService ? '✅ Available' : '❌ Disabled'
                },
                
                // 🧪 AI Testing Endpoints
                aiTestEndpoints: {
                    capabilities: 'GET /test/capabilities',
                    chat: 'POST /test/chat',
                    qualify: 'POST /test/qualify',
                    conversation: 'POST /test/conversation'
                },
                
                // 📱 WhatsApp N8N Integration (PRODUCTION)
                n8nIntegrationEndpoints: {
                    processMessage: 'POST /api/whatsapp/process-message',
                    stats: 'GET /api/whatsapp/stats',
                    test: 'POST /api/whatsapp/test'
                },
                
                // 🔧 System Endpoints
                systemEndpoints: {
                    health: 'GET /health',
                    database: 'GET /test-db',
                    api: 'GET /api/*',
                    admin: 'GET /admin/*',
                    webhooks: 'POST /webhooks/*'
                },
                
                // 📋 Examples for N8N Integration
                n8nExamples: {
                    processWhatsAppMessage: {
                        url: 'POST /api/whatsapp/process-message',
                        description: 'Main endpoint for n8n to process WhatsApp messages',
                        body: {
                            phone: '+5511999887766',
                            name: 'João Silva',
                            message: 'Estou procurando um apartamento com 2 quartos',
                            mediaType: 'text',
                            instanceId: 'instance-01'
                        },
                        response: {
                            success: true,
                            lead: { phone: '+5511999887766', name: 'João Silva' },
                            aiResponse: { reply: 'AI response', extractedData: {} },
                            qualification: { score: 75, temperature: 'warm' },
                            actions: [
                                { type: 'send_whatsapp', message: 'AI response' },
                                { type: 'create_crm_lead', priority: 'medium' }
                            ]
                        }
                    }
                },
                
                // 🧪 AI Testing Examples (for development)
                aiTestingExamples: {
                    testChat: {
                        url: 'POST /test/chat',
                        body: {
                            message: "Oi, estou procurando um apartamento com 2 quartos na zona sul",
                            leadContext: {
                                name: "João Silva",
                                phone: "+5511999887766"
                            }
                        }
                    },
                    testQualification: {
                        url: 'POST /test/qualify',
                        body: {
                            messages: [
                                "Estou procurando apartamento",
                                "Quero 3 quartos",
                                "Meu orçamento é R$ 500.000",
                                "É urgente, preciso decidir essa semana"
                            ]
                        }
                    }
                }
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
                availableEndpoints: [
                    'GET / (Landing page with all endpoints)',
                    'GET /health (System health)',
                    '',
                    '🧪 AI TESTING:',
                    'GET /test/capabilities',
                    'POST /test/chat',
                    'POST /test/qualify',
                    'POST /test/conversation',
                    '',
                    '📱 N8N WHATSAPP INTEGRATION:',
                    'POST /api/whatsapp/process-message (MAIN)',
                    'GET /api/whatsapp/stats',
                    'POST /api/whatsapp/test',
                    '',
                    '🔧 SYSTEM:',
                    'GET /api/*',
                    'GET /admin/*',
                    'POST /webhooks/*'
                ]
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

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('🛑 SIGTERM received, shutting down gracefully...');
            await this.shutdown();
        });

        process.on('SIGINT', async () => {
            logger.info('🛑 SIGINT received, shutting down gracefully...');
            await this.shutdown();
        });
        
        logger.info('✅ Error handling setup completed');
    }

    /**
     * 🚀 Inicia o servidor (ordem crítica)
     */
    async start() {
        try {
            logger.info('🚀 Starting LAIS IA Backend...');

            // 1. Database PRIMEIRO (não-crítico para AI tests)
            logger.info('📊 Step 1: Initializing Database...');
            await this.initializeDatabase();

            // 2. AI Services depois
            logger.info('🤖 Step 2: Initializing AI Services...');
            await this.initializeAIServices();

            // 3. Servidor por último
            logger.info('🌐 Step 3: Starting HTTP Server...');
            this.server.listen(this.port, () => {
                logger.info(`🎉 LAIS IA Backend STARTED successfully on port ${this.port}`);
                logger.info(`🏠 Landing page: http://localhost:${this.port}/`);
                logger.info(`📱 Health check: http://localhost:${this.port}/health`);
                logger.info('');
                logger.info(`🧪 AI TESTING ENDPOINTS:`);
                logger.info(`   🤖 Capabilities: http://localhost:${this.port}/test/capabilities`);
                logger.info(`   💬 Chat Test: POST http://localhost:${this.port}/test/chat`);
                logger.info(`   🎯 Qualification: POST http://localhost:${this.port}/test/qualify`);
                logger.info(`   🎪 Full Conversation: POST http://localhost:${this.port}/test/conversation`);
                logger.info('');
                logger.info(`📱 N8N WHATSAPP INTEGRATION:`);
                logger.info(`   🚀 Process Message: POST http://localhost:${this.port}/api/whatsapp/process-message`);
                logger.info(`   📊 Stats: GET http://localhost:${this.port}/api/whatsapp/stats`);
                logger.info(`   🧪 Test: POST http://localhost:${this.port}/api/whatsapp/test`);
                logger.info('');
                logger.info(`📊 SYSTEM ENDPOINTS:`);
                logger.info(`   🔧 Database test: http://localhost:${this.port}/test-db`);
                logger.info(`   🌐 API: http://localhost:${this.port}/api`);
                logger.info(`   👑 Admin: http://localhost:${this.port}/admin`);
                logger.info(`   🔗 Webhooks: http://localhost:${this.port}/webhooks`);
                
                if (this.dbConnected) {
                    logger.info(`✅ Database: CONNECTED and ready for persistence!`);
                } else {
                    logger.warn(`⚠️ Database: DISCONNECTED - AI tests still functional`);
                }
            });

        } catch (error) {
            logger.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }

    /**
     * Shutdown graceful
     */
    async shutdown() {
        try {
            logger.info('🛑 Shutting down...');
            
            // Fecha servidor HTTP
            this.server.close();
            
            // Fecha conexão database
            if (DatabaseService && this.dbConnected) {
                await DatabaseService.close();
            }
            
            logger.info('👋 Shutdown completed');
            process.exit(0);
            
        } catch (error) {
            logger.error('❌ Shutdown error:', error);
            process.exit(1);
        }
    }
}

// Inicializa e inicia a aplicação
const app = new LaisIAApp();
app.start();

module.exports = LaisIAApp;