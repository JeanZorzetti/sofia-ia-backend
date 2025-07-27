# 🏠 LAIS IA - Sistema SDR Inteligente para Imobiliárias

> Sistema de Desenvolvimento de Vendas baseado em IA para automatizar completamente o processo de prospecção, qualificação e engagement de leads imobiliários.

**Competidor direto da Lais.ai com 33% menos preço e IA superior**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Evolution API](https://img.shields.io/badge/Evolution%20API-Compatible-blue)](https://evolution-api.com/)
[![Claude AI](https://img.shields.io/badge/Claude%20AI-3.5%20Sonnet-purple)](https://anthropic.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🎯 **VISÃO GERAL**

### **O que é o LAIS IA?**
Sistema completo de automação de vendas para imobiliárias que:
- ✅ **Qualifica leads automaticamente** via WhatsApp 24/7
- ✅ **Processa áudios e imagens** com IA avançada
- ✅ **Personaliza atendimento** baseado no perfil do cliente
- ✅ **Analisa sentimentos** e detecta intenções de compra
- ✅ **Gera relatórios inteligentes** e insights de mercado

### **Diferenciais Competitivos**
| Aspecto | LAIS IA | Lais.ai (Concorrente) |
|---------|---------|------------------------|
| **Preço** | R$ 197-997/mês | R$ 297-1.497/mês |
| **IA** | Claude 3.5 Sonnet | GPT-4 |
| **WhatsApp** | Evolution API (sem limites) | API Oficial (limitada) |
| **Setup** | 15 minutos | Várias horas |
| **Customização** | Código aberto | Black box |

---

## 🚀 **INSTALAÇÃO RÁPIDA**

### **Pré-requisitos**
```bash
# Verificar versões mínimas
node --version    # v18+
npm --version     # v8+
psql --version    # PostgreSQL 15+
```

### **1. Clone e Configure**
```bash
# Clone o repositório
git clone https://github.com/roilabs/lais-ia-backend.git
cd lais-ia-backend

# Execute o setup automático
npm run setup
```

### **2. Configure suas APIs**
Durante o setup, você precisará de:
- 🔑 **Chave API do Claude** → [console.anthropic.com](https://console.anthropic.com/)
- 📱 **Evolution API** → [Instruções de instalação](#evolution-api-setup)
- 🗄️ **Banco PostgreSQL** → Local ou externo (Railway, Supabase, etc.)

### **3. Inicie o Sistema**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

🎉 **Pronto!** Sua API estará rodando em `http://localhost:8000`

---

## 🔧 **CONFIGURAÇÃO DETALHADA**

### **Variáveis de Ambiente (.env)**
```bash
# 🚀 CONFIGURAÇÕES GERAIS
NODE_ENV=development
PORT=8000
WEBHOOK_URL=https://sua-domain.com

# 🤖 EVOLUTION API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_evolution_aqui
EVOLUTION_INSTANCE_NAME=lais_ia_instance

# 🧠 CLAUDE AI
ANTHROPIC_API_KEY=sk-ant-api03-sua_chave_claude_aqui
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# 🗄️ BANCO DE DADOS
DATABASE_URL=postgresql://user:pass@host:5432/lais_ia
# ou configuração separada:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lais_ia
DB_USER=postgres
DB_PASSWORD=sua_senha

# 🔐 SEGURANÇA
JWT_SECRET=sua_chave_jwt_super_segura_aqui

# 🏢 EMPRESA
COMPANY_NAME="Sua Imobiliária"
COMPANY_PHONE="5511999999999"
COMPANY_EMAIL="contato@sua-imobiliaria.com"
```

### **Evolution API Setup**

1. **Instale o Evolution API**:
```bash
# Docker (Recomendado)
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -v evolution_instances:/evolution/instances \
  atendai/evolution-api:latest

# ou via NPM
npm install -g @evolution-api/evolution-api
evolution-api
```

2. **Configure Webhook**:
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "lais_ia_instance",
    "token": "sua_api_key",
    "qrcode": true,
    "webhook": "http://localhost:8000/webhooks/whatsapp"
  }'
```

---

## 📊 **ARQUITETURA DO SISTEMA**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │◄──►│  Evolution API   │◄──►│   Backend API   │
│   (Cliente)     │    │   (Gateway)      │    │   (Node.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────┐              │
                       │  Claude 3.5     │◄─────────────┤
                       │  Sonnet         │              │
                       └─────────────────┘              │
                                                         │
┌─────────────────┐    ┌──────────────────┐              │
│   Dashboard     │◄──►│    Frontend      │◄─────────────┤
│   (Admin)       │    │    (Next.js)     │              │
└─────────────────┘    └──────────────────┘              │
                                                         │
                       ┌─────────────────┐              │
                       │   PostgreSQL    │◄─────────────┘
                       │   + pgvector    │
                       └─────────────────┘
```

### **Principais Módulos**

#### **🧠 IA Engine (Claude 3.5 Sonnet)**
- Conversação natural em português
- Qualificação automática de leads
- Análise de sentimentos e intenções
- Personalização baseada no perfil
- Processamento de áudios e imagens

#### **📱 WhatsApp Integration (Evolution API)**
- Múltiplas instâncias simultâneas
- Envio de texto, áudio, imagem, documentos
- Grupos e listas de transmissão
- Status de entrega e leitura
- Anti-ban e rate limiting

#### **🎯 Lead Qualification System**
- Score inteligente (0-100)
- Classificação por temperatura (frio/morno/quente/imediato)
- Extração automática de preferências
- Histórico completo de interações
- Triggers de reengajamento

#### **📊 Analytics & Reporting**
- Dashboard em tempo real
- Métricas de conversão
- Funil de vendas
- ROI por campanha
- Insights de mercado

---

## 🔄 **FLUXO DE FUNCIONAMENTO**

### **1. Captura de Lead**
```mermaid
graph LR
    A[Cliente envia WhatsApp] --> B[Evolution API]
    B --> C[Webhook Backend]
    C --> D[Criar/Atualizar Lead]
    D --> E[Análise com IA]
```

### **2. Qualificação Inteligente**
```javascript
// Exemplo de qualificação automática
const qualification = await claudeService.qualifyLead(leadData, conversationHistory);
// Resultado:
{
  qualification_score: 85,
  temperature: "hot",
  buying_intent: "alto",
  estimated_closing_time: "1-4 semanas",
  next_action: "Agendar visita presencial"
}
```

### **3. Resposta Personalizada**
```javascript
// IA gera resposta baseada no contexto
const response = await claudeService.generateResponse({
  lead: lead,
  message: "Quero um apartamento de 2 quartos",
  conversationHistory: history,
  intent: "busca_informacoes"
});
// Resposta personalizada enviada via WhatsApp
```

---

## 📚 **GUIA DE USO**

### **Comandos Principais**

```bash
# ⚡ DESENVOLVIMENTO
npm run dev              # Inicia servidor com hot reload
npm run migrate          # Executa migrations do banco
npm run seed             # Popula banco com dados de exemplo
npm run logs             # Acompanha logs em tempo real

# 🧪 TESTES
npm test                 # Executa todos os testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Gera relatório de cobertura

# 🚀 PRODUÇÃO
npm start                # Inicia servidor de produção
npm run pm2:start        # Inicia com PM2
npm run backup           # Cria backup do banco

# 🔧 MANUTENÇÃO
npm run lint             # Analisa código
npm run format           # Formata código
npm run clean            # Limpa e reinstala dependências
npm run reset            # Reset completo do sistema
```

### **Endpoints da API**

#### **🔐 Autenticação**
```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

#### **👥 Leads**
```bash
GET    /api/leads                 # Lista leads com filtros
GET    /api/leads/:id             # Detalhes do lead
PUT    /api/leads/:id             # Atualiza lead
DELETE /api/leads/:id             # Remove lead
POST   /api/leads/:id/messages    # Envia mensagem
GET    /api/leads/:id/messages    # Histórico de mensagens
```

#### **📢 Campanhas**
```bash
GET  /api/campaigns               # Lista campanhas
POST /api/campaigns               # Cria campanha
PUT  /api/campaigns/:id           # Atualiza campanha
POST /api/campaigns/:id/send      # Executa campanha
```

#### **📊 Analytics**
```bash
GET /api/analytics/overview       # Visão geral
GET /api/analytics/leads/timeline # Timeline de leads
GET /api/analytics/performance    # Métricas de performance
```

#### **👑 Admin**
```bash
GET  /admin/dashboard             # Dashboard administrativo
GET  /admin/health/detailed       # Health check completo
POST /admin/database/migrate      # Executa migrations
GET  /admin/whatsapp/instances    # Lista instâncias WhatsApp
POST /admin/whatsapp/qrcode       # Gera QR Code
```

---

## 🔒 **SEGURANÇA**

### **Autenticação JWT**
```javascript
// Headers obrigatórios para rotas protegidas
{
  "Authorization": "Bearer seu_jwt_token_aqui"
}
```

### **Rate Limiting**
- **API Geral**: 100 requests/minuto
- **WhatsApp**: 60 mensagens/minuto  
- **Login**: 5 tentativas/5 minutos
- **Uploads**: 20 arquivos/hora

### **Roles e Permissões**
- **`user`**: Acesso básico ao sistema
- **`admin`**: Gestão de leads e campanhas
- **`super_admin`**: Acesso completo ao sistema

### **LGPD Compliance**
- Consentimento explícito para tratamento de dados
- Direito ao esquecimento (soft delete)
- Logs de auditoria completos
- Criptografia de dados sensíveis

---

## 📈 **MONITORAMENTO**

### **Health Checks**
```bash
# Verificação básica
curl http://localhost:8000/health

# Verificação detalhada (admin)
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/admin/health/detailed
```

### **Logs Estruturados**
```bash
# Logs em desenvolvimento
npm run logs

# Logs de erro
npm run logs:error

# Análise de logs
tail -f logs/app.log | grep "ERROR"
```

### **Métricas em Tempo Real**
- WebSocket para updates instantâneos
- Dashboard com gráficos interativos
- Alertas automáticos para problemas
- Estatísticas de performance

---

## 🐳 **DEPLOY COM DOCKER**

### **Docker Compose**
```yaml
version: '3.8'
services:
  lais-ia-backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=lais_ia
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=senha123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### **Comandos Docker**
```bash
# Build da imagem
npm run docker:build

# Executar container
npm run docker:run

# Com Docker Compose
docker-compose up -d
```

---

## 🔧 **DESENVOLVIMENTO**

### **Estrutura de Pastas**
```
backend/
├── src/
│   ├── app.js                 # Entry point
│   ├── config/               # Configurações
│   ├── controllers/          # Controladores
│   ├── middleware/           # Middlewares
│   ├── models/              # Modelos de dados
│   ├── routes/              # Rotas da API
│   ├── services/            # Serviços (IA, WhatsApp, DB)
│   ├── utils/               # Utilitários
│   └── webhooks/            # Handlers de webhooks
├── logs/                    # Logs do sistema
├── uploads/                 # Arquivos temporários
├── tests/                   # Testes automatizados
├── scripts/                 # Scripts utilitários
└── docs/                    # Documentação
```

### **Contribuindo**
1. **Fork** o repositório
2. **Clone** sua fork
3. **Crie** uma branch: `git checkout -b minha-feature`
4. **Commit** suas mudanças: `git commit -am 'Add nova feature'`
5. **Push** para a branch: `git push origin minha-feature`
6. **Abra** um Pull Request

### **Padrões de Código**
- **ESLint** para análise estática
- **Prettier** para formatação
- **Conventional Commits** para mensagens
- **Husky** para hooks de pre-commit

---

## 🆘 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **❌ Evolution API não conecta**
```bash
# Verificar se está rodando
curl http://localhost:8080/manager/status

# Recriar instância
curl -X DELETE http://localhost:8080/instance/delete/lais_ia_instance
npm run setup
```

#### **❌ Banco de dados não conecta**
```bash
# Testar conexão
psql -h localhost -U postgres -d lais_ia

# Recriar banco
dropdb lais_ia && createdb lais_ia
npm run migrate
```

#### **❌ Claude API rate limit**
```bash
# Verificar limites na Anthropic Console
# Implementar retry automático no código
```

#### **❌ WhatsApp banido**
- Use Evolution API com proxy
- Implemente delays entre mensagens
- Evite mensagens idênticas em massa

### **Logs de Debug**
```bash
# Ativar debug detalhado
DEBUG_MODE=true
LOG_LEVEL=debug
EVOLUTION_DEBUG=true
CLAUDE_DEBUG=true
```

---

## 💰 **MODELO DE NEGÓCIO**

### **Pricing Sugerido**
| Plano | Preço | Conversas | Features |
|-------|-------|-----------|----------|
| **Starter** | R$ 197/mês | 500 | Básico |
| **Professional** | R$ 397/mês | 2.000 | Completo |
| **Enterprise** | R$ 997/mês | Ilimitado | Customizado |

### **ROI Projetado**
- **Investimento inicial**: R$ 200K para MVP
- **ROI esperado**: 400-600% no primeiro ano
- **Market size**: R$ 500M+ (setor imobiliário digital)
- **Tempo para superar concorrente**: 12 semanas

---

## 📞 **SUPORTE**

### **Documentação**
- 📖 **Wiki**: [Documentação completa](docs/)
- 🎥 **Videos**: [Canal YouTube](https://youtube.com/@roilabs)
- 💬 **Discord**: [Comunidade](https://discord.gg/roilabs)

### **Contato**
- 📧 **Email**: contato@roilabs.com
- 📱 **WhatsApp**: (11) 99999-9999
- 🌐 **Site**: https://roilabs.com
- 💼 **LinkedIn**: [@roilabs](https://linkedin.com/company/roilabs)

### **Bugs e Sugestões**
- 🐛 **Issues**: [GitHub Issues](https://github.com/roilabs/lais-ia/issues)
- 💡 **Features**: [GitHub Discussions](https://github.com/roilabs/lais-ia/discussions)

---

## 📄 **LICENÇA**

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2025 ROI Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🌟 **AGRADECIMENTOS**

- **Anthropic** pelo Claude 3.5 Sonnet
- **Evolution API** pela integração WhatsApp
- **Comunidade open source** pelas bibliotecas utilizadas
- **Beta testers** pelos feedbacks valiosos

---

<div align="center">

**🚀 Pronto para revolucionar suas vendas imobiliárias?**

[⭐ Dê uma estrela](https://github.com/roilabs/lais-ia-backend) | [🍴 Fork o projeto](https://github.com/roilabs/lais-ia-backend/fork) | [📢 Compartilhe](https://twitter.com/intent/tweet?text=Sistema%20SDR%20IA%20para%20Imobili%C3%A1rias&url=https://github.com/roilabs/lais-ia-backend)

---

**Desenvolvido com ❤️ por [ROI Labs](https://roilabs.com)**

</div>
