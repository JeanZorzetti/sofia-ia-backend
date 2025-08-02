@echo off
echo 🔍 SOFIA IA - Diagnóstico de Porta
echo ===================================

echo 📍 Verificando o que está usando a porta 8000...
netstat -ano | findstr :8000

echo.
echo 📍 Processos Node.js em execução:
tasklist | findstr node.exe

echo.
echo 🎯 OPÇÕES:
echo [1] Matar processo na porta 8000 e reiniciar Sofia IA
echo [2] Usar porta alternativa (8001)
echo [3] Verificar se Sofia IA já está rodando

echo.
set /p choice="Digite sua escolha (1, 2 ou 3): "

if "%choice%"=="1" goto kill_process
if "%choice%"=="2" goto use_alt_port
if "%choice%"=="3" goto check_running

:kill_process
echo 🔥 Matando processos na porta 8000...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Matando PID: %%p
    taskkill /PID %%p /F
)
echo ✅ Processos finalizados. Tentando reiniciar Sofia IA...
goto start_sofia

:use_alt_port
echo 🔄 Iniciando Sofia IA na porta 8001...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"
set PORT=8001
npm run dev
goto end

:check_running
echo 🌐 Testando se Sofia IA já está rodando na porta 8000...
curl -s http://localhost:8000/health
if errorlevel 1 (
    echo ❌ Sofia IA não está respondendo na porta 8000
) else (
    echo ✅ Sofia IA JÁ ESTÁ RODANDO na porta 8000!
    echo 🌐 Acesse: http://localhost:8000
    echo 📊 Health: http://localhost:8000/health
    echo 📈 Dashboard: http://localhost:8000/api/dashboard/overview
)
goto end

:start_sofia
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"
npm run dev
goto end

:end
pause
