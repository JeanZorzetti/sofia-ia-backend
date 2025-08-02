/**
 * 🧪 SOFIA IA - TESTE SIMPLES DE ENDPOINTS
 * Versão sem dependências externas usando apenas Node.js nativo
 */

const http = require('http');
const { URL } = require('url');

// Configuração
const BASE_URL = 'http://localhost:8000';

// Lista de endpoints para testar
const ENDPOINTS = [
    { id: 1, path: '/', name: 'Página Inicial' },
    { id: 2, path: '/health', name: 'Health Check' },
    { id: 3, path: '/api/dashboard/overview', name: 'Dashboard Overview' },
    { id: 4, path: '/api/conversations/recent', name: 'Conversas Recentes' },
    { id: 5, path: '/api/leads', name: 'Lista de Leads' },
    { id: 6, path: '/api/leads?page=1&limit=5', name: 'Leads Paginados' },
    { id: 7, path: '/api/leads/1', name: 'Lead Específico' },
    { id: 8, path: '/api/analytics/detailed', name: 'Analytics Detalhados' },
    { id: 9, path: '/api/analytics/period?period=24h', name: 'Analytics 24h' },
    { id: 10, path: '/api/realtime/stats', name: 'Stats Tempo Real' }
];

// Função para fazer requisição HTTP
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        data: jsonData,
                        size: data.length
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        error: 'JSON inválido',
                        rawData: data.substring(0, 200)
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject({
                success: false,
                error: error.message,
                responseTime: Date.now() - startTime
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject({
                success: false,
                error: 'Timeout (10s)',
                responseTime: Date.now() - startTime
            });
        });
    });
}

// Função principal de teste
async function testAllEndpoints() {
    console.log('🚀 ============================================');
    console.log('🧪 SOFIA IA - TESTE DE ENDPOINTS');
    console.log('🚀 ============================================');
    console.log(`📡 Servidor: ${BASE_URL}`);
    console.log(`📊 Total: ${ENDPOINTS.length} endpoints`);
    console.log('');
    
    const results = [];
    let passed = 0;
    let failed = 0;
    
    for (const endpoint of ENDPOINTS) {
        const url = `${BASE_URL}${endpoint.path}`;
        console.log(`🧪 ${endpoint.id}. ${endpoint.name}`);
        console.log(`📡 GET ${url}`);
        
        try {
            const result = await makeRequest(url);
            
            if (result.success && result.statusCode === 200) {
                console.log(`✅ SUCESSO - ${result.responseTime}ms - ${result.size} bytes`);
                passed++;
                
                // Mostrar amostra dos dados
                if (result.data) {
                    const keys = Object.keys(result.data);
                    console.log(`📋 Campos: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
                }
            } else {
                console.log(`❌ FALHA - Status: ${result.statusCode} - ${result.error || 'Erro desconhecido'}`);
                failed++;
            }
            
            results.push({
                endpoint: endpoint,
                result: result
            });
            
        } catch (error) {
            console.log(`❌ ERRO - ${error.error || error.message}`);
            failed++;
            
            results.push({
                endpoint: endpoint,
                result: error
            });
        }
        
        console.log('');
        
        // Pequena pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Resumo final
    console.log('🏁 ============================================');
    console.log('📊 RESUMO DOS TESTES');
    console.log('🏁 ============================================');
    console.log(`📈 Total: ${ENDPOINTS.length}`);
    console.log(`✅ Sucessos: ${passed}`);
    console.log(`❌ Falhas: ${failed}`);
    console.log(`📊 Taxa de sucesso: ${((passed / ENDPOINTS.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
        console.log('');
        console.log('❌ ENDPOINTS COM FALHA:');
        results
            .filter(r => !r.result.success || r.result.statusCode !== 200)
            .forEach(r => {
                console.log(`   • ${r.endpoint.name}: ${r.result.error || `Status ${r.result.statusCode}`}`);
            });
    }
    
    if (passed > 0) {
        console.log('');
        console.log('✅ ENDPOINTS FUNCIONAIS:');
        results
            .filter(r => r.result.success && r.result.statusCode === 200)
            .forEach(r => {
                console.log(`   ✓ ${r.endpoint.name} (${r.result.responseTime}ms)`);
            });
    }
    
    console.log('');
    
    if (passed === ENDPOINTS.length) {
        console.log('🎉 TODOS OS ENDPOINTS ESTÃO FUNCIONANDO!');
    } else if (passed > 0) {
        console.log('⚠️  Sistema parcialmente funcional.');
    } else {
        console.log('❌ SISTEMA FORA DO AR - Verifique se o servidor está rodando.');
        console.log('💡 Execute: cd backend && npm start');
    }
    
    console.log('🏁 ============================================');
}

// Executar se chamado diretamente
if (require.main === module) {
    testAllEndpoints().catch(error => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = { testAllEndpoints, ENDPOINTS };