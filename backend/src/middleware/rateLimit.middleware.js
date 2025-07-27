/**
 * 🚦 Rate Limit Middleware - Fixed Version
 */

const logger = require('../utils/logger');

// Middleware simples que verifica flag de ativação
function createConditionalRateLimit() {
    return (req, res, next) => {
        // Se rate limiting está desabilitado
        if (process.env.ENABLE_RATE_LIMITING === 'false') {
            return next();
        }

        // Rate limiting básico em memória (fallback)
        if (!req.app.locals.rateLimitCounters) {
            req.app.locals.rateLimitCounters = new Map();
        }

        const ip = req.ip;
        const now = Date.now();
        const windowMs = 60000; // 1 minuto
        const maxRequests = 100;

        // Limpa contadores antigos
        for (const [key, data] of req.app.locals.rateLimitCounters.entries()) {
            if (now - data.resetTime > windowMs) {
                req.app.locals.rateLimitCounters.delete(key);
            }
        }

        // Verifica limite atual
        const current = req.app.locals.rateLimitCounters.get(ip) || { count: 0, resetTime: now };
        
        if (now - current.resetTime > windowMs) {
            current.count = 1;
            current.resetTime = now;
        } else {
            current.count++;
        }

        req.app.locals.rateLimitCounters.set(ip, current);

        // Headers informativos
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': Math.max(0, maxRequests - current.count)
        });

        // Verifica se excedeu limite
        if (current.count > maxRequests) {
            logger.warn('🚫 Rate limit exceeded', { ip, count: current.count });
            return res.status(429).json({
                error: 'Muitas requisições. Tente novamente em instantes.',
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }

        next();
    };
}

module.exports = createConditionalRateLimit();
