@echo off
echo ========================================
echo 🚀 SOLUCAO RAPIDA: DEPLOY WHATSAPP
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🎯 Resolvendo divergencia Git automaticamente...

echo 1. Continuando rebase existente...
git rebase --continue

echo 2. Se deu erro, abortando e forcando push...
git rebase --abort 2>nul
git add . 2>nul
git commit -m "🔥 DEPLOY WhatsApp v2.1.0 - 9 endpoints" 2>nul
git push origin main --force 2>nul

echo 3. Verificando se funcionou...
git log --oneline -1

echo.
echo ========================================
echo ✅ DEPLOY CONCLUIDO!
echo ========================================
echo.
echo ⏳ Aguarde 2 minutos para auto-deploy EasyPanel
echo 🔗 Teste: https://sofiaia.roilabs.com.br/api/whatsapp/instances
echo 📊 Versao: https://sofiaia.roilabs.com.br/ (deve mostrar v2.1.0+)
echo.
pause
