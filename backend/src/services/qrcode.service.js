/**
 * 🔗 SOFIA IA - QR Code Service REAL
 * Geração e gerenciamento de QR codes para WhatsApp
 * Checklist: ✅ QR codes reais gerados - IMPLEMENTANDO AGORA!
 */

const EvolutionAPIService = require('./evolution.service.js');

class QRCodeService {
    constructor() {
        this.evolutionAPI = new EvolutionAPIService();
        this.qrCodeCache = new Map(); // Cache temporário para QR codes
        this.qrCodeTimestamp = new Map(); // Timestamp para expiração
        this.QR_CODE_EXPIRY = 60000; // 1 minuto de validade
        
        console.log('🔗 QR Code Service inicializado');
        
        // Limpar cache expirado a cada 30 segundos
        setInterval(() => {
            this.cleanExpiredQRCodes();
        }, 30000);
    }

    /**
     * 📱 Gerar QR Code para uma instância específica
     */
    async generateQRCode(instanceName) {
        try {
            console.log(`🔗 Gerando QR Code para instância: ${instanceName}`);
            
            // Verificar se já existe na cache e ainda é válida
            const cachedQR = this.getCachedQRCode(instanceName);
            if (cachedQR) {
                console.log(`✅ QR Code da cache ainda válido para ${instanceName}`);
                return {
                    success: true,
                    data: {
                        instanceName: instanceName,
                        qrcode: cachedQR.qrcode,
                        status: 'cached',
                        expires_at: cachedQR.expires_at,
                        cache_hit: true
                    }
                };
            }
            
            // Tentar obter QR Code conectando a instância
            const connectResult = await this.evolutionAPI.connectInstance(instanceName);
            
            if (connectResult.success && connectResult.data.qrcode) {
                const qrCodeData = {
                    qrcode: connectResult.data.qrcode,
                    generated_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + this.QR_CODE_EXPIRY).toISOString()
                };
                
                // Salvar na cache
                this.qrCodeCache.set(instanceName, qrCodeData);
                this.qrCodeTimestamp.set(instanceName, Date.now());
                
                console.log(`✅ QR Code gerado com sucesso para ${instanceName}`);
                return {
                    success: true,
                    data: {
                        instanceName: instanceName,
                        qrcode: qrCodeData.qrcode,
                        status: 'generated',
                        generated_at: qrCodeData.generated_at,
                        expires_at: qrCodeData.expires_at,
                        cache_hit: false
                    }
                };
            } else {
                throw new Error('Falha ao obter QR Code da Evolution API');
            }
            
        } catch (error) {
            console.error(`❌ Erro ao gerar QR Code para ${instanceName}:`, error.message);
            return {
                success: false,
                error: error.message,
                instanceName: instanceName
            };
        }
    }

    /**
     * 🔄 Gerar QR Code com auto-refresh
     */
    async generateQRCodeWithRefresh(instanceName, autoRefresh = true) {
        try {
            const result = await this.generateQRCode(instanceName);
            
            if (result.success && autoRefresh) {
                // Agendar refresh automático antes da expiração
                setTimeout(async () => {
                    console.log(`🔄 Auto-refresh QR Code para ${instanceName}`);
                    await this.generateQRCode(instanceName);
                }, this.QR_CODE_EXPIRY - 10000); // 10s antes de expirar
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ Erro no QR Code com refresh:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 📱 Gerar QR Codes para múltiplas instâncias
     */
    async generateMultipleQRCodes(instanceNames) {
        try {
            console.log(`🔗 Gerando QR Codes para ${instanceNames.length} instâncias`);
            
            const results = await Promise.allSettled(
                instanceNames.map(instanceName => this.generateQRCode(instanceName))
            );
            
            const successful = [];
            const failed = [];
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    successful.push(result.value);
                } else {
                    failed.push({
                        instanceName: instanceNames[index],
                        error: result.reason || result.value?.error || 'Erro desconhecido'
                    });
                }
            });
            
            return {
                success: true,
                summary: {
                    total_requested: instanceNames.length,
                    successful: successful.length,
                    failed: failed.length
                },
                successful_qrcodes: successful,
                failed_qrcodes: failed,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`❌ Erro ao gerar múltiplos QR Codes:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🆕 Criar instância e gerar QR Code automaticamente
     */
    async createInstanceWithQRCode(instanceName, settings = {}) {
        try {
            console.log(`🆕 Criando instância ${instanceName} com QR Code automático`);
            
            // Primeiro criar a instância
            const createResult = await this.evolutionAPI.createInstance(instanceName, settings);
            
            if (!createResult.success) {
                throw new Error(`Falha ao criar instância: ${createResult.error}`);
            }
            
            // Aguardar um pouco para a instância inicializar
            await this.delay(2000);
            
            // Gerar QR Code
            const qrResult = await this.generateQRCode(instanceName);
            
            return {
                success: true,
                data: {
                    instance_created: createResult.data,
                    qrcode_generated: qrResult.success ? qrResult.data : null,
                    qrcode_error: qrResult.success ? null : qrResult.error
                },
                message: qrResult.success ? 
                    'Instância criada e QR Code gerado com sucesso' : 
                    'Instância criada, mas falha na geração do QR Code'
            };
            
        } catch (error) {
            console.error(`❌ Erro ao criar instância com QR Code:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔍 Verificar se QR Code ainda é válido
     */
    isQRCodeValid(instanceName) {
        if (!this.qrCodeCache.has(instanceName)) {
            return false;
        }
        
        const timestamp = this.qrCodeTimestamp.get(instanceName);
        const isValid = (Date.now() - timestamp) < this.QR_CODE_EXPIRY;
        
        if (!isValid) {
            this.qrCodeCache.delete(instanceName);
            this.qrCodeTimestamp.delete(instanceName);
        }
        
        return isValid;
    }

    /**
     * 🔍 Obter QR Code da cache se válido
     */
    getCachedQRCode(instanceName) {
        if (!this.isQRCodeValid(instanceName)) {
            return null;
        }
        
        return this.qrCodeCache.get(instanceName);
    }

    /**
     * 🧹 Limpar QR Codes expirados da cache
     */
    cleanExpiredQRCodes() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [instanceName, timestamp] of this.qrCodeTimestamp.entries()) {
            if ((now - timestamp) >= this.QR_CODE_EXPIRY) {
                this.qrCodeCache.delete(instanceName);
                this.qrCodeTimestamp.delete(instanceName);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 ${cleaned} QR Codes expirados removidos da cache`);
        }
        
        return cleaned;
    }

    /**
     * 📊 Obter estatísticas de QR Codes
     */
    getQRCodeStats() {
        return {
            cache_size: this.qrCodeCache.size,
            cached_instances: Array.from(this.qrCodeCache.keys()),
            total_generated: this.qrCodeTimestamp.size,
            expiry_time: this.QR_CODE_EXPIRY,
            next_cleanup: new Date(Date.now() + 30000).toISOString()
        };
    }

    /**
     * 🔄 Refresh de QR Code específico
     */
    async refreshQRCode(instanceName) {
        try {
            console.log(`🔄 Forçando refresh do QR Code para ${instanceName}`);
            
            // Remover da cache para forçar nova geração
            this.qrCodeCache.delete(instanceName);
            this.qrCodeTimestamp.delete(instanceName);
            
            // Gerar novo QR Code
            return await this.generateQRCode(instanceName);
            
        } catch (error) {
            console.error(`❌ Erro ao fazer refresh do QR Code:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 📱 Listar todas as instâncias com status de QR Code
     */
    async listInstancesWithQRStatus() {
        try {
            const instancesResult = await this.evolutionAPI.listInstances();
            
            if (!instancesResult.success) {
                throw new Error('Falha ao listar instâncias');
            }
            
            const instancesWithQR = instancesResult.data.map(instance => ({
                ...instance,
                qrcode_cached: this.qrCodeCache.has(instance.id),
                qrcode_valid: this.isQRCodeValid(instance.id),
                qrcode_expires_at: this.getCachedQRCode(instance.id)?.expires_at || null,
                needs_qr_code: instance.status === 'close' || instance.status === 'connecting'
            }));
            
            return {
                success: true,
                data: instancesWithQR,
                qr_stats: this.getQRCodeStats()
            };
            
        } catch (error) {
            console.error(`❌ Erro ao listar instâncias com QR status:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * ⏰ Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🔗 Obter QR Code como base64 image data
     */
    formatQRCodeAsDataURL(qrCode) {
        // Se já está em formato data URL, retorna como está
        if (qrCode.startsWith('data:image/')) {
            return qrCode;
        }
        
        // Se é apenas base64, adiciona o prefixo
        return `data:image/png;base64,${qrCode}`;
    }

    /**
     * 🎯 Auto-gerar QR Codes para instâncias desconectadas
     */
    async autoGenerateQRCodesForDisconnected() {
        try {
            console.log('🎯 Auto-gerando QR Codes para instâncias desconectadas');
            
            const instancesResult = await this.evolutionAPI.listInstances();
            
            if (!instancesResult.success) {
                throw new Error('Falha ao listar instâncias');
            }
            
            const disconnectedInstances = instancesResult.data
                .filter(instance => 
                    instance.status === 'close' || 
                    instance.status === 'connecting'
                )
                .map(instance => instance.id);
            
            if (disconnectedInstances.length === 0) {
                return {
                    success: true,
                    message: 'Todas as instâncias estão conectadas',
                    generated_count: 0
                };
            }
            
            const qrResults = await this.generateMultipleQRCodes(disconnectedInstances);
            
            return {
                success: true,
                message: `QR Codes auto-gerados para ${qrResults.summary.successful} instâncias`,
                data: qrResults
            };
            
        } catch (error) {
            console.error(`❌ Erro na auto-geração de QR Codes:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = QRCodeService;
