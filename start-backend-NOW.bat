@echo off
echo 🚀 SOFIA IA - Iniciando Backend Local
echo =====================================
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 📍 Verificando se Node.js está instalado...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado! Instale Node.js v18+ primeiro
    pause
    exit /b 1
)

echo 📍 Verificando dependências...
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

echo 🔄 Iniciando servidor Sofia IA...
echo 📍 Backend será iniciado em: http://localhost:8000
echo 🌐 Para parar o servidor: Ctrl+C
echo =====================================

npm run dev

pause
