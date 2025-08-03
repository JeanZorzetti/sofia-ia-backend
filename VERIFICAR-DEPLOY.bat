@echo off
echo ========================================
echo 🧪 VERIFICAR DEPLOY WHATSAPP
echo ========================================

echo ⏳ Aguardando 30 segundos para auto-deploy...
timeout /t 30 /nobreak

echo 🔍 Testando versao da API...
curl -s https://sofiaia.roilabs.com.br/ | findstr "version"

echo.
echo 🔍 Testando endpoint WhatsApp...
curl -s https://sofiaia.roilabs.com.br/api/whatsapp/instances | findstr "success"

echo.
echo ========================================
echo 📊 RESULTADO DO TESTE:
echo ========================================
echo.
echo Se versao = "2.1.0" → ✅ Deploy realizado
echo Se endpoint retorna success → ✅ WhatsApp funcionando
echo.
echo Caso contrario, endpoints ainda nao foram deployados.
echo.
pause
