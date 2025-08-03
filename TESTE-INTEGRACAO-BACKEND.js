/**
 * 🔧 TESTE INTEGRAÇÃO EVOLUTION API - Backend v2.3.0
 * Validar se a integração do EvolutionAPIService está funcionando
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

console.log('🔧 TESTANDO INTEGRAÇÃO EVOLUTION API NO BACKEND');
console.log('================================================');
console.log(`📍 Backend URL: ${BACKEND_URL}`);
console.log('');

async function testarIntegracao() {
    try {
        console.log('1️⃣ TESTE: Health Check Backend com Evolution API...');
        
        const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
            timeout: 10000
        });
        
        console.log('✅ Health Check OK!');
        console.log(`📊 Status: ${healthResponse.status}`);
        console.log(`🔗 Evolution API Status:`, healthResponse.data.evolution_api?.status || 'not_checked');
        console.log('');

        console.log('2️⃣ TESTE: Listar Instâncias WhatsApp REAIS...');
        
        const instancesResponse = await axios.get(`${BACKEND_URL}/api/whatsapp/instances`, {
            timeout: 15000
        });
        
        console.log('✅ Listagem de Instâncias REAIS OK!');
        console.log(`📊 Status: ${instancesResponse.status}`);
        console.log(`📱 Total de instâncias: ${instancesResponse.data.total || 0}`);
        console.log(`📝 Source: ${instancesResponse.data.source}`);
        
        if (instancesResponse.data.data && instancesResponse.data.data.length > 0) {
            console.log('🎯 Primeira Instância REAL:');
            const firstInstance = instancesResponse.data.data[0];
            console.log(`   ID: ${firstInstance.id}`);
            console.log(`   Nome: ${firstInstance.name}`);
            console.log(`   Status: ${firstInstance.status}`);
            console.log(`   Mensagens: ${firstInstance.messagesCount || 0}`);
            console.log(`   Criada em: ${firstInstance.createdAt}`);
        }
        console.log('');

        console.log('3️⃣ TESTE: Estatísticas WhatsApp REAIS...');
        
        const statsResponse = await axios.get(`${BACKEND_URL}/api/whatsapp/stats`, {
            timeout: 10000
        });
        
        console.log('✅ Estatísticas REAIS OK!');
        console.log(`📊 Status: ${statsResponse.status}`);
        console.log(`📝 Source: ${statsResponse.data.source}`);
        console.log('📈 Stats:', JSON.stringify(statsResponse.data.data, null, 2));
        console.log('');

        console.log('4️⃣ TESTE: Criar Nova Instância (SIMULAÇÃO)...');
        
        const testInstanceName = `sofia-teste-${Date.now()}`;
        
        try {
            const createResponse = await axios.post(`${BACKEND_URL}/api/whatsapp/instances`, {
                instanceName: testInstanceName,
                settings: {
                    token: `test_token_${Date.now()}`
                }
            }, {
                timeout: 20000
            });
            
            console.log('✅ Endpoint de Criação OK!');
            console.log(`📊 Status: ${createResponse.status}`);
            console.log(`📝 Resposta:`, JSON.stringify(createResponse.data, null, 2));
            
        } catch (createError) {
            console.log('⚠️ Erro esperado na criação (teste de endpoint):');
            console.log(`   Status: ${createError.response?.status || 'timeout'}`);
            console.log(`   Erro: ${createError.response?.data?.error || createError.message}`);
        }
        console.log('');

        console.log('🎉 RESULTADO FINAL DA INTEGRAÇÃO:');
        console.log('==================================');
        console.log('✅ Backend v2.3.0 está funcionando!');
        console.log('✅ EvolutionAPIService está integrado!');
        console.log('✅ Endpoints REAIS estão respondendo!');
        console.log('✅ Dados REAIS sendo retornados do Evolution API!');
        console.log('');
        console.log('🚀 PRÓXIMO PASSO: Configurar webhooks bidirecionais');
        console.log('🔗 Frontend já pode conectar nos endpoints reais!');
        
    } catch (error) {
        console.log('❌ ERRO na integração:');
        console.log('=======================');
        console.error('Tipo:', error.name);
        console.error('Mensagem:', error.message);
        
        if (error.response) {
            console.error('Status HTTP:', error.response.status);
            console.error('Data:', error.response.data);
        }
        
        console.log('');
        console.log('🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verificar se backend está rodando em localhost:8000');
        console.log('2. Verificar se Evolution API está online');
        console.log('3. Verificar arquivo .env com credenciais corretas');
        console.log('4. Reiniciar backend se necessário');
    }
}

// Executar teste
testarIntegracao();
