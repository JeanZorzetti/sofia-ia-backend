@echo off
echo ========================================
echo ⚙️ SOFIA IA - CONFIGURAR ENV VARS PRODUÇÃO
echo ========================================

echo 📋 STATUS ATUAL:
echo ✅ Deploy funcionando
echo ✅ Domínio customizado conectado
echo ✅ Bug login corrigido (aguardando teste)

echo.
echo 🎯 PRÓXIMO PASSO: Configurar variáveis de ambiente produção
echo.

echo 📍 VARIÁVEIS NECESSÁRIAS:
echo ========================================
echo.
echo FRONTEND (Vercel):
echo VITE_API_URL=https://sofiaia.roilabs.com.br
echo VITE_APP_NAME=Sofia IA
echo VITE_NODE_ENV=production
echo VITE_ENVIRONMENT=production
echo.
echo BACKEND (EasyPanel):
echo NODE_ENV=production
echo PORT=8000
echo API_BASE_URL=https://sofiaia.roilabs.com.br
echo CORS_ORIGIN=https://sofia-ia.roilabs.com.br
echo.
echo 📊 CONFIGURAÇÃO MANUAL NECESSÁRIA:
echo ========================================
echo.
echo 1. FRONTEND (Vercel):
echo    - Acesse: https://vercel.com/dashboard
echo    - Projeto: sofia-ai-lux-dash
echo    - Settings > Environment Variables
echo    - Adicionar variáveis acima
echo.
echo 2. BACKEND (EasyPanel):
echo    - Acesse: https://easypanel.io
echo    - Projeto: sofia-ia-backend
echo    - Environment > Variables
echo    - Adicionar variáveis acima
echo.
echo 3. REDEPLOY APÓS CONFIGURAÇÃO:
echo    - Frontend: Auto-redeploy no próximo commit
echo    - Backend: Restart manual no EasyPanel
echo.
echo ========================================
echo 🔗 LINKS DIRETOS:
echo ========================================
echo Vercel Dashboard: https://vercel.com/dashboard
echo EasyPanel: https://easypanel.io
echo Status Atual: https://sofia-ia.roilabs.com.br
echo.
echo ⚠️ IMPORTANTE:
echo Configure env vars antes de próximo deploy
echo Teste local primeiro: http://localhost:5173
echo.
pause
