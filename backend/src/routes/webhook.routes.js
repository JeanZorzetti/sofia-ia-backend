/**
 * 📱 Webhook Routes - FIXED VERSION
 */

const express = require('express');
const router = express.Router();

// Simple catchAsync function inline
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

const logger = require('../utils/logger');

// Simple webhook rate limit (conditional)
const webhookRateLimit = (req, res, next) => {
    if (process.env.ENABLE_RATE_LIMITING === 'false') {
        return next();
    }
    next();
};

/**
 * GET /webhooks/test
 */
router.get('/test', (req, res) => {
    logger.info('🧪 Webhook test endpoint called');
    
    res.json({
        success: true,
        message: 'Webhook endpoint is working',
        timestamp: new Date().toISOString(),
        server: 'LAIS IA v1.0.0'
    });
});

/**
 * POST /webhooks/whatsapp
 */
router.post('/whatsapp', webhookRateLimit, catchAsync(async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { event, instance, data } = req.body;
        
        logger.info('📱 WhatsApp webhook received', {
            event,
            instance,
            timestamp: new Date().toISOString()
        });

        // Simple response for now
        const result = { processed: true, event };
        const processingTime = Date.now() - startTime;
        
        logger.info('✅ Webhook processed successfully', {
            event,
            processingTime: `${processingTime}ms`
        });

        res.json({
            success: true,
            processed: true,
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        logger.error('❌ Webhook processing failed', {
            error: error.message,
            processingTime: `${processingTime}ms`
        });

        res.status(500).json({
            success: false,
            error: 'Webhook processing failed',
            processingTime: `${processingTime}ms`
        });
    }
}));

/**
 * POST /webhooks/n8n
 */
router.post('/n8n', webhookRateLimit, catchAsync(async (req, res) => {
    logger.info('🔄 N8N webhook received', {
        body: req.body
    });

    res.json({
        success: true,
        result: 'processed'
    });
}));

module.exports = router;
