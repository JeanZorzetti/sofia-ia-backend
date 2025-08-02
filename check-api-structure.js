/**
 * 🔍 VERIFICAR ESTRUTURA REAL DA API
 */

const http = require('http');

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:8000${path}`, (res) => {
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
        req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function checkApiStructure() {
    console.log('🔍 VERIFICANDO ESTRUTURA REAL DA API');
    console.log('=====================================');
    
    try {
        const data = await testEndpoint('/api/dashboard/overview');
        console.log('✅ Resposta da API:');
        console.log(JSON.stringify(data, null, 2));
        
        console.log('\n🔍 Chaves disponíveis:');
        console.log(Object.keys(data));
        
        console.log('\n🎯 PRÓXIMO PASSO:');
        console.log('Ajustar teste baseado na estrutura real');
        
    } catch (error) {
        console.log(`❌ ERRO: ${error.message}`);
    }
}

checkApiStructure();