/**
 * 🧪 TESTE PRODUÇÃO ENDPOINTS WHATSAPP
 * Execute após deploy para validar todos os endpoints
 */

const testProductionWhatsApp = async () => {
    const baseUrl = 'https://sofiaia.roilabs.com.br';
    
    console.log('🧪 TESTANDO ENDPOINTS WHATSAPP EM PRODUÇÃO...\n');
    
    // 1. Testar versão da API
    try {
        const versionResponse = await fetch(`${baseUrl}/`);
        const versionData = await versionResponse.json();
        console.log(`📊 Versão API: ${versionData.version}`);
        console.log(`🎯 Deve ser: v2.1.0 ou superior\n`);
    } catch (error) {
        console.log(`❌ Erro versão: ${error.message}\n`);
    }
    
    // 2. Testar endpoints WhatsApp
    const endpoints = [
        { method: 'GET', url: '/api/whatsapp/instances', name: 'Listar Instâncias' },
        { method: 'GET', url: '/api/whatsapp/stats', name: 'Estatísticas WhatsApp' },
        { method: 'GET', url: '/api/whatsapp/instances/sofia-principal', name: 'Instância Específica' },
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${baseUrl}${endpoint.url}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
                console.log(`   URL: ${endpoint.url}`);
                console.log(`   Success: ${data.success}`);
                console.log(`   Data: ${data.data ? 'Presente' : 'Ausente'}\n`);
            } else {
                console.log(`❌ ${endpoint.name} - Status: ${response.status}`);
                const errorText = await response.text();
                console.log(`   Error: ${errorText}\n`);
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint.name} - Error: ${error.message}\n`);
        }
    }
    
    console.log('🎯 Se todos mostrarem ✅, os endpoints WhatsApp estão funcionais!');
};

// Executar teste
testProductionWhatsApp();
