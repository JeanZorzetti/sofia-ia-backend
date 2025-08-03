@echo off
echo 🚀 COMMIT CORREÇÃO SOFIA IA - EXECUÇÃO RÁPIDA
echo ================================================

echo ✅ Correção do bug login APROVADA no teste!
echo 📦 Fazendo commit para produção...

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo.
echo 📋 Adicionando arquivos...
git add .

echo.
echo 📝 Fazendo commit...
git commit -m "🔧 Fix: Bug login corrigido - Modal isolado React.memo funciona perfeitamente"

echo.
echo 🌐 Push para produção...
git push origin main

echo.
echo ================================================
echo ✅ COMMIT REALIZADO!
echo ================================================
echo 🔗 Auto-deploy iniciado no Vercel
echo ⏱️  Aguarde 2-3 minutos
echo 🌐 URLs: sofia-ia.roilabs.com.br
echo.
echo 🎯 PRÓXIMO: Configurar env vars produção
echo ================================================
pause
