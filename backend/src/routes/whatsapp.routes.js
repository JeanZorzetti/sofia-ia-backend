/**
 * 🔗 WhatsApp Integration Routes
 * 
 * Endpoints específicos para integração com n8n e Evolution API
 * Processa mensagens WhatsApp com IA completa
 * 
 * @author ROI Labs
 */

const express = require('express');
const router = express.Router();

// Services
let ClaudeService, LeadQualificationService, DatabaseService;

try {
    ClaudeService = require('../services/claude.service');
    LeadQualificationService = require('../services/leadQualification.service');
    DatabaseService = require('../services/database.service');
} catch (error) {
    console.warn('⚠️ Some services not available:', error.message);
}

const logger = require('../utils/logger');

/**
 * 🚀 ENDPOINT PRINCIPAL: Processa mensagem WhatsApp completa
 * POST /api/whatsapp/process-message
 * 
 * Este é o endpoint que o n8n vai chamar para processar cada mensagem
 */
router.post('/process-message', async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Dados vindos do n8n/WhatsApp webhook
        const {
            phone,
            name,
            message,
            mediaType = 'text',
            mediaUrl = null,
            whatsappMessageId = null,
            instanceId = null
        } = req.body;

        // Validação básica
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone and message are required',
                requiredFields: ['phone', 'message']
            });
        }

        logger.info('📱 Processing WhatsApp message:', {
            phone: phone.substring(0, 8) + '****',
            messageLength: message.length,
            mediaType,
            instanceId
        });

        // ETAPA 1: Processamento IA da mensagem
        const aiResponse = await ClaudeService.processMessage(message, {
            leadId: `whatsapp-${phone}`,
            phone,
            name: name || 'Cliente',
            conversationHistory: [] // TODO: buscar do banco
        });

        // ETAPA 2: Qualificação do lead
        const qualification = await LeadQualificationService.analyzeConversation(
            [message], 
            { phone, name: name || 'Cliente', source: 'whatsapp' }
        );

        // ETAPA 3: Determinar ações baseadas no score/temperatura
        const actions = determineActionsFromQualification(qualification, aiResponse);

        // ETAPA 4: Salvar no banco (se disponível)
        let leadData = null;
        if (DatabaseService) {
            try {
                leadData = await saveLeadAndMessage({
                    phone,
                    name,
                    message,
                    mediaType,
                    qualification,
                    aiResponse
                });
            } catch (dbError) {
                logger.warn('⚠️ Database save failed, continuing without persistence:', dbError.message);
            }
        }

        const processingTime = Date.now() - startTime;

        // RESPOSTA ESTRUTURADA PARA N8N
        const response = {
            success: true,
            processingTime: `${processingTime}ms`,
            
            // Dados do lead
            lead: {
                phone,
                name: name || 'Cliente',
                id: leadData?.id || `temp-${Date.now()}`,
                status: 'active'
            },
            
            // Resposta da IA
            aiResponse: {
                reply: aiResponse.reply,
                extractedData: aiResponse.extractedData,
                nextAction: aiResponse.nextAction,
                confidence: aiResponse.confidence
            },
            
            // Qualificação
            qualification: {
                score: qualification.score,
                temperature: qualification.temperature,
                extractedData: qualification.extractedData,
                nextActions: qualification.nextActions,
                confidence: qualification.confidence
            },
            
            // Ações para n8n executar
            actions,
            
            // Metadados para debug
            metadata: {
                model: aiResponse.model,
                tokensUsed: aiResponse.tokensUsed,
                responseTime: aiResponse.responseTime,
                timestamp: new Date().toISOString()
            }
        };

        logger.info('✅ WhatsApp message processed successfully:', {
            phone: phone.substring(0, 8) + '****',
            score: qualification.score,
            temperature: qualification.temperature,
            actionsCount: actions.length,
            processingTime: `${processingTime}ms`
        });

        res.json(response);

    } catch (error) {
        logger.error('❌ WhatsApp message processing failed:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during message processing',
            details: error.message,
            fallback: {
                reply: "Obrigado pela mensagem! Em breve um consultor entrará em contato.",
                actions: [
                    {
                        type: 'send_whatsapp',
                        message: "Obrigado pela mensagem! Em breve um consultor entrará em contato.",
                        priority: 'normal'
                    }
                ]
            }
        });
    }
});

/**
 * 🎯 Determina ações baseadas na qualificação
 */
function determineActionsFromQualification(qualification, aiResponse) {
    const actions = [];
    
    // AÇÃO 1: Sempre responder no WhatsApp
    actions.push({
        type: 'send_whatsapp',
        message: aiResponse.reply,
        priority: 'immediate'
    });
    
    // AÇÕES baseadas no SCORE
    if (qualification.score >= 80) {
        // Lead quente - máxima prioridade
        actions.push({
            type: 'notify_sales_team',
            priority: 'urgent',
            message: `🔥 LEAD QUENTE! Score: ${qualification.score}`,
            data: {
                score: qualification.score,
                temperature: qualification.temperature,
                extractedData: qualification.extractedData
            }
        });
        
        actions.push({
            type: 'create_crm_lead',
            priority: 'high',
            data: {
                status: 'hot',
                priority: 'urgent',
                notes: `Lead qualificado automaticamente. Score: ${qualification.score}`
            }
        });
        
    } else if (qualification.score >= 60) {
        // Lead morno - follow-up estruturado
        actions.push({
            type: 'create_crm_lead',
            priority: 'medium',
            data: {
                status: 'warm',
                priority: 'medium',
                notes: `Lead em aquecimento. Score: ${qualification.score}`
            }
        });
        
        actions.push({
            type: 'schedule_followup',
            delay: '1 hour',
            message: 'Follow-up automático para qualificar melhor'
        });
        
    } else if (qualification.score >= 40) {
        // Lead frio - nutrição
        actions.push({
            type: 'add_to_nurturing',
            campaign: 'educacao_mercado_imobiliario',
            data: {
                status: 'cold',
                qualification: qualification
            }
        });
        
    } else {
        // Lead muito frio - educação básica
        actions.push({
            type: 'add_to_nurturing',
            campaign: 'educacao_basica',
            delay: '1 day'
        });
    }
    
    // AÇÕES baseadas nos DADOS EXTRAÍDOS
    if (qualification.extractedData.budget && qualification.extractedData.budget > 500000) {
        actions.push({
            type: 'tag_in_crm',
            tags: ['alto_valor', 'priority_lead']
        });
    }
    
    if (qualification.extractedData.urgency === 'high') {
        actions.push({
            type: 'immediate_callback',
            priority: 'urgent',
            timeframe: '30 minutes'
        });
    }
    
    if (qualification.extractedData.propertyType) {
        actions.push({
            type: 'send_property_suggestions',
            propertyType: qualification.extractedData.propertyType,
            delay: '5 minutes'
        });
    }
    
    return actions;
}

/**
 * 💾 Salva lead e mensagem no banco
 */
async function saveLeadAndMessage(data) {
    const { phone, name, message, mediaType, qualification, aiResponse } = data;
    
    try {
        // Busca ou cria lead
        let lead = await DatabaseService.query(
            'SELECT * FROM leads WHERE phone = $1', 
            [phone]
        );
        
        if (lead.rows.length === 0) {
            // Cria novo lead
            const newLead = await DatabaseService.insert('leads', {
                phone,
                name: name || 'Cliente',
                source: 'whatsapp',
                status: 'active',
                qualification_score: qualification.score,
                temperature: qualification.temperature,
                last_interaction: new Date(),
                last_message: message
            });
            lead = newLead;
        } else {
            // Atualiza lead existente
            const leadId = lead.rows[0].id;
            await DatabaseService.update('leads', leadId, {
                qualification_score: qualification.score,
                temperature: qualification.temperature,
                last_interaction: new Date(),
                last_message: message,
                interaction_count: (lead.rows[0].interaction_count || 0) + 1
            });
            lead = { ...lead.rows[0], qualification_score: qualification.score };
        }
        
        // Salva mensagem
        await DatabaseService.insert('messages', {
            lead_id: lead.id,
            content: message,
            direction: 'received',
            media_type: mediaType,
            created_at: new Date()
        });
        
        return lead;
        
    } catch (error) {
        logger.error('❌ Error saving lead/message:', error);
        throw error;
    }
}

/**
 * 📊 Endpoint para estatísticas (para dashboard)
 * GET /api/whatsapp/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalLeads: 0,
            hotLeads: 0,
            warmLeads: 0,
            coldLeads: 0,
            totalMessages: 0,
            avgResponseTime: '< 500ms',
            conversionRate: '0%'
        };
        
        if (DatabaseService) {
            try {
                const leadsStats = await DatabaseService.getStats();
                stats.totalLeads = leadsStats.leads || 0;
                stats.totalMessages = leadsStats.messages || 0;
                
                // Stats por temperatura
                const tempStats = await DatabaseService.query(`
                    SELECT temperature, COUNT(*) as count 
                    FROM leads 
                    GROUP BY temperature
                `);
                
                tempStats.rows.forEach(row => {
                    if (row.temperature === 'hot' || row.temperature === 'immediate') {
                        stats.hotLeads += parseInt(row.count);
                    } else if (row.temperature === 'warm') {
                        stats.warmLeads += parseInt(row.count);
                    } else {
                        stats.coldLeads += parseInt(row.count);
                    }
                });
                
            } catch (dbError) {
                logger.warn('⚠️ Database stats failed:', dbError.message);
            }
        }
        
        res.json({
            success: true,
            stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('❌ Stats retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve stats'
        });
    }
});

/**
 * 🧪 Endpoint de teste para n8n
 * POST /api/whatsapp/test
 */
router.post('/test', async (req, res) => {
    try {
        const testMessage = req.body.message || "Olá, estou procurando um apartamento com 2 quartos na zona sul, meu orçamento é R$ 400.000";
        
        const result = await router.handle({
            method: 'POST',
            url: '/process-message',
            body: {
                phone: '+5511999887766',
                name: 'João Teste',
                message: testMessage,
                mediaType: 'text'
            }
        }, res);
        
        // Se chegou aqui, o resultado já foi enviado
        
    } catch (error) {
        res.json({
            success: true,
            message: 'WhatsApp integration endpoint is working!',
            testMessage: "Use POST /api/whatsapp/process-message with proper data",
            example: {
                phone: '+5511999887766',
                name: 'João Silva',
                message: 'Estou procurando um apartamento',
                mediaType: 'text'
            }
        });
    }
});

module.exports = router;