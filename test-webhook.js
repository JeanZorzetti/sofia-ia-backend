/**
 * 🧪 TESTE WEBHOOK N8N - LAIS IA
 */

const https = require('https');

async function testWebhook() {
    console.log('🧪 Testando webhook N8N...');
    
    const leadData = {
        name: 'João Teste',
        phone: '11999887766',
        email: '11999887766@whatsapp.com',
        source: 'LAIS IA WhatsApp Teste',
        qualification_score: 85,
        original_message: 'Oi, preciso de um apartamento de 2 quartos na Zona Sul, orçamento até 500 mil',
        created_at: new Date().toISOString(),
        notes: 'Lead AUTO-qualificado via LAIS IA - Score: 85/100'
    };

    const payload = JSON.stringify(leadData);
    
    const options = {
        hostname: 'n8n.roilabs.com.br',
        port: 443,
        path: '/webhook/lais-lead-qualified',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`\n📊 Status: ${res.statusCode}`);
                console.log(`📤 Response: ${responseData}`);
                
                if (res.statusCode === 200) {
                    console.log('✅ Webhook funcionando corretamente!');
                    resolve({ success: true, data: responseData });
                } else {
                    console.log('❌ Erro no webhook');
                    reject(new Error(`N8N Error: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Erro de conexão:', error.message);
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

// Executar teste
testWebhook()
    .then(() => {
        console.log('\n🎯 Teste concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Teste falhou:', error.message);
        process.exit(1);
    });
