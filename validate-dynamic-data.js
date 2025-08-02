/**
 * 🔍 VALIDAÇÃO DE DADOS DINÂMICOS
 * Testa se os dados do dashboard mudam entre chamadas
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
        req.setTimeout(3000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function validateDynamicData() {
    console.log('🔍 VALIDANDO DADOS DINÂMICOS DO DASHBOARD');
    console.log('==========================================');
    
    try {
        // Primeira chamada
        console.log('📞 Primeira chamada...');
        const data1 = await testEndpoint('/api/dashboard/overview');
        console.log(`✅ Conversas: ${data1.conversationsToday}`);
        console.log(`✅ Taxa conversão: ${data1.conversionRate}%`);
        console.log(`✅ Leads qualificados: ${data1.qualifiedLeads}`);
        
        // Aguarda 2 segundos
        console.log('\n⏳ Aguardando 2 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Segunda chamada
        console.log('📞 Segunda chamada...');
        const data2 = await testEndpoint('/api/dashboard/overview');
        console.log(`✅ Conversas: ${data2.conversationsToday}`);
        console.log(`✅ Taxa conversão: ${data2.conversionRate}%`);
        console.log(`✅ Leads qualificados: ${data2.qualifiedLeads}`);
        
        // Comparação
        console.log('\n🔍 ANÁLISE DE DINAMISMO:');
        console.log('========================');
        
        let differences = 0;
        
        if (data1.conversationsToday !== data2.conversationsToday) {
            console.log('✅ Conversas DINÂMICAS - Valores diferentes!');
            differences++;
        } else {
            console.log('⚠️  Conversas ESTÁTICAS - Mesmo valor');
        }
        
        if (data1.conversionRate !== data2.conversionRate) {
            console.log('✅ Taxa conversão DINÂMICA - Valores diferentes!');
            differences++;
        } else {
            console.log('⚠️  Taxa conversão ESTÁTICA - Mesmo valor');
        }
        
        if (data1.qualifiedLeads !== data2.qualifiedLeads) {
            console.log('✅ Leads qualificados DINÂMICOS - Valores diferentes!');
            differences++;
        } else {
            console.log('⚠️  Leads qualificados ESTÁTICOS - Mesmo valor');
        }
        
        // Verifica se existe timestamp ou campo que muda
        if (data1.timestamp && data2.timestamp && data1.timestamp !== data2.timestamp) {
            console.log('✅ Timestamp DINÂMICO - Sistema atualizando!');
            differences++;
        }
        
        console.log('\n🎯 RESULTADO FINAL:');
        console.log('===================');
        
        if (differences > 0) {
            console.log(`🎉 DADOS DINÂMICOS CONFIRMADOS! (${differences} campos mudaram)`);
            console.log('✅ Sistema está gerando dados em tempo real');
        } else {
            console.log('⚠️  POSSÍVEIS DADOS HARDCODED - Nenhum campo mudou');
            console.log('❓ Verifique se o backend está simulando corretamente');
        }
        
    } catch (error) {
        console.log(`❌ ERRO: ${error.message}`);
    }
}

validateDynamicData();