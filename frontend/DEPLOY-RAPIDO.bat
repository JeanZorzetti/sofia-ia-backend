@echo off
echo ========================================
echo 🚀 DEPLOY FRONTEND RÁPIDO - SOFIA IA
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 📋 Status:
echo ✅ Hook useSofiaApi.ts configurado (auto-detect ambiente)
echo ✅ Backend produção: https://sofiaia.roilabs.com.br
echo 🎯 Meta: Conectar frontend ao backend real

echo.
echo 🔧 Executando steps essenciais...

echo 1. Verificando se package.json existe...
if exist package.json (
    echo ✅ Package.json encontrado
) else (
    echo ❌ Package.json não encontrado!
    pause
    exit /b 1
)

echo 2. Verificando se node_modules existe...
if exist node_modules (
    echo ✅ Dependencies já instaladas
) else (
    echo 📦 Instalando dependencies (pode demorar)...
    start /wait npm install
)

echo 3. Build para produção...
echo ⚡ Executando npm run build...
start /wait npm run build

if exist dist (
    echo ✅ Build concluído! Pasta dist criada.
) else (
    echo ❌ Build falhou!
    pause
    exit /b 1
)

echo.
echo 🎯 OPÇÕES DE DEPLOY MANUAL:
echo.
echo OPÇÃO A - Via Vercel CLI (mais rápido):
echo   npx vercel --prod
echo.
echo OPÇÃO B - Via GitHub (automático):
echo   1. git add .
echo   2. git commit -m "Deploy: Frontend v2.1.0"  
echo   3. git push origin main
echo.
echo OPÇÃO C - Via Vercel Dashboard:
echo   1. Acesse vercel.com/dashboard
echo   2. Import from GitHub
echo   3. Auto-deploy configurado
echo.
echo ========================================
echo 🔗 URL ATUAL: https://sofia-ai-lux-dash.vercel.app
echo 📊 DEVE MOSTRAR: Dados dinâmicos do backend
echo ========================================
echo.
pause
