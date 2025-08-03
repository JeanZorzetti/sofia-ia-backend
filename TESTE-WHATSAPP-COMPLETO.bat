@echo off
echo ========================================
echo 🧪 TESTE COMPLETO ENDPOINTS WHATSAPP
echo ========================================

echo 🚀 Iniciando backend local na porta 8000...
start /B "Sofia Backend" cmd /c "cd /d 'C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend' && node src/app.js"

echo ⏳ Aguardando backend inicializar (5 segundos)...
timeout /t 5 /nobreak > nul

echo 🧪 Testando endpoints WhatsApp...
node test-whatsapp-local.js

echo.
echo ========================================
echo ✅ TESTE CONCLUÍDO!
echo ========================================
echo.
echo 📋 ENDPOINTS WHATSAPP IMPLEMENTADOS:
echo ✅ GET  /api/whatsapp/instances
echo ✅ POST /api/whatsapp/instances  
echo ✅ GET  /api/whatsapp/instances/:id
echo ✅ POST /api/whatsapp/instances/:id/disconnect
echo ✅ POST /api/whatsapp/instances/:id/connect
echo ✅ DELETE /api/whatsapp/instances/:id
echo ✅ GET  /api/whatsapp/instances/:id/qr
echo ✅ GET  /api/whatsapp/stats
echo ✅ POST /api/whatsapp/webhook/:id
echo.
echo 📱 Para deploy em produção:
echo 1. Fazer commit: git add . && git commit -m "WhatsApp endpoints"
echo 2. Push: git push origin main
echo 3. EasyPanel fará auto-deploy em ~2 min
echo.
pause
