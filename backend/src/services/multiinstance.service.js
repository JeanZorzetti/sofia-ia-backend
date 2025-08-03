/**
 * 📱 SOFIA IA - Multi-Instance Management Service
 * Sistema completo para gerenciar múltiplas instâncias WhatsApp simultaneamente
 * Checklist: Multi-instâncias funcionando ✅ IMPLEMENTANDO!
 */

const EvolutionAPIService = require('./evolution.service.js');

class MultiInstanceService {
    constructor() {
        this.evolutionAPI = new EvolutionAPIService();
        this.instances = new Map(); // Cache local das instâncias
        this.monitoringInterval = null;
        this.lastUpdate = null;
        
        console.log('📱 Multi-Instance Service inicializado');
        
        // Iniciar monitoramento automático
        this.startMonitoring();
    }

    // 🔄 Sincronizar com Evolution API
    async syncWithEvolutionAPI() {
        try {
            console.log('🔄 Sincronizando instâncias com Evolution API...');
            
            const result = await this.evolutionAPI.listInstances();
            
            if (!result.success) {
                throw new Error('Falha ao listar instâncias da Evolution API');
            }
            
            // Atualizar cache local
            this.instances.clear();
            
            for (const instance of result.data) {
                this.instances.set(instance.id, {
                    ...instance,
                    last_seen: new Date().toISOString(),
                    managed_by_sofia: true,
                    health_status: this.calculateHealthStatus(instance),
                    performance_metrics: {
                        uptime: this.calculateUptime(instance.createdAt),
                        message_rate: this.calculateMessageRate(instance),
                        connection_stability: this.calculateConnectionStability(instance)
                    }
                });
            }
            
            this.lastUpdate = new Date().toISOString();
            
            console.log(`✅ ${this.instances.size} instâncias sincronizadas`);
            return {
                success: true,
                total_instances: this.instances.size,
                last_update: this.lastUpdate
            };
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📊 Calcular status de saúde da instância
    calculateHealthStatus(instance) {
        const factors = {
            connection: instance.status === 'open' ? 100 : 0,
            messages: Math.min((instance.messagesCount || 0) / 10, 100),
            uptime: this.calculateUptime(instance.createdAt) > 3600 ? 100 : 50,
            errors: 100 // Assumir sem erros por enquanto
        };
        
        const overall = (factors.connection + factors.messages + factors.uptime + factors.errors) / 4;
        
        if (overall >= 80) return 'excellent';
        if (overall >= 60) return 'good';
        if (overall >= 40) return 'warning';
        return 'critical';
    }

    // ⏱️ Calcular uptime em segundos
    calculateUptime(createdAt) {
        if (!createdAt) return 0;
        return Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    }

    // 📈 Calcular taxa de mensagens
    calculateMessageRate(instance) {
        const uptime = this.calculateUptime(instance.createdAt);
        if (uptime === 0) return 0;
        return ((instance.messagesCount || 0) / uptime * 3600).toFixed(2); // mensagens/hora
    }

    // 🔗 Calcular estabilidade da conexão
    calculateConnectionStability(instance) {
        // Simulação baseada no status atual
        if (instance.status === 'open') return 95;
        if (instance.status === 'connecting') return 50;
        return 10;
    }

    // 📋 Listar todas as instâncias gerenciadas
    async listManagedInstances() {
        await this.syncWithEvolutionAPI();
        
        const instancesList = Array.from(this.instances.values()).map(instance => ({
            id: instance.id,
            name: instance.name,
            status: instance.status,
            phone: instance.phone,
            health_status: instance.health_status,
            performance_metrics: instance.performance_metrics,
            created_at: instance.createdAt,
            last_seen: instance.last_seen,
            messages_count: instance.messagesCount || 0,
            contacts_count: instance.contactsCount || 0,
            chats_count: instance.chatsCount || 0
        }));
        
        return {
            success: true,
            data: instancesList,
            total: instancesList.length,
            summary: this.generateSummary(instancesList),
            last_update: this.lastUpdate
        };
    }

    // 📊 Gerar resumo das instâncias
    generateSummary(instances) {
        const summary = {
            total: instances.length,
            by_status: {
                connected: instances.filter(i => i.status === 'open').length,
                disconnected: instances.filter(i => i.status === 'close').length,
                connecting: instances.filter(i => i.status === 'connecting').length
            },
            by_health: {
                excellent: instances.filter(i => i.health_status === 'excellent').length,
                good: instances.filter(i => i.health_status === 'good').length,
                warning: instances.filter(i => i.health_status === 'warning').length,
                critical: instances.filter(i => i.health_status === 'critical').length
            },
            total_messages: instances.reduce((sum, i) => sum + (i.messages_count || 0), 0),
            total_contacts: instances.reduce((sum, i) => sum + (i.contacts_count || 0), 0),
            total_chats: instances.reduce((sum, i) => sum + (i.chats_count || 0), 0)
        };
        
        return summary;
    }

    // 🆕 Criar múltiplas instâncias simultaneamente
    async createMultipleInstances(instancesConfig) {
        console.log(`🆕 Criando ${instancesConfig.length} instâncias simultaneamente...`);
        
        const results = [];
        
        // Processar em paralelo com limite de 3 simultâneas
        const batchSize = 3;
        for (let i = 0; i < instancesConfig.length; i += batchSize) {
            const batch = instancesConfig.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (config) => {
                try {
                    const result = await this.evolutionAPI.createInstance(config.name, config.settings);
                    return {
                        name: config.name,
                        success: result.success,
                        data: result.data,
                        error: result.error || null
                    };
                } catch (error) {
                    return {
                        name: config.name,
                        success: false,
                        error: error.message
                    };
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Aguardar um pouco entre batches para não sobrecarregar
            if (i + batchSize < instancesConfig.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`✅ Criação concluída: ${successful} sucessos, ${failed} falhas`);
        
        // Sincronizar após criação
        await this.syncWithEvolutionAPI();
        
        return {
            success: true,
            results: results,
            summary: {
                total_requested: instancesConfig.length,
                successful: successful,
                failed: failed,
                success_rate: ((successful / instancesConfig.length) * 100).toFixed(1) + '%'
            }
        };
    }

    // 🔗 Conectar múltiplas instâncias simultaneamente
    async connectMultipleInstances(instanceNames) {
        console.log(`🔗 Conectando ${instanceNames.length} instâncias simultaneamente...`);
        
        const connectPromises = instanceNames.map(async (instanceName) => {
            try {
                const result = await this.evolutionAPI.connectInstance(instanceName);
                return {
                    instance: instanceName,
                    success: result.success,
                    qrcode: result.data?.qrcode || null,
                    error: result.error || null
                };
            } catch (error) {
                return {
                    instance: instanceName,
                    success: false,
                    error: error.message
                };
            }
        });
        
        const results = await Promise.all(connectPromises);
        const successful = results.filter(r => r.success).length;
        
        console.log(`✅ Conexão concluída: ${successful}/${instanceNames.length} sucessos`);
        
        return {
            success: true,
            results: results,
            summary: {
                total_requested: instanceNames.length,
                successful: successful,
                failed: instanceNames.length - successful
            }
        };
    }

    // ❌ Desconectar múltiplas instâncias
    async disconnectMultipleInstances(instanceNames) {
        console.log(`❌ Desconectando ${instanceNames.length} instâncias...`);
        
        const disconnectPromises = instanceNames.map(async (instanceName) => {
            try {
                const result = await this.evolutionAPI.disconnectInstance(instanceName);
                return {
                    instance: instanceName,
                    success: result.success,
                    error: result.error || null
                };
            } catch (error) {
                return {
                    instance: instanceName,
                    success: false,
                    error: error.message
                };
            }
        });
        
        const results = await Promise.all(disconnectPromises);
        const successful = results.filter(r => r.success).length;
        
        console.log(`✅ Desconexão concluída: ${successful}/${instanceNames.length} sucessos`);
        
        return {
            success: true,
            results: results,
            summary: {
                total_requested: instanceNames.length,
                successful: successful,
                failed: instanceNames.length - successful
            }
        };
    }

    // 🗑️ Deletar múltiplas instâncias
    async deleteMultipleInstances(instanceNames) {
        console.log(`🗑️ Deletando ${instanceNames.length} instâncias...`);
        
        const deletePromises = instanceNames.map(async (instanceName) => {
            try {
                const result = await this.evolutionAPI.deleteInstance(instanceName);
                return {
                    instance: instanceName,
                    success: result.success,
                    error: result.error || null
                };
            } catch (error) {
                return {
                    instance: instanceName,
                    success: false,
                    error: error.message
                };
            }
        });
        
        const results = await Promise.all(deletePromises);
        const successful = results.filter(r => r.success).length;
        
        console.log(`✅ Deleção concluída: ${successful}/${instanceNames.length} sucessos`);
        
        // Remover do cache local
        instanceNames.forEach(name => {
            this.instances.delete(name);
        });
        
        return {
            success: true,
            results: results,
            summary: {
                total_requested: instanceNames.length,
                successful: successful,
                failed: instanceNames.length - successful
            }
        };
    }

    // 📊 Health check de todas as instâncias
    async healthCheckAllInstances() {
        console.log('📊 Executando health check de todas as instâncias...');
        
        await this.syncWithEvolutionAPI();
        
        const healthResults = [];
        
        for (const [instanceId, instance] of this.instances) {
            const health = {
                instance_id: instanceId,
                name: instance.name,
                status: instance.status,
                health_score: this.calculateHealthScore(instance),
                uptime: this.calculateUptime(instance.createdAt),
                last_activity: instance.last_seen,
                issues: this.detectIssues(instance)
            };
            
            healthResults.push(health);
        }
        
        return {
            success: true,
            data: healthResults,
            overall_health: this.calculateOverallHealth(healthResults),
            timestamp: new Date().toISOString()
        };
    }

    // 🎯 Calcular score de saúde numérico
    calculateHealthScore(instance) {
        const factors = {
            connection: instance.status === 'open' ? 25 : 0,
            activity: Math.min((instance.messagesCount || 0) / 50, 25),
            uptime: Math.min(this.calculateUptime(instance.createdAt) / 86400, 25), // Max 1 dia
            stability: 25 // Assumir estável por enquanto
        };
        
        return Math.round(factors.connection + factors.activity + factors.uptime + factors.stability);
    }

    // 🚨 Detectar problemas na instância
    detectIssues(instance) {
        const issues = [];
        
        if (instance.status === 'close') {
            issues.push({ type: 'connection', severity: 'high', message: 'Instância desconectada' });
        }
        
        if ((instance.messagesCount || 0) === 0) {
            issues.push({ type: 'activity', severity: 'medium', message: 'Nenhuma mensagem processada' });
        }
        
        const uptime = this.calculateUptime(instance.createdAt);
        if (uptime < 300) { // Menos de 5 minutos
            issues.push({ type: 'stability', severity: 'low', message: 'Instância muito nova' });
        }
        
        return issues;
    }

    // 📈 Calcular saúde geral do sistema
    calculateOverallHealth(healthResults) {
        if (healthResults.length === 0) return 0;
        
        const totalScore = healthResults.reduce((sum, h) => sum + h.health_score, 0);
        const averageScore = totalScore / healthResults.length;
        
        return {
            score: Math.round(averageScore),
            status: averageScore >= 80 ? 'excellent' : 
                   averageScore >= 60 ? 'good' : 
                   averageScore >= 40 ? 'warning' : 'critical',
            total_instances: healthResults.length,
            healthy_instances: healthResults.filter(h => h.health_score >= 60).length
        };
    }

    // 🎯 Balanceador de carga - encontrar melhor instância
    findBestInstance(criteria = 'health') {
        const instances = Array.from(this.instances.values());
        const connectedInstances = instances.filter(i => i.status === 'open');
        
        if (connectedInstances.length === 0) {
            return null;
        }
        
        switch (criteria) {
            case 'health':
                return connectedInstances.reduce((best, current) => 
                    this.calculateHealthScore(current) > this.calculateHealthScore(best) ? current : best
                );
            
            case 'load':
                return connectedInstances.reduce((best, current) => 
                    (current.messagesCount || 0) < (best.messagesCount || 0) ? current : best
                );
            
            case 'uptime':
                return connectedInstances.reduce((best, current) => 
                    this.calculateUptime(current.createdAt) > this.calculateUptime(best.createdAt) ? current : best
                );
            
            default:
                return connectedInstances[Math.floor(Math.random() * connectedInstances.length)];
        }
    }

    // 🔄 Iniciar monitoramento automático
    startMonitoring(intervalMs = 60000) { // 1 minuto
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        console.log(`🔄 Monitoramento automático iniciado (${intervalMs/1000}s)`);
        
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.syncWithEvolutionAPI();
                console.log(`🔄 Monitoramento: ${this.instances.size} instâncias atualizadas`);
            } catch (error) {
                console.error('❌ Erro no monitoramento automático:', error.message);
            }
        }, intervalMs);
    }

    // ⏹️ Parar monitoramento
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('⏹️ Monitoramento automático parado');
        }
    }

    // 📊 Obter estatísticas do sistema multi-instâncias
    getSystemStats() {
        const instances = Array.from(this.instances.values());
        
        return {
            total_instances: instances.length,
            connected_instances: instances.filter(i => i.status === 'open').length,
            monitoring_active: this.monitoringInterval !== null,
            last_sync: this.lastUpdate,
            system_uptime: process.uptime(),
            memory_usage: process.memoryUsage(),
            performance_summary: {
                total_messages: instances.reduce((sum, i) => sum + (i.messagesCount || 0), 0),
                total_contacts: instances.reduce((sum, i) => sum + (i.contactsCount || 0), 0),
                avg_health_score: instances.length > 0 ? 
                    instances.reduce((sum, i) => sum + this.calculateHealthScore(i), 0) / instances.length : 0
            }
        };
    }
}

module.exports = MultiInstanceService;
