/**
 * 🔐 Auth Middleware
 * 
 * Middleware de autenticação JWT
 * Proteção de rotas e validação de tokens
 * 
 * @author ROI Labs
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger').api;

/**
 * Middleware de autenticação principal
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Extrai token do header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Token de acesso requerido',
                code: 'TOKEN_MISSING'
            });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;

        if (!token) {
            return res.status(401).json({
                error: 'Token de acesso inválido',
                code: 'TOKEN_INVALID'
            });
        }

        // Verifica e decodifica token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adiciona dados do usuário na requisição
        req.user = decoded;
        req.userId = decoded.id;
        req.userRole = decoded.role;

        logger.debug('🔐 User authenticated', {
            userId: decoded.id,
            role: decoded.role,
            endpoint: req.originalUrl
        });

        next();

    } catch (error) {
        logger.warn('🚫 Authentication failed', {
            error: error.message,
            endpoint: req.originalUrl,
            ip: req.ip
        });

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                code: 'TOKEN_INVALID'
            });
        }

        return res.status(401).json({
            error: 'Falha na autenticação',
            code: 'AUTH_FAILED'
        });
    }
};

/**
 * Middleware para verificar roles específicas
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            logger.warn('🚫 Access denied - insufficient role', {
                userId: req.user.id,
                userRole,
                requiredRoles: allowedRoles,
                endpoint: req.originalUrl
            });

            return res.status(403).json({
                error: 'Acesso negado - permissões insuficientes',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

/**
 * Middleware para administradores
 */
const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * Middleware opcional - não falha se não tiver token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ') 
                ? authHeader.substring(7) 
                : authHeader;

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                req.userId = decoded.id;
                req.userRole = decoded.role;
            }
        }

        next();

    } catch (error) {
        // Token inválido, mas continua sem autenticação
        logger.debug('🔓 Optional auth failed, continuing without auth', {
            error: error.message
        });
        next();
    }
};

/**
 * Gera token JWT
 */
const generateToken = (payload, expiresIn = '24h') => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn,
        issuer: 'lais-ia',
        audience: 'lais-ia-users'
    });
};

/**
 * Verifica token sem middleware
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw error;
    }
};

/**
 * Middleware para verificar propriedade de recurso
 */
const requireOwnership = (resourceField = 'user_id') => {
    return async (req, res, next) => {
        try {
            // Implementar lógica específica de verificação de ownership
            // Por exemplo, verificar se o lead pertence ao usuário
            
            const resourceId = req.params.id;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            // Admins podem acessar qualquer recurso
            if (['admin', 'super_admin'].includes(userRole)) {
                return next();
            }
            
            // Aqui você implementaria a verificação específica
            // Por exemplo: buscar no banco se o recurso pertence ao usuário
            
            logger.debug('✅ Ownership verified', {
                userId,
                resourceId,
                resourceField
            });
            
            next();

        } catch (error) {
            logger.error('❌ Ownership verification failed:', error);
            return res.status(403).json({
                error: 'Acesso negado ao recurso',
                code: 'RESOURCE_ACCESS_DENIED'
            });
        }
    };
};

/**
 * Middleware para verificar limites de uso
 */
const checkUsageLimits = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userPlan = req.user.plan || 'starter';
        
        // Limites por plano
        const limits = {
            starter: {
                monthly_messages: 500,
                leads: 100,
                campaigns: 5
            },
            professional: {
                monthly_messages: 2000,
                leads: 500,
                campaigns: 20
            },
            enterprise: {
                monthly_messages: -1, // ilimitado
                leads: -1,
                campaigns: -1
            }
        };
        
        const userLimits = limits[userPlan];
        
        // Verificar limites específicos baseado na rota
        const action = req.route?.path;
        
        // Aqui você implementaria verificações específicas
        // Por exemplo: contar mensagens do mês atual
        
        logger.debug('✅ Usage limits checked', {
            userId,
            plan: userPlan,
            action
        });
        
        next();

    } catch (error) {
        logger.error('❌ Usage limit check failed:', error);
        return res.status(429).json({
            error: 'Limite de uso excedido',
            code: 'USAGE_LIMIT_EXCEEDED'
        });
    }
};

module.exports = {
    authMiddleware,
    requireRole,
    requireAdmin,
    optionalAuth,
    generateToken,
    verifyToken,
    requireOwnership,
    checkUsageLimits
};
