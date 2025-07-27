/**
 * 🎯 Lead Qualification Service
 * 
 * Sistema inteligente de qualificação e scoring de leads
 * Combina IA + regras de negócio + análise comportamental
 * 
 * @author ROI Labs
 */

const logger = require('../utils/logger');
const DatabaseService = require('./database.service');

class LeadQualificationService {
    constructor(dependencies) {
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
            const intent = await this.claudeService.detectIntent(message, { lead });
            
            // Analisa sentimento
            const sentiment = await this.claudeService.analyzeSentiment(message);
            
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
            
            // Busca lead existente
            let leadResult = await DatabaseService.query(
                'SELECT * FROM leads WHERE phone = $1',
                [cleanPhone]
            );

            if (leadResult.rows.length > 0) {
                return leadResult.rows[0];
            }

            // Cria novo lead
            const newLead = await DatabaseService.query(`
                INSERT INTO leads (
                    phone, name, status, source, 
                    qualification_score, temperature, 
                    created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING *
            `, [cleanPhone, name, 'new', 'whatsapp', 30, 'cold']);

            const lead = newLead.rows[0];
            
            logger.info('👤 New lead created:', {
                id: lead.id,
                name: lead.name,
                phone: lead.phone
            });

            // Enriquece dados do lead
            await this.enrichLeadData(lead);

            return lead;

        } catch (error) {
            logger.error('❌ Error finding/creating lead:', error);
            throw error;
        }
    }

    /**
     * Atualiza lead baseado na conversa
     */
    async updateLeadFromConversation(lead, conversationData) {
        try {
            const { message, intent, sentiment, mediaType } = conversationData;
            
            // Extrai insights da conversa
            const insights = await this.extractConversationInsights(message, intent);
            
            // Atualiza campos relevantes
            const updates = {
                last_interaction: new Date(),
                last_message: message,
                last_intent: intent,
                sentiment_score: sentiment.confidence,
                engagement_level: this.calculateEngagementLevel(lead, conversationData),
                interaction_count: (lead.interaction_count || 0) + 1
            };

            // Aplica insights específicos
            if (insights.budget_range) {
                updates.budget_min = insights.budget_range.min;
                updates.budget_max = insights.budget_range.max;
            }

            if (insights.property_type) {
                updates.property_type_interest = insights.property_type;
            }

            if (insights.location_preference) {
                updates.location_preference = insights.location_preference;
            }

            if (insights.urgency_level) {
                updates.urgency_level = insights.urgency_level;
            }

            // Merge updates com lead atual
            return { ...lead, ...updates };

        } catch (error) {
            logger.error('❌ Error updating lead from conversation:', error);
            return lead;
        }
    }

    /**
     * Extrai insights específicos da conversa
     */
    async extractConversationInsights(message, intent) {
        try {
            const prompt = `
Analise esta mensagem de um lead imobiliário e extraia insights estruturados:

MENSAGEM: "${message}"
INTENÇÃO: ${intent}

Extraia APENAS informações explicitamente mencionadas:

{
    "budget_range": {"min": 0, "max": 0} ou null,
    "property_type": "apartamento|casa|terreno|comercial" ou null,
    "bedrooms": number ou null,
    "location_preference": "string" ou null,
    "urgency_level": 1-5 ou null,
    "financing_needed": true|false ou null,
    "family_size": number ou null,
    "key_requirements": ["string"] ou [],
    "objections_mentioned": ["string"] ou []
}

Seja conservador - só extraia o que está claramente mencionado.
            `;

            const response = await this.claudeService.client.messages.create({
                model: this.claudeService.model,
                max_tokens: 500,
                system: "Você é um especialista em extração de dados de conversas imobiliárias. Seja preciso e conservador.",
                messages: [{ role: 'user', content: prompt }]
            });

            const insights = JSON.parse(response.content[0].text);
            
            logger.debug('🔍 Conversation insights extracted:', insights);
            return insights;

        } catch (error) {
            logger.error('❌ Error extracting conversation insights:', error);
            return {};
        }
    }

    /**
     * Calcula score completo do lead
     */
    async calculateLeadScore(lead) {
        try {
            const scores = {
                financial_capacity: this.scoreFinancialCapacity(lead),
                buying_intent: this.scoreBuyingIntent(lead),
                urgency: this.scoreUrgency(lead),
                engagement: this.scoreEngagement(lead),
                profile_completeness: this.scoreProfileCompleteness(lead),
                conversation_quality: this.scoreConversationQuality(lead),
                source_quality: this.scoreSourceQuality(lead)
            };

            // Calcula score ponderado
            let totalScore = 0;
            for (const [category, score] of Object.entries(scores)) {
                totalScore += score * this.scoreWeights[category];
            }

            // Determina temperatura baseada no score
            const temperature = this.determineTemperature(totalScore);

            const updatedLead = {
                ...lead,
                qualification_score: Math.round(totalScore),
                temperature,
                score_breakdown: scores,
                last_score_update: new Date()
            };

            logger.debug('📊 Lead score calculated:', {
                leadId: lead.id,
                score: totalScore,
                temperature,
                breakdown: scores
            });

            return updatedLead;

        } catch (error) {
            logger.error('❌ Error calculating lead score:', error);
            return lead;
        }
    }

    /**
     * Scoring individual por categoria
     */
    
    scoreFinancialCapacity(lead) {
        let score = 0;
        
        // Orçamento declarado
        if (lead.budget_max > 0) {
            if (lead.budget_max >= 1000000) score += 40;
            else if (lead.budget_max >= 500000) score += 30;
            else if (lead.budget_max >= 300000) score += 20;
            else score += 10;
        }

        // Indicadores de capacidade financeira na conversa
        if (lead.financing_needed === false) score += 20; // Pagamento à vista
        if (lead.profession && this.isHighIncomeProfile(lead.profession)) score += 20;
        if (lead.owns_property) score += 10;
        
        return Math.min(score, 100);
    }

    scoreBuyingIntent(lead) {
        let score = 0;
        
        // Baseado em intenções detectadas
        const recentIntents = lead.recent_intents || [];
        if (recentIntents.includes('agendamento_visita')) score += 30;
        if (recentIntents.includes('negociacao_preco')) score += 25;
        if (recentIntents.includes('condicoes_financiamento')) score += 20;
        if (recentIntents.includes('busca_informacoes')) score += 15;
        
        // Frequência de interação
        const interactionCount = lead.interaction_count || 0;
        if (interactionCount >= 10) score += 20;
        else if (interactionCount >= 5) score += 15;
        else if (interactionCount >= 2) score += 10;
        
        return Math.min(score, 100);
    }

    scoreUrgency(lead) {
        let score = 0;
        
        // Nível de urgência declarado/detectado
        const urgencyLevel = lead.urgency_level || 3;
        score += urgencyLevel * 20;
        
        // Indicadores de urgência
        if (lead.current_situation === 'renting_expensive') score += 20;
        if (lead.family_growing) score += 15;
        if (lead.job_relocation) score += 20;
        if (lead.investment_opportunity) score += 10;
        
        return Math.min(score, 100);
    }

    scoreEngagement(lead) {
        let score = 0;
        
        // Frequência de resposta
        const responseRate = lead.response_rate || 0.5;
        score += responseRate * 40;
        
        // Qualidade das respostas
        const avgSentiment = lead.avg_sentiment_score || 50;
        score += (avgSentiment / 100) * 30;
        
        // Tempo de resposta médio
        const avgResponseTime = lead.avg_response_time || 3600; // segundos
        if (avgResponseTime < 300) score += 20;      // < 5 min
        else if (avgResponseTime < 1800) score += 15; // < 30 min
        else if (avgResponseTime < 3600) score += 10; // < 1 hora
        
        // Iniciativa própria
        if (lead.initiated_conversation) score += 10;
        
        return Math.min(score, 100);
    }

    scoreProfileCompleteness(lead) {
        let score = 0;
        const fields = [
            'name', 'phone', 'email', 'budget_min', 'budget_max',
            'property_type_interest', 'location_preference', 'family_size',
            'current_situation', 'timeline'
        ];
        
        const completedFields = fields.filter(field => 
            lead[field] && lead[field] !== '' && lead[field] !== null
        );
        
        score = (completedFields.length / fields.length) * 100;
        
        return Math.round(score);
    }

    scoreConversationQuality(lead) {
        let score = 0;
        
        // Número de perguntas respondidas
        const questionsAnswered = lead.questions_answered || 0;
        score += Math.min(questionsAnswered * 10, 40);
        
        // Profundidade das respostas
        const avgMessageLength = lead.avg_message_length || 50;
        if (avgMessageLength > 100) score += 20;
        else if (avgMessageLength > 50) score += 15;
        else if (avgMessageLength > 20) score += 10;
        
        // Clareza na comunicação
        const communicationScore = lead.communication_clarity || 70;
        score += (communicationScore / 100) * 40;
        
        return Math.min(score, 100);
    }

    scoreSourceQuality(lead) {
        const sourceScores = {
            'referral': 100,
            'website_form': 80,
            'whatsapp_direct': 70,
            'social_media': 60,
            'paid_ads': 50,
            'cold_outreach': 30,
            'unknown': 20
        };
        
        return sourceScores[lead.source] || 50;
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
     * Calcula nível de engajamento
     */
    calculateEngagementLevel(lead, conversationData) {
        const { sentiment, mediaType } = conversationData;
        
        let engagement = lead.engagement_level || 50;
        
        // Ajusta baseado no sentimento
        if (sentiment.sentiment === 'positivo') engagement += 5;
        else if (sentiment.sentiment === 'negativo') engagement -= 3;
        
        // Mídia indica maior engajamento
        if (mediaType && mediaType !== 'text') engagement += 3;
        
        // Urgência da mensagem
        if (sentiment.urgency_level > 3) engagement += 2;
        
        return Math.max(0, Math.min(100, engagement));
    }

    /**
     * Enriquece dados do lead com informações externas
     */
    async enrichLeadData(lead) {
        try {
            // Validação do WhatsApp
            const isValidWhatsApp = await this.evolutionApi.validateWhatsAppNumber(lead.phone);
            
            // Busca informações do perfil
            const profileInfo = await this.evolutionApi.getProfile(lead.phone);
            
            const enrichmentData = {
                whatsapp_valid: isValidWhatsApp,
                profile_picture: profileInfo?.picture || null,
                whatsapp_name: profileInfo?.name || null,
                status_message: profileInfo?.status || null
            };

            await DatabaseService.query(`
                UPDATE leads SET 
                    whatsapp_valid = $1,
                    profile_picture = $2,
                    whatsapp_name = $3,
                    status_message = $4,
                    updated_at = NOW()
                WHERE id = $5
            `, [
                enrichmentData.whatsapp_valid,
                enrichmentData.profile_picture,
                enrichmentData.whatsapp_name,
                enrichmentData.status_message,
                lead.id
            ]);

            logger.info('🔍 Lead data enriched:', {
                leadId: lead.id,
                whatsappValid: isValidWhatsApp
            });

        } catch (error) {
            logger.error('❌ Error enriching lead data:', error);
        }
    }

    /**
     * Salva mensagem no histórico
     */
    async saveMessage(leadId, content, direction, mediaType = 'text') {
        try {
            await DatabaseService.query(`
                INSERT INTO messages (
                    lead_id, content, direction, media_type, 
                    created_at
                ) VALUES ($1, $2, $3, $4, NOW())
            `, [leadId, content, direction, mediaType]);

        } catch (error) {
            logger.error('❌ Error saving message:', error);
        }
    }

    /**
     * Atualiza lead no banco
     */
    async updateLead(lead) {
        try {
            const updateFields = [
                'qualification_score', 'temperature', 'last_interaction',
                'last_message', 'last_intent', 'sentiment_score',
                'engagement_level', 'interaction_count', 'budget_min',
                'budget_max', 'property_type_interest', 'location_preference',
                'urgency_level', 'score_breakdown'
            ];

            const setClause = updateFields.map((field, index) => 
                `${field} = $${index + 2}`
            ).join(', ');

            const values = [lead.id, ...updateFields.map(field => lead[field])];

            await DatabaseService.query(`
                UPDATE leads SET 
                    ${setClause},
                    updated_at = NOW()
                WHERE id = $1
            `, values);

        } catch (error) {
            logger.error('❌ Error updating lead:', error);
        }
    }

    /**
     * Identifica se profissão é de alta renda
     */
    isHighIncomeProfile(profession) {
        const highIncomeProfiles = [
            'medico', 'advogado', 'engenheiro', 'arquiteto',
            'dentista', 'empresario', 'diretor', 'gerente',
            'consultor', 'piloto', 'juiz', 'promotor'
        ];
        
        return highIncomeProfiles.some(profile => 
            profession.toLowerCase().includes(profile)
        );
    }

    /**
     * Limpa formato do telefone
     */
    cleanPhone(phone) {
        return phone.replace(/\D/g, '').replace(/^55/, '');
    }

    /**
     * Busca leads para reengajamento
     */
    async getLeadsForReengagement(daysSinceLastContact = 3) {
        try {
            const results = await DatabaseService.query(`
                SELECT * FROM leads 
                WHERE 
                    status = 'active' 
                    AND last_interaction < NOW() - INTERVAL '${daysSinceLastContact} days'
                    AND qualification_score >= 40
                    AND reengagement_attempts < 3
                ORDER BY qualification_score DESC, last_interaction ASC
                LIMIT 50
            `);

            return results.rows;

        } catch (error) {
            logger.error('❌ Error getting leads for reengagement:', error);
            return [];
        }
    }

    /**
     * Qualificação completa com IA
     */
    async performAIQualification(leadId) {
        try {
            // Busca lead e histórico
            const lead = await this.getLeadById(leadId);
            const history = await this.getConversationHistory(leadId);
            
            // Qualificação com IA
            const qualification = await this.claudeService.qualifyLead(lead, history);
            
            // Atualiza lead com qualificação da IA
            const updatedLead = {
                ...lead,
                ...qualification,
                ai_qualification_date: new Date()
            };
            
            await this.updateLead(updatedLead);
            
            logger.info('🤖 AI qualification completed:', {
                leadId,
                score: qualification.qualification_score,
                temperature: qualification.temperature
            });

            return updatedLead;

        } catch (error) {
            logger.error('❌ AI qualification failed:', error);
            throw error;
        }
    }

    async getLeadById(leadId) {
        const result = await DatabaseService.query('SELECT * FROM leads WHERE id = $1', [leadId]);
        return result.rows[0];
    }

    async getConversationHistory(leadId) {
        const result = await DatabaseService.query(
            'SELECT * FROM messages WHERE lead_id = $1 ORDER BY created_at ASC',
            [leadId]
        );
        return result.rows;
    }
}

module.exports = LeadQualificationService;
