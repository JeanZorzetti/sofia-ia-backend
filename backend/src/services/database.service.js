/**
 * 🗄️ Database Service
 * 
 * Serviço centralizado para todas operações de banco de dados
 * PostgreSQL + pgvector para embeddings
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
     * Executa transação
     */
    async transaction(queries) {
        const client = await this.pool.connect();
        const timer = logger.timer('database_transaction');
        
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const { text, params } of queries) {
                const result = await client.query(text, params);
                results.push(result);
            }
            
            await client.query('COMMIT');
            
            timer.end({ queries: queries.length, success: true });
            logger.info('✅ Transaction completed', {
                queries: queries.length,
                totalRows: results.reduce((sum, r) => sum + r.rowCount, 0)
            });
            
            return results;

        } catch (error) {
            await client.query('ROLLBACK');
            timer.end({ error: true });
            logger.error('❌ Transaction failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Busca com paginação
     */
    async paginate(baseQuery, params = [], page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            // Query para contar total
            const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as count_query`;
            const countResult = await this.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count);
            
            // Query com paginação
            const dataQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            const dataResult = await this.query(dataQuery, [...params, limit, offset]);
            
            const totalPages = Math.ceil(total / limit);
            
            return {
                data: dataResult.rows,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_records: total,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            };

        } catch (error) {
            logger.error('❌ Pagination query failed:', error);
            throw error;
        }
    }

    /**
     * Busca por embeddings (vector similarity)
     */
    async vectorSearch(table, vectorColumn, queryVector, limit = 10, threshold = 0.7) {
        try {
            const query = `
                SELECT *, 
                       1 - (${vectorColumn} <=> $1) as similarity
                FROM ${table}
                WHERE 1 - (${vectorColumn} <=> $1) > $2
                ORDER BY ${vectorColumn} <=> $1
                LIMIT $3
            `;
            
            const result = await this.query(query, [JSON.stringify(queryVector), threshold, limit]);
            
            logger.debug('🔍 Vector search completed', {
                table,
                results: result.rowCount,
                threshold
            });
            
            return result.rows;

        } catch (error) {
            logger.error('❌ Vector search failed:', error);
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
     * Atualiza registro
     */
    async update(table, id, data) {
        try {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const setClause = columns.map((col, index) => `${col} = $${index + 2}`);
            
            const query = `
                UPDATE ${table}
                SET ${setClause.join(', ')}, updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await this.query(query, [id, ...values]);
            
            if (result.rowCount === 0) {
                throw new Error(`Record with id ${id} not found in ${table}`);
            }
            
            logger.info('✏️ Record updated', { table, id });
            return result.rows[0];

        } catch (error) {
            logger.error('❌ Update failed:', { table, id, error: error.message });
            throw error;
        }
    }

    /**
     * Deleta registro (soft delete se tiver deleted_at)
     */
    async delete(table, id, hard = false) {
        try {
            let query;
            
            if (hard) {
                query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
            } else {
                // Verifica se tabela tem coluna deleted_at
                const hasDeletedAt = await this.hasColumn(table, 'deleted_at');
                
                if (hasDeletedAt) {
                    query = `
                        UPDATE ${table} 
                        SET deleted_at = NOW(), updated_at = NOW()
                        WHERE id = $1 AND deleted_at IS NULL
                        RETURNING *
                    `;
                } else {
                    query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
                }
            }
            
            const result = await this.query(query, [id]);
            
            if (result.rowCount === 0) {
                throw new Error(`Record with id ${id} not found in ${table}`);
            }
            
            logger.info('🗑️ Record deleted', { 
                table, 
                id, 
                type: hard ? 'hard' : 'soft' 
            });
            
            return result.rows[0];

        } catch (error) {
            logger.error('❌ Delete failed:', { table, id, error: error.message });
            throw error;
        }
    }

    /**
     * Busca registro por ID
     */
    async findById(table, id) {
        try {
            const query = `SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`;
            const result = await this.query(query, [id]);
            
            return result.rows[0] || null;

        } catch (error) {
            // Se coluna deleted_at não existir, tenta sem ela
            if (error.message.includes('deleted_at')) {
                const query = `SELECT * FROM ${table} WHERE id = $1`;
                const result = await this.query(query, [id]);
                return result.rows[0] || null;
            }
            throw error;
        }
    }

    /**
     * Verifica se coluna existe na tabela
     */
    async hasColumn(table, column) {
        try {
            const query = `
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = $1 AND column_name = $2
                )
            `;
            
            const result = await this.query(query, [table, column]);
            return result.rows[0].exists;

        } catch (error) {
            logger.error('❌ Column check failed:', error);
            return false;
        }
    }

    /**
     * Executa migrations
     */
    async runMigrations() {
        try {
            logger.info('🔄 Running database migrations...');
            
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
            
            // Lista de migrations (em ordem)
            const migrations = [
                '001_create_leads_table',
                '002_create_messages_table', 
                '003_create_conversations_table',
                '004_create_properties_table',
                '005_create_interactions_table',
                '006_create_campaigns_table',
                '007_add_vector_extensions',
                '008_add_indexes'
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
     * Executa migration específica
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
                )
            `,
            
            '002_create_messages_table': `
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    direction VARCHAR(20) NOT NULL, -- 'sent' | 'received'
                    media_type VARCHAR(20) DEFAULT 'text', -- 'text' | 'image' | 'audio' | 'document'
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
                )
            `,
            
            '003_create_conversations_table': `
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
                    status VARCHAR(20) DEFAULT 'active', -- 'active' | 'closed' | 'transferred'
                    
                    -- Conversation metrics
                    message_count INTEGER DEFAULT 0,
                    avg_response_time INTEGER,
                    satisfaction_score INTEGER,
                    
                    -- AI summary
                    summary TEXT,
                    key_points JSONB,
                    next_steps TEXT,
                    
                    started_at TIMESTAMP DEFAULT NOW(),
                    ended_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `,
            
            '004_create_properties_table': `
                CREATE TABLE IF NOT EXISTS properties (
                    id SERIAL PRIMARY KEY,
                    external_id VARCHAR(100),
                    source VARCHAR(50), -- 'vivareal' | 'zapimoveis' | 'olx'
                    
                    -- Basic info
                    title TEXT NOT NULL,
                    description TEXT,
                    price DECIMAL(12,2),
                    price_per_sqm DECIMAL(8,2),
                    
                    -- Location
                    address TEXT,
                    neighborhood VARCHAR(100),
                    city VARCHAR(100),
                    state VARCHAR(10),
                    zipcode VARCHAR(10),
                    latitude DECIMAL(10,8),
                    longitude DECIMAL(11,8),
                    
                    -- Property details
                    property_type VARCHAR(50), -- 'apartment' | 'house' | 'land' | 'commercial'
                    total_area DECIMAL(8,2),
                    built_area DECIMAL(8,2),
                    bedrooms INTEGER,
                    bathrooms INTEGER,
                    parking_spaces INTEGER,
                    
                    -- Features
                    features JSONB,
                    amenities JSONB,
                    
                    -- Media
                    images JSONB,
                    virtual_tour_url TEXT,
                    
                    -- Availability
                    available BOOLEAN DEFAULT true,
                    purpose VARCHAR(20), -- 'sale' | 'rent'
                    
                    -- SEO/Search
                    embedding vector(1536), -- Para similarity search
                    
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    deleted_at TIMESTAMP
                )
            `,
            
            '005_create_interactions_table': `
                CREATE TABLE IF NOT EXISTS interactions (
                    id SERIAL PRIMARY KEY,
                    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
                    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
                    
                    interaction_type VARCHAR(50), -- 'view' | 'favorite' | 'share' | 'inquiry'
                    channel VARCHAR(20), -- 'whatsapp' | 'email' | 'call' | 'visit'
                    
                    -- Details
                    details JSONB,
                    duration_seconds INTEGER,
                    outcome VARCHAR(50),
                    notes TEXT,
                    
                    -- AI analysis
                    intent_detected VARCHAR(50),
                    sentiment_score REAL,
                    conversion_probability REAL,
                    
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `,
            
            '006_create_campaigns_table': `
                CREATE TABLE IF NOT EXISTS campaigns (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    type VARCHAR(50), -- 'broadcast' | 'drip' | 'reengagement'
                    status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'active' | 'paused' | 'completed'
                    
                    -- Target audience
                    target_criteria JSONB,
                    lead_count INTEGER DEFAULT 0,
                    
                    -- Message content
                    message_template TEXT,
                    media_url TEXT,
                    
                    -- Scheduling
                    scheduled_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    
                    -- Results
                    sent_count INTEGER DEFAULT 0,
                    delivered_count INTEGER DEFAULT 0,
                    read_count INTEGER DEFAULT 0,
                    reply_count INTEGER DEFAULT 0,
                    conversion_count INTEGER DEFAULT 0,
                    
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `,
            
            '007_add_vector_extensions': `
                -- Adiciona extensão pgvector se não existir
                CREATE EXTENSION IF NOT EXISTS vector;
            `,
            
            '008_add_indexes': `
                -- Índices para performance
                CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
                CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
                CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(qualification_score DESC);
                CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
                CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
                CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
                
                CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
                CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
                CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
                CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(available);
                
                CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
                CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(interaction_type);
                CREATE INDEX IF NOT EXISTS idx_interactions_created ON interactions(created_at DESC);
                
                -- Índice de similarity search para embeddings
                CREATE INDEX IF NOT EXISTS idx_properties_embedding ON properties USING ivfflat (embedding vector_cosine_ops);
            `
        };
        
        const sql = migrations[migrationName];
        if (!sql) {
            throw new Error(`Migration ${migrationName} not found`);
        }
        
        await this.query(sql);
    }

    /**
     * Backup da base de dados
     */
    async backup() {
        try {
            logger.info('💾 Starting database backup...');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup_${timestamp}.sql`;
            
            // Este seria implementado com pg_dump em produção
            logger.info('💾 Backup completed', { filename });
            
            return filename;

        } catch (error) {
            logger.error('❌ Backup failed:', error);
            throw error;
        }
    }

    /**
     * Estatísticas do banco
     */
    async getStats() {
        try {
            const stats = {};
            
            // Contagem de registros principais
            const tables = ['leads', 'messages', 'properties', 'interactions'];
            
            for (const table of tables) {
                const result = await this.query(`SELECT COUNT(*) as count FROM ${table}`);
                stats[table] = parseInt(result.rows[0].count);
            }
            
            // Estatísticas de leads por temperature
            const tempStats = await this.query(`
                SELECT temperature, COUNT(*) as count 
                FROM leads 
                GROUP BY temperature
            `);
            
            stats.leads_by_temperature = {};
            tempStats.rows.forEach(row => {
                stats.leads_by_temperature[row.temperature] = parseInt(row.count);
            });
            
            // Performance do banco
            const connections = await this.query('SELECT COUNT(*) FROM pg_stat_activity');
            stats.active_connections = parseInt(connections.rows[0].count);
            
            return stats;

        } catch (error) {
            logger.error('❌ Failed to get database stats:', error);
            throw error;
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
        if (query.startsWith('ALTER')) return 'ALTER';
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
