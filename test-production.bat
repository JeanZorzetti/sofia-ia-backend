@echo off
echo ========================================
echo 🌍 SOFIA IA - TESTE PRODUCAO
echo ========================================
echo.

echo 🎯 INSTRUCOES:
echo 1. Pegue a URL publica do EasyPanel
echo 2. Substitua [URL_PRODUCAO] abaixo pela URL real
echo 3. Execute os testes
echo.
echo Exemplo URL: https://sofia-ia-backend.easypanel.app
echo.

set /p PROD_URL="Digite a URL de producao (sem / no final): "

echo.
echo 🧪 TESTANDO ENDPOINTS EM PRODUCAO...
echo ========================================
echo.

echo ⚡ Testando Health Check...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%PROD_URL%/health' -TimeoutSec 5; Write-Host '✅ Health Status:' $response.status -ForegroundColor Green; Write-Host '🌍 Environment:' $response.environment -ForegroundColor Cyan; Write-Host '📍 Version:' $response.version -ForegroundColor Yellow } catch { Write-Host '❌ Health check falhou!' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red }"

echo.
echo ⚡ Testando Dashboard API...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%PROD_URL%/api/dashboard/overview' -TimeoutSec 5; Write-Host '✅ Dashboard API funcionando!' -ForegroundColor Green; Write-Host '💬 Conversas hoje:' $response.data.stats.conversations_today -ForegroundColor Cyan; Write-Host '📊 Taxa conversao:' $response.data.stats.conversion_rate'%%' -ForegroundColor Yellow } catch { Write-Host '❌ Dashboard API com problema!' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red }"

echo.
echo ⚡ Testando Conversations API...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%PROD_URL%/api/conversations/recent' -TimeoutSec 5; Write-Host '✅ Conversations API funcionando!' -ForegroundColor Green; Write-Host '💬 Mensagens encontradas:' $response.data.Count -ForegroundColor Cyan } catch { Write-Host '❌ Conversations API com problema!' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red }"

echo.
echo ⚡ Testando Realtime Stats...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%PROD_URL%/api/realtime/stats' -TimeoutSec 5; Write-Host '✅ Realtime Stats funcionando!' -ForegroundColor Green; Write-Host '👥 Conversas ativas:' $response.data.active_conversations -ForegroundColor Cyan; Write-Host '⏱️ Tempo resposta:' $response.data.avg_response_time -ForegroundColor Yellow } catch { Write-Host '❌ Realtime Stats com problema!' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red }"

echo.
echo ========================================
echo 🎯 RESULTADO DOS TESTES:
echo ========================================
echo.
echo Se todos os testes passaram:
echo ✅ Backend Sofia IA em producao funcionando!
echo ✅ Hooks de API vao funcionar no frontend
echo ✅ Pronto para configurar frontend para producao
echo.
echo URL de producao: %PROD_URL%
echo.
echo ========================================
pause