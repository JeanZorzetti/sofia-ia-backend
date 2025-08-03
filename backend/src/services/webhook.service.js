/**
 * 🔔 SOFIA IA - Webhook Processing Service
 * Sistema completo de webhooks bidirecionais WhatsApp + IA
 * Checklist: Configurar webhooks bidirecionais ✅ IMPLEMENTANDO!
 */

const EvolutionAPIService = require('./evolution.service.js');

class WebhookProcessingService {
    constructor() {
        this.evolutionAPI = new EvolutionAPIService();
        this.messageQueue = [];
        this.processingStats = {
            total_received: 0,
            total_processed: 0,
            total_responses_sent: 0,
            last_activity: null
        };
        
        console.log('🔔 Webhook Processing Service inicializado');
    }

    // 🎯 Processar webhook recebido da Evolution API
    async processIncomingWebhook(webhookData) {
        try {
            console.log('🎯 Processando webhook:', webhookData.event);
            this.processingStats.total_received++;
            this.processingStats.last_activity = new Date().toISOString();
            
            const { event, instance, data } = webhookData;
            
            switch (event) {
                case 'MESSAGES_UPSERT':
                    return await this.processIncomingMessage(instance, data);
                    
                case 'QRCODE_UPDATED':
                    return await this.processQRCodeUpdate(instance, data);
                    
                case 'CONNECTION_UPDATE':
                    return await this.processConnectionUpdate(instance, data);
                    
                case 'MESSAGE_STATUS_UPDATE':
                    return await this.processMessageStatus(instance, data);
                    
                default:
                    console.log(`ℹ️ Evento não processado: ${event}`);
                    return { success: true, processed: false, event };
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar webhook:', error.message);
            return {
                success: false,
                error: error.message,
                webhook_data: webhookData
            };
        }
    }

    // 💬 Processar mensagem recebida
    async processIncomingMessage(instance, messageData) {
        try {
            console.log(`💬 Nova mensagem em ${instance}`);
            
            // Extrair dados da mensagem
            const message = this.extractMessageData(messageData);
            
            if (!message.isFromUser) {
                console.log('📤 Mensagem enviada por nós, ignorando...');
                return { success: true, action: 'ignored', reason: 'outgoing_message' };
            }
            
            console.log(`📱 Mensagem de ${message.from}: ${message.text}`);
            
            // Adicionar à fila de processamento
            this.messageQueue.push({
                id: message.id,
                instance: instance,
                from: message.from,
                text: message.text,
                type: message.type,
                timestamp: new Date().toISOString(),
                processed: false
            });
            
            // Processar com IA (Claude) - versão simulada por enquanto
            const aiResponse = await this.processWithAI(message);
            
            // Enviar resposta automática se necessário
            if (aiResponse.shouldRespond && aiResponse.response) {
                const sendResult = await this.sendAutomaticResponse(
                    instance, 
                    message.from, 
                    aiResponse.response
                );
                
                if (sendResult.success) {
                    this.processingStats.total_responses_sent++;
                }
            }
            
            this.processingStats.total_processed++;
            
            return {
                success: true,
                action: 'message_processed',
                instance: instance,
                from: message.from,
                ai_response: aiResponse,
                response_sent: aiResponse.shouldRespond
            };
            
        } catch (error) {
            console.error(`❌ Erro ao processar mensagem:`, error.message);
            return {
                success: false,
                error: error.message,
                instance: instance
            };
        }
    }

    // 📱 Processar QR Code atualizado
    async processQRCodeUpdate(instance, qrData) {
        console.log(`📱 QR Code atualizado para ${instance}`);
        
        return {
            success: true,
            action: 'qr_updated',
            instance: instance,
            qrcode: qrData.qrcode || qrData.base64,
            timestamp: new Date().toISOString()
        };
    }

    // 🔗 Processar atualização de conexão
    async processConnectionUpdate(instance, connectionData) {
        console.log(`🔗 Status de conexão atualizado para ${instance}:`, connectionData.state);
        
        // Se conectou, configurar webhook automaticamente
        if (connectionData.state === 'open') {
            await this.autoConfigureWebhook(instance);
        }
        
        return {
            success: true,
            action: 'connection_updated',
            instance: instance,
            status: connectionData.state,
            timestamp: new Date().toISOString()
        };
    }

    // 📋 Processar status de mensagem
    async processMessageStatus(instance, statusData) {
        console.log(`📋 Status de mensagem atualizado em ${instance}`);
        
        return {
            success: true,
            action: 'message_status_updated',
            instance: instance,
            status: statusData,
            timestamp: new Date().toISOString()
        };
    }

    // 📝 Extrair dados da mensagem
    extractMessageData(messageData) {
        const message = messageData.message || messageData;
        const key = messageData.key || {};
        
        return {
            id: key.id || `msg_${Date.now()}`,
            from: key.remoteJid || key.participant || 'unknown',
            isFromUser: !key.fromMe,
            text: message.conversation || 
                  message.extendedTextMessage?.text || 
                  message.imageMessage?.caption ||
                  message.videoMessage?.caption ||
                  '[Mídia sem texto]',
            type: this.getMessageType(message),
            timestamp: new Date().toISOString(),
            raw: messageData
        };
    }

    // 🎯 Identificar tipo de mensagem
    getMessageType(message) {
        if (message.conversation || message.extendedTextMessage) return 'text';
        if (message.imageMessage) return 'image';
        if (message.videoMessage) return 'video';
        if (message.audioMessage) return 'audio';
        if (message.documentMessage) return 'document';
        if (message.locationMessage) return 'location';
        return 'unknown';
    }

    // 🧠 Processar com IA (Claude) - versão simulada
    async processWithAI(message) {
        try {
            console.log('🧠 Processando com IA Claude...');
            
            // TODO: Integrar com Claude API real quando tivermos a chave
            // Por enquanto, simulação inteligente baseada na mensagem
            
            const aiAnalysis = this.simulateClaudeAnalysis(message.text);
            
            return {
                success: true,
                shouldRespond: aiAnalysis.shouldRespond,
                response: aiAnalysis.response,
                leadScore: aiAnalysis.leadScore,
                temperature: aiAnalysis.temperature,
                preferences: aiAnalysis.preferences,
                nextAction: aiAnalysis.nextAction
            };
            
        } catch (error) {
            console.error('❌ Erro no processamento IA:', error.message);
            return {
                success: false,
                shouldRespond: false,
                error: error.message
            };
        }
    }

    // 🎭 Simular análise Claude (até termos API key real)
    simulateClaudeAnalysis(messageText) {
        const text = messageText.toLowerCase();
        
        // Palavras-chave imobiliárias
        const propertyKeywords = ['apartamento', 'casa', 'imóvel', 'comprar', 'alugar', 'quarto', 'venda'];
        const interestKeywords = ['interesse', 'quero', 'gostaria', 'preciso', 'procuro'];
        const locationKeywords = ['zona sul', 'zona norte', 'centro', 'bairro'];
        
        const hasPropertyKeyword = propertyKeywords.some(keyword => text.includes(keyword));
        const hasInterestKeyword = interestKeywords.some(keyword => text.includes(keyword));
        const hasLocationKeyword = locationKeywords.some(keyword => text.includes(keyword));
        
        let leadScore = 30; // Base score
        let shouldRespond = true;
        let response = '';
        let temperature = 'cold';
        
        // Calcular score e temperatura
        if (hasPropertyKeyword) leadScore += 25;
        if (hasInterestKeyword) leadScore += 20;
        if (hasLocationKeyword) leadScore += 15;
        if (text.includes('urgente') || text.includes('agora')) leadScore += 20;
        if (text.includes('orçamento') || text.includes('preço')) leadScore += 15;
        
        // Determinar temperatura
        if (leadScore >= 80) temperature = 'immediate';
        else if (leadScore >= 60) temperature = 'hot';
        else if (leadScore >= 40) temperature = 'warm';
        
        // Gerar resposta contextual
        if (hasPropertyKeyword && hasInterestKeyword) {
            response = `Olá! Vi que você tem interesse em imóveis. Temos várias opções disponíveis. Poderia me contar um pouco mais sobre o que está procurando? Tipo de imóvel, região preferida e faixa de preço? 🏠`;
        } else if (text.includes('olá') || text.includes('oi') || text.includes('bom dia')) {
            response = `Olá! Muito obrigado pelo contato! 😊 Sou a Sofia, assistente da imobiliária. Como posso ajudá-lo hoje? Está procurando algum imóvel específico?`;
        } else if (text.includes('preço') || text.includes('valor')) {
            response = `Claro! Para passar valores mais precisos, seria importante saber: que tipo de imóvel você procura e em qual região? Assim posso apresentar as melhores opções! 💰`;
        } else if (hasLocationKeyword) {
            response = `Perfeito! Temos várias opções nessa região. Me conta mais sobre suas preferências: apartamento ou casa? Quantos quartos? Faixa de preço? 📍`;
        } else {
            response = `Obrigado pela mensagem! Para te ajudar melhor, poderia me contar o que está procurando? Estou aqui para esclarecer qualquer dúvida sobre nossos imóveis! 🏡`;
        }
        
        return {
            shouldRespond: true,
            response: response,
            leadScore: Math.min(leadScore, 100),
            temperature: temperature,
            preferences: {
                property_type: hasPropertyKeyword ? 'mentioned' : 'not_mentioned',
                location: hasLocationKeyword ? 'mentioned' : 'not_mentioned',
                budget: text.includes('preço') || text.includes('valor') ? 'mentioned' : 'not_mentioned'
            },
            nextAction: temperature === 'immediate' ? 'priority_followup' : 'standard_followup'
        };
    }

    // 📤 Enviar resposta automática
    async sendAutomaticResponse(instance, to, responseText) {
        try {
            console.log(`📤 Enviando resposta automática para ${to}`);
            
            const result = await this.evolutionAPI.sendMessage(instance, to, responseText, 'text');
            
            if (result.success) {
                console.log('✅ Resposta enviada com sucesso!');
            } else {
                console.log('❌ Falha ao enviar resposta:', result.error);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Erro ao enviar resposta automática:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🔧 Configurar webhook automaticamente para instância
    async autoConfigureWebhook(instance) {
        try {
            console.log(`🔧 Configurando webhook automaticamente para ${instance}`);
            
            // URL do nosso webhook (ajustar para produção)
            const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:8000/api/whatsapp/webhook';
            
            const events = [
                'MESSAGES_UPSERT',
                'MESSAGE_STATUS_UPDATE', 
                'PRESENCE_UPDATE',
                'QRCODE_UPDATED',
                'CONNECTION_UPDATE'
            ];
            
            const result = await this.evolutionAPI.configureWebhook(instance, webhookUrl, events);
            
            if (result.success) {
                console.log(`✅ Webhook configurado automaticamente para ${instance}`);
            } else {
                console.log(`❌ Falha na configuração automática de webhook: ${result.error}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Erro na configuração automática de webhook:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📊 Obter estatísticas de processamento
    getProcessingStats() {
        return {
            ...this.processingStats,
            queue_size: this.messageQueue.length,
            unprocessed_messages: this.messageQueue.filter(msg => !msg.processed).length
        };
    }

    // 🔄 Limpar fila de mensagens antigas
    cleanOldMessages(maxAge = 24 * 60 * 60 * 1000) { // 24 horas
        const cutoff = Date.now() - maxAge;
        const initialLength = this.messageQueue.length;
        
        this.messageQueue = this.messageQueue.filter(msg => {
            const msgTime = new Date(msg.timestamp).getTime();
            return msgTime > cutoff;
        });
        
        const cleaned = initialLength - this.messageQueue.length;
        if (cleaned > 0) {
            console.log(`🧹 Removidas ${cleaned} mensagens antigas da fila`);
        }
        
        return cleaned;
    }

    // 🔔 Configurar webhook para todas as instâncias ativas
    async configureWebhooksForAllInstances() {
        try {
            console.log('🔔 Configurando webhooks para todas as instâncias...');
            
            const instancesResult = await this.evolutionAPI.listInstances();
            
            if (!instancesResult.success) {
                throw new Error('Falha ao listar instâncias');
            }
            
            const results = [];
            
            for (const instance of instancesResult.data) {
                if (instance.status === 'open') {
                    const webhookResult = await this.autoConfigureWebhook(instance.id);
                    results.push({
                        instance: instance.id,
                        success: webhookResult.success,
                        error: webhookResult.error || null
                    });
                }
            }
            
            console.log(`✅ Webhooks configurados para ${results.length} instâncias`);
            
            return {
                success: true,
                results: results,
                total_configured: results.filter(r => r.success).length
            };
            
        } catch (error) {
            console.error('❌ Erro ao configurar webhooks:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = WebhookProcessingService;
