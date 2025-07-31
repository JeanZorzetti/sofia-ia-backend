-- =============================================
-- SOFIA IA - SUPABASE DATABASE SCHEMA
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE (Sistema de usuários)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'viewer')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEADS TABLE (Gestão de leads)
-- =============================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'frio', 'morno', 'quente', 'convertido', 'perdido')),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    interesse TEXT,
    valor_min INTEGER,
    valor_max INTEGER,
    regiao VARCHAR(255),
    tipo_imovel VARCHAR(50) CHECK (tipo_imovel IN ('apartamento', 'casa', 'terreno', 'comercial', 'studio')),
    fonte VARCHAR(50) DEFAULT 'whatsapp' CHECK (fonte IN ('whatsapp', 'portal', 'indicacao', 'site', 'facebook', 'google')),
    metadata JSONB DEFAULT '{}',
    ultima_interacao TIMESTAMPTZ DEFAULT NOW(),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONVERSATIONS TABLE (Conversas)
-- =============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    whatsapp_chat_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE (Mensagens WhatsApp)
-- =============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(255),
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('lead', 'sofia', 'agent')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'document', 'video')),
    content TEXT NOT NULL,
    media_url TEXT,
    media_caption TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(50),
    ai_confidence FLOAT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CAMPAIGNS TABLE (Campanhas de marketing)
-- =============================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'drip' CHECK (type IN ('drip', 'broadcast', 'reactivation', 'nurture')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    target_criteria JSONB DEFAULT '{}',
    message_template TEXT,
    schedule_config JSONB DEFAULT '{}',
    leads_count INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANALYTICS TABLE (Métricas e analytics)
-- =============================================
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    conversations_started INTEGER DEFAULT 0,
    conversations_completed INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    leads_created INTEGER DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    ai_interactions INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- =============================================
-- SETTINGS TABLE (Configurações do sistema)
-- =============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, key)
);

-- =============================================
-- WHATSAPP_INSTANCES TABLE (Instâncias WhatsApp)
-- =============================================
CREATE TABLE whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
    qr_code TEXT,
    webhook_url TEXT,
    evolution_instance_id VARCHAR(100),
    battery_level INTEGER,
    last_seen TIMESTAMPTZ,
    messages_sent_today INTEGER DEFAULT 0,
    messages_received_today INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES para performance
-- =============================================
CREATE INDEX idx_leads_telefone ON leads(telefone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_ultima_interacao ON leads(ultima_interacao DESC);

CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date DESC);

-- =============================================
-- TRIGGERS para updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_instances_updated_at BEFORE UPDATE ON whatsapp_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Policies básicas (ajustar conforme necessário)
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =============================================
-- DADOS INICIAIS (SEED DATA)
-- =============================================

-- Usuário admin inicial
INSERT INTO users (id, email, password_hash, name, role, status) VALUES 
(
    uuid_generate_v4(),
    'admin@sofia-ia.com',
    crypt('admin123', gen_salt('bf')),
    'Administrador',
    'admin',
    'active'
);

-- Configurações iniciais
INSERT INTO settings (category, key, value, description) VALUES 
('system', 'app_name', '"Sofia IA"', 'Nome da aplicação'),
('system', 'version', '"1.0.0"', 'Versão atual'),
('whatsapp', 'auto_reply', 'true', 'Resposta automática ativa'),
('ai', 'model', '"claude-3-5-sonnet-20241022"', 'Modelo de IA usado'),
('ai', 'max_tokens', '4000', 'Máximo de tokens por resposta'),
('business', 'working_hours_start', '"08:00"', 'Início do horário comercial'),
('business', 'working_hours_end', '"22:00"', 'Fim do horário comercial'),
('business', 'timezone', '"America/Sao_Paulo"', 'Timezone padrão');

-- Dados de exemplo para desenvolvimento
INSERT INTO leads (nome, telefone, email, status, score, interesse, valor_max, regiao, fonte) VALUES 
('Maria Silva', '+5511987654321', 'maria@email.com', 'quente', 85, 'Apartamento 2 quartos', 350000, 'Vila Madalena', 'whatsapp'),
('João Santos', '+5511976543210', 'joao@email.com', 'morno', 65, 'Casa 3 quartos', 500000, 'Brooklin', 'portal'),
('Ana Costa', '+5511965432109', 'ana@email.com', 'frio', 35, 'Studio', 200000, 'Centro', 'indicacao');

-- Analytics inicial para o dia atual
INSERT INTO analytics_daily (date, conversations_started, messages_sent, messages_received, leads_created, leads_qualified, conversion_count, conversion_rate) VALUES 
(CURRENT_DATE, 247, 423, 156, 34, 89, 12, 34.2);

COMMIT;
