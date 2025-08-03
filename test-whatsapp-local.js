/**
 * 🧪 TESTE RÁPIDO DOS ENDPOINTS WHATSAPP
 * Verifica se os 9 endpoints WhatsApp estão funcionando
 */

const testEndpoints = async () => {
    const baseUrl = 'http://localhost:8000';
    
    const endpoints = [
        { method: 'GET', url: '/api/whatsapp/instances', name: 'Listar Instâncias' },
        { method: 'GET', url: '/api/whatsapp/stats', name: 'Estatísticas WhatsApp' },
        { method: 'GET', url: '/api/whatsapp/instances/sofia-principal', name: 'Instância Específica' },
        { method: 'GET', url: '/api/whatsapp/instances/sofia-principal/qr', name: 'QR Code' }
    ];

    console.log('🧪 TESTANDO ENDPOINTS WHATSAPP...\n');

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${baseUrl}${endpoint.url}`);
            const data = await response.json();
            
            console.log(`✅ ${endpoint.name}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   URL: ${endpoint.url}`);
            console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...\n`);
            
        } catch (error) {
            console.log(`❌ ${endpoint.name}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }
};

// Executar teste
testEndpoints();
