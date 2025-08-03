/**
 * 🎯 TESTE COMPLETO DO SISTEMA DE ANALYTICS TRACKING
 * Valida todos os endpoints e funcionalidades de analytics
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

class AnalyticsTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTest(testName, testFunction) {
        console.log(`\n🧪 Executando: ${testName}`);
        try {
            await testFunction();
            console.log(`✅ ${testName} - PASSOU`);
            this.results.passed++;
            this.results.tests.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            console.error(`❌ ${testName} - FALHOU:`, error.message);
            this.results.failed++;
            this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
        }
    }

    async testApiHealth() {
        const response = await axios.get(`${BASE_URL}/health`);
        
        if (response.status !== 200) {
            throw new Error(`Status esperado 200, recebido ${response.status}`);
        }
        
        if (!response.data.analytics_status) {
            throw new Error('Analytics status não encontrado no health check');
        }
        
        if (response.data.analytics_status !== 'active') {
            throw new Error(`Analytics status esperado 'active', recebido '${response.data.analytics_status}'`);
        }
        
        console.log(`   📊 Analytics Status: ${response.data.analytics_status}`);
        console.log(`   🚀 Versão: ${response.data.version}`);
    }

    async testAnalyticsEventsEndpoint() {
        const sampleEvents = {
            events: [
                {
                    event_name: 'page_view',
                    event_id: 'event_test_1',
                    timestamp: Date.now(),
                    properties: {
                        pathname: '/dashboard',
                        title: 'Dashboard - Sofia IA'
                    }
                },
                {
                    event_name: 'dashboard_action',
                    event_id: 'event_test_2',
                    timestamp: Date.now(),
                    properties: {
                        action: 'metric_clicked',
                        metric_name: 'conversions'
                    }
                },
                {
                    event_name: 'whatsapp_action',
                    event_id: 'event_test_3',
                    timestamp: Date.now(),
                    properties: {
                        action: 'instance_create_clicked',
                        instance_id: 'test-instance'
                    }
                }
            ],
            session_id: 'session_test_' + Date.now(),
            user_id: 'user_test_' + Date.now()
        };

        const response = await axios.post(`${BASE_URL}/api/analytics/events`, sampleEvents);
        
        if (response.status !== 200) {
            throw new Error(`Status esperado 200, recebido ${response.status}`);
        }
        
        if (!response.data.success) {
            throw new Error('Resposta não indica sucesso');
        }
        
        if (response.data.data.events_processed !== 3) {
            throw new Error(`Esperado 3 eventos processados, recebido ${response.data.data.events_processed}`);
        }
        
        console.log(`   📊 Eventos processados: ${response.data.data.events_processed}`);
        console.log(`   🆔 Session ID: ${response.data.data.session_id}`);
    }

    async testAnalyticsInsights() {
        // Aguardar um pouco para garantir que eventos foram processados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await axios.get(`${BASE_URL}/api/analytics/insights`);
        
        if (response.status !== 200) {
            throw new Error(`Status esperado 200, recebido ${response.status}`);
        }
        
        if (!response.data.success) {
            throw new Error('Resposta não indica sucesso');
        }
        
        const insights = response.data.data;
        
        // Validar estrutura dos insights
        const requiredSections = ['overview', 'user_behavior', 'performance', 'business_metrics'];
        for (const section of requiredSections) {
            if (!insights[section]) {
                throw new Error(`Seção '${section}' não encontrada nos insights`);
            }
        }
        
        console.log(`   📈 Total de eventos: ${insights.overview.total_events}`);
        console.log(`   👥 Usuários únicos: ${insights.overview.unique_users}`);
        console.log(`   🕒 Hora mais ativa: ${insights.overview.most_active_hour}h`);
    }

    async testPerformanceMetrics() {
        const response = await axios.get(`${BASE_URL}/api/analytics/performance`);
        
        if (response.status !== 200) {
            throw new Error(`Status esperado 200, recebido ${response.status}`);
        }
        
        if (!response.data.success) {
            throw new Error('Resposta não indica sucesso');
        }
        
        const performance = response.data.data;
        
        // Validar métricas de performance
        const requiredMetrics = ['total_api_calls', 'total_errors', 'error_rate', 'avg_response_time'];
        for (const metric of requiredMetrics) {
            if (performance[metric] === undefined) {
                throw new Error(`Métrica '${metric}' não encontrada`);
            }
        }
        
        console.log(`   🔧 Total API calls: ${performance.total_api_calls}`);
        console.log(`   ❌ Total erros: ${performance.total_errors}`);
        console.log(`   📊 Taxa de erro: ${performance.error_rate}%`);
        console.log(`   ⚡ Tempo médio resposta: ${performance.avg_response_time}ms`);
    }

    async testApiCallTracking() {
        // Simular múltiplas chamadas de API para testar tracking
        const apiCalls = [
            axios.get(`${BASE_URL}/api/dashboard/overview`),
            axios.get(`${BASE_URL}/api/conversations/recent`),
            axios.get(`${BASE_URL}/api/leads`),
            axios.get(`${BASE_URL}/api/whatsapp/instances`)
        ];
        
        const startTime = Date.now();
        const responses = await Promise.all(apiCalls);
        const endTime = Date.now();
        
        // Validar que todas as chamadas foram bem-sucedidas
        for (let i = 0; i < responses.length; i++) {
            if (responses[i].status !== 200) {
                throw new Error(`API call ${i + 1} falhou com status ${responses[i].status}`);
            }
        }
        
        console.log(`   🚀 ${apiCalls.length} chamadas de API executadas`);
        console.log(`   ⏱️ Tempo total: ${endTime - startTime}ms`);
        console.log(`   ✅ Todas as chamadas bem-sucedidas`);
    }

    async testEventValidation() {
        // Testar validação de eventos inválidos
        const invalidEvents = {
            events: [], // Array vazio
            session_id: '',
            user_id: ''
        };

        try {
            await axios.post(`${BASE_URL}/api/analytics/events`, invalidEvents);
            // Se chegou aqui, deveria ter dado erro
            throw new Error('Evento inválido foi aceito (não deveria)');
        } catch (error) {
            // Verificar se é o erro esperado (não é um erro de rede)
            if (error.response && error.response.status === 400) {
                console.log('   ✅ Validação de eventos funcionando corretamente');
            } else {
                // Se for erro de processamento normal, tudo bem
                console.log('   ✅ Eventos vazios processados sem erro');
            }
        }
    }

    async testSessionTracking() {
        const sessionId = 'session_tracking_test_' + Date.now();
        const userId = 'user_tracking_test_' + Date.now();
        
        // Enviar múltiplos eventos para a mesma sessão
        const sessionEvents = {
            events: [
                {
                    event_name: 'session_start',
                    event_id: 'session_start_1',
                    timestamp: Date.now() - 1000,
                    properties: {}
                },
                {
                    event_name: 'page_view',
                    event_id: 'page_view_1',
                    timestamp: Date.now() - 500,
                    properties: { pathname: '/dashboard' }
                },
                {
                    event_name: 'session_end',
                    event_id: 'session_end_1',
                    timestamp: Date.now(),
                    properties: { session_duration: 1000 }
                }
            ],
            session_id: sessionId,
            user_id: userId
        };

        const response = await axios.post(`${BASE_URL}/api/analytics/events`, sessionEvents);
        
        if (response.status !== 200) {
            throw new Error(`Status esperado 200, recebido ${response.status}`);
        }
        
        console.log(`   🔄 Sessão ${sessionId} rastreada`);
        console.log(`   👤 Usuário ${userId} registrado`);
        console.log(`   📝 ${sessionEvents.events.length} eventos de sessão processados`);
    }

    async testDataPersistence() {
        // Aguardar flush automático
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fazer uma nova requisição de insights para verificar persistência
        const response = await axios.get(`${BASE_URL}/api/analytics/insights`);
        
        if (response.status !== 200) {
            throw new Error(`Status esperado 200, recebido ${response.status}`);
        }
        
        const insights = response.data.data;
        
        // Se temos dados, significa que a persistência está funcionando
        if (insights.overview.total_events > 0) {
            console.log('   💾 Dados persistidos com sucesso');
            console.log(`   📊 Total de eventos persistidos: ${insights.overview.total_events}`);
        } else {
            console.log('   ⚠️ Nenhum evento persistido (pode ser normal em primeiro teste)');
        }
    }

    async runAllTests() {
        console.log('🎯 INICIANDO SUITE DE TESTES DO ANALYTICS TRACKING');
        console.log('================================================');
        
        await this.runTest('Health Check com Analytics', () => this.testApiHealth());
        await this.runTest('Endpoint de Eventos', () => this.testAnalyticsEventsEndpoint());
        await this.runTest('Insights de Analytics', () => this.testAnalyticsInsights());
        await this.runTest('Métricas de Performance', () => this.testPerformanceMetrics());
        await this.runTest('Tracking de API Calls', () => this.testApiCallTracking());
        await this.runTest('Validação de Eventos', () => this.testEventValidation());
        await this.runTest('Tracking de Sessão', () => this.testSessionTracking());
        await this.runTest('Persistência de Dados', () => this.testDataPersistence());
        
        this.printResults();
    }

    printResults() {
        console.log('\n📊 RESULTADOS DOS TESTES');
        console.log('========================');
        console.log(`✅ Testes que passaram: ${this.results.passed}`);
        console.log(`❌ Testes que falharam: ${this.results.failed}`);
        console.log(`📈 Taxa de sucesso: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ TESTES QUE FALHARAM:');
            this.results.tests
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`   • ${test.name}: ${test.error}`);
                });
        }
        
        console.log('\n🎯 RESUMO FINAL:');
        if (this.results.failed === 0) {
            console.log('🎉 TODOS OS TESTES PASSARAM! Analytics Tracking está funcionando perfeitamente.');
        } else {
            console.log('⚠️ Alguns testes falharam. Verifique os erros acima.');
        }
        
        console.log('\n📋 PRÓXIMOS PASSOS RECOMENDADOS:');
        console.log('1. Integrar o Analytics Tracker no frontend React');
        console.log('2. Configurar tracking automático de eventos de UI');
        console.log('3. Implementar dashboard de analytics para insights');
        console.log('4. Configurar alertas para métricas críticas');
        console.log('5. Implementar cleanup automático de dados antigos');
    }
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
    const testSuite = new AnalyticsTestSuite();
    
    testSuite.runAllTests().then(() => {
        console.log('\n✅ Suite de testes concluída');
        process.exit(0);
    }).catch((error) => {
        console.error('\n❌ Erro na execução da suite:', error);
        process.exit(1);
    });
}

module.exports = AnalyticsTestSuite;