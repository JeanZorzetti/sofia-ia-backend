@echo off
echo ========================================
echo 🏠 SOFIA IA - TESTE DE INTEGRACAO COMPLETA
echo ========================================
echo.

echo 📊 Testando Backend (Porta 8000)...
echo.

REM Testar health check
echo ⚡ Testando /health...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8000/health' -TimeoutSec 3; Write-Host '✅ Backend Status:' $response.status -ForegroundColor Green; Write-Host '📍 Version:' $response.version -ForegroundColor Cyan; Write-Host '⏱️ Uptime:' ([math]::Round($response.uptime, 2)) 'seconds' -ForegroundColor Yellow } catch { Write-Host '❌ Backend não está rodando!' -ForegroundColor Red; Write-Host 'Execute: npm start (na pasta backend)' -ForegroundColor Yellow }"

echo.
echo ⚡ Testando /api/dashboard/overview...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/dashboard/overview' -TimeoutSec 3; Write-Host '✅ Dashboard API funcionando!' -ForegroundColor Green; Write-Host '💬 Conversas hoje:' $response.data.stats.conversations_today -ForegroundColor Cyan; Write-Host '📊 Taxa conversão:' $response.data.stats.conversion_rate'%' -ForegroundColor Yellow } catch { Write-Host '❌ Dashboard API com problema!' -ForegroundColor Red }"

echo.
echo ⚡ Testando /api/conversations/recent...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/conversations/recent' -TimeoutSec 3; Write-Host '✅ Conversations API funcionando!' -ForegroundColor Green; Write-Host '💬 Mensagens encontradas:' $response.data.Count -ForegroundColor Cyan } catch { Write-Host '❌ Conversations API com problema!' -ForegroundColor Red }"

echo.
echo ========================================
echo 🎯 RESULTADO DO TESTE:
echo ========================================
echo.
echo Se todos os testes passaram:
echo ✅ Backend funcionando corretamente
echo ✅ Hooks de API estão corretos  
echo ✅ Próximo passo: Testar frontend
echo.
echo Para testar frontend:
echo 1. cd frontend/sofia-ai-lux-dash-main
echo 2. npm run dev
echo 3. Abrir: http://localhost:8080
echo.
echo ========================================
pause