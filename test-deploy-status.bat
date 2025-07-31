@echo off
color 0B
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🧪 TESTE STATUS PÓS-DEPLOY - LAIS IA               ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 🔗 VERIFICANDO ENDPOINTS APÓS DEPLOY...
echo ════════════════════════════════════════════════════════════════════

echo.
echo 📡 1. Testando Backend Health...
curl -s https://lais-ia-api.roilabs.com.br/api/health
if errorlevel 1 (
    echo ❌ Backend não responde
) else (
    echo ✅ Backend funcionando
)
echo.

echo 📊 2. Testando Analytics...
curl -s https://lais-ia-api.roilabs.com.br/api/analytics
if errorlevel 1 (
    echo ❌ Analytics não responde
) else (
    echo ✅ Analytics funcionando
)
echo.

echo 📱 3. Testando WhatsApp Instances...
curl -s https://lais-ia-api.roilabs.com.br/api/whatsapp/instances
if errorlevel 1 (
    echo ❌ WhatsApp API não responde
) else (
    echo ✅ WhatsApp API funcionando
)
echo.

echo 🔄 4. Testando Evolution API...
curl -s -H "apikey: SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz" https://evolutionapi.roilabs.com.br/instance/fetchInstances
if errorlevel 1 (
    echo ❌ Evolution API não responde
) else (
    echo ✅ Evolution API funcionando
)
echo.

echo ════════════════════════════════════════════════════════════════════
echo 🌐 URLS PARA TESTE MANUAL:
echo ════════════════════════════════════════════════════════════════════
echo.
echo 🔹 Backend Health:
echo   https://lais-ia-api.roilabs.com.br/api/health
echo.
echo 🔹 Analytics:
echo   https://lais-ia-api.roilabs.com.br/api/analytics
echo.
echo 🔹 WhatsApp Status:
echo   https://lais-ia-api.roilabs.com.br/api/whatsapp/status
echo.
echo 🔹 Metrics:
echo   https://lais-ia-api.roilabs.com.br/api/metrics
echo.
echo 🔹 Evolution Manager:
echo   https://evolutionapi.roilabs.com.br/manager/instance/ac3e6132-10fe-4dd7-871b-e3883997cd6/dashboard
echo.
echo 🔹 Frontend Dashboard:
echo   https://sofia-ai-lux-dash.vercel.app
echo.

echo ════════════════════════════════════════════════════════════════════
echo 🧪 GUIA DE TESTE COMPLETO:
echo ════════════════════════════════════════════════════════════════════
echo.
echo ETAPA 1 - VERIFICAR BACKEND:
echo   1. Abrir: https://lais-ia-api.roilabs.com.br/api/health
echo   2. Deve retornar JSON com status "ok"
echo   3. Se erro 500/503: backend não subiu
echo   4. Se timeout: verificar EasyPanel
echo.
echo ETAPA 2 - VERIFICAR EVOLUTION API:
echo   1. Abrir Evolution Manager (URL acima)
echo   2. Verificar se Sofia IA está "Conectado"
echo   3. Ver mensagens: 1.804 (ou similar)
echo   4. Status: verde
echo.
echo ETAPA 3 - TESTAR FRONTEND:
echo   1. Abrir dashboard Sofia IA (URL acima)
echo   2. Login: qualquer email/senha
echo   3. Aba: WhatsApp
echo   4. Clicar: "Nova Instância WhatsApp"
echo   5. Verificar: Mostra "Sofia IA" como opção
echo   6. Testar: Ambas opções (usar existente + criar nova)
echo.
echo ETAPA 4 - LOGS PARA ENVIAR:
echo   1. F12 (DevTools) no navegador
echo   2. Aba Console: logs JavaScript
echo   3. Aba Network: requisições HTTP
echo   4. Screenshots de erros (se houver)
echo   5. Response de APIs (se erro)
echo.

echo ════════════════════════════════════════════════════════════════════
echo 📋 CHECKLIST PÓS-DEPLOY:
echo ════════════════════════════════════════════════════════════════════
echo [ ] Backend responde em /api/health
echo [ ] Evolution API retorna instâncias
echo [ ] Sofia IA aparece como "Conectado"
echo [ ] Frontend carrega sem erros
echo [ ] WhatsApp tab funciona
echo [ ] QR Code modal abre
echo [ ] Opções "Sofia IA" + "Criar Nova" aparecem
echo [ ] Integração funciona end-to-end
echo.

echo ⏱️ Aguardar 2-3 minutos após deploy para URLs funcionarem
echo 📧 Enviar screenshots + logs de qualquer erro encontrado
echo.
pause