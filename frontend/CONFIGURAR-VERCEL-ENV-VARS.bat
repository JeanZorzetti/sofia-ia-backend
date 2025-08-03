@echo off
echo ========================================
echo ⚙️ SOFIA IA - CONFIGURAR ENV VARS VERCEL
echo ========================================

echo ✅ BACKEND EASYPANEL: Configurado corretamente
echo 🔄 FRONTEND VERCEL: Configuração necessária

echo.
echo 📋 VARIÁVEIS PARA VERCEL:
echo ========================================
echo.
echo VITE_API_URL=https://sofiaia.roilabs.com.br
echo VITE_APP_NAME=Sofia IA
echo VITE_NODE_ENV=production
echo VITE_ENVIRONMENT=production
echo VITE_BACKEND_URL=https://sofiaia.roilabs.com.br
echo VITE_COMPANY_PHONE=+5562983443919
echo.
echo ========================================
echo 🔗 CONFIGURAÇÃO MANUAL VERCEL:
echo ========================================
echo.
echo 1. ACESSE VERCEL:
echo    https://vercel.com/dashboard
echo.
echo 2. SELECIONE PROJETO:
echo    sofia-ai-lux-dash
echo.
echo 3. SETTINGS > ENVIRONMENT VARIABLES:
echo    - Clique "Settings" na aba superior
echo    - Clique "Environment Variables" no menu lateral
echo.
echo 4. ADICIONAR VARIÁVEIS (uma por vez):
echo.
echo    Nome: VITE_API_URL
echo    Valor: https://sofiaia.roilabs.com.br
echo    Environment: Production
echo    [Add]
echo.
echo    Nome: VITE_APP_NAME  
echo    Valor: Sofia IA
echo    Environment: Production
echo    [Add]
echo.
echo    Nome: VITE_NODE_ENV
echo    Valor: production
echo    Environment: Production
echo    [Add]
echo.
echo    Nome: VITE_ENVIRONMENT
echo    Valor: production
echo    Environment: Production
echo    [Add]
echo.
echo    Nome: VITE_BACKEND_URL
echo    Valor: https://sofiaia.roilabs.com.br
echo    Environment: Production
echo    [Add]
echo.
echo    Nome: VITE_COMPANY_PHONE
echo    Valor: +5562983443919
echo    Environment: Production
echo    [Add]
echo.
echo 5. REDEPLOY PROJETO:
echo    - Após adicionar todas variáveis
echo    - Clique "Deployments" na aba superior
echo    - No último deployment, clique nos 3 pontos "..."
echo    - Clique "Redeploy"
echo    - Aguardar 2-3 minutos
echo.
echo ========================================
echo 🔗 LINKS DIRETOS:
echo ========================================
echo Vercel Dashboard: https://vercel.com/dashboard
echo Project Settings: https://vercel.com/roi-labs/sofia-ai-lux-dash/settings
echo Environment Variables: https://vercel.com/roi-labs/sofia-ai-lux-dash/settings/environment-variables
echo.
echo ⚠️ IMPORTANTE:
echo Todas variáveis devem ter prefixo VITE_ para funcionar
echo Redeploy é obrigatório após adicionar variáveis
echo.
echo ✅ RESULTADO ESPERADO:
echo Frontend conectará ao backend produção automaticamente
echo.
start https://vercel.com/dashboard

echo.
echo 🌐 Vercel aberto no navegador
echo 📝 Configure as variáveis listadas acima
echo 🔄 Redeploy após configuração
echo ⏱️  Deploy em 2-3 minutos
echo.
pause
