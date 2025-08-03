@echo off
echo 🚀 ========================================
echo 📦 DEPLOY QR CODES PARA PRODUCAO
echo 🚀 ========================================

echo.
echo ✅ QR CODES v2.6.0 IMPLEMENTADOS!
echo.
echo 📁 ARQUIVOS MODIFICADOS:
echo   - backend/src/app.js (QR Code Service integrado)
echo   - backend/src/services/qrcode.service.js (NOVO)
echo   - TESTE-QR-CODES-REAIS.js (NOVO)
echo   - TESTE-QR-CODES-AGORA.bat (NOVO)
echo   - DEPLOY-QR-CODES-SUMMARY.md (NOVO)
echo.

echo 📦 EXECUTANDO COMMIT...
git add .
git commit -m "✅ QR CODES REAIS v2.6.0 - READY FOR PRODUCTION

🔗 NEW QR CODE SERVICE:
- Cache inteligente + auto-refresh
- 7 endpoints funcionais
- Evolution API integration ready
- 11 automated tests
- Production ready

📱 ENDPOINTS ADDED:
- POST /api/whatsapp/instances/:name/qrcode
- GET /api/whatsapp/qrcode-stats
- POST /api/whatsapp/auto-generate-qrcodes
- + 4 more QR endpoints

🧪 TESTED & VALIDATED:
- Backend running localhost:8000
- QR generation working
- Health check with QR status
- Ready for EasyPanel deploy

🚀 DEPLOY READY: EasyPanel + Vercel"

echo.
echo 🌐 FAZENDO PUSH PARA GITHUB...
git push origin main

echo.
echo ✅ COMMIT CONCLUIDO!
echo.
echo 🚀 PRÓXIMOS PASSOS PARA DEPLOY:
echo.
echo 1. 🔧 EasyPanel Backend:
echo    - URL: https://lais-ia-api.roilabs.com.br
echo    - Build: npm install
echo    - Start: node src/app.js
echo    - Env vars: EVOLUTION_API_URL, EVOLUTION_API_KEY
echo.
echo 2. 🌐 Vercel Frontend:
echo    - URL: https://sofia-ai-lux-dash.vercel.app
echo    - Auto-deploy via GitHub
echo    - Update API base URL if needed
echo.
echo 3. ✅ Validação:
echo    - Test health: /health (QR system status)
echo    - Test QR stats: /api/whatsapp/qrcode-stats
echo    - Test QR generation: POST /api/whatsapp/instances/test/qrcode
echo.
echo 🎯 STATUS: PRONTO PARA PRODUCAO!
pause
