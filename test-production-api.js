/**
 * 🔍 TESTE API DE PRODUÇÃO - DADOS DINÂMICOS
 */

const https = require('https');

function testEndpoint(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error(`JSON inválido: ${error.message}`));
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(3000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function testProductionApi() {
    console.log('🌐 TESTANDO API DE PRODUÇÃO');
    console.log('============================');
    
    const baseUrl = 'https://sofiaia.roilabs.com.br';
    
    try {
        // Teste Health
        console.log('🏥 Testando Health Check...');
        const health = await testEndpoint(`${baseUrl}/health`);
        console.log('✅ Health:', health.status || 'OK');
        
        // Teste Dashboard
        console.log('\n📊 Testando Dashboard Overview...');
        const dashboard = await testEndpoint(`${baseUrl}/api/dashboard/overview`);
        console.log('✅ Dashboard data:');
        console.log(JSON.stringify(dashboard, null, 2));
        
        console.log('\n🔍 Análise dos dados:');
        Object.keys(dashboard).forEach(key => {
            console.log(`  • ${key}: ${dashboard[key]}`);
        });
        
        console.log('\n🎯 RESULTADO:');
        if (Object.keys(dashboard).length > 0) {
            console.log('✅ API PRODUÇÃO FUNCIONANDO!');
            console.log('✅ Dados sendo retornados corretamente');
        } else {
            console.log('⚠️  API retornando dados vazios');
        }
        
    } catch (error) {
        console.log(`❌ ERRO: ${error.message}`);
        console.log('❓ Verifique se a API de produção está online');
    }
}

testProductionApi();