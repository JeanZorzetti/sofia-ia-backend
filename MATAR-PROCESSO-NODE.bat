@echo off
echo 🔧 MATAR PROCESSO SOFIA IA EXISTENTE
echo ==================================

echo 🔍 Procurando processos Node.js na porta 8000...
netstat -ano | findstr :8000

echo.
echo 💀 Matando todos os processos Node.js...
taskkill /f /im node.exe > nul 2>&1

echo ✅ Processos eliminados!
echo.

echo 🚀 Aguarde 2 segundos e inicie novamente:
echo    node src/app.js
echo.

timeout /t 2

echo ✅ Pronto! Agora pode executar: node src/app.js
pause