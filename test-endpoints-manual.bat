@echo off
echo.
echo ========================================
echo 🧪 SOFIA IA - TESTE MANUAL DOS ENDPOINTS
echo ========================================
echo.

echo 📡 Servidor: http://localhost:8000
echo 📊 Total: 9 endpoints principais
echo.

echo 🔍 Verificando se servidor está ativo...
netstat -an | findstr :8000 > nul
if %errorlevel% == 0 (
    echo ✅ Servidor rodando na porta 8000
) else (
    echo ❌ Servidor NÃO está rodando na porta 8000
    echo 💡 Execute: cd backend ^&^& npm start
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎯 ESCOLHA UM ENDPOINT PARA TESTAR:
echo ========================================
echo.
echo 1. GET / (Página Inicial)
echo 2. GET /health (Health Check)
echo 3. GET /api/dashboard/overview (Dashboard)
echo 4. GET /api/conversations/recent (Conversas)
echo 5. GET /api/leads (Lista de Leads)
echo 6. GET /api/leads?page=1^&limit=5 (Leads Paginados)
echo 7. GET /api/leads/1 (Lead Específico)
echo 8. GET /api/analytics/detailed (Analytics)
echo 9. GET /api/realtime/stats (Stats Tempo Real)
echo 10. TESTAR TODOS (sequencial)
echo 0. Sair
echo.

set /p choice="Digite sua escolha (0-10): "

if "%choice%"=="1" goto test1
if "%choice%"=="2" goto test2
if "%choice%"=="3" goto test3
if "%choice%"=="4" goto test4
if "%choice%"=="5" goto test5
if "%choice%"=="6" goto test6
if "%choice%"=="7" goto test7
if "%choice%"=="8" goto test8
if "%choice%"=="9" goto test9
if "%choice%"=="10" goto testall
if "%choice%"=="0" goto end
goto invalid

:test1
echo.
echo 🧪 Testando: Página Inicial
echo 📡 GET http://localhost:8000/
start "" "http://localhost:8000/"
goto menu

:test2
echo.
echo 🧪 Testando: Health Check
echo 📡 GET http://localhost:8000/health
start "" "http://localhost:8000/health"
goto menu

:test3
echo.
echo 🧪 Testando: Dashboard Overview
echo 📡 GET http://localhost:8000/api/dashboard/overview
start "" "http://localhost:8000/api/dashboard/overview"
goto menu

:test4
echo.
echo 🧪 Testando: Conversas Recentes
echo 📡 GET http://localhost:8000/api/conversations/recent
start "" "http://localhost:8000/api/conversations/recent"
goto menu

:test5
echo.
echo 🧪 Testando: Lista de Leads
echo 📡 GET http://localhost:8000/api/leads
start "" "http://localhost:8000/api/leads"
goto menu

:test6
echo.
echo 🧪 Testando: Leads Paginados
echo 📡 GET http://localhost:8000/api/leads?page=1^&limit=5
start "" "http://localhost:8000/api/leads?page=1&limit=5"
goto menu

:test7
echo.
echo 🧪 Testando: Lead Específico
echo 📡 GET http://localhost:8000/api/leads/1
start "" "http://localhost:8000/api/leads/1"
goto menu

:test8
echo.
echo 🧪 Testando: Analytics Detalhados
echo 📡 GET http://localhost:8000/api/analytics/detailed
start "" "http://localhost:8000/api/analytics/detailed"
goto menu

:test9
echo.
echo 🧪 Testando: Stats Tempo Real
echo 📡 GET http://localhost:8000/api/realtime/stats
start "" "http://localhost:8000/api/realtime/stats"
goto menu

:testall
echo.
echo 🚀 Abrindo todos os endpoints no navegador...
start "" "http://localhost:8000/"
timeout /t 1 /nobreak > nul
start "" "http://localhost:8000/health"
timeout /t 1 /nobreak > nul
start "" "http://localhost:8000/api/dashboard/overview"
timeout /t 1 /nobreak > nul
start "" "http://localhost:8000/api/conversations/recent"
timeout /t 1 /nobreak > nul
start "" "http://localhost:8000/api/leads"
timeout /t 1 /nobreak > nul
start "" "http://localhost:8000/api/analytics/detailed"
timeout /t 1 /nobreak > nul
start "" "http://localhost:8000/api/realtime/stats"
echo ✅ Todos os endpoints abertos no navegador!
goto menu

:invalid
echo ❌ Opção inválida! Digite um número de 0 a 10.
goto menu

:menu
echo.
echo ========================================
echo 💡 DICAS:
echo ========================================
echo • Verifique se o JSON é retornado corretamente
echo • Status 200 = Sucesso
echo • Campos "success": true nos endpoints de API
echo • Dados dinâmicos mudam a cada refresh
echo.
set /p continue="Pressione ENTER para voltar ao menu ou digite 'x' para sair: "
if /i "%continue%"=="x" goto end
cls
goto start

:start
echo.
echo ========================================
echo 🎯 ESCOLHA UM ENDPOINT PARA TESTAR:
echo ========================================
echo.
echo 1. GET / (Página Inicial)
echo 2. GET /health (Health Check)
echo 3. GET /api/dashboard/overview (Dashboard)
echo 4. GET /api/conversations/recent (Conversas)
echo 5. GET /api/leads (Lista de Leads)
echo 6. GET /api/leads?page=1^&limit=5 (Leads Paginados)
echo 7. GET /api/leads/1 (Lead Específico)
echo 8. GET /api/analytics/detailed (Analytics)
echo 9. GET /api/realtime/stats (Stats Tempo Real)
echo 10. TESTAR TODOS (sequencial)
echo 0. Sair
echo.

set /p choice="Digite sua escolha (0-10): "

if "%choice%"=="1" goto test1
if "%choice%"=="2" goto test2
if "%choice%"=="3" goto test3
if "%choice%"=="4" goto test4
if "%choice%"=="5" goto test5
if "%choice%"=="6" goto test6
if "%choice%"=="7" goto test7
if "%choice%"=="8" goto test8
if "%choice%"=="9" goto test9
if "%choice%"=="10" goto testall
if "%choice%"=="0" goto end
goto invalid

:end
echo.
echo 👋 Teste concluído!
echo.
echo 📋 RESUMO:
echo ✅ Backend rodando em http://localhost:8000
echo ✅ 9 endpoints principais identificados
echo ✅ Dados simulados realisticamente
echo ✅ Sistema pronto para conectar frontend
echo.
echo 🎯 PRÓXIMO PASSO: Conectar frontend ao backend
echo.
pause
exit /b 0