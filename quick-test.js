/**
 * 🧪 TESTE RÁPIDO DOS ENDPOINTS - APENAS UM POR VEZ
 */

const http = require('http');

async function testSingleEndpoint(path) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const url = `http://localhost:8000${path}`;
        
        console.log(`🧪 Testando: ${path}`);
        
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`✅ SUCESSO - ${responseTime}ms - Status: ${res.statusCode}`);
                        console.log(`📊 Dados: ${Object.keys(jsonData).join(', ')}`);
                        resolve(true);
                    } catch (error) {
                        console.log(`❌ JSON inválido - ${responseTime}ms`);
                        resolve(false);
                    }
                } else {
                    console.log(`❌ Status: ${res.statusCode} - ${responseTime}ms`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ERRO: ${error.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`❌ TIMEOUT`);
            resolve(false);
        });
    });
}

async function quickTest() {
    console.log('🚀 TESTE RÁPIDO DOS ENDPOINTS PRINCIPAIS');
    console.log('========================================');
    
    const endpoints = [
        '/',
        '/health',
        '/api/dashboard/overview',
        '/api/leads',
        '/api/conversations/recent'
    ];
    
    let passed = 0;
    
    for (const endpoint of endpoints) {
        const success = await testSingleEndpoint(endpoint);
        if (success) passed++;
        console.log(''); // linha em branco
        
        // Pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('========================================');
    console.log(`📊 RESULTADO: ${passed}/${endpoints.length} endpoints funcionando`);
    
    if (passed === endpoints.length) {
        console.log('🎉 TODOS OS ENDPOINTS ESTÃO FUNCIONANDO!');
    } else {
        console.log('⚠️  Alguns endpoints falharam.');
    }
}

quickTest();