/**
 * 🎯 Lead Qualification Service
 * 
 * Sistema inteligente de qualificação e scoring de leads
 * Combina IA + regras de negócio + análise comportamental
 * 
 * @author ROI Labs
 */

const logger = require('../utils/logger');

class LeadQualificationService {
    constructor(dependencies = {}) {
        this.claudeService = dependencies.claudeService;
        this.evolutionApi = dependencies.evolutionApi;
        
        // Pesos para cálculo de score
        this.scoreWeights = {
            financial_capacity: 0.25,
            buying_intent: 0.20,
            urgency: 0.15,
            engagement: 0.15,
            profile_completeness: 0.10,
            conversation_quality: 0.10,
            source_quality: 0.05
        };

        // Configurações de temperatura
        this.temperatureThresholds = {
            cold: 0,
            warm: 40,
            hot: 70,
            immediate: 85
        };

        logger.info('🎯 Lead Qualification Service initialized');
    }

    /**
     * 🆕 MÉTODO PRINCIPAL PARA TESTES - Analisa conversa e retorna qualificação
     */
    async analyzeConversation(messages, leadProfile = {}) {
        try {
            const startTime = Date.now();
            
            // Perfil padrão se não fornecido
            const defaultProfile = {
                phone: '+5511999887766',
                name: 'Cliente',
                source: 'whatsapp'
            };
            
            const profile = { ...defaultProfile, ...leadProfile };
            
            // Análise das mensagens
            const conversationAnalysis = this.analyzeMessagePatterns(messages);
            
            // Extração de dados estruturados
            const extractedData = await this.extractDataFromMessages(messages);
            
            // Cálculo do score
            const scores = this.calculateScoreComponents(conversationAnalysis, extractedData, profile);
            
            // Score final ponderado
            let totalScore = 0;
            for (const [category, score] of Object.entries(scores)) {
                totalScore += score * (this.scoreWeights[category] || 0.1);
            }
            
            // Determina temperatura
            const temperature = this.determineTemperature(totalScore);
            
            // Análise de sentimento geral
            const overallSentiment = this.analyzeSentimentPattern(messages);
            
            // Recomendações de ação
            const nextActions = this.generateActionRecommendations(totalScore, extractedData, conversationAnalysis);
            
            const responseTime = Date.now() - startTime;
            
            const qualification = {
                score: Math.round(totalScore),
                temperature,
                extractedData,
                analysis: conversationAnalysis,
                sentiment: overallSentiment,
                scoreBreakdown: scores,
                nextActions,
                confidence: this.calculateConfidence(messages.length, extractedData),
                responseTime: `${responseTime}ms`
            };
            
            logger.info('🎯 Conversation analyzed:', {
                messages: messages.length,
                score: qualification.score,
                temperature: qualification.temperature,
                responseTime: `${responseTime}ms`
            });

            return qualification;

        } catch (error) {
            logger.error('❌ Conversation analysis failed:', error);
            
            // Qualificação básica de fallback
            return {
                score: 50,
                temperature: 'warm',
                extractedData: {},
                analysis: {},
                sentiment: 'neutral',
                scoreBreakdown: {},
                nextActions: ['Continuar conversa para obter mais informações'],
                confidence: 30,
                error: error.message
            };
        }
    }

    /**
     * Analisa padrões nas mensagens
     */
    analyzeMessagePatterns(messages) {
        const analysis = {
            messageCount: messages.length,
            avgMessageLength: 0,
            hasQuestions: false,
            hasBudgetMention: false,
            hasLocationMention: false,
            hasUrgencyIndicators: false,
            hasPropertyTypeMention: false,
            communicationQuality: 'medium'
        };

        if (messages.length === 0) return analysis;

        // Calcula comprimento médio
        const totalLength = messages.reduce((sum, msg) => sum + msg.length, 0);
        analysis.avgMessageLength = Math.round(totalLength / messages.length);

        // Concatena todas as mensagens
        const fullText = messages.join(' ').toLowerCase();

        // Detecta padrões específicos
        analysis.hasQuestions = /\?/.test(fullText);
        analysis.hasBudgetMention = /(\d+[\.,]\d+|mil|milhão|reais|r\$|\$)/i.test(fullText);
        analysis.hasLocationMention = /(zona|bairro|região|centro|sul|norte|leste|oeste|próximo)/i.test(fullText);
        analysis.hasUrgencyIndicators = /(urgente|rápido|logo|semana|mês|pressa)/i.test(fullText);
        analysis.hasPropertyTypeMention = /(apartamento|casa|terreno|comercial|sala|loja|galpão)/i.test(fullText);

        // Avalia qualidade da comunicação
        if (analysis.avgMessageLength > 50 && analysis.hasQuestions) {
            analysis.communicationQuality = 'high';
        } else if (analysis.avgMessageLength < 20) {
            analysis.communicationQuality = 'low';
        }

        return analysis;
    }

    /**
     * Extrai dados estruturados das mensagens
     */
    async extractDataFromMessages(messages) {
        const fullText = messages.join(' ');
        const extracted = {
            propertyType: null,
            budget: null,
            location: null,
            bedrooms: null,
            urgency: null,
            intent: 'interesse_inicial'
        };

        // Extração de tipo de propriedade
        const propertyTypes = {
            'apartamento': /apartamento|apto|ap\b/i,
            'casa': /casa|residência/i,
            'terreno': /terreno|lote/i,
            'comercial': /comercial|sala|loja|escritório/i
        };

        for (const [type, regex] of Object.entries(propertyTypes)) {
            if (regex.test(fullText)) {
                extracted.propertyType = type;
                break;
            }
        }

        // Extração de orçamento
        const budgetMatch = fullText.match(/(\d+[\.,]\d+|\d+)\s*(mil|milhão|k|m)?/i);
        if (budgetMatch) {
            let value = parseFloat(budgetMatch[1].replace(',', '.'));
            const unit = budgetMatch[2]?.toLowerCase();
            
            if (unit === 'mil' || unit === 'k') value *= 1000;
            if (unit === 'milhão' || unit === 'm') value *= 1000000;
            
            extracted.budget = value;
        }

        // Extração de quartos
        const bedroomMatch = fullText.match(/(\d+)\s*quarto/i);
        if (bedroomMatch) {
            extracted.bedrooms = parseInt(bedroomMatch[1]);
        }

        // Extração de localização
        const locationPatterns = [
            /zona\s+(sul|norte|leste|oeste)/i,
            /bairro\s+([a-záêçõãé\s]+)/i,
            /região\s+([a-záêçõãé\s]+)/i,
            /(centro|copacabana|ipanema|leblon|jardins|moema|vila\s+\w+)/i
        ];

        for (const pattern of locationPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                extracted.location = match[1] || match[0];
                break;
            }
        }

        // Análise de urgência
        if (/urgente|rápido|logo|essa\s+semana/i.test(fullText)) {
            extracted.urgency = 'high';
        } else if (/mês|sem\s+pressa|quando\s+der/i.test(fullText)) {
            extracted.urgency = 'low';
        } else {
            extracted.urgency = 'medium';
        }

        // Detecção de intenção
        if (/visita|ver|mostrar|agendar/i.test(fullText)) {
            extracted.intent = 'agendamento_visita';
        } else if (/preço|valor|quanto|custo/i.test(fullText)) {
            extracted.intent = 'negociacao_preco';
        } else if (/informação|detalhes|saber/i.test(fullText)) {
            extracted.intent = 'busca_informacoes';
        }

        return extracted;
    }

    /**
     * Calcula componentes do score
     */
    calculateScoreComponents(analysis, extractedData, profile) {
        const scores = {};

        // Financial Capacity (0-100)
        scores.financial_capacity = 0;
        if (extractedData.budget) {
            if (extractedData.budget >= 1000000) scores.financial_capacity = 90;
            else if (extractedData.budget >= 500000) scores.financial_capacity = 75;
            else if (extractedData.budget >= 300000) scores.financial_capacity = 60;
            else if (extractedData.budget >= 200000) scores.financial_capacity = 45;
            else scores.financial_capacity = 30;
        } else {
            scores.financial_capacity = 40; // Padrão se não mencionou
        }

        // Buying Intent (0-100)
        scores.buying_intent = 0;
        if (extractedData.intent === 'agendamento_visita') scores.buying_intent = 85;
        else if (extractedData.intent === 'negociacao_preco') scores.buying_intent = 75;
        else if (extractedData.intent === 'busca_informacoes') scores.buying_intent = 60;
        else scores.buying_intent = 40;

        // Urgency (0-100)
        scores.urgency = 0;
        if (extractedData.urgency === 'high') scores.urgency = 90;
        else if (extractedData.urgency === 'medium') scores.urgency = 60;
        else if (extractedData.urgency === 'low') scores.urgency = 30;

        // Engagement (0-100)
        scores.engagement = 0;
        if (analysis.messageCount >= 5) scores.engagement += 40;
        else if (analysis.messageCount >= 3) scores.engagement += 30;
        else if (analysis.messageCount >= 2) scores.engagement += 20;
        
        if (analysis.avgMessageLength > 50) scores.engagement += 30;
        else if (analysis.avgMessageLength > 30) scores.engagement += 20;
        else if (analysis.avgMessageLength > 10) scores.engagement += 10;

        if (analysis.hasQuestions) scores.engagement += 20;
        if (analysis.communicationQuality === 'high') scores.engagement += 10;

        // Profile Completeness (0-100)
        scores.profile_completeness = 0;
        const dataPoints = [
            extractedData.propertyType,
            extractedData.budget,
            extractedData.location,
            extractedData.bedrooms,
            profile.name && profile.name !== 'Cliente'
        ];
        
        const completedPoints = dataPoints.filter(Boolean).length;
        scores.profile_completeness = (completedPoints / dataPoints.length) * 100;

        // Conversation Quality (0-100)
        scores.conversation_quality = 0;
        if (analysis.hasBudgetMention) scores.conversation_quality += 25;
        if (analysis.hasLocationMention) scores.conversation_quality += 20;
        if (analysis.hasPropertyTypeMention) scores.conversation_quality += 20;
        if (analysis.hasUrgencyIndicators) scores.conversation_quality += 15;
        if (analysis.communicationQuality === 'high') scores.conversation_quality += 20;

        // Source Quality (0-100)
        const sourceScores = {
            'whatsapp': 70,
            'website': 80,
            'referral': 90,
            'social': 60,
            'ads': 50
        };
        scores.source_quality = sourceScores[profile.source] || 50;

        return scores;
    }

    /**
     * Analisa padrão de sentimento
     */
    analyzeSentimentPattern(messages) {
        const fullText = messages.join(' ').toLowerCase();
        
        const positiveIndicators = ['ótimo', 'perfeito', 'excelente', 'adorei', 'gostei', 'interessante'];
        const negativeIndicators = ['caro', 'difícil', 'problema', 'não gostei', 'ruim'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveIndicators.forEach(word => {
            if (fullText.includes(word)) positiveCount++;
        });
        
        negativeIndicators.forEach(word => {
            if (fullText.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    /**
     * Gera recomendações de ação
     */
    generateActionRecommendations(score, extractedData, analysis) {
        const actions = [];
        
        if (score >= 80) {
            actions.push('Priorizar atendimento - lead quente');
            actions.push('Agendar visita presencial imediatamente');
            actions.push('Preparar propostas comerciais');
        } else if (score >= 60) {
            actions.push('Enviar opções de imóveis relevantes');
            actions.push('Agendar conversa telefônica');
            actions.push('Qualificar melhor o orçamento');
        } else if (score >= 40) {
            actions.push('Continuar nutrição com conteúdo relevante');
            actions.push('Identificar necessidades específicas');
            actions.push('Agendar follow-up em 3-5 dias');
        } else {
            actions.push('Educação sobre mercado imobiliário');
            actions.push('Identificar se é momento de compra');
            actions.push('Follow-up semanal com conteúdo de valor');
        }
        
        // Ações específicas baseadas nos dados
        if (!extractedData.budget) {
            actions.push('Descobrir faixa de orçamento');
        }
        
        if (!extractedData.location) {
            actions.push('Identificar região de interesse');
        }
        
        if (!extractedData.propertyType) {
            actions.push('Definir tipo de imóvel desejado');
        }
        
        return actions;
    }

    /**
     * Calcula confiança da análise
     */
    calculateConfidence(messageCount, extractedData) {
        let confidence = 50;
        
        // Mais mensagens = maior confiança
        if (messageCount >= 5) confidence += 30;
        else if (messageCount >= 3) confidence += 20;
        else if (messageCount >= 2) confidence += 10;
        
        // Dados extraídos = maior confiança
        const extractedCount = Object.values(extractedData).filter(Boolean).length;
        confidence += extractedCount * 5;
        
        return Math.min(confidence, 95);
    }

    /**
     * Processa mensagem recebida e atualiza/cria lead
     */
    async processIncomingMessage(messageData) {
        try {
            const { phone, name, message, mediaType } = messageData;
            
            // Busca ou cria lead
            let lead = await this.findOrCreateLead(phone, name);
            
            // Salva mensagem no histórico
            await this.saveMessage(lead.id, message, 'received', mediaType);
            
            // Detecta intenção da mensagem
            const intent = await this.claudeService?.detectIntent(message, { lead }) || 'conversa_geral';
            
            // Analisa sentimento
            const sentiment = await this.claudeService?.analyzeSentiment(message) || { sentiment: 'neutro', confidence: 50 };
            
            // Atualiza dados do lead baseado na conversa
            lead = await this.updateLeadFromConversation(lead, {
                message,
                intent,
                sentiment,
                mediaType
            });
            
            // Recalcula score
            lead = await this.calculateLeadScore(lead);
            
            // Atualiza lead no banco
            await this.updateLead(lead);
            
            logger.info('💬 Message processed for lead:', {
                leadId: lead.id,
                intent,
                score: lead.qualification_score,
                temperature: lead.temperature
            });

            return lead;

        } catch (error) {
            logger.error('❌ Error processing incoming message:', error);
            throw error;
        }
    }

    /**
     * Busca lead existente ou cria novo
     */
    async findOrCreateLead(phone, name) {
        try {
            const cleanPhone = this.cleanPhone(phone);
            
            // Simula criação de lead (sem banco por enquanto)
            return {
                id: `lead-${Date.now()}`,
                phone: cleanPhone,
                name: name || 'Cliente',
                status: 'new',
                source: 'whatsapp',
                qualification_score: 30,
                temperature: 'cold',
                interaction_count: 0,
                created_at: new Date(),
                updated_at: new Date()
            };

        } catch (error) {
            logger.error('❌ Error finding/creating lead:', error);
            throw error;
        }
    }

    /**
     * Determina temperatura baseada no score
     */
    determineTemperature(score) {
        if (score >= this.temperatureThresholds.immediate) return 'immediate';
        if (score >= this.temperatureThresholds.hot) return 'hot';
        if (score >= this.temperatureThresholds.warm) return 'warm';
        return 'cold';
    }

    /**
     * Limpa formato do telefone
     */
    cleanPhone(phone) {
        return phone.replace(/\D/g, '').replace(/^55/, '');
    }

    // ... outros métodos mantidos para compatibilidade
    async calculateLeadScore(lead) { return lead; }
    async updateLeadFromConversation(lead, data) { return lead; }
    async saveMessage() {}
    async updateLead() {}
}

// Cria instância singleton
const leadQualificationService = new LeadQualificationService();

module.exports = leadQualificationService;