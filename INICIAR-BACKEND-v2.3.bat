@echo off
echo 🚀 INICIANDO SOFIA IA BACKEND v2.3.0 COM EVOLUTION API REAL
echo ============================================================
echo 📍 Diretorio: %cd%
echo 📱 Evolution API: INTEGRADA
echo 🔗 Backend URL: http://localhost:8000
echo ============================================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🔄 Matando processos Node.js existentes...
taskkill /f /im node.exe >nul 2>&1

echo 📦 Instalando dependencias se necessario...
npm install --silent

echo 🚀 Iniciando backend com Evolution API integrada...
node src/app.js

pause
