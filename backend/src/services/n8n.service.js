/**
 * 🔄 N8N Integration Service
 * 
 * Integração com n8n da ROI Labs para workflows avançados
 * URL: https://n8n.roilabs.com.br
 * 
 * @author ROI Labs
 */

const axios = require('axios');
const logger = require('../utils/logger');

class N8NService {
    constructor() {
        this.baseUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.roilabs.com.br';
        this.apiKey = process.env.N8N_API_KEY;
        this.enabled = process.env.ENABLE_N8N === 'true';
        
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': this.apiKey
            },
            timeout: 10000
        });

        // Interceptors para logs
        this.client.interceptors.request.use(
            (config) => {
                logger.debug('🔄 N8N Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    data: config.data
                });
                return config;
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                logger.debug('📥 N8N Response:', {
                    status: response.status,
                    data: response.data
                });
                return response;
            },
            (error) => {
                logger.error('❌ N8N Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                return Promise.reject(error);
            }
        );

        logger.info('🔄 N8N Service initialized', {
            enabled: this.enabled,
            baseUrl: this.baseUrl
        });
    }

    /**
     * Verifica se n8n está habilitado
     */
    isEnabled() {
        return this.enabled && this.apiKey;
    }

    /**
     * Health check do n8n
     */
    async healthCheck() {
        if (!this.isEnabled()) {
            return { status: 'disabled' };
        }

        try {
            const response = await this.client.get('/health');
            return { 
                status: 'healthy',
                version: response.data?.version 
            };
        } catch (error) {
            return { 
                status: 'unhealthy', 
                error: error.message 
            };
        }
    }

    /**
     * Envia evento de mensagem recebida do WhatsApp
     */
    async sendWhatsAppMessage(messageData) {
        if (!this.isEnabled()) {
            logger.debug('N8N disabled, skipping WhatsApp message');
            return null;
        }

        try {
            const payload = {
                event: 'whatsapp_message_received',
                timestamp: new Date().toISOString(),
                data: {
                    phone: messageData.phone,
                    name: messageData.name,
                    message: messageData.message,
                    mediaType: messageData.mediaType,
                    mediaUrl: messageData.mediaUrl,
                    leadId: messageData.leadId,
                    source: 'lais_ia_backend'
                }
            };

            const response = await this.client.post('/webhook/whatsapp-message', payload);
            
            logger.info('📤 WhatsApp message sent to n8n', {
                phone: messageData.phone?.substring(0, 10) + '...',
                messageLength: messageData.message?.length || 0
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to send WhatsApp message to n8n:', error);
            throw error;
        }
    }

    /**
     * Envia evento de lead qualificado
     */
    async sendLeadQualified(leadData) {
        if (!this.isEnabled()) {
            logger.debug('N8N disabled, skipping lead qualified');
            return null;
        }

        try {
            const payload = {
                event: 'lead_qualified',
                timestamp: new Date().toISOString(),
                data: {
                    leadId: leadData.id,
                    name: leadData.name,
                    phone: leadData.phone,
                    email: leadData.email,
                    qualificationScore: leadData.qualification_score,
                    temperature: leadData.temperature,
                    buyingIntent: leadData.buying_intent,
                    budgetRange: {
                        min: leadData.budget_min,
                        max: leadData.budget_max
                    },
                    propertyInterest: leadData.property_type_interest,
                    locationPreference: leadData.location_preference,
                    urgencyLevel: leadData.urgency_level,
                    estimatedClosingTime: leadData.estimated_closing_time,
                    nextAction: leadData.next_action,
                    source: 'lais_ia_backend'
                }
            };

            const response = await this.client.post('/webhook/lead-qualified', payload);
            
            logger.info('🎯 Lead qualified sent to n8n', {
                leadId: leadData.id,
                score: leadData.qualification_score,
                temperature: leadData.temperature
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to send lead qualified to n8n:', error);
            throw error;
        }
    }

    /**
     * Envia evento de novo lead criado
     */
    async sendNewLead(leadData) {
        if (!this.isEnabled()) {
            return null;
        }

        try {
            const payload = {
                event: 'new_lead_created',
                timestamp: new Date().toISOString(),
                data: {
                    leadId: leadData.id,
                    name: leadData.name,
                    phone: leadData.phone,
                    source: leadData.source,
                    createdAt: leadData.created_at
                }
            };

            const response = await this.client.post('/webhook/new-lead', payload);
            
            logger.info('👤 New lead sent to n8n', {
                leadId: leadData.id,
                name: leadData.name
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to send new lead to n8n:', error);
            throw error;
        }
    }

    /**
     * Executa workflow específico do n8n
     */
    async executeWorkflow(workflowId, inputData) {
        if (!this.isEnabled()) {
            throw new Error('N8N not enabled');
        }

        try {
            const payload = {
                workflowId,
                inputData,
                source: 'lais_ia_backend'
            };

            const response = await this.client.post(`/api/v1/workflows/${workflowId}/execute`, payload);
            
            logger.info('🔄 N8N workflow executed', {
                workflowId,
                executionId: response.data?.executionId
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to execute n8n workflow:', error);
            throw error;
        }
    }

    /**
     * Busca workflows disponíveis
     */
    async getWorkflows() {
        if (!this.isEnabled()) {
            return [];
        }

        try {
            const response = await this.client.get('/api/v1/workflows');
            return response.data?.data || [];

        } catch (error) {
            logger.error('❌ Failed to get n8n workflows:', error);
            return [];
        }
    }

    /**
     * Cria webhook dinâmico no n8n
     */
    async createWebhook(webhookName, path, httpMethod = 'POST') {
        if (!this.isEnabled()) {
            return null;
        }

        try {
            const payload = {
                name: webhookName,
                path: path,
                httpMethod: httpMethod,
                source: 'lais_ia_backend'
            };

            const response = await this.client.post('/api/v1/webhooks', payload);
            
            logger.info('🔗 N8N webhook created', {
                name: webhookName,
                path: path
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to create n8n webhook:', error);
            throw error;
        }
    }

    /**
     * Envia dados para CRM via n8n
     */
    async sendToCRM(crmName, leadData, action = 'create_contact') {
        if (!this.isEnabled()) {
            return null;
        }

        try {
            const payload = {
                event: 'crm_integration',
                crm: crmName,
                action: action,
                timestamp: new Date().toISOString(),
                data: leadData
            };

            const response = await this.client.post(`/webhook/crm-${crmName.toLowerCase()}`, payload);
            
            logger.info('🔗 Data sent to CRM via n8n', {
                crm: crmName,
                action: action,
                leadId: leadData.id
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to send to CRM via n8n:', error);
            throw error;
        }
    }

    /**
     * Agenda follow-up via n8n
     */
    async scheduleFollowUp(leadData, delay, message) {
        if (!this.isEnabled()) {
            return null;
        }

        try {
            const payload = {
                event: 'schedule_follow_up',
                timestamp: new Date().toISOString(),
                data: {
                    leadId: leadData.id,
                    phone: leadData.phone,
                    delay: delay, // em minutos
                    message: message,
                    scheduledFor: new Date(Date.now() + delay * 60000).toISOString()
                }
            };

            const response = await this.client.post('/webhook/schedule-follow-up', payload);
            
            logger.info('⏰ Follow-up scheduled via n8n', {
                leadId: leadData.id,
                delay: `${delay} minutes`
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to schedule follow-up via n8n:', error);
            throw error;
        }
    }

    /**
     * Notifica equipe via n8n (Slack, Discord, Email, etc.)
     */
    async notifyTeam(event, data, channels = ['slack']) {
        if (!this.isEnabled()) {
            return null;
        }

        try {
            const payload = {
                event: 'team_notification',
                notificationEvent: event,
                channels: channels,
                timestamp: new Date().toISOString(),
                data: data
            };

            const response = await this.client.post('/webhook/team-notification', payload);
            
            logger.info('🔔 Team notification sent via n8n', {
                event,
                channels: channels.join(', ')
            });

            return response.data;

        } catch (error) {
            logger.error('❌ Failed to send team notification via n8n:', error);
            throw error;
        }
    }

    /**
     * Processa resposta do n8n
     */
    async processN8NResponse(n8nData) {
        try {
            const { event, data, source } = n8nData;

            logger.info('📥 Processing n8n response', {
                event,
                source,
                dataKeys: Object.keys(data || {})
            });

            switch (event) {
                case 'send_whatsapp_message':
                    return await this.handleSendMessage(data);
                
                case 'update_lead':
                    return await this.handleUpdateLead(data);
                
                case 'create_task':
                    return await this.handleCreateTask(data);
                
                default:
                    logger.warn('🤷 Unknown n8n event type:', event);
                    return { processed: false, reason: 'unknown_event' };
            }

        } catch (error) {
            logger.error('❌ Error processing n8n response:', error);
            throw error;
        }
    }

    /**
     * Handlers para respostas do n8n
     */
    async handleSendMessage(data) {
        // Implementar envio de mensagem de volta via Evolution API
        logger.info('📤 N8N requested message send', data);
        return { processed: true, action: 'message_sent' };
    }

    async handleUpdateLead(data) {
        // Implementar atualização de lead
        logger.info('✏️ N8N requested lead update', data);
        return { processed: true, action: 'lead_updated' };
    }

    async handleCreateTask(data) {
        // Implementar criação de tarefa/lembrete
        logger.info('📝 N8N requested task creation', data);
        return { processed: true, action: 'task_created' };
    }
}

module.exports = N8NService;
