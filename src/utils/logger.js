/**
 * 📝 Logger Utility
 * 
 * Sistema de logging centralizado com níveis e formatação
 * Suporte para desenvolvimento e produção
 * 
 * @author ROI Labs
 */

const winston = require('winston');
const path = require('path');

// Níveis de log customizados
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        verbose: 4
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        verbose: 'cyan'
    }
};

// Adiciona cores aos níveis
winston.addColors(customLevels.colors);

// Formato para desenvolvimento
const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Adiciona stack trace para erros
        if (stack) {
            log += `\n${stack}`;
        }
        
        // Adiciona metadados se existirem
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Formato para produção
const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        return JSON.stringify({
            timestamp,
            level,
            message,
            stack,
            ...meta
        });
    })
);

// Configuração de transports
const transports = [];

// Console transport (sempre ativo)
transports.push(
    new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
        handleExceptions: true,
        handleRejections: true
    })
);

// File transports para produção
if (process.env.NODE_ENV === 'production') {
    // Log geral
    transports.push(
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/app.log'),
            level: 'info',
            format: productionFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        })
    );
    
    // Log de erros
    transports.push(
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: productionFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        })
    );
}

// Cria logger principal
const logger = winston.createLogger({
    levels: customLevels.levels,
    level: process.env.LOG_LEVEL || 'info',
    transports,
    exitOnError: false
});

// Logger específico para diferentes módulos
const createModuleLogger = (module) => {
    return {
        error: (message, meta = {}) => logger.error(message, { module, ...meta }),
        warn: (message, meta = {}) => logger.warn(message, { module, ...meta }),
        info: (message, meta = {}) => logger.info(message, { module, ...meta }),
        debug: (message, meta = {}) => logger.debug(message, { module, ...meta }),
        verbose: (message, meta = {}) => logger.verbose(message, { module, ...meta })
    };
};

// Loggers especializados
const apiLogger = createModuleLogger('API');
const dbLogger = createModuleLogger('DATABASE');
const whatsappLogger = createModuleLogger('WHATSAPP');
const aiLogger = createModuleLogger('AI');
const webhookLogger = createModuleLogger('WEBHOOK');

// Middleware de logging para Express
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log da requisição
    logger.info('📥 Request received', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method === 'POST' ? JSON.stringify(req.body).substring(0, 500) : undefined
    });
    
    // Intercepta a resposta
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        
        // Log da resposta
        const logLevel = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
        logger[logLevel]('📤 Response sent', {
            method: req.method,
            url: req.originalUrl,
            statusCode,
            duration: `${duration}ms`,
            responseSize: body ? body.length : 0
        });
        
        originalSend.call(this, body);
    };
    
    next();
};

// Helper para logs estruturados
const logStructured = {
    // Log de eventos do sistema
    systemEvent: (event, data = {}) => {
        logger.info(`🔔 System Event: ${event}`, {
            event,
            ...data,
            timestamp: new Date().toISOString()
        });
    },
    
    // Log de performance
    performance: (operation, duration, metadata = {}) => {
        const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
        logger[level](`⚡ Performance: ${operation}`, {
            operation,
            duration: `${duration}ms`,
            ...metadata
        });
    },
    
    // Log de segurança
    security: (event, details = {}) => {
        logger.warn(`🔒 Security Event: ${event}`, {
            event,
            ...details,
            timestamp: new Date().toISOString()
        });
    },
    
    // Log de business events
    business: (event, leadId, details = {}) => {
        logger.info(`💼 Business Event: ${event}`, {
            event,
            leadId,
            ...details,
            timestamp: new Date().toISOString()
        });
    },
    
    // Log de integrações externas
    integration: (service, operation, success, details = {}) => {
        const level = success ? 'info' : 'error';
        const emoji = success ? '✅' : '❌';
        
        logger[level](`${emoji} ${service}: ${operation}`, {
            service,
            operation,
            success,
            ...details
        });
    },
    
    // Log de IA/ML operations
    ai: (operation, model, tokens, success, details = {}) => {
        logger.info(`🤖 AI Operation: ${operation}`, {
            operation,
            model,
            tokens,
            success,
            ...details
        });
    }
};

// Função para criar timer de performance
const timer = (operation) => {
    const start = Date.now();
    return {
        end: (metadata = {}) => {
            const duration = Date.now() - start;
            logStructured.performance(operation, duration, metadata);
            return duration;
        }
    };
};

// Stream para integração com Express
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// CORREÇÃO: Export direto das funções do winston logger
module.exports = {
    // Funções principais do winston (CORRIGIDO)
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    verbose: logger.verbose.bind(logger),
    
    // Loggers especializados
    api: apiLogger,
    db: dbLogger,
    whatsapp: whatsappLogger,
    ai: aiLogger,
    webhook: webhookLogger,
    
    // Middleware
    requestLogger,
    
    // Helpers
    logStructured,
    timer,
    
    // Utilidades
    createModuleLogger,
    
    // Logger winston original para casos especiais
    winston: logger
};
