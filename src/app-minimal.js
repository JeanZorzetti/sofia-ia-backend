/**
 * 🏠 LAIS IA - Sistema SDR Inteligente para Imobiliárias - MINIMAL + CLAUDE
 * Versão com integração Claude AI para WhatsApp + ENVIO DE RESPOSTA
 */

require('dotenv').config();

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Simple console logger
const logger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`, meta),
    warn: (msg, meta = {}) => console.warn(`[WARN] ${new Date().toISOString()} ${msg}`, meta),
    error: (msg, meta = {}) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, meta),
    debug: (msg, meta = {}) => console.log(`[DEBUG] ${new Date().toISOString()} ${msg}`, meta)
};

/**
 * Claude AI Service
 */
class ClaudeService {
    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
        this.baseURL = 'https://api.anthropic.com';
        
        if (!this.apiKey) {
            logger.warn('⚠️ ANTHROPIC_API_KEY não encontrada');
        } else {
            logger.info('✅ Claude Service inicializado');
        }
    }

    /**
     * Fazer request para Claude API
     */
    async callClaude(messages, maxTokens = 1000) {
        if (!this.apiKey) {
            throw new Error('Claude API key não configurada');
        }

        const payload = {
            model: this.model,
            max_tokens: maxTokens,
            messages: messages
        };

        return new Promise((resolve, reject) => {
            const data = JSON.stringify(payload);
            
            const options = {
                hostname: 'api.anthropic.com',
                port: 443,
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            reject(new Error(`Claude API Error: ${parsed.error?.message || responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`Parse Error: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(data);
            req.end();
        });
    }

    /**
     * Processar mensagem do lead
     */
    async processLeadMessage(phone, message, leadName = null) {
        try {
            const systemPrompt = this.getSystemPrompt();
            const userMessage = this.formatUserMessage(phone, message, leadName);

            const messages = [
                { role: "user", content: `${systemPrompt}\n\nMensagem do lead: ${userMessage}` }
            ];

            const response = await this.callClaude(messages, 800);
            
            if (response.content && response.content[0] && response.content[0].text) {
                const claudeResponse = response.content[0].text.trim();
                
                logger.info('🤖 Claude response generated', {
                    phone,
                    messageLength: claudeResponse.length,
                    tokens: response.usage
                });

                return claudeResponse;
            } else {
                throw new Error('Formato de resposta inválido do Claude');
            }

        } catch (error) {
            logger.error('❌ Erro ao processar mensagem com Claude:', error.message);
            return this.getFallbackResponse();
        }
    }

    /**
     * Prompt do sistema para corretor imobiliário
     */
    getSystemPrompt() {
        return `Você é LAIS, uma assistente de vendas imobiliárias inteligente e amigável. 

REGRAS IMPORTANTES:
- Responda sempre em português brasileiro
- Seja natural, amigável e profissional
- Mantenha o foco em imóveis e oportunidades
- Faça perguntas para qualificar o lead
- Sempre tente agendar uma conversa com corretor
- Use emojis com moderação
- Seja concisa, máximo 150 palavras

INFORMAÇÕES DA EMPRESA:
- Empresa: ROI Labs Imobiliária
- Foco: Apartamentos e casas em São Paulo
- Diferenciais: Tecnologia IA, atendimento 24h, financiamento facilitado

SEU OBJETIVO:
Qualificar leads perguntando sobre:
- Tipo de imóvel desejado
- Localização preferida  
- Orçamento disponível
- Prazo para compra
- Se precisa de financiamento

Sempre termine oferecendo agendar uma conversa com nosso corretor especialista.`;
    }

    /**
     * Formatar mensagem do usuário
     */
    formatUserMessage(phone, message, leadName) {
        const name = leadName ? `Nome: ${leadName}` : 'Nome: Não informado';
        return `${name}\nTelefone: ${phone}\nMensagem: "${message}"`;
    }

    /**
     * Resposta de fallback se Claude falhar
     */
    getFallbackResponse() {
        return `Olá! 👋 Sou a LAIS, assistente da ROI Labs Imobiliária.

Estou aqui para te ajudar a encontrar o imóvel ideal! 🏠

Para começar, me conta:
- Que tipo de imóvel você procura?
- Em qual região?
- Qual seu orçamento?

Vou te conectar com nosso corretor especialista para uma conversa personalizada! 

📱 Pode me mandar suas informações que já vou preparando tudo para você.`;
    }

    /**
     * Teste simples do Claude
     */
    async testConnection() {
        try {
            const messages = [
                { role: "user", content: "Responda apenas 'OK' se você está funcionando corretamente." }
            ];

            const response = await this.callClaude(messages, 10);
            return {
                success: true,
                response: response.content[0]?.text || 'Conectado',
                usage: response.usage
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

class LaisIAMinimal {
    constructor() {
        this.port = process.env.PORT || 8000;
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
        this.claude = new ClaudeService();
        
        logger.info('🔄 Initializing LAIS IA Minimal + Claude + WhatsApp Send Version');
    }

    /**
     * Enviar mensagem via Evolution API
     */
    async sendWhatsAppMessage(phone, message, instanceName = 'Demo_Food') {
        const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolutionapi.roilabs.com.br';
        const apiKey = process.env.EVOLUTION_API_KEY || 'SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz';
        
        try {
            const payload = JSON.stringify({
                number: phone,
                textMessage: {
                    text: message
                }
            });
            
            const options = {
                hostname: 'evolutionapi.roilabs.com.br',
                port: 443,
                path: `/message/sendText/${instanceName}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey,
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let responseData = '';

                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            logger.info('✅ WhatsApp message sent successfully', {
                                phone,
                                messagePreview: message.substring(0, 50) + '...'
                            });
                            resolve({ success: true, data: responseData });
                        } else {
                            reject(new Error(`Evolution API Error: ${res.statusCode} - ${responseData}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    logger.error('❌ Error sending WhatsApp message:', error.message);
                    reject(error);
                });

                req.write(payload);
                req.end();
            });

        } catch (error) {
            logger.error('❌ WhatsApp send error:', error.message);
            throw error;
        }
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
                    version: '1.0.0-minimal+claude+whatsapp',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    services: {
                        database: 'disabled',
                        evolutionApi: 'configured',
                        claude: this.claude.apiKey ? 'configured' : 'missing-key',
                        whatsapp_send: 'enabled'
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
                            server: 'LAIS IA Minimal + Claude + WhatsApp v1.0.0'
                        }
                    };
                }
                break;

            case 'whatsapp':
                if (method === 'POST') {
                    return this.handleWhatsAppWebhook(body);
                }
                break;

            case 'evolution':
                if (method === 'POST') {
                    return this.handleEvolutionWebhook(body);
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
     * Handle WhatsApp webhook from Evolution API
     */
    async handleWhatsAppWebhook(body) {
        try {
            logger.info('📱 WhatsApp webhook received', { 
                event: body.event,
                instance: body.instance 
            });

            // Processar apenas mensagens recebidas
            if (body.event === 'messages.upsert' && body.data) {
                const message = body.data;
                
                // Ignorar mensagens enviadas por nós
                if (message.key?.fromMe) {
                    return {
                        statusCode: 200,
                        data: { success: true, action: 'ignored_own_message' }
                    };
                }

                // Extrair dados da mensagem
                const phone = message.key?.remoteJid?.replace('@s.whatsapp.net', '');
                const messageText = message.message?.conversation || 
                                 message.message?.extendedTextMessage?.text || '';
                const senderName = message.pushName || null;

                if (phone && messageText) {
                    // Processar com Claude
                    const claudeResponse = await this.claude.processLeadMessage(
                        phone, 
                        messageText, 
                        senderName
                    );

                    // 🚀 NOVA FUNCIONALIDADE: ENVIAR RESPOSTA DE VOLTA
                    try {
                        await this.sendWhatsAppMessage(phone, claudeResponse, 'Demo_Food');
                        logger.info('✅ Claude response sent back to WhatsApp', { phone });
                    } catch (sendError) {
                        logger.error('❌ Failed to send response back to WhatsApp:', sendError.message);
                    }

                    // Simular scoring baseado na mensagem
                    const qualificationScore = this.calculateLeadScore(messageText, senderName);
                    
                    // Se score alto (≥70), enviar para CRM automaticamente
                    if (qualificationScore >= 70 && senderName) {
                        try {
                            await this.sendLeadToCRM({
                                name: senderName,
                                phone: phone,
                                email: `${phone}@whatsapp.com`,
                                source: 'LAIS IA WhatsApp Auto',
                                qualification_score: qualificationScore,
                                original_message: messageText,
                                created_at: new Date().toISOString(),
                                notes: `Lead AUTO-qualificado via LAIS IA - Score: ${qualificationScore}/100`
                            });
                            
                            logger.info('🎯 High-score lead sent to CRM automatically', {
                                phone,
                                name: senderName,
                                score: qualificationScore
                            });
                        } catch (crmError) {
                            logger.error('❌ Auto CRM send failed:', crmError.message);
                        }
                    }

                    logger.info('🤖 Response generated for WhatsApp', {
                        phone,
                        score: qualificationScore,
                        auto_sent_to_crm: qualificationScore >= 70 && senderName,
                        response: claudeResponse.substring(0, 100) + '...'
                    });

                    return {
                        statusCode: 200,
                        data: {
                            success: true,
                            processed: true,
                            phone: phone,
                            qualification_score: qualificationScore,
                            auto_sent_to_crm: qualificationScore >= 70 && senderName,
                            response_sent: true,
                            response_preview: claudeResponse.substring(0, 100) + '...',
                            timestamp: new Date().toISOString()
                        }
                    };
                }
            }

            return {
                statusCode: 200,
                data: {
                    success: true,
                    processed: false,
                    reason: 'Event not processed'
                }
            };

        } catch (error) {
            logger.error('❌ Error processing WhatsApp webhook:', error.message);
            return {
                statusCode: 500,
                data: {
                    success: false,
                    error: error.message
                }
            };
        }
    }

    /**
     * Calculate lead qualification score
     */
    calculateLeadScore(message, senderName) {
        let score = 30; // Base score
        
        // Tem nome = +20
        if (senderName && senderName !== 'null') {
            score += 20;
        }
        
        // Palavras-chave importantes = +10 cada
        const keyWords = [
            'apartamento', 'casa', 'imóvel', 'comprar', 'vender',
            'orçamento', 'financiamento', 'corretor', 'visita',
            'interessado', 'preciso', 'quero', 'gostaria'
        ];
        
        const messageWords = message.toLowerCase();
        keyWords.forEach(word => {
            if (messageWords.includes(word)) {
                score += 10;
            }
        });
        
        // Urgência = +15
        const urgencyWords = ['urgente', 'rápido', 'logo', 'hoje', 'amanhã'];
        urgencyWords.forEach(word => {
            if (messageWords.includes(word)) {
                score += 15;
            }
        });
        
        // Valores específicos = +15
        if (messageWords.match(/\d+\s*(mil|k|reais|r\$)/)) {
            score += 15;
        }
        
        return Math.min(score, 100); // Max 100
    }

    /**
     * Handle Evolution API webhook (alias for WhatsApp)
     */
    async handleEvolutionWebhook(body) {
        return this.handleWhatsAppWebhook(body);
    }

    /**
     * Send qualified lead to N8N → Pipedrive
     */
    async sendLeadToCRM(leadData) {
        const n8nWebhookUrl = 'https://n8n.roilabs.com.br/webhook/lais-lead-qualified';
        
        try {
            const payload = JSON.stringify(leadData);
            
            const options = {
                hostname: 'n8n.roilabs.com.br',
                port: 443,
                path: '/webhook/lais-lead-qualified',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let responseData = '';

                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            logger.info('✅ Lead sent to CRM successfully', { 
                                phone: leadData.phone,
                                name: leadData.name 
                            });
                            resolve({ success: true, data: responseData });
                        } else {
                            reject(new Error(`N8N Error: ${res.statusCode} - ${responseData}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    logger.error('❌ Error sending lead to CRM:', error.message);
                    reject(error);
                });

                req.write(payload);
                req.end();
            });

        } catch (error) {
            logger.error('❌ CRM integration error:', error.message);
            throw error;
        }
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
                        version: '1.0.0-minimal+claude+whatsapp'
                    }
                };

            case 'send-to-crm':
                if (method === 'POST') {
                    try {
                        const { phone, name, email, message, qualification_score } = body;
                        
                        if (!phone || !name) {
                            return {
                                statusCode: 400,
                                data: { error: 'Phone and name are required' }
                            };
                        }

                        const leadData = {
                            name: name,
                            phone: phone,
                            email: email || `${phone}@whatsapp.com`,
                            source: 'LAIS IA WhatsApp',
                            qualification_score: qualification_score || 70,
                            original_message: message,
                            created_at: new Date().toISOString(),
                            notes: `Lead qualificado via LAIS IA - Score: ${qualification_score || 70}/100`
                        };

                        const result = await this.sendLeadToCRM(leadData);

                        return {
                            statusCode: 200,
                            data: {
                                success: true,
                                message: 'Lead sent to Pipedrive successfully',
                                lead_data: leadData,
                                crm_response: result,
                                timestamp: new Date().toISOString()
                            }
                        };

                    } catch (error) {
                        return {
                            statusCode: 500,
                            data: {
                                success: false,
                                error: error.message
                            }
                        };
                    }
                }
                break;

            case 'test-claude':
                if (method === 'POST') {
                    try {
                        const { message } = body;
                        
                        if (!message) {
                            return {
                                statusCode: 400,
                                data: { error: 'Mensagem é obrigatória' }
                            };
                        }

                        logger.info('🧪 Testing Claude with message:', message);
                        
                        const response = await this.claude.processLeadMessage(
                            'test-phone', 
                            message, 
                            'Usuário Teste'
                        );

                        return {
                            statusCode: 200,
                            data: {
                                success: true,
                                input: message,
                                claude_response: response,
                                timestamp: new Date().toISOString()
                            }
                        };

                    } catch (error) {
                        return {
                            statusCode: 500,
                            data: {
                                success: false,
                                error: error.message
                            }
                        };
                    }
                }
                break;

            case 'claude-status':
                if (method === 'GET') {
                    const status = await this.claude.testConnection();
                    return {
                        statusCode: 200,
                        data: {
                            claude_configured: !!this.claude.apiKey,
                            connection_test: status,
                            model: this.claude.model,
                            timestamp: new Date().toISOString()
                        }
                    };
                }
                break;

            case 'test-whatsapp-send':
                if (method === 'POST') {
                    try {
                        const { phone, message } = body;
                        
                        if (!phone || !message) {
                            return {
                                statusCode: 400,
                                data: { error: 'Phone and message are required' }
                            };
                        }

                        const result = await this.sendWhatsAppMessage(phone, message, 'Demo_Food');

                        return {
                            statusCode: 200,
                            data: {
                                success: true,
                                message: 'WhatsApp message sent successfully',
                                result: result,
                                timestamp: new Date().toISOString()
                            }
                        };

                    } catch (error) {
                        return {
                            statusCode: 500,
                            data: {
                                success: false,
                                error: error.message
                            }
                        };
                    }
                }
                break;

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
                const claudeStatus = await this.claude.testConnection();
                
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
                            services: {
                                database: { status: 'disabled' },
                                claude: { 
                                    status: claudeStatus.success ? 'healthy' : 'error',
                                    model: this.claude.model,
                                    test_result: claudeStatus
                                },
                                evolution_api: { 
                                    status: process.env.EVOLUTION_API_URL ? 'configured' : 'missing' 
                                },
                                whatsapp_send: { status: 'enabled' }
                            },
                            timestamp: new Date().toISOString()
                        }
                    }
                };

            default:
                return {
                    statusCode: 404,
                    data: { error: 'Admin route not found' }
                };
        }
    }

    /**
     * Start the server
     */
    async start() {
        try {
            this.server.listen(this.port, () => {
                logger.info(`🚀 LAIS IA Minimal + Claude + WhatsApp Backend started on port ${this.port}`);
                logger.info(`📱 Health check: http://localhost:${this.port}/health`);
                logger.info(`🤖 Claude test: http://localhost:${this.port}/api/test-claude`);
                logger.info(`📲 WhatsApp test: http://localhost:${this.port}/api/test-whatsapp-send`);
                logger.info(`🌐 API endpoints: http://localhost:${this.port}/api/health`);
                logger.info(`👑 Admin endpoints: http://localhost:${this.port}/admin/dashboard`);
                logger.info(`🔗 Webhooks: http://localhost:${this.port}/webhooks/whatsapp`);
                logger.info(`\n🎯 Quick test commands:`);
                logger.info(`   curl http://localhost:${this.port}/health`);
                logger.info(`   curl http://localhost:${this.port}/api/claude-status`);
                logger.info(`   curl -X POST http://localhost:${this.port}/api/test-claude -H "Content-Type: application/json" -d '{"message": "Oi, preciso de um apartamento"}'`);
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