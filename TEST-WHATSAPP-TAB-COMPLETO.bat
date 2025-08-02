@echo off
echo 🚀 TESTANDO WHATSAPP TAB - FRONTEND + BACKEND
echo ================================================

echo 📍 1. Verificando se backend está rodando...
curl -s http://localhost:8000/health | findstr "2.1.0"
if %errorlevel% equ 0 (
    echo ✅ Backend WhatsApp v2.1.0 ATIVO!
) else (
    echo ❌ Backend não está rodando! Execute start-backend-whatsapp.bat primeiro
    pause
    exit
)

echo.
echo 📍 2. Testando endpoints WhatsApp...
curl -s http://localhost:8000/api/whatsapp/instances | findstr "success"
if %errorlevel% equ 0 (
    echo ✅ Endpoints WhatsApp FUNCIONANDO!
) else (
    echo ❌ Endpoints WhatsApp com problema!
    pause
    exit
)

echo.
echo 📍 3. Iniciando frontend React...
cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"
echo 📂 Diretório: %CD%

echo.
echo 🌐 Frontend será aberto em: http://localhost:5173
echo 📱 WhatsApp Tab deve estar 100%% funcional!
echo.
echo ⚡ Iniciando servidor de desenvolvimento...
npm run dev
