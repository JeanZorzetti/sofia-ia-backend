@echo off
echo ========================================
echo 🚀 DEPLOY ENDPOINTS WHATSAPP - AGORA!
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 📱 Adicionando arquivos WhatsApp...
git add src/app.js

echo 📝 Commit rápido...
git commit -m "🔥 HOTFIX: Deploy endpoints WhatsApp v2.1.0"

echo 🚀 Push para GitHub...
git push origin main

echo ✅ CONCLUÍDO! EasyPanel fará auto-deploy em ~2 minutos
echo 🔗 Verificar: https://sofiaia.roilabs.com.br/api/whatsapp/instances
pause
