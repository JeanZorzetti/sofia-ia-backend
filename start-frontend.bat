@echo off
echo ========================================
echo 🚀 SOFIA IA - INICIAR FRONTEND
echo ========================================
echo.
echo ✅ Backend confirmado funcionando (porta 8000)
echo 🎯 Iniciando frontend (porta 8080)...
echo.
cd frontend\sofia-ai-lux-dash-main
echo 📦 Instalando dependências...
call npm install
echo.
echo 🚀 Iniciando desenvolvimento...
call npm run dev