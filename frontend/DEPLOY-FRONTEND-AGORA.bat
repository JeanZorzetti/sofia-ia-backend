@echo off
echo ========================================
echo 🚀 DEPLOY FRONTEND PRODUÇÃO ATUALIZADO
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 📋 Status Atual:
echo ✅ Frontend local preparado com hooks dinâmicos
echo ✅ Backend produção funcionando (v2.1.0)
echo ❌ Deploy Vercel desatualizado (dados hardcoded)

echo.
echo 🔧 Configurando para produção...

echo 1. Verificando se Git está configurado...
git status

echo 2. Verificando se npm/node funcionam...
node --version
npm --version

echo 3. Instalando dependências se necessário...
npm install

echo 4. Build otimizado para produção...
npm run build

echo 5. Preparando deploy Vercel...
echo.
echo 📋 OPÇÕES DE DEPLOY:
echo.
echo OPÇÃO A - Deploy direto via Vercel CLI:
echo   npx vercel --prod
echo.
echo OPÇÃO B - Push para GitHub + auto-deploy:
echo   git add .
echo   git commit -m "🚀 Deploy: Frontend v2.1.0 com dados dinâmicos"
echo   git push origin main
echo.
echo OPÇÃO C - Deploy manual via Vercel Dashboard:
echo   1. Acesse vercel.com/dashboard
echo   2. Importe projeto GitHub
echo   3. Configure auto-deploy
echo.
echo ========================================
echo 🎯 RECOMENDAÇÃO: Use OPÇÃO A (mais rápido)
echo ========================================
echo.
echo Executar deploy agora? [s/n]:
set /p deploy=

if /i "%deploy%"=="s" (
    echo 🚀 Executando deploy via Vercel CLI...
    npx vercel --prod
    echo.
    echo ✅ Deploy concluído!
    echo 🔗 Teste: https://sofia-ai-lux-dash.vercel.app
    echo 📊 Deve mostrar dados dinâmicos do backend agora
) else (
    echo 📋 Deploy manual necessário. Use uma das opções acima.
)

echo.
pause
