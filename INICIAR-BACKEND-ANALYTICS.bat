@echo off
echo 🚀 SOFIA IA - INICIAR BACKEND COM ANALYTICS v2.2.0
echo ================================================
echo.

echo 📅 Data/Hora: %date% %time%
echo 💻 Iniciando em: localhost:8000
echo.

echo 🔧 Passo 1: Navegando para diretório backend...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 📦 Passo 2: Verificando dependências...
if not exist "node_modules" (
    echo 📥 Instalando dependências...
    npm install
)

echo 🚀 Passo 3: Iniciando servidor Sofia IA v2.2.0...
echo.
echo ✅ Backend será iniciado com:
echo    📊 Analytics Tracking: ATIVO
echo    📱 WhatsApp Management: ATIVO  
echo    📈 Dashboard Metrics: ATIVO
echo    🔧 Todas as APIs: FUNCIONAIS
echo.

echo 🌍 URL do Backend: http://localhost:8000
echo 📊 Health Check: http://localhost:8000/health
echo 📈 Analytics: http://localhost:8000/api/analytics/insights
echo.

echo 🚀 Iniciando servidor...
node src/app.js

pause