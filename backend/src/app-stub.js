/**
 * 🏠 LAIS IA - Sistema SDR Inteligente - STUB SERVICE
 * Backend ultra-minimal - Toda inteligência movida para N8N
 */

require('dotenv').config();
const http = require('http');
const url = require('url');

const logger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`, meta),
    error: (msg, meta = {}) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, meta)
};

class LaisIAStub {
    constructor() {
        this.port = process.env.PORT || 8000;
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
        this.startTime = Date.now();
        logger.info('🔄 Initializing LAIS IA Stub Service - N8N Powered Backend');
    }

    async handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const { pathname } = parsedUrl;
        const method = req.method;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', 'application/json');

        if (method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        logger.info(`${method} ${pathname} - ${req.socket.remoteAddress}`);

        try {
            let body = '';
            if (method === 'POST') {
                body = await this.parseBody(req);
            }

            const response = await this.routeRequest(method, pathname, body);
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

    parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
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

    async routeRequest(method, pathname, body) {
        if (pathname === '/health' && method === 'GET') {
            return {
                statusCode: 200,
                data: {
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    version: '2.0.0-stub-n8n-powered',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    architecture: 'distributed',
                    services: {
                        backend: 'stub-service',
                        intelligence: 'n8n-workflows',
                        evolution_api: 'n8n-managed',
                        claude_ai: 'n8n-managed'
                    }
                }
            };
        }

        if (pathname.startsWith('/api/')) {
            const route = pathname.replace('/api/', '');
            if (route === 'health') {
                return {
                    statusCode: 200,
                    data: {
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        version: '2.0.0-stub-n8n-powered',
                        architecture: 'distributed'
                    }
                };
            }

            if (route === 'status') {
                return {
                    statusCode: 200,
                    data: {
                        backend: {
                            status: 'running',
                            role: 'stub-service',
                            uptime: process.uptime()
                        },
                        n8n: {
                            url: 'https://n8n.roilabs.com.br',
                            status: 'external'
                        },
                        architecture: {
                            type: 'distributed',
                            intelligence_layer: 'n8n'
                        }
                    }
                };
            }
        }

        if (pathname.startsWith('/admin/dashboard')) {
            return {
                statusCode: 200,
                data: {
                    success: true,
                    data: {
                        system: {
                            uptime: process.uptime(),
                            memory: process.memoryUsage(),
                            version: process.version
                        },
                        architecture: {
                            type: 'distributed-microservices',
                            backend_role: 'stub-service',
                            intelligence_layer: 'n8n-workflows'
                        },
                        services: {
                            backend_stub: { status: 'healthy' },
                            n8n_workflows: { 
                                status: 'external',
                                url: 'https://n8n.roilabs.com.br'
                            }
                        }
                    }
                }
            };
        }

        return {
            statusCode: 404,
            data: {
                error: 'Route not found',
                path: pathname,
                suggestion: 'All processing moved to N8N workflows'
            }
        };
    }

    async start() {
        try {
            this.server.listen(this.port, () => {
                logger.info(`🚀 LAIS IA Stub Service started on port ${this.port}`);
                logger.info(`🏗️ Architecture: Distributed N8N-Powered`);
                logger.info(`📱 Health check: http://localhost:${this.port}/health`);
                logger.info(`🔧 Status check: http://localhost:${this.port}/api/status`);
                logger.info(`👑 Admin dashboard: http://localhost:${this.port}/admin/dashboard`);
            });

            process.on('SIGTERM', () => {
                logger.info('🛑 SIGTERM received, shutting down gracefully');
                this.server.close(() => {
                    logger.info('✅ Stub service closed');
                    process.exit(0);
                });
            });

        } catch (error) {
            logger.error('❌ Failed to start stub service:', error);
            process.exit(1);
        }
    }
}

const app = new LaisIAStub();
app.start();

module.exports = LaisIAStub;