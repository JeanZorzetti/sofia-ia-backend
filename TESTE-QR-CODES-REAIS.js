        // Teste 8: Gerar Múltiplos QR Codes
        await this.runTest('Gerar Múltiplos QR Codes', () => this.testGenerateMultipleQRCodes());

        // Teste 9: Criar Instância com QR Code Automático
        await this.runTest('Criar Instância com QR Code', () => this.testCreateInstanceWithQR());

        this.printResults();
    }

    printResults() {
        console.log('\n🔗 ========================================');
        console.log('📊 RESULTADOS DOS TESTES QR CODES');
        console.log('🔗 ========================================');
        console.log(`📈 Total de Testes: ${this.results.total_tests}`);
        console.log(`✅ Testes Passou: ${this.results.passed}`);
        console.log(`❌ Testes Falhou: ${this.results.failed}`);
        console.log(`📊 Taxa de Sucesso: ${((this.results.passed / this.results.total_tests) * 100).toFixed(1)}%`);

        console.log('\n📋 DETALHES DOS TESTES:');
        this.results.details.forEach((detail, index) => {
            console.log(`\n${index + 1}. ${detail.test}`);
            console.log(`   Status: ${detail.status}`);
            if (detail.error) {
                console.log(`   Erro: ${detail.error}`);
            }
            if (detail.data) {
                console.log(`   Dados: ${JSON.stringify(detail.data, null, 2)}`);
            }
        });

        console.log('\n🔗 ========================================');
        if (this.results.passed === this.results.total_tests) {
            console.log('🎉 TODOS OS TESTES PASSARAM! SISTEMA QR CODES FUNCIONANDO!');
        } else {
            console.log('⚠️ ALGUNS TESTES FALHARAM. VERIFICAR IMPLEMENTAÇÃO.');
        }
        console.log('🔗 ========================================');

        return this.results;
    }

    // Teste adicional: Validar estrutura de QR Code
    async testQRCodeStructure() {
        try {
            const instancesResponse = await axios.get(`${BASE_URL}/api/whatsapp/instances`);
            
            if (!instancesResponse.data.success || instancesResponse.data.data.length === 0) {
                return {
                    success: false,
                    error: 'Nenhuma instância disponível para teste'
                };
            }

            const instanceName = instancesResponse.data.data[0].id;
            const response = await axios.post(`${BASE_URL}/api/whatsapp/instances/${instanceName}/qrcode`);
            
            if (response.status === 200 && response.data.data?.qrcode) {
                const qrcode = response.data.data.qrcode;
                
                // Validar se é base64 ou data URL
                const isBase64 = /^[A-Za-z0-9+/=]+$/.test(qrcode.replace(/^data:image\/[a-z]+;base64,/, ''));
                const isDataURL = qrcode.startsWith('data:image/');
                
                return {
                    success: isBase64 || isDataURL,
                    data: {
                        instance_name: instanceName,
                        qrcode_length: qrcode.length,
                        is_base64: isBase64,
                        is_data_url: isDataURL,
                        qrcode_preview: qrcode.substring(0, 100) + '...'
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'QR Code não foi gerado'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    // Teste de performance: Medir tempo de geração de QR Code
    async testQRCodePerformance() {
        try {
            const instancesResponse = await axios.get(`${BASE_URL}/api/whatsapp/instances`);
            
            if (!instancesResponse.data.success || instancesResponse.data.data.length === 0) {
                return {
                    success: false,
                    error: 'Nenhuma instância disponível para teste'
                };
            }

            const instanceName = instancesResponse.data.data[0].id;
            
            const startTime = Date.now();
            const response = await axios.post(`${BASE_URL}/api/whatsapp/instances/${instanceName}/qrcode`);
            const endTime = Date.now();
            
            const responseTime = endTime - startTime;
            
            return {
                success: response.status === 200,
                data: {
                    instance_name: instanceName,
                    response_time_ms: responseTime,
                    response_time_readable: `${responseTime}ms`,
                    performance_rating: responseTime < 2000 ? 'Excelente' : 
                                       responseTime < 5000 ? 'Bom' : 
                                       responseTime < 10000 ? 'Aceitável' : 'Lento'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    // Teste completo incluindo validação e performance
    async runExtendedTests() {
        console.log('🔗 ========================================');
        console.log('🧪 INICIANDO TESTES ESTENDIDOS QR CODES');
        console.log('🔗 ========================================');

        // Executar testes básicos
        await this.runAllTests();

        console.log('\n🔍 ========================================');
        console.log('🧪 TESTES ADICIONAIS DE QUALIDADE');
        console.log('🔍 ========================================');

        // Teste adicional: Estrutura do QR Code
        await this.runTest('Validação Estrutura QR Code', () => this.testQRCodeStructure());

        // Teste adicional: Performance
        await this.runTest('Performance Geração QR Code', () => this.testQRCodePerformance());

        return this.results;
    }
}

// Função para executar testes
async function runQRCodeTests() {
    try {
        const tester = new QRCodeTester();
        
        // Verificar se o servidor está rodando
        console.log('🔌 Verificando se o servidor está online...');
        
        try {
            const healthResponse = await axios.get(`${BASE_URL}/health`);
            console.log('✅ Servidor online e funcionando!');
            console.log(`📋 Versão: ${healthResponse.data.version}`);
            console.log(`🔗 QR Code System: ${healthResponse.data.qrcode_system?.status || 'unknown'}`);
        } catch (error) {
            console.log('❌ Servidor offline ou com problemas!');
            console.log('💡 Execute: npm start no diretório do backend');
            process.exit(1);
        }

        // Executar testes estendidos
        const results = await tester.runExtendedTests();
        
        // Salvar resultados em arquivo
        const fs = require('fs');
        const resultsFile = 'qrcode-test-results.json';
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 Resultados salvos em: ${resultsFile}`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Erro durante execução dos testes:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runQRCodeTests().then(results => {
        const successRate = (results.passed / results.total_tests) * 100;
        process.exit(successRate === 100 ? 0 : 1);
    });
}

module.exports = { QRCodeTester, runQRCodeTests };