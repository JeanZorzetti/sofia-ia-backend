@echo off
echo 🚀 SOFIA IA - Inicialização Completa
echo =====================================
echo.
echo ✅ STEP 1: Backend corrigido para localhost:8001  
echo ✅ STEP 2: Frontend corrigido para conectar em localhost:8001
echo.
echo 🎯 EXECUÇÃO:
echo [1] Iniciar Backend (porta 8001)
echo [2] Iniciar Frontend (porta 5173) 
echo [3] Iniciar AMBOS (recomendado)
echo [4] Testar se está funcionando
echo.

set /p choice="Digite sua escolha (1, 2, 3 ou 4): "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend  
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto test_system

:start_backend
echo 🔄 Iniciando Backend Sofia IA na porta 8001...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"
set PORT=8001
start "Sofia IA Backend" cmd /k "npm run dev"
timeout /t 3
echo ✅ Backend iniciado! Verificando...
curl -s http://localhost:8001/health >nul
if errorlevel 1 (
    echo ❌ Backend não respondeu
) else (
    echo ✅ Backend respondendo na porta 8001!
)
goto menu

:start_frontend
echo 🔄 Iniciando Frontend Sofia IA na porta 5173...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"
start "Sofia IA Frontend" cmd /k "npm run dev"
timeout /t 5
echo ✅ Frontend iniciado na porta 5173!
echo 🌐 Acesse: http://localhost:5173
goto menu

:start_both
echo 🚀 INICIANDO SISTEMA COMPLETO...
echo.
echo 🔄 1/2: Iniciando Backend (porta 8001)...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"
set PORT=8001
start "Sofia IA Backend" cmd /k "npm run dev"
timeout /t 5

echo 🔄 2/2: Iniciando Frontend (porta 5173)...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"
start "Sofia IA Frontend" cmd /k "npm run dev"
timeout /t 3

echo ✅ SISTEMA INICIADO!
echo 📊 Backend: http://localhost:8001
echo 🌐 Frontend: http://localhost:5173
echo.
echo 📋 URLs para testar:
echo   Health Check: http://localhost:8001/health
echo   Dashboard API: http://localhost:8001/api/dashboard/overview
echo   Frontend App: http://localhost:5173
echo.
goto end

:test_system
echo 🔍 TESTANDO SISTEMA SOFIA IA...
echo.
echo 📊 Testando Backend (porta 8001)...
curl -s http://localhost:8001/health
if errorlevel 1 (
    echo ❌ Backend não está respondendo
) else (
    echo ✅ Backend OK!
)

echo.
echo 📈 Testando API Dashboard...
curl -s http://localhost:8001/api/dashboard/overview >nul
if errorlevel 1 (
    echo ❌ API Dashboard com problema
) else (
    echo ✅ API Dashboard OK!
)

echo.
echo 🌐 Frontend deve estar em: http://localhost:5173
echo 💡 Abra no navegador para testar interface
goto menu

:menu
echo.
echo 🎯 Escolha outra opção ou pressione qualquer tecla para sair
pause >nul
goto end

:end
echo.
echo 🎉 SOFIA IA pronto para usar!
echo 🌐 Frontend: http://localhost:5173  
echo 📊 Backend: http://localhost:8001
pause
