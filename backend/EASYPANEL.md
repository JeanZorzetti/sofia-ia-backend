# 🚀 EasyPanel Configuration for LAIS IA

# Este arquivo contém as configurações para deploy no EasyPanel
# Para usar: Copie essas configurações no painel do EasyPanel

## APP CONFIGURATION

**App Name:** lais-ia-backend
**Domain:** lais-ia-api.roilabs.com.br
**Port:** 8000
**Health Check Path:** /health

## ENVIRONMENT VARIABLES

```env
NODE_ENV=production
PORT=8000

# URLs
WEBHOOK_URL=https://lais-ia-api.roilabs.com.br
FRONTEND_URL=https://lais-ia.roilabs.com.br
ALLOWED_ORIGINS=https://lais-ia.roilabs.com.br,https://n8n.roilabs.com.br

# N8N Integration - JÁ CONFIGURADO!
N8N_WEBHOOK_URL=https://n8n.roilabs.com.br
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOGM4OTNiNC1kZDJiLTRmZGQtYTNjNy02Mjc3MjJjMjU0NjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMjAxNjExfQ.dNkFl5bbxuVnCcVx6-8cCfJYE8Fw5rsA_z_rf0YjWC0
ENABLE_N8N=true

# Supabase Database
DATABASE_URL=SUA_SUPABASE_DATABASE_URL_AQUI
SUPABASE_URL=SUA_SUPABASE_URL_AQUI
SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY_AQUI

# Redis
REDIS_URL=SUA_REDIS_URL_AQUI
REDIS_PASSWORD=SUA_REDIS_PASSWORD_AQUI

# Evolution API
EVOLUTION_API_URL=SUA_EVOLUTION_URL_AQUI
EVOLUTION_API_KEY=SUA_EVOLUTION_KEY_AQUI
EVOLUTION_INSTANCE_NAME=lais_ia_roilabs

# Claude AI
ANTHROPIC_API_KEY=SUA_CLAUDE_KEY_AQUI
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Security
JWT_SECRET=chave_jwt_super_segura_production_64_chars_roilabs_2025_aqui

# Company
COMPANY_NAME=ROI Labs
COMPANY_PHONE=5511999999999
COMPANY_EMAIL=contato@roilabs.com.br

# Production optimizations
LOG_LEVEL=warn
DEBUG_MODE=false
RATE_LIMIT_REQUESTS=1000
DB_POOL_MAX=20
```

## DOCKER CONFIGURATION

**Dockerfile:** Use o Dockerfile incluído no repositório

**Build Command:** 
```bash
docker build -t lais-ia-backend .
```

**Run Command:**
```bash
docker run -p 8000:8000 --env-file .env lais-ia-backend
```

## RESOURCE LIMITS

**CPU:** 1 core
**Memory:** 1GB
**Storage:** 20GB

## NETWORKING

**Internal Port:** 8000
**External Port:** 80/443 (handled by EasyPanel)
**Protocol:** HTTP

## PERSISTENT VOLUMES

```
/app/logs -> Volume for application logs
/app/uploads -> Volume for temporary file uploads  
/app/backups -> Volume for database backups
```

## SSL CERTIFICATE

EasyPanel will automatically provision SSL certificate for:
- lais-ia-api.roilabs.com.br

## MONITORING

**Health Check:** GET /health
**Metrics Endpoint:** GET /admin/metrics/performance
**Logs:** Available in EasyPanel dashboard

## SCALING

**Horizontal Scaling:** Available (stateless application)
**Auto-scaling trigger:** CPU > 80% or Memory > 85%

## BACKUP STRATEGY

**Database:** Managed by Supabase (automatic)
**Application Logs:** Retained for 30 days
**User Uploads:** Backed up daily

## CI/CD PIPELINE

**Repository:** https://github.com/roilabs/lais-ia-backend
**Branch:** main
**Auto-deploy:** On push to main branch
**Build Trigger:** Webhook from GitHub

## CUSTOM DOMAINS

- lais-ia-api.roilabs.com.br (API)
- lais-ia.roilabs.com.br (Frontend - será configurado separadamente)

## WEBHOOKS CONFIGURATION

Configure these webhooks in your Evolution API:
- **WhatsApp Messages:** https://lais-ia-api.roilabs.com.br/webhooks/whatsapp
- **Connection Status:** https://lais-ia-api.roilabs.com.br/webhooks/evolution/status

Configure n8n integration:
- **N8N to Backend:** https://lais-ia-api.roilabs.com.br/webhooks/n8n
- **Backend to N8N:** https://n8n.roilabs.com.br/webhook/lais-ia

## ENVIRONMENT SETUP COMMANDS

```bash
# 1. Clone repository
git clone https://github.com/roilabs/lais-ia-backend.git

# 2. Install dependencies
npm install

# 3. Run migrations (after deploy)
npm run migrate

# 4. Check health
curl https://lais-ia-api.roilabs.com.br/health
```

## TROUBLESHOOTING

**Logs Location:** EasyPanel Dashboard -> Applications -> lais-ia-backend -> Logs
**Restart Command:** EasyPanel Dashboard -> Applications -> lais-ia-backend -> Restart
**Health Check:** https://lais-ia-api.roilabs.com.br/health

## SECURITY NOTES

- All environment variables are encrypted in EasyPanel
- SSL/TLS termination handled by EasyPanel
- Rate limiting implemented in application
- JWT tokens for API authentication
- CORS configured for trusted domains only

## COST OPTIMIZATION

- Use EasyPanel's resource monitoring
- Scale down during low usage periods  
- Monitor Supabase usage to stay within free tier
- Optimize Redis cache to reduce database calls
