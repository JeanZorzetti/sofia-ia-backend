/**
 * 🧠 Claude AI Service
 * 
 * Serviço responsável por toda inteligência artificial do sistema
 * Funcionalidades: Conversação natural, qualificação, personalização
 * 
 * @author ROI Labs
 */

const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class ClaudeService {
    constructor(config) {
        this.client = new Anthropic({
            apiKey: config.apiKey,
        });
        
        this.model = config.model || 'claude-3-5-sonnet-20241022';
        this.maxTokens = 4096;
        
        // Prompts do sistema por contexto
        this.systemPrompts = {
            lead_qualification: this.getLeadQualificationPrompt(),
            conversation: this.getConversationPrompt(),
            reengagement: this.getReengagementPrompt(),
            property_recommendation: this.getPropertyRecommendationPrompt()
        };
        
        logger.info('🧠 Claude AI Service initialized with model:', this.model);
    }

    /**
     * Gera resposta conversacional personalizada
     */
    async generateResponse(context) {
        try {
            const { lead, message, conversationHistory, intent } = context;
            
            // Determina o tipo de prompt baseado no contexto
            const promptType = this.determinePromptType(context);
            const systemPrompt = this.systemPrompts[promptType];
            
            // Constrói o contexto da conversa
            const conversationContext = this.buildConversationContext(lead, conversationHistory);
            
            // Gera resposta com Claude
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: `
CONTEXTO DO LEAD:
${JSON.stringify(lead, null, 2)}

HISTÓRICO DA CONVERSA:
${conversationContext}

MENSAGEM ATUAL:
${message}

INTENT DETECTADO: ${intent || 'conversa_geral'}

Gere uma resposta personalizada, natural e que conduza o lead no funil de vendas.
                        `
                    }
                ]
            });

            const aiResponse = response.content[0].text;
            
            logger.info('🧠 AI Response generated:', {
                leadId: lead.id,
                messageLength: message.length,
                responseLength: aiResponse.length,
                promptType
            });

            return {
                text: aiResponse,
                promptType,
                tokens_used: response.usage?.total_tokens || 0
            };

        } catch (error) {
            logger.error('❌ Claude response generation failed:', error);
            
            // Fallback response
            return {
                text: this.getFallbackResponse(context),
                promptType: 'fallback',
                tokens_used: 0
            };
        }
    }

    /**
     * Qualifica lead baseado na conversa
     */
    async qualifyLead(leadData, conversationHistory) {
        try {
            const prompt = `
Analise o perfil e histórico de conversa para qualificar este lead imobiliário:

DADOS DO LEAD:
${JSON.stringify(leadData, null, 2)}

HISTÓRICO DE CONVERSA:
${conversationHistory.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Retorne um JSON com a seguinte estrutura:
{
    "qualification_score": 0-100,
    "temperature": "frio|morno|quente|imediato",
    "buying_intent": "baixo|medio|alto",
    "financial_capacity": "baixa|media|alta",
    "urgency": "baixa|media|alta",
    "property_preferences": {
        "type": "apartamento|casa|terreno|comercial",
        "bedrooms": number,
        "price_range": {"min": 0, "max": 0},
        "location": "string",
        "characteristics": ["string"]
    },
    "pain_points": ["string"],
    "objections": ["string"],
    "next_action": "string",
    "estimated_closing_time": "1-7 dias|1-4 semanas|1-3 meses|3+ meses",
    "notes": "string"
}
            `;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 2048,
                system: "Você é um especialista em qualificação de leads imobiliários. Analise conversas e extraia insights precisos sobre potencial de compra.",
                messages: [{ role: 'user', content: prompt }]
            });

            const qualification = JSON.parse(response.content[0].text);
            
            logger.info('🎯 Lead qualified:', {
                leadId: leadData.id,
                score: qualification.qualification_score,
                temperature: qualification.temperature
            });

            return qualification;

        } catch (error) {
            logger.error('❌ Lead qualification failed:', error);
            
            // Qualificação básica de fallback
            return {
                qualification_score: 50,
                temperature: "morno",
                buying_intent: "medio",
                financial_capacity: "media",
                urgency: "media",
                property_preferences: {},
                pain_points: [],
                objections: [],
                next_action: "Continuar conversa para entender melhor as necessidades",
                estimated_closing_time: "1-3 meses",
                notes: "Qualificação automática falhou, necessita análise manual"
            };
        }
    }

    /**
     * Detecta intenção da mensagem
     */
    async detectIntent(message, context = {}) {
        try {
            const prompt = `
Analise a mensagem e detecte a intenção principal:

MENSAGEM: "${message}"
CONTEXTO: ${JSON.stringify(context)}

Possíveis intenções:
- interesse_inicial: Primeira manifestação de interesse
- busca_informacoes: Quer saber detalhes sobre imóveis
- agendamento_visita: Quer agendar uma visita
- negociacao_preco: Falando sobre valores
- condicoes_financiamento: Interessado em financiamento
- objecao: Demonstrando resistência
- desinteresse: Perdeu interesse
- reagendamento: Quer remarcar algo
- reclamacao: Insatisfeito com algo
- duvida_tecnica: Dúvidas sobre documentação/processo
- elogio: Satisfeito com atendimento
- conversa_social: Conversa casual/social

Retorne apenas o nome da intenção.
            `;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 50,
                system: "Você é um especialista em análise de intenções em conversas de vendas. Seja preciso e conciso.",
                messages: [{ role: 'user', content: prompt }]
            });

            const intent = response.content[0].text.trim();
            
            logger.debug('🎯 Intent detected:', { message: message.substring(0, 50), intent });
            return intent;

        } catch (error) {
            logger.error('❌ Intent detection failed:', error);
            return 'conversa_geral';
        }
    }

    /**
     * Gera estratégia de reengajamento
     */
    async generateReengagementStrategy(lead, daysSinceLastContact) {
        try {
            const prompt = `
Crie uma estratégia de reengajamento para este lead:

LEAD: ${JSON.stringify(lead, null, 2)}
DIAS SEM CONTATO: ${daysSinceLastContact}

Retorne um JSON com:
{
    "strategy_type": "string",
    "message": "string",
    "timing": "string",
    "follow_up_sequence": ["string"],
    "estimated_success_rate": 0-100
}
            `;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 1024,
                system: this.systemPrompts.reengagement,
                messages: [{ role: 'user', content: prompt }]
            });

            const strategy = JSON.parse(response.content[0].text);
            
            logger.info('🔄 Reengagement strategy generated:', {
                leadId: lead.id,
                strategy: strategy.strategy_type,
                successRate: strategy.estimated_success_rate
            });

            return strategy;

        } catch (error) {
            logger.error('❌ Reengagement strategy failed:', error);
            throw error;
        }
    }

    /**
     * Analisa sentimento da mensagem
     */
    async analyzeSentiment(message) {
        try {
            const prompt = `
Analise o sentimento desta mensagem:

"${message}"

Retorne um JSON:
{
    "sentiment": "positivo|neutro|negativo",
    "confidence": 0-100,
    "emotions": ["string"],
    "urgency_level": 1-5
}
            `;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 200,
                system: "Você é um especialista em análise de sentimentos. Seja preciso na análise emocional.",
                messages: [{ role: 'user', content: prompt }]
            });

            return JSON.parse(response.content[0].text);

        } catch (error) {
            logger.error('❌ Sentiment analysis failed:', error);
            return {
                sentiment: "neutro",
                confidence: 50,
                emotions: [],
                urgency_level: 3
            };
        }
    }

    /**
     * Gera personalização baseada no perfil
     */
    async personalizeContent(content, leadProfile) {
        try {
            const prompt = `
Personalize este conteúdo para o perfil do lead:

CONTEÚDO: ${content}
PERFIL: ${JSON.stringify(leadProfile, null, 2)}

Adapte:
- Tom de voz (formal/informal)
- Linguagem técnica
- Referências pessoais
- Argumentos de venda
- Call-to-actions

Retorne apenas o conteúdo personalizado.
            `;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 1024,
                system: "Você é um especialista em personalização de conteúdo para vendas.",
                messages: [{ role: 'user', content: prompt }]
            });

            return response.content[0].text;

        } catch (error) {
            logger.error('❌ Content personalization failed:', error);
            return content; // Retorna conteúdo original se falhar
        }
    }

    // =============================================================================
    // SYSTEM PROMPTS
    // =============================================================================

    getLeadQualificationPrompt() {
        return `
Você é um especialista consultor imobiliário com 15 anos de experiência em vendas de alto padrão.

SUA MISSÃO: Qualificar leads através de conversas naturais, identificando:
- Necessidades reais vs desejos
- Capacidade financeira
- Urgência de compra
- Objeções ocultas
- Momento ideal para fechamento

ABORDAGEM:
- Faça perguntas inteligentes e não óbvias
- Use técnicas de discovery (SPIN, BANT)
- Identifique pain points específicos
- Construa rapport genuíno
- Seja consultivo, não apenas vendedor

NUNCA:
- Seja insistente ou agressivo
- Faça perguntas diretas sobre dinheiro no início
- Ignore objeções
- Use linguagem genérica

SEMPRE:
- Personalize baseado no perfil
- Ofereça valor em cada interação
- Mantenha foco no cliente
- Direcione para próximos passos claros
        `;
    }

    getConversationPrompt() {
        return `
Você é um consultor imobiliário especialista, natural e empático.

PERSONALIDADE:
- Profissional mas acessível
- Conhecimento profundo do mercado
- Foco em resolver problemas do cliente
- Confiável e transparente

OBJETIVOS:
- Manter engajamento alto
- Conduzir pelo funil de vendas
- Identificar oportunidades
- Agendar visitas/reuniões

ESTILO:
- Conversação natural
- Perguntas inteligentes
- Histórias e analogias
- Senso de urgência sutil

CONHECIMENTOS:
- Mercado imobiliário brasileiro
- Financiamentos e documentação
- Tendências de preços
- Aspectos legais básicos
- Análise de investimento
        `;
    }

    getReengagementPrompt() {
        return `
Você é um especialista em reativação de leads dormentes.

ESTRATÉGIAS:
- Ofereça novidades relevantes
- Use gatilhos de escassez/oportunidade
- Demonstre valor perdido
- Reative com soft approach
- Teste diferentes ângulos

TRIGGERS:
- Mudanças no mercado
- Novas oportunidades
- Ofertas especiais
- Insights personalizados
- Benefícios perdidos

TIMING:
- Considere ciclo de vida do lead
- Respeite frequência de contato
- Use momentos oportunos
- Teste horários diferentes
        `;
    }

    getPropertyRecommendationPrompt() {
        return `
Você é um curador imobiliário especialista em matching perfeito.

CRITÉRIOS DE RECOMENDAÇÃO:
- Necessidades declaradas vs implícitas
- Orçamento real vs declarado
- Estilo de vida e preferências
- Potencial de valorização
- ROI para investidores

APRESENTAÇÃO:
- Destaque pontos únicos
- Conecte com necessidades específicas
- Use storytelling
- Inclua dados de mercado
- Antecipe objeções

TÉCNICAS:
- Anchoring de preços
- Comparações estratégicas
- Tour virtual mental
- Provas sociais
- Escassez genuína
        `;
    }

    // =============================================================================
    // MÉTODOS AUXILIARES
    // =============================================================================

    determinePromptType(context) {
        const { intent, lead, isFirstContact } = context;
        
        if (isFirstContact) return 'lead_qualification';
        if (intent?.includes('agendamento')) return 'property_recommendation';
        if (lead?.status === 'dormant') return 'reengagement';
        
        return 'conversation';
    }

    buildConversationContext(lead, history) {
        if (!history || history.length === 0) return 'Primeira interação';
        
        return history.slice(-10).map(msg => 
            `${msg.sender === 'ai' ? 'Consultor' : lead.name}: ${msg.content}`
        ).join('\n');
    }

    getFallbackResponse(context) {
        const fallbacks = [
            "Que interessante! Conte-me mais sobre isso.",
            "Entendo. Deixe-me verificar as melhores opções para você.",
            "Ótima pergunta! Vou te ajudar com isso.",
            "Perfeito! Vamos encontrar exatamente o que você precisa."
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    /**
     * Processa transcrição de áudio
     */
    async processAudioTranscription(audioBase64) {
        try {
            // Aqui integraria com Whisper API ou similar
            // Por agora, retorna placeholder
            
            logger.info('🎤 Processing audio transcription');
            
            return {
                text: "Transcrição de áudio ainda não implementada",
                confidence: 0,
                language: "pt-BR"
            };
            
        } catch (error) {
            logger.error('❌ Audio transcription failed:', error);
            throw error;
        }
    }

    /**
     * Analisa imagem recebida
     */
    async analyzeImage(imageBase64, context = {}) {
        try {
            // Claude 3.5 Sonnet suporta análise de imagem
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: 'image/jpeg',
                                    data: imageBase64
                                }
                            },
                            {
                                type: 'text',
                                text: 'Analise esta imagem no contexto imobiliário. É uma propriedade? Documento? Planta? Descreva o que vê e sugira próximos passos.'
                            }
                        ]
                    }
                ]
            });

            const analysis = response.content[0].text;
            
            logger.info('📸 Image analyzed successfully');
            
            return {
                analysis,
                suggested_response: `Obrigado por compartilhar a imagem! ${analysis}`,
                action_required: true
            };

        } catch (error) {
            logger.error('❌ Image analysis failed:', error);
            return {
                analysis: 'Não foi possível analisar a imagem',
                suggested_response: 'Recebi sua imagem! Pode me explicar do que se trata?',
                action_required: false
            };
        }
    }
}

module.exports = ClaudeService;
