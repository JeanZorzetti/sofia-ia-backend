/**
 * 🏠 LAIS IA - Sistema SDR Inteligente para Imobiliárias - MINIMAL VERSION
 * Versão mínima que funciona sem dependências externas
 */

require('dotenv').config();

const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Simple console logger
const logger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`, meta),
    warn: (msg, meta = {}) => console.warn(`[WARN] ${new Date().toISOString()} ${msg}`, meta),
    error: (msg, meta = {}) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, meta),
    debug: (msg, meta = {}) => console.log(`[DEBUG] ${new Date().toISOString()} ${msg}`, meta)
};

class LaisIAMinimal {
    constructor() {
        this.port = process.env.PORT || 8000;
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
        
        logger.info('🔄 Initializing LAIS IA Minimal Version');
    }

    /**
     * Handle HTTP requests
     */
    async handleRequest(req, res) {
        // Parse URL
        const parsedUrl = url.parse(req.url, true);
        const { pathname, query } = parsedUrl;
        const method = req.method;

        // CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', 'application/json');

        // Handle preflight requests
        if (method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Log request
        logger.info(`${method} ${pathname} - ${req.socket.remoteAddress}`);

        try {
            // Parse body for POST requests
            let body = '';
            if (method === 'POST') {
                body = await this.parseBody(req);
            }

            // Route handling
            const response = await this.routeRequest(method, pathname, query, body);
            
            res.writeHead(response.statusCode || 200);
            res.end(JSON.stringify(response.data, null, 2));

        } catch (error) {
            logger.error('Request handling error:', error.message);
            res.writeHead(500);
            res.end(JSON.stringify({
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            }, null, 2));
        }
    }

    /**
     * Parse request body
     */
    parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    resolve({});
                }
            });
            
            req.on('error', reject);
        });
    }

    /**
     * Route requests to handlers
     */
    async routeRequest(method, pathname, query, body) {
        // Health check
        if (pathname === '/health' && method === 'GET') {
            return {
                statusCode: 200,
                data: {
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0-minimal',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    services: {
                        database: 'disabled',
                        evolutionApi: 'disabled',
                        claude: 'disabled'
                    }
                }
            };
        }

        // Webhook routes
        if (pathname.startsWith('/webhooks/')) {
            return this.handleWebhook(method, pathname, query, body);
        }

        // API routes
        if (pathname.startsWith('/api/')) {
            return this.handleApi(method, pathname, query, body);
        }

        // Admin routes
        if (pathname.startsWith('/admin/')) {
            return this.handleAdmin(method, pathname, query, body);
        }

        // Default 404
        return {
            statusCode: 404,
            data: {
                error: 'Route not found',
                path: pathname,
                method: method
            }
        };
    }

    /**
     * Handle webhook routes
     */
    async handleWebhook(method, pathname, query, body) {
        const route = pathname.replace('/webhooks/', '');

        switch (route) {
            case 'test':
                if (method === 'GET') {
                    logger.info('🧪 Webhook test endpoint called');
                    return {
                        statusCode: 200,
                        data: {
                            success: true,
                            message: 'Webhook endpoint is working',
                            timestamp: new Date().toISOString(),
                            server: 'LAIS IA Minimal v1.0.0'
                        }
                    };
                }
                break;

            case 'whatsapp':
                if (method === 'POST') {
                    const startTime = Date.now();
                    const { event, instance, data } = body;
                    
                    logger.info('📱 WhatsApp webhook received', {
                        event,
                        instance,
                        timestamp: new Date().toISOString()
                    });

                    const processingTime = Date.now() - startTime;
                    
                    return {
                        statusCode: 200,
                        data: {
                            success: true,
                            processed: true,
                            processingTime: `${processingTime}ms`,
                            timestamp: new Date().toISOString()
                        }
                    };
                }
                break;

            case 'n8n':
                if (method === 'POST') {
                    logger.info('🔄 N8N webhook received', { body });
                    return {
                        statusCode: 200,
                        data: {
                            success: true,
                            result: 'processed'
                        }
                    };
                }
                break;
        }

        return {
            statusCode: 404,
            data: { error: 'Webhook route not found' }
        };
    }

    /**
     * Handle API routes
     */
    async handleApi(method, pathname, query, body) {
        const route = pathname.replace('/api/', '');

        switch (route) {
            case 'health':
                return {
                    statusCode: 200,
                    data: {
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        version: '1.0.0-minimal'
                    }
                };

            case 'leads':
                if (method === 'GET') {
                    return {
                        statusCode: 200,
                        data: {
                            success: true,
                            data: [],
                            pagination: {
                                page: 1,
                                limit: 20,
                                total: 0
                            }
                        }
                    };
                }
                break;

            case 'analytics/overview':
                if (method === 'GET') {
                    return {
                        statusCode: 200,
                        data: {
                            success: true,
                            data: {
                                total_leads: 0,
                                new_leads: 0,
                                qualified_leads: 0,
                                conversions: 0,
                                message_stats: {
                                    total_messages: 0,
                                    sent_messages: 0,
                                    received_messages: 0
                                }
                            }
                        }
                    };
                }
                break;
        }

        return {
            statusCode: 404,
            data: { error: 'API route not found' }
        };
    }

    /**
     * Handle admin routes
     */
    async handleAdmin(method, pathname, query, body) {
        const route = pathname.replace('/admin/', '');

        switch (route) {
            case 'dashboard':
                return {
                    statusCode: 200,
                    data: {
                        success: true,
                        data: {
                            system: {
                                uptime: process.uptime(),
                                memory: process.memoryUsage(),
                                version: process.version,
                                platform: process.platform
                            },
                            database: {
                                status: 'disabled',
                                connections: 0
                            },
                            timestamp: new Date().toISOString()
                        }
                    }
                };

            case 'health/detailed':
                return {
                    statusCode: 200,
                    data: {
                        success: true,
                        data: {
                            overall_status: 'healthy',
                            services: {
                                database: { status: 'disabled' },
                                evolution_api: { status: 'disabled' },
                                claude_api: { status: 'disabled' }
                            },
                            timestamp: new Date().toISOString()
                        }
                    }
                };

            case 'metrics/performance':
                return {
                    statusCode: 200,
                    data: {
                        success: true,
                        data: {
                            cpu_usage: process.cpuUsage(),
                            memory_usage: process.memoryUsage(),
                            uptime: process.uptime(),
                            node_version: process.version,
                            platform: process.platform
                        }
                    }
                };
        }

        return {
            statusCode: 404,
            data: { error: 'Admin route not found' }
        };
    }

    /**
     * Start the server
     */
    async start() {
        try {
            this.server.listen(this.port, () => {
                logger.info(`🚀 LAIS IA Minimal Backend started on port ${this.port}`);
                logger.info(`📱 Health check: http://localhost:${this.port}/health`);
                logger.info(`🌐 API endpoints: http://localhost:${this.port}/api/health`);
                logger.info(`👑 Admin endpoints: http://localhost:${this.port}/admin/dashboard`);
                logger.info(`🔗 Webhooks: http://localhost:${this.port}/webhooks/test`);
                logger.info(`\n🎯 Quick test commands:`);
                logger.info(`   curl http://localhost:${this.port}/health`);
                logger.info(`   curl http://localhost:${this.port}/webhooks/test`);
                logger.info(`   curl http://localhost:${this.port}/api/health`);
            });

            // Graceful shutdown
            process.on('SIGTERM', () => {
                logger.info('🛑 SIGTERM received, shutting down gracefully');
                this.server.close(() => {
                    logger.info('✅ Server closed');
                    process.exit(0);
                });
            });

            process.on('SIGINT', () => {
                logger.info('🛑 SIGINT received, shutting down gracefully');
                this.server.close(() => {
                    logger.info('✅ Server closed');
                    process.exit(0);
                });
            });

        } catch (error) {
            logger.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Initialize and start the application
const app = new LaisIAMinimal();
app.start();

module.exports = LaisIAMinimal;
