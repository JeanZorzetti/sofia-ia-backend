/**
 * 🗄️ Database Service - SIMPLIFIED VERSION (sem pgvector)
 * 
 * Serviço centralizado para todas operações de banco de dados
 * PostgreSQL simples sem pgvector inicialmente
 * 
 * @author ROI Labs
 */

const { Pool } = require('pg');
const logger = require('../utils/logger').db;

class DatabaseService {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    /**
     * Conecta ao banco de dados
     */
    async connect() {
        try {
            // Configuração do pool de conexões
            const config = {
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: parseInt(process.env.DB_POOL_MAX) || 10,
                min: parseInt(process.env.DB_POOL_MIN) || 2,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            };

            // Se não tiver DATABASE_URL, usa configuração separada
            if (!config.connectionString) {
                config.host = process.env.DB_HOST || 'localhost';
                config.port = parseInt(process.env.DB_PORT) || 5432;
                config.database = process.env.DB_NAME || 'lais_ia';
                config.user = process.env.DB_USER || 'postgres';
                config.password = process.env.DB_PASSWORD;
            }

            this.pool = new Pool(config);

            // Testa a conexão
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            this.isConnected = true;
            logger.info('✅ Database connected successfully', {
                database: config.database || 'from_url',
                host: config.host || 'from_url',
                maxConnections: config.max
            });

            // Configura listeners de eventos
            this.setupEventListeners();

            return true;

        } catch (error) {
            logger.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    /**
     * Configura listeners de eventos do pool
     */
    setupEventListeners() {
        this.pool.on('connect', (client) => {
            logger.debug('🔗 New database client connected');
        });

        this.pool.on('acquire', (client) => {
            logger.debug('📥 Database client acquired from pool');
        });

        this.pool.on('remove', (client) => {
            logger.debug('🗑️ Database client removed from pool');
        });

        this.pool.on('error', (err, client) => {
            logger.error('❌ Database pool error:', err);
        });
    }

    /**
     * Executa query simples
     */
    async query(text, params = []) {
        const timer = logger.timer('database_query');
        
        try {
            const start = Date.now();
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;

            logger.debug('📊 Query executed', {
                query: text.substring(0, 100),
                params: params.length,
                rows: result.rowCount,
                duration: `${duration}ms`
            });

            timer.end({ rows: result.rowCount, query_type: this.getQueryType(text) });
            return result;

        } catch (error) {
            timer.end({ error: true });
            logger.error('❌ Query failed:', {
                error: error.message,
                query: text.substring(0, 200),
                params
            });
            throw error;
        }
    }

    /**
     * Insere dados e retorna o registro criado
     */
    async insert(table, data) {
        try {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const placeholders = values.map((_, index) => `$${index + 1}`);
            
            const query = `
                INSERT INTO ${table} (${columns.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING *
            `;
            
            const result = await this.query(query, values);
            
            logger.info('📝 Record inserted', {
                table,
                id: result.rows[0].id || 'no_id'
            });
            
            return result.rows[0];

        } catch (error) {
            logger.error('❌ Insert failed:', { table, error: error.message });
            throw error;
        }
    }

    /**
     * Busca registro por ID
     */
    async findById(table, id) {
        try {
            const query = `SELECT * FROM ${table} WHERE id = $1`;
            const result = await this.query(query, [id]);
            
            return result.rows[0] || null;

        } catch (error) {
            logger.error('❌ Find by ID failed:', error);
            throw error;
        }
    }

    /**
     * Deleta registro (hard delete simplificado)
     */
    async delete(table, id, hard = true) {
        try {
            const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
            const result = await this.query(query, [id]);
            
            if (result.rowCount === 0) {
                throw new Error(`Record with id ${id} not found in ${table}`);
            }
            
            logger.info('🗑️ Record deleted', { table, id });
            return result.rows[0];

        } catch (error) {
            logger.error('❌ Delete failed:', { table, id, error: error.message });
            throw error;
        }
    }

    /**
     * Executa migrations SIMPLIFICADAS
     */
    async runMigrations() {
        try {
            logger.info('🔄 Running simplified database migrations...');
            
            // Cria tabela de migrations se não existir
            await this.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            // Lista migrations já executadas
            const executedResult = await this.query('SELECT name FROM migrations');
            const executed = executedResult.rows.map(row => row.name);
            
            // Lista de migrations simplificadas
            const migrations = [
                '001_create_leads_table',
                '002_create_messages_table'
            ];
            
            // Executa migrations pendentes
            for (const migration of migrations) {
                if (!executed.includes(migration)) {
                    await this.executeMigration(migration);
                    await this.query(
                        'INSERT INTO migrations (name) VALUES ($1)',
                        [migration]
                    );
                    logger.info(`✅ Migration executed: ${migration}`);
                }
            }
            
            logger.info('✅ All migrations completed');

        } catch (error) {
            logger.error('❌ Migration failed:', error);
            throw error;
        }
    }

    /**
     * Executa migration específica SIMPLIFICADA
     */
    async executeMigration(migrationName) {
        const migrations = {
            '001_create_leads_table': `
                CREATE TABLE IF NOT EXISTS leads (
                    id SERIAL PRIMARY KEY,
                    phone VARCHAR(20) NOT NULL UNIQUE,
                    name VARCHAR(100),
                    email VARCHAR(100),
                    source VARCHAR(50) DEFAULT 'whatsapp',
                    status VARCHAR(20) DEFAULT 'new',
                    qualification_score INTEGER DEFAULT 0,
                    temperature VARCHAR(20) DEFAULT 'cold',
                    
                    -- Basic preferences
                    property_type_interest VARCHAR(50),
                    location_preference TEXT,
                    budget_min DECIMAL(12,2),
                    budget_max DECIMAL(12,2),
                    
                    -- Engagement
                    interaction_count INTEGER DEFAULT 0,
                    last_interaction TIMESTAMP,
                    last_message TEXT,
                    
                    -- Timestamps
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `,
            
            '002_create_messages_table': `
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    direction VARCHAR(20) NOT NULL, -- 'sent' | 'received'
                    media_type VARCHAR(20) DEFAULT 'text',
                    
                    -- WhatsApp data
                    whatsapp_message_id VARCHAR(100),
                    
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `
        };
        
        const sql = migrations[migrationName];
        if (!sql) {
            throw new Error(`Migration ${migrationName} not found`);
        }
        
        await this.query(sql);
    }

    /**
     * Estatísticas do banco
     */
    async getStats() {
        try {
            const stats = {};
            
            // Contagem de registros principais
            const tables = ['leads', 'messages'];
            
            for (const table of tables) {
                try {
                    const result = await this.query(`SELECT COUNT(*) as count FROM ${table}`);
                    stats[table] = parseInt(result.rows[0].count);
                } catch (error) {
                    stats[table] = 0; // Tabela não existe ainda
                }
            }
            
            return stats;

        } catch (error) {
            logger.error('❌ Failed to get database stats:', error);
            return { error: error.message };
        }
    }

    /**
     * Determina tipo de query para métricas
     */
    getQueryType(sql) {
        const query = sql.trim().toUpperCase();
        if (query.startsWith('SELECT')) return 'SELECT';
        if (query.startsWith('INSERT')) return 'INSERT';
        if (query.startsWith('UPDATE')) return 'UPDATE';
        if (query.startsWith('DELETE')) return 'DELETE';
        if (query.startsWith('CREATE')) return 'CREATE';
        return 'OTHER';
    }

    /**
     * Fecha pool de conexões
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            logger.info('👋 Database connection closed');
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            await this.query('SELECT 1');
            return { status: 'healthy', connected: this.isConnected };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// Exporta instância singleton
const databaseService = new DatabaseService();

module.exports = databaseService;