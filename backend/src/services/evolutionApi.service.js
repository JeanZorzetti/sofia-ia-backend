/**
 * 🚀 Evolution API Service
 * 
 * Serviço responsável por toda integração com Evolution API
 * Funcionalidades: WhatsApp messaging, media, groups, status
 * 
 * @author ROI Labs
 */

const axios = require('axios');
const logger = require('../utils/logger');

class EvolutionApiService {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.apiKey = config.apiKey;
        this.instanceName = config.instanceName;
        
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'apikey': this.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 segundos
        });

        // Interceptor para logs
        this.client.interceptors.request.use(
            (config) => {
                logger.debug('📤 Evolution API Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    data: config.data
                });
                return config;
            },
            (error) => {
                logger.error('❌ Evolution API Request Error:', error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                logger.debug('📥 Evolution API Response:', {
                    status: response.status,
                    data: response.data
                });
                return response;
            },
            (error) => {
                logger.error('❌ Evolution API Response Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                return Promise.reject(error);
            }
        );
    }

    /**
     * Verifica se a API está online
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/manager/status');
            return response.status === 200;
        } catch (error) {
            logger.error('❌ Evolution API health check failed:', error.message);
            return false;
        }
    }

    /**
     * Cria uma nova instância do WhatsApp
     */
    async createInstance() {
        try {
            const response = await this.client.post('/manager/create', {
                instanceName: this.instanceName,
                token: this.apiKey,
                qrcode: true,
                webhook: `${process.env.WEBHOOK_URL}/webhooks/whatsapp`,
                webhookByEvents: true,
                events: [
                    'APPLICATION_STARTUP',
                    'QRCODE_UPDATED',
                    'CONNECTION_UPDATE',
                    'MESSAGES_UPSERT',
                    'MESSAGES_UPDATE',
                    'SEND_MESSAGE'
                ]
            });

            logger.info('✅ Evolution instance created:', response.data);
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to create instance:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Busca QR Code para conexão
     */
    async getQRCode() {
        try {
            const response = await this.client.get(`/instance/connect/${this.instanceName}`);
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to get QR code:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Verifica status da conexão
     */
    async getConnectionStatus() {
        try {
            const response = await this.client.get(`/instance/connectionState/${this.instanceName}`);
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to get connection status:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envia mensagem de texto
     */
    async sendMessage(phone, message, options = {}) {
        try {
            const payload = {
                number: this.cleanPhone(phone),
                textMessage: {
                    text: message
                },
                ...options
            };

            const response = await this.client.post(`/message/sendText/${this.instanceName}`, payload);
            
            logger.info('📤 Message sent:', {
                to: phone,
                message: message.substring(0, 100)
            });

            return response.data;
        } catch (error) {
            logger.error('❌ Failed to send message:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envia mensagem com mídia (imagem, áudio, documento)
     */
    async sendMedia(phone, mediaUrl, caption = '', mediaType = 'image') {
        try {
            const payload = {
                number: this.cleanPhone(phone),
                mediaMessage: {
                    mediatype: mediaType,
                    media: mediaUrl,
                    caption: caption
                }
            };

            const response = await this.client.post(`/message/sendMedia/${this.instanceName}`, payload);
            
            logger.info('📤 Media sent:', {
                to: phone,
                type: mediaType,
                caption: caption
            });

            return response.data;
        } catch (error) {
            logger.error('❌ Failed to send media:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envia áudio (voice message)
     */
    async sendAudio(phone, audioUrl) {
        try {
            const payload = {
                number: this.cleanPhone(phone),
                audioMessage: {
                    audio: audioUrl
                }
            };

            const response = await this.client.post(`/message/sendWhatsAppAudio/${this.instanceName}`, payload);
            
            logger.info('📤 Audio sent:', { to: phone });
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to send audio:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Marca mensagem como lida
     */
    async markAsRead(phone, messageId) {
        try {
            const payload = {
                readMessages: [{
                    remoteJid: this.cleanPhone(phone),
                    id: messageId,
                    fromMe: false
                }]
            };

            const response = await this.client.post(`/chat/markMessageAsRead/${this.instanceName}`, payload);
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to mark as read:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mostra status "digitando..."
     */
    async showTyping(phone, duration = 3000) {
        try {
            const payload = {
                number: this.cleanPhone(phone),
                delay: duration
            };

            const response = await this.client.post(`/chat/sendPresence/${this.instanceName}`, payload);
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to show typing:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Busca informações do contato
     */
    async getContactInfo(phone) {
        try {
            const cleanedPhone = this.cleanPhone(phone);
            const response = await this.client.get(`/chat/findContact/${this.instanceName}`, {
                params: { number: cleanedPhone }
            });

            return response.data;
        } catch (error) {
            logger.error('❌ Failed to get contact info:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Busca histórico de mensagens
     */
    async getChatHistory(phone, limit = 50) {
        try {
            const cleanedPhone = this.cleanPhone(phone);
            const response = await this.client.get(`/chat/findMessages/${this.instanceName}`, {
                params: {
                    remoteJid: cleanedPhone,
                    limit: limit
                }
            });

            return response.data;
        } catch (error) {
            logger.error('❌ Failed to get chat history:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Cria lista de transmissão
     */
    async createBroadcastList(name, contacts) {
        try {
            const payload = {
                name: name,
                contacts: contacts.map(phone => this.cleanPhone(phone))
            };

            const response = await this.client.post(`/group/createGroup/${this.instanceName}`, payload);
            
            logger.info('📢 Broadcast list created:', { name, contacts: contacts.length });
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to create broadcast list:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envia mensagem em massa para lista
     */
    async sendBroadcastMessage(contacts, message, options = {}) {
        try {
            const results = [];
            
            // Envia para cada contato com delay para evitar spam
            for (const phone of contacts) {
                try {
                    const result = await this.sendMessage(phone, message, options);
                    results.push({ phone, success: true, result });
                    
                    // Delay de 2-5 segundos entre envios
                    const delay = Math.random() * 3000 + 2000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } catch (error) {
                    results.push({ phone, success: false, error: error.message });
                }
            }

            logger.info('📢 Broadcast completed:', {
                total: contacts.length,
                success: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            });

            return results;
        } catch (error) {
            logger.error('❌ Broadcast failed:', error);
            throw error;
        }
    }

    /**
     * Configura webhook para a instância
     */
    async setWebhook(webhookUrl) {
        try {
            const payload = {
                webhook: {
                    url: webhookUrl,
                    events: [
                        'APPLICATION_STARTUP',
                        'QRCODE_UPDATED', 
                        'CONNECTION_UPDATE',
                        'MESSAGES_UPSERT',
                        'MESSAGES_UPDATE'
                    ]
                }
            };

            const response = await this.client.post(`/webhook/set/${this.instanceName}`, payload);
            
            logger.info('🔗 Webhook configured:', { url: webhookUrl });
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to set webhook:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Baixa mídia recebida
     */
    async downloadMedia(messageId) {
        try {
            const response = await this.client.get(`/chat/getMedia/${this.instanceName}`, {
                params: { messageId },
                responseType: 'arraybuffer'
            });

            return response.data;
        } catch (error) {
            logger.error('❌ Failed to download media:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Utilitários
     */
    
    /**
     * Limpa e formata número de telefone
     */
    cleanPhone(phone) {
        // Remove tudo que não é número
        let cleaned = phone.replace(/\D/g, '');
        
        // Adiciona código do país se não tiver
        if (!cleaned.startsWith('55') && cleaned.length <= 11) {
            cleaned = '55' + cleaned;
        }
        
        // Adiciona @s.whatsapp.net se não tiver
        if (!phone.includes('@')) {
            cleaned += '@s.whatsapp.net';
        }
        
        return cleaned;
    }

    /**
     * Valida se número é WhatsApp válido
     */
    async validateWhatsAppNumber(phone) {
        try {
            const response = await this.client.get(`/chat/whatsappNumbers/${this.instanceName}`, {
                params: { numbers: [this.cleanPhone(phone)] }
            });

            return response.data?.[0]?.exists || false;
        } catch (error) {
            logger.error('❌ Failed to validate WhatsApp number:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Busca perfil do usuário
     */
    async getProfile(phone) {
        try {
            const response = await this.client.get(`/chat/findProfile/${this.instanceName}`, {
                params: { number: this.cleanPhone(phone) }
            });

            return response.data;
        } catch (error) {
            logger.error('❌ Failed to get profile:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Logout da instância
     */
    async logout() {
        try {
            const response = await this.client.delete(`/instance/logout/${this.instanceName}`);
            logger.info('👋 Instance logged out');
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to logout:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Deleta instância
     */
    async deleteInstance() {
        try {
            const response = await this.client.delete(`/instance/delete/${this.instanceName}`);
            logger.info('🗑️ Instance deleted');
            return response.data;
        } catch (error) {
            logger.error('❌ Failed to delete instance:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = EvolutionApiService;
