/**
 * 🧪 SOFIA IA - TESTE COMPLETO DE TODOS OS ENDPOINTS
 * Script para testar sistematicamente todos os 9 endpoints implementados
 */

const axios = require('axios');
const colors = require('colors');

// Configuração do servidor
const BASE_URL = 'http://localhost:8000';
const TIMEOUT = 10000; // 10 segundos

// Lista completa de todos os endpoints identificados
const ENDPOINTS = [
    {
        id: 1,
        method: 'GET',
        path: '/',
        name: 'Página Inicial da API',
        description: 'Documentação básica e informações do serviço',
        expectedFields: ['service', 'version', 'status', 'description', 'documentation']
    },
    {
        id: 2,
        method: 'GET',
        path: '/health',
        name: 'Health Check',
        description: 'Status de saúde do servidor',
        expectedFields: ['status', 'timestamp', 'service', 'uptime']
    },
    {
        id: 3,
        method: 'GET',
        path: '/api/dashboard/overview',
        name: 'Dashboard Overview',
        description: 'Métricas principais do dashboard',
        expectedFields: ['success', 'data']
    },
    {
        id: 4,
        method: 'GET',
        path: '/api/conversations/recent',
        name: 'Conversas Recentes',
        description: 'Preview de conversas recentes do WhatsApp',
        expectedFields: ['success', 'data']
    },
    {
        id: 5,
        method: 'GET',
        path: '/api/leads',
        name: 'Lista de Leads',
        description: 'Lista paginada de leads com filtros',
        expectedFields: ['success', 'data', 'pagination'],
        testQueries: [
            '',
            '?page=1&limit=10',
            '?status=hot',
            '?page=2&limit=5&status=warm'
        ]
    },
    {
        id: 6,
        method: 'GET',
        path: '/api/leads/1',
        name: 'Lead Específico',
        description: 'Detalhes de um lead específico',
        expectedFields: ['success', 'data']
    },
    {
        id: 7,
        method: 'GET',
        path: '/api/analytics/detailed',
        name: 'Analytics Detalhados',
        description: 'Relatórios completos e métricas avançadas',
        expectedFields: ['success', 'data']
    },
    {
        id: 8,
        method: 'GET',
        path: '/api/analytics/period',
        name: 'Analytics por Período',
        description: 'Métricas filtradas por período de tempo',
        expectedFields: ['success', 'data', 'period'],
        testQueries: [
            '',
            '?period=24h',
            '?period=7d',
            '?period=30d'
        ]
    },
    {
        id: 9,
        method: 'GET',
        path: '/api/realtime/stats',
        name: 'Stats em Tempo Real',
        description: 'Estatísticas que atualizam em tempo real',
        expectedFields: ['success', 'data', 'timestamp']
    }
];

// Classe para execução dos testes
class EndpointTester {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
        this.startTime = Date.now();
    }

    async testEndpoint(endpoint) {
        console.log(`\n🧪 ${endpoint.id}. Testando: ${endpoint.name}`.cyan);
        console.log(`📝 ${endpoint.description}`.gray);
        
        // Se tem queries para testar, testa todas
        const queries = endpoint.testQueries || [''];
        let allPassed = true;
        const testResults = [];

        for (const query of queries) {
            const fullPath = endpoint.path + query;
            const testResult = await this.makeRequest(endpoint, fullPath);
            testResults.push(testResult);
            
            if (!testResult.success) {
                allPassed = false;
            }
        }

        // Resultado consolidado
        const result = {
            endpoint: endpoint,
            success: allPassed,
            tests: testResults,
            timestamp: new Date().toISOString()
        };

        this.results.details.push(result);
        this.results.total++;
        
        if (allPassed) {
            this.results.passed++;
            console.log(`✅ ${endpoint.name} - SUCESSO`.green);
        } else {
            this.results.failed++;
            console.log(`❌ ${endpoint.name} - FALHOU`.red);
        }

        return result;
    }

    async makeRequest(endpoint, fullPath) {
        try {
            const url = `${BASE_URL}${fullPath}`;
            console.log(`   📡 ${endpoint.method} ${url}`.yellow);
            
            const startTime = Date.now();
            const response = await axios({
                method: endpoint.method,
                url: url,
                timeout: TIMEOUT,
                validateStatus: () => true // Aceita qualquer status code
            });
            const responseTime = Date.now() - startTime;

            // Verificar status code
            const isSuccessStatus = response.status >= 200 && response.status < 300;
            
            // Verificar campos esperados
            const hasExpectedFields = this.validateFields(response.data, endpoint.expectedFields);
            
            const success = isSuccessStatus && hasExpectedFields;

            console.log(`   ⏱️  Tempo: ${responseTime}ms | Status: ${response.status} | Campos: ${hasExpectedFields ? '✓' : '✗'}`);
            
            if (success) {
                console.log(`   ✅ Sucesso - Dados recebidos corretamente`.green);
            } else {
                console.log(`   ❌ Falha - Status: ${response.status} | Campos válidos: ${hasExpectedFields}`.red);
            }

            return {
                success: success,
                url: url,
                method: endpoint.method,
                statusCode: response.status,
                responseTime: responseTime,
                dataSize: JSON.stringify(response.data).length,
                hasExpectedFields: hasExpectedFields,
                error: null,
                sample: this.getSampleData(response.data)
            };

        } catch (error) {
            console.log(`   ❌ ERRO: ${error.message}`.red);
            
            return {
                success: false,
                url: `${BASE_URL}${fullPath}`,
                method: endpoint.method,
                statusCode: null,
                responseTime: null,
                dataSize: null,
                hasExpectedFields: false,
                error: error.message,
                sample: null
            };
        }
    }

    validateFields(data, expectedFields) {
        if (!expectedFields || expectedFields.length === 0) return true;
        
        return expectedFields.every(field => {
            const hasField = data && data.hasOwnProperty(field);
            if (!hasField) {
                console.log(`   ⚠️  Campo ausente: ${field}`.yellow);
            }
            return hasField;
        });
    }

    getSampleData(data) {
        if (!data) return null;
        
        // Retorna uma amostra dos dados para verificação
        const sample = JSON.stringify(data, null, 2);
        return sample.length > 500 ? sample.substring(0, 500) + '...' : sample;
    }

    printSummary() {
        const totalTime = Date.now() - this.startTime;
        
        console.log('\n🏁 ==============================================='.cyan);
        console.log('📊 RESUMO DOS TESTES'.cyan.bold);
        console.log('🏁 ==============================================='.cyan);
        console.log(`⏱️  Tempo total: ${totalTime}ms`);
        console.log(`📈 Total de endpoints: ${this.results.total}`);
        console.log(`✅ Sucessos: ${this.results.passed}`.green);
        console.log(`❌ Falhas: ${this.results.failed}`.red);
        console.log(`📊 Taxa de sucesso: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ FALHAS DETALHADAS:'.red.bold);
            this.results.details
                .filter(r => !r.success)
                .forEach(result => {
                    console.log(`   • ${result.endpoint.name}`.red);
                    result.tests
                        .filter(t => !t.success)
                        .forEach(test => {
                            console.log(`     - ${test.url}: ${test.error || `Status ${test.statusCode}`}`.gray);
                        });
                });
        }
        
        console.log('\n✅ ENDPOINTS FUNCIONAIS:'.green.bold);
        this.results.details
            .filter(r => r.success)
            .forEach(result => {
                console.log(`   ✓ ${result.endpoint.name}`.green);
            });
            
        console.log('\n🏁 ==============================================='.cyan);
    }

    // Gerar relatório detalhado em JSON
    generateReport() {
        const report = {
            test_summary: {
                total_endpoints: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                success_rate: ((this.results.passed / this.results.total) * 100).toFixed(1) + '%',
                test_duration: Date.now() - this.startTime + 'ms',
                timestamp: new Date().toISOString()
            },
            endpoints: this.results.details,
            server_info: {
                base_url: BASE_URL,
                timeout: TIMEOUT + 'ms'
            }
        };
        
        return report;
    }
}

// Função principal
async function runAllTests() {
    console.log('🚀 ==============================================='.cyan);
    console.log('🧪 SOFIA IA - TESTE COMPLETO DE ENDPOINTS'.cyan.bold);
    console.log('🚀 ==============================================='.cyan);
    console.log(`📡 Servidor: ${BASE_URL}`);
    console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
    console.log(`📊 Total de endpoints: ${ENDPOINTS.length}`);
    console.log('🚀 ==============================================='.cyan);
    
    const tester = new EndpointTester();
    
    // Testar conectividade básica primeiro
    try {
        console.log('\n🔌 Verificando conectividade...'.yellow);
        await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        console.log('✅ Servidor respondendo!'.green);
    } catch (error) {
        console.log('❌ ERRO: Servidor não está respondendo!'.red);
        console.log(`💡 Verifique se o servidor está rodando em ${BASE_URL}`.yellow);
        console.log('💡 Execute: npm start ou node src/app.js'.yellow);
        return;
    }
    
    // Executar todos os testes
    for (const endpoint of ENDPOINTS) {
        await tester.testEndpoint(endpoint);
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Mostrar resumo
    tester.printSummary();
    
    // Salvar relatório detalhado
    const report = tester.generateReport();
    const fs = require('fs');
    const reportPath = './test-results.json';
    
    try {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Relatório detalhado salvo em: ${reportPath}`.cyan);
    } catch (error) {
        console.log(`⚠️  Não foi possível salvar o relatório: ${error.message}`.yellow);
    }
    
    // Status final
    if (tester.results.failed === 0) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.'.green.bold);
    } else {
        console.log(`\n⚠️  ${tester.results.failed} teste(s) falharam. Verifique os logs acima.`.yellow.bold);
    }
}

// Verificar dependências
function checkDependencies() {
    try {
        require('axios');
        require('colors');
        return true;
    } catch (error) {
        console.log('❌ Dependências não encontradas!'.red);
        console.log('💡 Execute: npm install axios colors'.yellow);
        return false;
    }
}

// Executar
if (require.main === module) {
    if (checkDependencies()) {
        runAllTests().catch(error => {
            console.error('❌ Erro fatal:', error.message);
            process.exit(1);
        });
    }
}

module.exports = { EndpointTester, ENDPOINTS };