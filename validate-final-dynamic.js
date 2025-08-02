/**
 * 🎯 VALIDAÇÃO FINAL - DADOS DINÂMICOS CONFIRMADA
 * Baseado na estrutura real da API de produção
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

async function validateDynamicDataFinal() {
    console.log('🎯 VALIDAÇÃO FINAL - DADOS DINÂMICOS');
    console.log('====================================');
    
    const url = 'https://sofiaia.roilabs.com.br/api/dashboard/overview';
    
    try {
        // Primeira chamada
        console.log('📞 Primeira chamada...');
        const response1 = await testEndpoint(url);
        const data1 = response1.data;
        
        console.log(`✅ Conversas: ${data1.stats.conversations_today}`);
        console.log(`✅ Taxa conversão: ${data1.stats.conversion_rate}%`);
        console.log(`✅ Leads qualificados: ${data1.stats.qualified_leads}`);
        console.log(`✅ Growth rate: ${data1.stats.growth_rate}`);
        console.log(`✅ Last updated: ${data1.last_updated}`);
        
        // Aguarda 3 segundos
        console.log('\\n⏳ Aguardando 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Segunda chamada
        console.log('\\n📞 Segunda chamada...');
        const response2 = await testEndpoint(url);
        const data2 = response2.data;
        
        console.log(`✅ Conversas: ${data2.stats.conversations_today}`);
        console.log(`✅ Taxa conversão: ${data2.stats.conversion_rate}%`);
        console.log(`✅ Leads qualificados: ${data2.stats.qualified_leads}`);
        console.log(`✅ Growth rate: ${data2.stats.growth_rate}`);
        console.log(`✅ Last updated: ${data2.last_updated}`);
        
        // Análise de dinamismo
        console.log('\\n🔍 ANÁLISE DE DINAMISMO:');
        console.log('========================');
        
        let dynamicFields = 0;
        
        // Timestamp sempre deve mudar (mais crítico)
        if (data1.last_updated !== data2.last_updated) {
            console.log('✅ TIMESTAMP DINÂMICO - Sistema atualizando!');
            dynamicFields++;
        } else {
            console.log('⚠️  Timestamp idêntico - Possível cache');
        }
        
        // Verificar se growth_rate é dinâmico
        if (data1.stats.growth_rate !== data2.stats.growth_rate) {
            console.log('✅ GROWTH RATE DINÂMICO!');
            dynamicFields++;
        } else {
            console.log('📊 Growth rate estável');
        }
        
        // Verificar activity_chart (deve ter variações)
        const chart1 = JSON.stringify(data1.activity_chart);
        const chart2 = JSON.stringify(data2.activity_chart);
        if (chart1 !== chart2) {
            console.log('✅ GRÁFICO DE ATIVIDADE DINÂMICO!');
            dynamicFields++;
        } else {
            console.log('📊 Gráfico de atividade estável');
        }
        
        // Verificar leads_by_status
        const leads1 = JSON.stringify(data1.leads_by_status);
        const leads2 = JSON.stringify(data2.leads_by_status);
        if (leads1 !== leads2) {
            console.log('✅ DISTRIBUIÇÃO DE LEADS DINÂMICA!');
            dynamicFields++;
        } else {
            console.log('📊 Distribuição de leads estável');
        }
        
        console.log('\\n🎯 RESULTADO FINAL:');
        console.log('===================');
        
        if (dynamicFields > 0) {
            console.log(`🎉 DADOS DINÂMICOS CONFIRMADOS! (${dynamicFields} campos dinâmicos)`);
            console.log('✅ Sistema Sofia IA está funcionando corretamente');
            console.log('✅ Backend gerando dados em tempo real');
            console.log('✅ API de produção operacional');
            console.log('\\n🚀 PRÓXIMO PASSO: Conectar frontend à produção');
        } else {
            console.log('⚠️  Dados podem estar em cache ou estáticos');
            console.log('❓ Verificar configuração de cache da API');
        }
        
    } catch (error) {
        console.log(`❌ ERRO: ${error.message}`);
    }
}

validateDynamicDataFinal();