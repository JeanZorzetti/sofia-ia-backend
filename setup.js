#!/usr/bin/env node

/**
 * 🚀 LAIS IA Setup Script
 * 
 * Script de configuração inicial do sistema
 * Configura banco, instala dependências e prepara ambiente
 * 
 * @author ROI Labs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Cores para output no terminal
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
    title: (msg) => console.log(`${colors.bright}${colors.cyan}🏠 ${msg}${colors.reset}\n`),
    step: (msg) => console.log(`${colors.magenta}🔧 ${msg}${colors.reset}`)
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class LaisIASetup {
    constructor() {
        this.config = {};
        this.projectRoot = path.join(__dirname, '..');
    }

    async run() {
        try {
            log.title('LAIS IA - Setup Inicial v1.0.0');
            log.info('Configurando sistema SDR inteligente para imobiliárias\n');

            await this.checkRequirements();
            await this.collectConfiguration();
            await this.installDependencies();
            await this.createEnvironmentFile();
            await this.setupDatabase();
            await this.createDirectories();
            await this.finalizeSetup();

            log.success('\n🎉 Setup concluído com sucesso!');
            log.info('Execute "npm run dev" para iniciar o servidor de desenvolvimento');

        } catch (error) {
            log.error(`Setup falhou: ${error.message}`);
            process.exit(1);
        } finally {
            rl.close();
        }
    }

    async checkRequirements() {
        log.step('Verificando pré-requisitos...');

        // Verifica Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
            
            if (majorVersion < 18) {
                throw new Error(`Node.js 18+ necessário. Versão atual: ${nodeVersion}`);
            }
            
            log.success(`Node.js ${nodeVersion} ✓`);
        } catch (error) {
            throw new Error('Node.js não encontrado. Instale Node.js 18+ primeiro.');
        }

        // Verifica npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            log.success(`npm ${npmVersion} ✓`);
        } catch (error) {
            throw new Error('npm não encontrado.');
        }

        // Verifica PostgreSQL
        try {
            execSync('psql --version', { encoding: 'utf8' });
            log.success('PostgreSQL encontrado ✓');
        } catch (error) {
            log.warning('PostgreSQL não encontrado localmente');
            log.info('Você pode usar um serviço externo (Railway, Supabase, etc.)');
        }

        log.success('Pré-requisitos verificados\n');
    }

    async collectConfiguration() {
        log.step('Coletando configurações...\n');

        // Configurações básicas
        this.config.company_name = await this.ask('Nome da sua imobiliária: ');
        this.config.company_phone = await this.ask('Telefone da empresa (formato: 5511999999999): ');
        this.config.company_email = await this.ask('Email da empresa: ');

        // Configurações de banco
        log.info('\n📊 Configuração do Banco de Dados:');
        const useLocalDb = await this.askYesNo('Usar PostgreSQL local? (y/n): ');
        
        if (useLocalDb) {
            this.config.db_host = 'localhost';
            this.config.db_port = '5432';
            this.config.db_name = await this.ask('Nome do banco (default: lais_ia): ') || 'lais_ia';
            this.config.db_user = await this.ask('Usuário do banco (default: postgres): ') || 'postgres';
            this.config.db_password = await this.ask('Senha do banco: ');
        } else {
            this.config.database_url = await this.ask('URL completa do banco: ');
        }

        // Configurações de APIs
        log.info('\n🤖 Configuração de APIs:');
        this.config.anthropic_api_key = await this.ask('Chave API do Claude (Anthropic): ');
        this.config.evolution_api_url = await this.ask('URL do Evolution API (ex: http://localhost:8080): ');
        this.config.evolution_api_key = await this.ask('Chave API do Evolution: ');
        this.config.evolution_instance_name = await this.ask('Nome da instância WhatsApp (default: lais_ia): ') || 'lais_ia';

        // JWT Secret
        this.config.jwt_secret = this.generateSecureKey();

        log.success('\nConfigurações coletadas ✓');
    }

    async installDependencies() {
        log.step('Instalando dependências...');

        try {
            execSync('npm install', { 
                cwd: this.projectRoot,
                stdio: 'inherit'
            });
            log.success('Dependências instaladas ✓');
        } catch (error) {
            throw new Error('Falha ao instalar dependências');
        }
    }

    async createEnvironmentFile() {
        log.step('Criando arquivo de configuração (.env)...');

        const envContent = this.generateEnvContent();
        const envPath = path.join(this.projectRoot, '.env');

        try {
            fs.writeFileSync(envPath, envContent);
            log.success('Arquivo .env criado ✓');
        } catch (error) {
            throw new Error('Falha ao criar arquivo .env');
        }
    }

    async setupDatabase() {
        log.step('Configurando banco de dados...');

        // Se estiver usando PostgreSQL local, tenta criar o banco
        if (this.config.db_host === 'localhost') {
            try {
                const createDbCommand = `createdb -h ${this.config.db_host} -p ${this.config.db_port} -U ${this.config.db_user} ${this.config.db_name}`;
                execSync(createDbCommand, { stdio: 'ignore' });
                log.success('Banco de dados criado ✓');
            } catch (error) {
                log.warning('Banco pode já existir ou credenciais incorretas');
            }
        }

        log.info('Execute "npm run migrate" após iniciar para criar as tabelas');
    }

    async createDirectories() {
        log.step('Criando diretórios necessários...');

        const directories = [
            'logs',
            'uploads',
            'temp',
            'backups'
        ];

        directories.forEach(dir => {
            const dirPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });

        log.success('Diretórios criados ✓');
    }

    async finalizeSetup() {
        log.step('Finalizando configuração...');

        // Cria arquivo de exemplo de configuração do Evolution API
        const evolutionConfigExample = {
            baseUrl: this.config.evolution_api_url,
            apiKey: this.config.evolution_api_key,
            instanceName: this.config.evolution_instance_name,
            webhook: {
                url: 'http://localhost:8000/webhooks/whatsapp',
                events: [
                    'messages.upsert',
                    'connection.update',
                    'qrcode.updated'
                ]
            }
        };

        const configPath = path.join(this.projectRoot, 'evolution-config.example.json');
        fs.writeFileSync(configPath, JSON.stringify(evolutionConfigExample, null, 2));

        log.success('Configuração finalizada ✓');
    }

    generateEnvContent() {
        const envTemplate = `# 🏠 LAIS IA - Configuração Gerada Automaticamente
# Gerado em: ${new Date().toISOString()}

# =============================================================================
# 🚀 CONFIGURAÇÕES GERAIS
# =============================================================================

NODE_ENV=development
PORT=8000
APP_NAME="${this.config.company_name} - LAIS IA"
APP_VERSION="1.0.0"

# URLs
FRONTEND_URL=http://localhost:3000
WEBHOOK_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000

# =============================================================================
# 🤖 EVOLUTION API - WhatsApp Integration
# =============================================================================

EVOLUTION_API_URL=${this.config.evolution_api_url}
EVOLUTION_API_KEY=${this.config.evolution_api_key}
EVOLUTION_INSTANCE_NAME=${this.config.evolution_instance_name}

# =============================================================================
# 🧠 ANTHROPIC CLAUDE AI
# =============================================================================

ANTHROPIC_API_KEY=${this.config.anthropic_api_key}
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096

# =============================================================================
# 🗄️ BANCO DE DADOS - PostgreSQL
# =============================================================================

${this.config.database_url ? 
    `DATABASE_URL=${this.config.database_url}` : 
    `DB_HOST=${this.config.db_host}
DB_PORT=${this.config.db_port}
DB_NAME=${this.config.db_name}
DB_USER=${this.config.db_user}
DB_PASSWORD=${this.config.db_password}`
}
DB_SSL=false

# =============================================================================
# 🚀 REDIS - Cache e Sessões
# =============================================================================

# REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=
# REDIS_DB=0

# =============================================================================
# 🔐 AUTENTICAÇÃO E SEGURANÇA
# =============================================================================

JWT_SECRET=${this.config.jwt_secret}
JWT_EXPIRES_IN=24
BCRYPT_SALT_ROUNDS=12

# =============================================================================
# 🎯 CONFIGURAÇÕES ESPECÍFICAS DO NEGÓCIO
# =============================================================================

COMPANY_NAME="${this.config.company_name}"
COMPANY_PHONE="${this.config.company_phone}"
COMPANY_EMAIL="${this.config.company_email}"

# =============================================================================
# 🔧 CONFIGURAÇÕES AVANÇADAS
# =============================================================================

DB_POOL_MIN=2
DB_POOL_MAX=10
REQUEST_TIMEOUT=30000
TZ=America/Sao_Paulo

# Rate limiting (requests por minuto)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000

# =============================================================================
# 🧪 DESENVOLVIMENTO E DEBUG
# =============================================================================

LOG_LEVEL=info
DEBUG_MODE=true
EVOLUTION_DEBUG=false
CLAUDE_DEBUG=false

# =============================================================================
# 📂 UPLOADS E MÍDIA
# =============================================================================

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# =============================================================================
# 📱 WEBHOOKS E CALLBACKS
# =============================================================================

WEBHOOK_WHATSAPP=http://localhost:8000/webhooks/whatsapp
# WEBHOOK_SECRET=

# =============================================================================
# 🔄 AUTOMAÇÃO E CRON JOBS
# =============================================================================

ENABLE_CRON_JOBS=true
REENGAGEMENT_INTERVAL=24
BACKUP_INTERVAL=6

# =============================================================================
# 📈 MÉTRICAS E PERFORMANCE
# =============================================================================

ENABLE_METRICS=true
STATS_INTERVAL=30
`;

        return envTemplate;
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

// Executa setup se chamado diretamente
if (require.main === module) {
    const setup = new LaisIASetup();
    setup.run().catch(console.error);
}

module.exports = LaisIASetup;
