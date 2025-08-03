@echo off
echo 🚀 SOFIA IA BACKEND v2.2.0 - PORTA 8001
echo =======================================

echo 📅 Data/Hora: %date% %time%
echo 💻 Iniciando em: localhost:8001 (porta alternativa)
echo.

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🔧 Configurando porta 8001...
set PORT=8001

echo 🚀 Iniciando Sofia IA na porta 8001...
echo.
echo ✅ URL: http://localhost:8001
echo 📊 Health: http://localhost:8001/health
echo 📈 Dashboard: http://localhost:8001/api/dashboard/overview
echo.

node src/app.js

pause