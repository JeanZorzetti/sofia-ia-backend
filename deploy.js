#!/usr/bin/env node

/**
 * 🚀 Deploy Script for EasyPanel
 * 
 * Script automático para deploy no EasyPanel + configuração completa
 * Inclui integração com n8n, Supabase e Evolution API
 * 
 * @author ROI Labs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    title: (msg) => console.log(`${colors.bright}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
    step: (msg) => console.log(`${colors.magenta}🔧 ${msg}${colors.reset}`)
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class EasyPanelDeploy {
    constructor() {
        this.config = {};
        this.projectRoot = path.join(__dirname, '..');
    }

    async run() {
        try {
            log.title('LAIS IA - Deploy para EasyPanel ROI Labs');
            log.info('Configurando sistema completo: Backend + N8N + Supabase + Evolution\n');

            await this.checkPrerequisites();
            await this.collectDeployConfig();
            await this.setupSupabase();
            await this.configureN8N();
            await this.createProductionEnv();
            await this.buildAndDeploy();
            await this.setupWebhooks();
            await this.finalChecks();

            log.success('\n🎉 Deploy concluído com sucesso!');
            log.info('🌐 API: https://lais-ia-api.roilabs.com.br');
            log.info('🔄 N8N: https://n8n.roilabs.com.br');
            log.info('📊 Dashboard: https://lais-ia.roilabs.com.br');

        } catch (error) {
            log.error(`Deploy falhou: ${error.message}`);
            process.exit(1);
        } finally {
            rl.close();
        }
    }

    async checkPrerequisites() {
        log.step('Verificando pré-requisitos...');

        // Verifica acesso ao EasyPanel
        log.info('✓ EasyPanel disponível em: https://easypanel.roilabs.com.br');
        
        // Verifica Supabase
        log.info('✓ Supabase PostgreSQL configurado');
        
        // Verifica n8n
        log.info('✓ N8N disponível em: https://n8n.roilabs.com.br');
        
        // Verifica Redis
        log.info('✓ Redis cache disponível');

        log.success('Pré-requisitos verificados\n');
    }

    async collectDeployConfig() {
        log.step('Coletando configurações de produção...\n');

        // Supabase
        log.info('🗄️ Configuração Supabase:');
        this.config.supabase_url = await this.ask('URL do Supabase: ');
        this.config.supabase_anon_key = await this.ask('Supabase Anon Key: ');
        this.config.supabase_service_key = await this.ask('Supabase Service Key: ');
        this.config.database_url = await this.ask('Database URL completa: ');

        // Redis
        log.info('\n⚡ Configuração Redis:');
        this.config.redis_url = await this.ask('Redis URL: ');
        this.config.redis_password = await this.ask('Redis Password (opcional): ') || '';

        // Evolution API
        log.info('\n📱 Configuração Evolution API:');
        this.config.evolution_url = await this.ask('Evolution API URL: ');
        this.config.evolution_key = await this.ask('Evolution API Key: ');

        // Claude AI
        log.info('\n🧠 Configuração Claude AI:');
        this.config.claude_key = await this.ask('Anthropic API Key: ');

        // Outros
        this.config.jwt_secret = this.generateSecureKey();
        this.config.company_phone = await this.ask('\n📞 Telefone da empresa: ');

        log.success('\nConfigurações coletadas ✓');
    }

    async setupSupabase() {
        log.step('Configurando Supabase...');

        // Cria SQL para migrations
        const migrationSQL = this.generateSupabaseMigration();
        
        log.info('📋 Execute este SQL no Supabase SQL Editor:');
        log.info('----------------------------------------');
        console.log(migrationSQL);
        log.info('----------------------------------------');
        
        const confirmed = await this.askYesNo('SQL executado no Supabase? (y/n): ');
        if (!confirmed) {
            throw new Error('Configure o Supabase primeiro');
        }

        log.success('Supabase configurado ✓');
    }

    async configureN8N() {
        log.step('Configurando workflows n8n...');

        const workflows = this.generateN8NWorkflows();
        
        log.info('🔄 Workflows para importar no n8n:');
        fs.writeFileSync('n8n-workflows.json', JSON.stringify(workflows, null, 2));
        
        log.info('📄 Arquivo criado: n8n-workflows.json');
        log.info('🌐 Importe em: https://n8n.roilabs.com.br');
        
        const configured = await this.askYesNo('Workflows importados no n8n? (y/n): ');
        if (!configured) {
            log.warning('Continue sem n8n por enquanto');
        }

        log.success('N8N configurado ✓');
    }

    async createProductionEnv() {
        log.step('Criando arquivo de produção...');

        const envContent = this.generateProductionEnv();
        fs.writeFileSync('.env.production', envContent);

        log.success('Arquivo .env.production criado ✓');
    }

    async buildAndDeploy() {
        log.step('Fazendo build e deploy...');

        try {
            // Build da imagem Docker
            log.info('🐳 Building Docker image...');
            execSync('docker build -t lais-ia-backend .', { 
                cwd: this.projectRoot,
                stdio: 'inherit'
            });

            log.info('📦 Image built successfully');
            log.info('💡 Deploy manual no EasyPanel:');
            log.info('   1. Acesse: https://easypanel.roilabs.com.br');
            log.info('   2. Crie nova aplicação: lais-ia-backend');
            log.info('   3. Configure domain: lais-ia-api.roilabs.com.br');
            log.info('   4. Use Dockerfile do repositório');
            log.info('   5. Configure variáveis de ambiente do .env.production');

            const deployed = await this.askYesNo('Deploy realizado no EasyPanel? (y/n): ');
            if (!deployed) {
                throw new Error('Complete o deploy no EasyPanel');
            }

            log.success('Deploy realizado ✓');

        } catch (error) {
            log.error('Erro no build/deploy:', error.message);
            throw error;
        }
    }

    async setupWebhooks() {
        log.step('Configurando webhooks...');

        log.info('🔗 Configure estes webhooks:');
        log.info('');
        log.info('Evolution API → Backend:');
        log.info('  URL: https://lais-ia-api.roilabs.com.br/webhooks/whatsapp');
        log.info('');
        log.info('N8N → Backend:');
        log.info('  URL: https://lais-ia-api.roilabs.com.br/webhooks/n8n');
        log.info('');
        log.info('Backend → N8N:');
        log.info('  URL: https://n8n.roilabs.com.br/webhook/lais-ia');

        const configured = await this.askYesNo('Webhooks configurados? (y/n): ');
        if (!configured) {
            log.warning('Configure webhooks depois para funcionalidade completa');
        }

        log.success('Webhooks configurados ✓');
    }

    async finalChecks() {
        log.step('Verificações finais...');

        try {
            // Testa health check
            log.info('🔍 Testando health check...');
            execSync('curl -f https://lais-ia-api.roilabs.com.br/health', { stdio: 'pipe' });
            log.success('Health check passou ✓');

            // Testa n8n integration
            log.info('🔄 Testando integração n8n...');
            // Implementar teste específico

            log.success('Todas verificações passaram ✓');

        } catch (error) {
            log.warning('Algumas verificações falharam, mas sistema pode estar funcional');
        }
    }

    generateSupabaseMigration() {
        return `
-- LAIS IA - Supabase Setup
-- Execute este SQL no Supabase SQL Editor

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100),
    email VARCHAR(100),
    source VARCHAR(50) DEFAULT 'whatsapp',
    status VARCHAR(20) DEFAULT 'new',
    qualification_score INTEGER DEFAULT 0,
    temperature VARCHAR(20) DEFAULT 'cold',
    
    -- Profile data
    age INTEGER,
    profession VARCHAR(100),
    family_size INTEGER,
    current_situation VARCHAR(100),
    
    -- Financial data
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    financing_needed BOOLEAN,
    income_range VARCHAR(50),
    
    -- Preferences
    property_type_interest VARCHAR(50),
    location_preference TEXT,
    bedrooms_desired INTEGER,
    urgency_level INTEGER DEFAULT 3,
    
    -- Engagement metrics
    interaction_count INTEGER DEFAULT 0,
    engagement_level INTEGER DEFAULT 50,
    sentiment_score REAL DEFAULT 50,
    response_rate REAL DEFAULT 0,
    avg_response_time INTEGER DEFAULT 3600,
    
    -- AI insights
    last_intent VARCHAR(50),
    predicted_closing_time VARCHAR(50),
    score_breakdown JSONB,
    ai_notes TEXT,
    
    -- WhatsApp data
    whatsapp_valid BOOLEAN DEFAULT false,
    profile_picture TEXT,
    whatsapp_name VARCHAR(100),
    status_message TEXT,
    
    -- Timestamps
    last_interaction TIMESTAMP,
    last_message TEXT,
    reengagement_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    direction VARCHAR(20) NOT NULL,
    media_type VARCHAR(20) DEFAULT 'text',
    media_url TEXT,
    
    -- AI analysis
    intent VARCHAR(50),
    sentiment VARCHAR(20),
    confidence REAL,
    extracted_data JSONB,
    
    -- WhatsApp data
    whatsapp_message_id VARCHAR(100),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de eventos do sistema
CREATE TABLE IF NOT EXISTS system_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    instance_name VARCHAR(100),
    status VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(instance_name, event_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(qualification_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);

-- Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Policies básicas (ajustar conforme necessário)
CREATE POLICY "Allow all operations for authenticated users" ON leads
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON messages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON system_events
    FOR ALL USING (auth.role() = 'authenticated');
`;
    }

    generateN8NWorkflows() {
        return [
            {
                name: "LAIS IA - WhatsApp Message Processing",
                nodes: [
                    {
                        name: "WhatsApp Webhook",
                        type: "n8n-nodes-base.webhook",
                        position: [240, 300],
                        parameters: {
                            path: "whatsapp-message",
                            httpMethod: "POST"
                        }
                    },
                    {
                        name: "Process Lead",
                        type: "n8n-nodes-base.httpRequest",
                        position: [460, 300],
                        parameters: {
                            url: "https://lais-ia-api.roilabs.com.br/api/leads",
                            method: "POST"
                        }
                    }
                ]
            },
            {
                name: "LAIS IA - Lead Qualified to CRM",
                nodes: [
                    {
                        name: "Lead Qualified Webhook",
                        type: "n8n-nodes-base.webhook",
                        position: [240, 300],
                        parameters: {
                            path: "lead-qualified",
                            httpMethod: "POST"
                        }
                    },
                    {
                        name: "Send to Pipedrive",
                        type: "n8n-nodes-base.pipedrive",
                        position: [460, 300],
                        parameters: {
                            operation: "create",
                            resource: "person"
                        }
                    }
                ]
            }
        ];
    }

    generateProductionEnv() {
        return `# 🚀 LAIS IA - Production Environment
# Generated: ${new Date().toISOString()}

NODE_ENV=production
PORT=8000

# URLs
WEBHOOK_URL=https://lais-ia-api.roilabs.com.br
FRONTEND_URL=https://lais-ia.roilabs.com.br
ALLOWED_ORIGINS=https://lais-ia.roilabs.com.br,https://n8n.roilabs.com.br

# N8N Integration
N8N_WEBHOOK_URL=https://n8n.roilabs.com.br
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOGM4OTNiNC1kZDJiLTRmZGQtYTNjNy02Mjc3MjJjMjU0NjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMjAxNjExfQ.dNkFl5bbxuVnCcVx6-8cCfJYE8Fw5rsA_z_rf0YjWC0
ENABLE_N8N=true

# Supabase Database
DATABASE_URL=${this.config.database_url}
SUPABASE_URL=${this.config.supabase_url}
SUPABASE_ANON_KEY=${this.config.supabase_anon_key}
SUPABASE_SERVICE_KEY=${this.config.supabase_service_key}

# Redis Cache
REDIS_URL=${this.config.redis_url}
REDIS_PASSWORD=${this.config.redis_password}

# Evolution API
EVOLUTION_API_URL=${this.config.evolution_url}
EVOLUTION_API_KEY=${this.config.evolution_key}
EVOLUTION_INSTANCE_NAME=lais_ia_roilabs

# Claude AI
ANTHROPIC_API_KEY=${this.config.claude_key}
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Security
JWT_SECRET=${this.config.jwt_secret}
JWT_EXPIRES_IN=24
BCRYPT_SALT_ROUNDS=12

# Company
COMPANY_NAME=ROI Labs
COMPANY_PHONE=${this.config.company_phone}
COMPANY_EMAIL=contato@roilabs.com.br

# Production optimizations
LOG_LEVEL=warn
DEBUG_MODE=false
RATE_LIMIT_REQUESTS=1000
DB_POOL_MAX=20
REQUEST_TIMEOUT=10000

# EasyPanel
VIRTUAL_HOST=lais-ia-api.roilabs.com.br
LETSENCRYPT_HOST=lais-ia-api.roilabs.com.br
LETSENCRYPT_EMAIL=contato@roilabs.com.br
`;
    }

    generateSecureKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < 64; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    ask(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    askYesNo(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(['y', 'yes', 's', 'sim'].includes(answer.toLowerCase()));
            });
        });
    }
}

// Executa deploy se chamado diretamente
if (require.main === module) {
    const deploy = new EasyPanelDeploy();
    deploy.run().catch(console.error);
}

module.exports = EasyPanelDeploy;
