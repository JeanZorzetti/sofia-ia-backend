/**
 * 🧪 TESTE DOS NOVOS ENDPOINTS WHATSAPP - Sofia IA
 */

const http = require('http');

// Função para testar endpoint
function testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        data: result
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();

        // Timeout
        setTimeout(() => {
            req.destroy();
            reject(new Error('Timeout'));
        }, 5000);
    });
}

async function testarEndpoints() {
    console.log('🧪 ===== TESTANDO ENDPOINTS WHATSAPP SOFIA IA =====\n');

    // Teste 1: Health Check
    console.log('🧪 Teste 1: Health Check');
    try {
        const result = await testEndpoint('/health');
        console.log('✅ Status:', result.status);
        console.log('📱 WhatsApp Status:', result.data.whatsapp_status);
        console.log('🔢 Version:', result.data.version);
        console.log('');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('');
    }

    // Teste 2: Listar Instâncias WhatsApp
    console.log('🧪 Teste 2: Listar Instâncias WhatsApp');
    try {
        const result = await testEndpoint('/api/whatsapp/instances');
        console.log('✅ Status:', result.status);
        console.log('📱 Total Instâncias:', result.data.data.length);
        console.log('📊 Stats:', result.data.stats);
        result.data.data.forEach((instance, i) => {
            console.log(`  ${i+1}. ${instance.name} (${instance.status})`);
        });
        console.log('');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('');
    }

    // Teste 3: Criar Nova Instância
    console.log('🧪 Teste 3: Criar Nova Instância');
    try {
        const result = await testEndpoint('/api/whatsapp/instances', 'POST', {
            name: 'Sofia Teste'
        });
        console.log('✅ Status:', result.status);
        console.log('📱 Nova Instância:', result.data.data.name);
        console.log('🆔 ID:', result.data.data.id);
        console.log('📄 Mensagem:', result.data.message);
        console.log('');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('');
    }

    // Teste 4: Obter QR Code
    console.log('🧪 Teste 4: Obter QR Code');
    try {
        const result = await testEndpoint('/api/whatsapp/instances/sofia-backup/qr');
        console.log('✅ Status:', result.status);
        console.log('📱 QR Code Length:', result.data.data.qr_code.length);
        console.log('⏰ Expires in:', result.data.data.expires_in, 'segundos');
        console.log('📋 Instruções:', result.data.data.instructions.length, 'passos');
        console.log('');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('');
    }

    // Teste 5: Estatísticas WhatsApp
    console.log('🧪 Teste 5: Estatísticas WhatsApp');
    try {
        const result = await testEndpoint('/api/whatsapp/stats');
        console.log('✅ Status:', result.status);
        console.log('📱 Total Instâncias:', result.data.data.total_instances);
        console.log('🟢 Conectadas:', result.data.data.connected);
        console.log('🔴 Desconectadas:', result.data.data.disconnected);
        console.log('📊 Uptime:', result.data.data.uptime_percentage + '%');
        console.log('');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('');
    }

    console.log('🧪 ===== TESTES CONCLUÍDOS =====');
}

// Executar testes
testarEndpoints().catch(console.error);
