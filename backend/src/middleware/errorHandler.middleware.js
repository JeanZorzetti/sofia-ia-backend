/**
 * ⚠️ Error Handler Middleware
 * 
 * Tratamento centralizado de erros
 * Logs estruturados e respostas padronizadas
 * 
 * @author ROI Labs
 */

const logger = require('../utils/logger').api;

/**
 * Tipos de erro conhecidos
 */
const ERROR_TYPES = {
    VALIDATION_ERROR: 'ValidationError',
    DATABASE_ERROR: 'DatabaseError',
    AUTHENTICATION_ERROR: 'AuthenticationError',
    AUTHORIZATION_ERROR: 'AuthorizationError',
    NOT_FOUND_ERROR: 'NotFoundError',
    RATE_LIMIT_ERROR: 'RateLimitError',
    EXTERNAL_API_ERROR: 'ExternalApiError',
    FILE_UPLOAD_ERROR: 'FileUploadError',
    BUSINESS_LOGIC_ERROR: 'BusinessLogicError'
};

/**
 * Códigos de erro padronizados
 */
const ERROR_CODES = {
    // Autenticação (1000-1099)
    INVALID_CREDENTIALS: 1001,
    TOKEN_EXPIRED: 1002,
    TOKEN_INVALID: 1003,
    INSUFFICIENT_PERMISSIONS: 1004,
    
    // Validação (1100-1199)
    INVALID_INPUT: 1101,
    MISSING_REQUIRED_FIELD: 1102,
    INVALID_FORMAT: 1103,
    VALUE_OUT_OF_RANGE: 1104,
    
    // Recursos (1200-1299)
    RESOURCE_NOT_FOUND: 1201,
    RESOURCE_ALREADY_EXISTS: 1202,
    RESOURCE_CONFLICT: 1203,
    RESOURCE_DELETED: 1204,
    
    // Rate Limiting (1300-1399)
    RATE_LIMIT_EXCEEDED: 1301,
    QUOTA_EXCEEDED: 1302,
    
    // Integrações (1400-1499)
    WHATSAPP_API_ERROR: 1401,
    CLAUDE_API_ERROR: 1402,
    DATABASE_CONNECTION_ERROR: 1403,
    EXTERNAL_SERVICE_UNAVAILABLE: 1404,
    
    // Upload/Mídia (1500-1599)
    FILE_TOO_LARGE: 1501,
    INVALID_FILE_TYPE: 1502,
    UPLOAD_FAILED: 1503,
    
    // Business Logic (1600-1699)
    LEAD_NOT_QUALIFIED: 1601,
    CAMPAIGN_LIMIT_REACHED: 1602,
    INVALID_PHONE_NUMBER: 1603,
    
    // Sistema (1700-1799)
    INTERNAL_SERVER_ERROR: 1701,
    SERVICE_UNAVAILABLE: 1702,
    MAINTENANCE_MODE: 1703
};

/**
 * Classe de erro personalizado
 */
class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = null, isOperational = true) {
        super(message);
        
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Middleware de tratamento de erros principal
 */
const errorHandler = (error, req, res, next) => {
    let err = { ...error };
    err.message = error.message;

    // Log do erro
    logError(error, req);

    // Tratamento específico por tipo de erro
    if (error.name === 'ValidationError') {
        err = handleValidationError(error);
    } else if (error.name === 'CastError') {
        err = handleCastError(error);
    } else if (error.code === 11000) {
        err = handleDuplicateKeyError(error);
    } else if (error.name === 'JsonWebTokenError') {
        err = handleJWTError(error);
    } else if (error.name === 'TokenExpiredError') {
        err = handleJWTExpiredError(error);
    } else if (error.code === 'ECONNREFUSED') {
        err = handleConnectionError(error);
    } else if (error.response && error.response.status) {
        err = handleExternalAPIError(error);
    }

    // Resposta de erro padronizada
    const response = {
        success: false,
        error: {
            message: err.message || 'Erro interno do servidor',
            code: err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
            timestamp: err.timestamp || new Date().toISOString()
        }
    };

    // Adiciona detalhes em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = error.stack;
        response.error.details = error;
    }

    // ID de tracking para suporte
    response.error.trackingId = generateTrackingId();

    // Status code apropriado
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json(response);
};

/**
 * Log estruturado de erros
 */
function logError(error, req) {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        isOperational: error.isOperational,
        
        // Contexto da requisição
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        body: req.method === 'POST' ? JSON.stringify(req.body).substring(0, 500) : undefined,
        params: req.params,
        query: req.query,
        
        // Timing
        timestamp: new Date().toISOString()
    };

    // Log baseado na severidade
    if (error.statusCode >= 500) {
        logger.error('🔥 Server Error:', errorInfo);
    } else if (error.statusCode >= 400) {
        logger.warn('⚠️ Client Error:', errorInfo);
    } else {
        logger.info('ℹ️ Error:', errorInfo);
    }
}

/**
 * Handlers específicos por tipo de erro
 */

function handleValidationError(error) {
    const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
    }));

    return new AppError(
        'Dados de entrada inválidos',
        400,
        ERROR_CODES.INVALID_INPUT
    );
}

function handleCastError(error) {
    const message = `Valor inválido para o campo ${error.path}: ${error.value}`;
    return new AppError(message, 400, ERROR_CODES.INVALID_FORMAT);
}

function handleDuplicateKeyError(error) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} já existe no sistema`;
    return new AppError(message, 409, ERROR_CODES.RESOURCE_ALREADY_EXISTS);
}

function handleJWTError(error) {
    return new AppError(
        'Token de acesso inválido',
        401,
        ERROR_CODES.TOKEN_INVALID
    );
}

function handleJWTExpiredError(error) {
    return new AppError(
        'Token de acesso expirado',
        401,
        ERROR_CODES.TOKEN_EXPIRED
    );
}

function handleConnectionError(error) {
    return new AppError(
        'Falha na conexão com serviço externo',
        503,
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE
    );
}

function handleExternalAPIError(error) {
    const status = error.response.status;
    let message = 'Erro em serviço externo';
    let errorCode = ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE;

    if (error.config && error.config.url) {
        if (error.config.url.includes('anthropic')) {
            message = 'Erro na API do Claude AI';
            errorCode = ERROR_CODES.CLAUDE_API_ERROR;
        } else if (error.config.url.includes('evolution')) {
            message = 'Erro na API do WhatsApp';
            errorCode = ERROR_CODES.WHATSAPP_API_ERROR;
        }
    }

    return new AppError(message, status >= 500 ? 503 : status, errorCode);
}

/**
 * Middleware para capturar erros assíncronos
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handler para rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(
        `Rota ${req.originalUrl} não encontrada`,
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
    );
    
    next(error);
};

/**
 * Middleware para validação de entrada
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type
            }));

            const appError = new AppError(
                'Dados de entrada inválidos',
                400,
                ERROR_CODES.INVALID_INPUT
            );
            
            appError.validationDetails = details;
            return next(appError);
        }

        req.validatedBody = value;
        next();
    };
};

/**
 * Gerador de ID de tracking para suporte
 */
function generateTrackingId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Factory para erros específicos
 */
const createError = {
    validation: (message, field = null) => {
        const error = new AppError(message, 400, ERROR_CODES.INVALID_INPUT);
        if (field) error.field = field;
        return error;
    },

    notFound: (resource = 'Recurso') => {
        return new AppError(
            `${resource} não encontrado`,
            404,
            ERROR_CODES.RESOURCE_NOT_FOUND
        );
    },

    unauthorized: (message = 'Acesso não autorizado') => {
        return new AppError(message, 401, ERROR_CODES.INVALID_CREDENTIALS);
    },

    forbidden: (message = 'Acesso negado') => {
        return new AppError(message, 403, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    },

    conflict: (message = 'Conflito de recursos') => {
        return new AppError(message, 409, ERROR_CODES.RESOURCE_CONFLICT);
    },

    rateLimit: (message = 'Muitas requisições') => {
        return new AppError(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
    },

    external: (service, originalError) => {
        let errorCode = ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE;
        
        if (service === 'claude') errorCode = ERROR_CODES.CLAUDE_API_ERROR;
        else if (service === 'whatsapp') errorCode = ERROR_CODES.WHATSAPP_API_ERROR;
        else if (service === 'database') errorCode = ERROR_CODES.DATABASE_CONNECTION_ERROR;

        return new AppError(
            `Erro no serviço ${service}: ${originalError.message}`,
            503,
            errorCode
        );
    },

    business: (message, code = ERROR_CODES.BUSINESS_LOGIC_ERROR) => {
        return new AppError(message, 400, code);
    }
};

/**
 * Middleware para logs de performance
 */
const performanceLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;
        
        const logData = {
            method,
            url: originalUrl,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id
        };

        if (duration > 5000) {
            logger.warn('🐌 Slow Request:', logData);
        } else if (duration > 1000) {
            logger.info('⏱️ Request:', logData);
        } else {
            logger.debug('✅ Request:', logData);
        }
    });
    
    next();
};

module.exports = {
    AppError,
    ERROR_TYPES,
    ERROR_CODES,
    errorHandler,
    catchAsync,
    notFoundHandler,
    validateRequest,
    createError,
    performanceLogger
};
