@echo off
echo 🎯 INICIAR SOFIA IA BACKEND v2.2.0 - ANALYTICS TRACKING
echo ========================================================
echo.

echo 📅 Data/Hora: %date% %time%
echo 💻 Iniciando em: localhost:8000
echo.

echo 🔧 Navegando para diretório...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🚀 Iniciando Sofia IA Backend v2.2.0...
echo.
echo ✅ Funcionalidades ativas:
echo    📊 Analytics Tracking
echo    📱 WhatsApp Management  
echo    📈 Dashboard Metrics
echo    🔧 8+ Endpoints funcionais
echo.

start "Sofia IA Backend" cmd /k "node src/app.js"

echo.
echo 🌍 Backend iniciado em nova janela!
echo 📊 URL: http://localhost:8000
echo 🩺 Health: http://localhost:8000/health
echo.

timeout /t 3

echo 🧪 Testando se backend está online...
curl -s http://localhost:8000/health > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend está ONLINE e funcionando!
    echo.
    echo 📋 Próximos passos:
    echo 1. Execute: TESTAR-ANALYTICS-COMPLETO.bat
    echo 2. Ou teste manual: http://localhost:8000
    echo.
) else (
    echo ⏳ Backend ainda está iniciando...
    echo 💡 Aguarde alguns segundos e teste: http://localhost:8000/health
    echo.
)

pause