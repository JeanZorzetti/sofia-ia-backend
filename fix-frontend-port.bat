@echo off
echo 🔧 SOFIA IA - Fix Porta Frontend
echo ==================================
echo.
echo 🎯 PROBLEMA IDENTIFICADO:
echo   Vite configurado para porta 8080 (incorreto)
echo   Deveria usar porta 5173 (padrão Vite)
echo.
echo ✅ SOLUÇÃO APLICADA:
echo   vite.config.ts corrigido para porta 5173
echo.
echo 🧹 Limpando processos que possam ocupar porta 5173...

echo 📍 Verificando porta 5173...
netstat -ano | findstr :5173
if errorlevel 1 (
    echo ✅ Porta 5173 livre
) else (
    echo ⚠️ Porta 5173 ocupada. Tentando liberar...
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
        echo Finalizando processo PID: %%p
        taskkill /PID %%p /F >nul 2>&1
    )
)

echo.
echo 🔄 Reiniciando frontend na porta correta...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

echo 🚀 Iniciando frontend na porta 5173...
echo 🌐 URL: http://localhost:5173
echo ====================================

npm run dev

pause
