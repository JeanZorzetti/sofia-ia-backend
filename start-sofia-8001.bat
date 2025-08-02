@echo off
echo 🚀 SOFIA IA - Porta Alternativa 8001
echo =====================================
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🔄 Configurando porta 8001...
set PORT=8001

echo 🚀 Iniciando Sofia IA na porta 8001...
echo 📍 Backend: http://localhost:8001
echo 📊 Health: http://localhost:8001/health
echo 📈 Dashboard: http://localhost:8001/api/dashboard/overview
echo =====================================

npm run dev
