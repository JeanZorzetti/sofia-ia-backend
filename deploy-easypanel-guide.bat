@echo off
echo ========================================
echo 🚀 SOFIA IA - DEPLOY EASYPANEL
echo ========================================
echo.

echo ✅ GitHub: Sincronizado com sucesso!
echo 📍 Repositorio: https://github.com/JeanZorzetti/sofia-ia-backend
echo 🎯 Commit: cf3d16e - Hooks de API corrigidos
echo.

echo 📋 INFORMACOES PARA DEPLOY EASYPANEL:
echo ========================================
echo.
echo 🔗 REPOSITORIO GITHUB:
echo    https://github.com/JeanZorzetti/sofia-ia-backend.git
echo.
echo 📁 CONFIGURACOES:
echo    Branch: main
echo    Build Command: npm install
echo    Start Command: npm start
echo    Port: 8000
echo    Node Version: 18+
echo.
echo 🌍 ENVIRONMENT VARIABLES (.env):
echo    ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
echo    EVOLUTION_API_URL=https://evolutionapi.roilabs.com.br
echo    EVOLUTION_API_KEY=SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz
echo    DATABASE_URL=postgresql://postgres.lbnmwhobrhqtyqfagzhp:ROILabs2024*@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
echo    N8N_WEBHOOK_URL=https://n8n.roilabs.com.br/webhook/
echo    N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOiIvYXBpL3YxIiwiaWF0IjoxNzM2Mzc1NzUxfQ.aPzJI1RkW3yvs30tOGN7lhJaT9QAOiLDJFXl6qlbO10
echo    PORT=8000
echo    NODE_ENV=production
echo.
echo 🔗 HEALTH CHECK URL:
echo    https://[SEU-DOMINIO]/health
echo.
echo 📊 ENDPOINTS PARA TESTAR APOS DEPLOY:
echo    GET /health                    - Health check
echo    GET /api/dashboard/overview    - Metricas dashboard
echo    GET /api/conversations/recent  - Conversas recentes
echo    GET /api/leads                 - Lista de leads
echo    GET /api/realtime/stats        - Stats em tempo real
echo.
echo ========================================
echo 🎯 PASSOS PARA DEPLOY EASYPANEL:
echo ========================================
echo.
echo 1. Acesse: https://easypanel.roilabs.com.br
echo 2. New Project ^> Create from Git
echo 3. Repository: https://github.com/JeanZorzetti/sofia-ia-backend.git
echo 4. Branch: main
echo 5. Build: npm install
echo 6. Start: npm start
echo 7. Port: 8000
echo 8. Environment Variables: Copiar do .env acima
echo 9. Deploy!
echo.
echo ✅ PRONTO! Backend Sofia IA em producao
echo.
pause