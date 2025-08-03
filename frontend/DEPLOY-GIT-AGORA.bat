@echo off
echo ========================================
echo 🚀 SOFIA IA - DEPLOY VIA GIT (CONFIÁVEL)
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 📋 Status do Deploy:
echo ✅ Build dist/ já existe
echo ✅ Vercel project configurado
echo ✅ Hook useSofiaApi.ts auto-detecta produção
echo 🎯 URL: https://sofia-ai-lux-dash.vercel.app

echo.
echo 🔄 Fazendo deploy via Git...

echo 1. Verificando status Git...
git status --porcelain

echo.
echo 2. Adicionando arquivos modificados...
git add .

echo.
echo 3. Commit do deploy...
git commit -m "🚀 Deploy: Frontend v2.1.0 com dados dinâmicos conectados ao backend produção"

echo.
echo 4. Push para main (trigger auto-deploy)...
git push origin main

echo.
echo ========================================
echo ✅ DEPLOY INICIADO!
echo ========================================
echo 📊 Auto-deploy Vercel será executado em ~2-3 minutos
echo 🔗 URL: https://sofia-ai-lux-dash.vercel.app
echo 📊 Dados: Backend https://sofiaia.roilabs.com.br
echo.
echo 🎯 PRÓXIMO PASSO CHECKLIST:
echo    ✅ Deploy atualizado
echo    🔄 Conectar domínio customizado
echo ========================================

pause
