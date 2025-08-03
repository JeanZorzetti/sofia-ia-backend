/**
 * 🚀 TESTE EVOLUTION API REAL - Primeiro Passo do Checklist
 * Verificar conexão com evolutionapi.roilabs.com.br
 */

const axios = require('axios');

const EVOLUTION_API_URL = 'https://evolutionapi.roilabs.com.br';
const EVOLUTION_API_KEY = 'SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz';

console.log('🔌 TESTANDO CONEXÃO EVOLUTION API REAL');
console.log('=====================================');
console.log(`📍 URL: ${EVOLUTION_API_URL}`);
console.log(`🔑 API Key: ${EVOLUTION_API_KEY.substring(0, 10)}...`);
console.log('');

async function testarEvolutionAPI() {
    try {
        console.log('1️⃣ TESTE: Health Check Evolution API...');
        
        // Teste 1: Health check
        const healthResponse = await axios.get(`${EVOLUTION_API_URL}/`, {
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Health Check OK!');
        console.log('📊 Status:', healthResponse.status);
        console.log('📝 Data:', JSON.stringify(healthResponse.data, null, 2));
        console.log('');

        console.log('2️⃣ TESTE: Listar Instâncias Existentes...');
        
        // Teste 2: Listar instâncias
        const instancesResponse = await axios.get(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Listagem de Instâncias OK!');
        console.log('📊 Status:', instancesResponse.status);
        console.log('📝 Instâncias encontradas:', instancesResponse.data.length || 0);
        
        if (instancesResponse.data.length > 0) {
            console.log('🎯 Primeira Instância:', JSON.stringify(instancesResponse.data[0], null, 2));
        }
        console.log('');

        console.log('3️⃣ TESTE: Verificar Manager API...');
        
        // Teste 3: Manager
        const managerResponse = await axios.get(`${EVOLUTION_API_URL}/manager/fetchInstances`, {
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Manager API OK!');
        console.log('📊 Status:', managerResponse.status);
        console.log('📝 Manager Data:', JSON.stringify(managerResponse.data, null, 2));
        console.log('');

        console.log('🎉 RESULTADO FINAL:');
        console.log('==================');
        console.log('✅ Evolution API está ONLINE e FUNCIONANDO!');
        console.log('✅ API Key está VÁLIDA!');
        console.log('✅ Endpoints estão RESPONDENDO!');
        console.log('');
        console.log('🚀 PRÓXIMO PASSO: Integrar com Sofia IA Backend');
        
    } catch (error) {
        console.log('❌ ERRO na Evolution API:');
        console.log('========================');
        console.error('Tipo:', error.name);
        console.error('Mensagem:', error.message);
        
        if (error.response) {
            console.error('Status HTTP:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }
        
        console.log('');
        console.log('🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verificar se API Key está correta');
        console.log('2. Verificar conectividade de rede');
        console.log('3. Verificar se Evolution API está online');
        console.log('4. Tentar outros endpoints de teste');
    }
}

// Executar teste
testarEvolutionAPI();
