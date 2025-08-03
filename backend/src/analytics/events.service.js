/**
 * 🎯 SOFIA IA - ANALYTICS EVENTS SERVICE
 * Processa e armazena eventos de analytics para insights de negócio
 */

const fs = require('fs').promises;
const path = require('path');

class AnalyticsEventsService {
    constructor() {
        this.eventsBuffer = [];
        this.eventsFile = path.join(__dirname, '../../logs/analytics_events.json');
        this.sessionsFile = path.join(__dirname, '../../logs/user_sessions.json');
        this.metricsFile = path.join(__dirname, '../../logs/business_metrics.json');
        
        this.ensureDirectories();
        this.loadExistingData();
        
        // Flush automático a cada 30 segundos
        setInterval(() => {
            this.flushToDisk();
        }, 30000);
    }

    async ensureDirectories() {
        const logsDir = path.dirname(this.eventsFile);
        try {
            await fs.access(logsDir);
        } catch {
            await fs.mkdir(logsDir, { recursive: true });
        }
    }

    async loadExistingData() {
        try {
            const data = await fs.readFile(this.eventsFile, 'utf8');
            this.existingEvents = JSON.parse(data);
        } catch {
            this.existingEvents = [];
        }
    }

    // ========== PROCESSAMENTO DE EVENTOS ==========

    async processEvents(eventsData) {
        const { events, session_id, user_id } = eventsData;
        
        console.log(`📊 Processando ${events.length} eventos para sessão ${session_id}`);
        
        // Enriquecer eventos com metadata
        const enrichedEvents = events.map(event => ({
            ...event,
            processed_at: new Date().toISOString(),
            server_timestamp: Date.now(),
            session_id: session_id,
            user_id: user_id
        }));

        // Adicionar ao buffer
        this.eventsBuffer.push(...enrichedEvents);

        // Processar business intelligence
        await this.processBusinessIntelligence(enrichedEvents);

        // Atualizar sessão do usuário
        await this.updateUserSession(session_id, user_id, enrichedEvents);

        return {
            success: true,
            events_processed: events.length,
            session_id: session_id
        };
    }

    async processBusinessIntelligence(events) {
        const metrics = {
            dashboard_interactions: 0,
            whatsapp_actions: 0,
            lead_actions: 0,
            api_calls: 0,
            errors: 0,
            page_views: 0,
            session_starts: 0,
            session_ends: 0
        };

        const detailedMetrics = {
            timestamp: new Date().toISOString(),
            popular_actions: {},
            performance_data: [],
            error_analysis: [],
            user_flow: [],
            conversion_funnel: {
                page_visits: 0,
                dashboard_views: 0,
                whatsapp_interactions: 0,
                lead_qualifications: 0,
                successful_actions: 0
            }
        };

        events.forEach(event => {
            // Contar tipos de eventos
            switch (event.event_name) {
                case 'dashboard_action':
                    metrics.dashboard_interactions++;
                    detailedMetrics.conversion_funnel.dashboard_views++;
                    break;
                case 'whatsapp_action':
                    metrics.whatsapp_actions++;
                    detailedMetrics.conversion_funnel.whatsapp_interactions++;
                    break;
                case 'lead_action':
                    metrics.lead_actions++;
                    if (event.properties.action === 'qualified') {
                        detailedMetrics.conversion_funnel.lead_qualifications++;
                    }
                    break;
                case 'api_call':
                    metrics.api_calls++;
                    if (event.properties.status_code < 400) {
                        detailedMetrics.conversion_funnel.successful_actions++;
                    }
                    // Coletar dados de performance
                    detailedMetrics.performance_data.push({
                        endpoint: event.properties.endpoint,
                        response_time: event.properties.response_time,
                        status_code: event.properties.status_code,
                        timestamp: event.timestamp
                    });
                    break;
                case 'error_event':
                    metrics.errors++;
                    detailedMetrics.error_analysis.push({
                        error_type: event.properties.error_type,
                        error_message: event.properties.error_message,
                        context: event.properties.context,
                        timestamp: event.timestamp
                    });
                    break;
                case 'page_view':
                    metrics.page_views++;
                    detailedMetrics.conversion_funnel.page_visits++;
                    detailedMetrics.user_flow.push({
                        page: event.properties.pathname,
                        timestamp: event.timestamp
                    });
                    break;
                case 'session_end':
                    metrics.session_ends++;
                    break;
            }

            // Contar ações populares
            const actionKey = `${event.event_name}:${event.properties.action || 'default'}`;
            detailedMetrics.popular_actions[actionKey] = (detailedMetrics.popular_actions[actionKey] || 0) + 1;
        });

        // Calcular conversion rate
        const conversionRate = detailedMetrics.conversion_funnel.page_visits > 0 
            ? (detailedMetrics.conversion_funnel.successful_actions / detailedMetrics.conversion_funnel.page_visits * 100).toFixed(2)
            : 0;

        detailedMetrics.conversion_funnel.conversion_rate = conversionRate;

        // Salvar métricas
        await this.saveBusinessMetrics({ metrics, detailedMetrics });
    }

    async updateUserSession(sessionId, userId, events) {
        const sessionData = {
            session_id: sessionId,
            user_id: userId,
            start_time: Math.min(...events.map(e => e.timestamp)),
            last_activity: Math.max(...events.map(e => e.timestamp)),
            events_count: events.length,
            event_types: [...new Set(events.map(e => e.event_name))],
            updated_at: new Date().toISOString()
        };

        // Salvar sessão (simplified - em produção usaria DB)
        const sessions = await this.loadSessions();
        const existingIndex = sessions.findIndex(s => s.session_id === sessionId);
        
        if (existingIndex >= 0) {
            sessions[existingIndex] = { ...sessions[existingIndex], ...sessionData };
        } else {
            sessions.push(sessionData);
        }

        await this.saveSessions(sessions);
    }

    // ========== ANALYTICS INSIGHTS ==========

    async generateInsights() {
        const events = await this.getAllEvents();
        const sessions = await this.loadSessions();
        
        const insights = {
            overview: {
                total_events: events.length,
                total_sessions: sessions.length,
                unique_users: [...new Set(events.map(e => e.user_id))].length,
                avg_session_duration: this.calculateAvgSessionDuration(sessions),
                most_active_hour: this.getMostActiveHour(events)
            },
            user_behavior: {
                top_actions: this.getTopActions(events),
                popular_pages: this.getPopularPages(events),
                user_flow: this.getUserFlow(events),
                bounce_rate: this.calculateBounceRate(sessions)
            },
            performance: {
                avg_api_response_time: this.getAvgApiResponseTime(events),
                error_rate: this.getErrorRate(events),
                slowest_endpoints: this.getSlowestEndpoints(events)
            },
            business_metrics: {
                dashboard_engagement: this.getDashboardEngagement(events),
                whatsapp_usage: this.getWhatsAppUsage(events),
                lead_conversion_funnel: this.getLeadConversionFunnel(events)
            }
        };

        return insights;
    }

    // ========== HELPER METHODS ==========

    calculateAvgSessionDuration(sessions) {
        if (sessions.length === 0) return 0;
        
        const durations = sessions.map(session => {
            return session.last_activity - session.start_time;
        });

        const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
        return Math.round(avgDuration / 1000); // em segundos
    }

    getMostActiveHour(events) {
        const hourCounts = {};
        
        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        return Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
    }

    getTopActions(events) {
        const actionCounts = {};
        
        events.forEach(event => {
            const action = `${event.event_name}:${event.properties.action || 'default'}`;
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });

        return Object.entries(actionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([action, count]) => ({ action, count }));
    }

    getPopularPages(events) {
        const pageViews = events.filter(e => e.event_name === 'page_view');
        const pageCounts = {};
        
        pageViews.forEach(event => {
            const page = event.properties.pathname;
            pageCounts[page] = (pageCounts[page] || 0) + 1;
        });

        return Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([page, count]) => ({ page, count }));
    }

    getUserFlow(events) {
        const pageViews = events
            .filter(e => e.event_name === 'page_view')
            .sort((a, b) => a.timestamp - b.timestamp);

        const flows = {};
        
        for (let i = 0; i < pageViews.length - 1; i++) {
            const from = pageViews[i].properties.pathname;
            const to = pageViews[i + 1].properties.pathname;
            const flowKey = `${from} → ${to}`;
            flows[flowKey] = (flows[flowKey] || 0) + 1;
        }

        return Object.entries(flows)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([flow, count]) => ({ flow, count }));
    }

    calculateBounceRate(sessions) {
        if (sessions.length === 0) return 0;
        
        const singlePageSessions = sessions.filter(session => {
            return session.events_count <= 2; // apenas page_view e possível session_end
        });

        return ((singlePageSessions.length / sessions.length) * 100).toFixed(2);
    }

    getAvgApiResponseTime(events) {
        const apiCalls = events.filter(e => e.event_name === 'api_call');
        if (apiCalls.length === 0) return 0;

        const totalTime = apiCalls.reduce((sum, call) => sum + call.properties.response_time, 0);
        return Math.round(totalTime / apiCalls.length);
    }

    getErrorRate(events) {
        const totalEvents = events.length;
        const errorEvents = events.filter(e => e.event_name === 'error_event').length;
        
        if (totalEvents === 0) return 0;
        return ((errorEvents / totalEvents) * 100).toFixed(2);
    }

    getSlowestEndpoints(events) {
        const apiCalls = events.filter(e => e.event_name === 'api_call');
        const endpointTimes = {};

        apiCalls.forEach(call => {
            const endpoint = call.properties.endpoint;
            if (!endpointTimes[endpoint]) {
                endpointTimes[endpoint] = { total_time: 0, count: 0 };
            }
            endpointTimes[endpoint].total_time += call.properties.response_time;
            endpointTimes[endpoint].count += 1;
        });

        return Object.entries(endpointTimes)
            .map(([endpoint, data]) => ({
                endpoint,
                avg_response_time: Math.round(data.total_time / data.count),
                calls_count: data.count
            }))
            .sort((a, b) => b.avg_response_time - a.avg_response_time)
            .slice(0, 5);
    }

    getDashboardEngagement(events) {
        const dashboardEvents = events.filter(e => e.event_name === 'dashboard_action');
        const actions = {};

        dashboardEvents.forEach(event => {
            const action = event.properties.action;
            actions[action] = (actions[action] || 0) + 1;
        });

        return {
            total_interactions: dashboardEvents.length,
            unique_actions: Object.keys(actions).length,
            most_used_action: Object.keys(actions).length > 0 
                ? Object.entries(actions).sort(([,a], [,b]) => b - a)[0][0] 
                : null,
            action_breakdown: actions
        };
    }

    getWhatsAppUsage(events) {
        const whatsappEvents = events.filter(e => e.event_name === 'whatsapp_action');
        const actions = {};
        const instances = new Set();

        whatsappEvents.forEach(event => {
            const action = event.properties.action;
            actions[action] = (actions[action] || 0) + 1;
            if (event.properties.instance_id) {
                instances.add(event.properties.instance_id);
            }
        });

        return {
            total_actions: whatsappEvents.length,
            unique_instances_used: instances.size,
            most_common_action: Object.keys(actions).length > 0 
                ? Object.entries(actions).sort(([,a], [,b]) => b - a)[0][0] 
                : null,
            action_breakdown: actions
        };
    }

    getLeadConversionFunnel(events) {
        const leadEvents = events.filter(e => e.event_name === 'lead_action');
        const stages = {
            viewed: 0,
            clicked: 0,
            qualified: 0,
            contacted: 0
        };

        leadEvents.forEach(event => {
            const action = event.properties.action;
            if (stages.hasOwnProperty(action)) {
                stages[action]++;
            }
        });

        // Calcular conversion rates
        const conversionRates = {
            view_to_click: stages.viewed > 0 ? ((stages.clicked / stages.viewed) * 100).toFixed(2) : 0,
            click_to_qualify: stages.clicked > 0 ? ((stages.qualified / stages.clicked) * 100).toFixed(2) : 0,
            qualify_to_contact: stages.qualified > 0 ? ((stages.contacted / stages.qualified) * 100).toFixed(2) : 0
        };

        return {
            funnel_stages: stages,
            conversion_rates: conversionRates,
            overall_conversion: stages.viewed > 0 ? ((stages.contacted / stages.viewed) * 100).toFixed(2) : 0
        };
    }

    // ========== PERSISTÊNCIA ==========

    async flushToDisk() {
        if (this.eventsBuffer.length === 0) return;

        try {
            const allEvents = [...this.existingEvents, ...this.eventsBuffer];
            await fs.writeFile(this.eventsFile, JSON.stringify(allEvents, null, 2));
            
            console.log(`📊 ${this.eventsBuffer.length} eventos salvos em disco`);
            this.existingEvents = allEvents;
            this.eventsBuffer = [];
        } catch (error) {
            console.error('❌ Erro ao salvar eventos:', error);
        }
    }

    async saveBusinessMetrics(metrics) {
        try {
            const existingMetrics = await this.loadBusinessMetrics();
            existingMetrics.push(metrics);
            
            // Manter apenas últimos 100 registros
            if (existingMetrics.length > 100) {
                existingMetrics.splice(0, existingMetrics.length - 100);
            }
            
            await fs.writeFile(this.metricsFile, JSON.stringify(existingMetrics, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar métricas de negócio:', error);
        }
    }

    async loadBusinessMetrics() {
        try {
            const data = await fs.readFile(this.metricsFile, 'utf8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    async saveSessions(sessions) {
        try {
            await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar sessões:', error);
        }
    }

    async loadSessions() {
        try {
            const data = await fs.readFile(this.sessionsFile, 'utf8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    async getAllEvents() {
        await this.flushToDisk(); // Garantir que buffer está vazio
        return this.existingEvents;
    }

    // ========== LIMPEZA ==========

    async cleanup() {
        // Limpar eventos antigos (> 30 dias)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const events = await this.getAllEvents();
        const recentEvents = events.filter(event => event.timestamp > thirtyDaysAgo);
        
        this.existingEvents = recentEvents;
        await fs.writeFile(this.eventsFile, JSON.stringify(recentEvents, null, 2));
        
        console.log(`🧹 Limpeza concluída. Removidos ${events.length - recentEvents.length} eventos antigos`);
    }
}

module.exports = AnalyticsEventsService;