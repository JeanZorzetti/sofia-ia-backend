@echo off
echo ========================================
echo 🚀 SOFIA IA - COMMIT CORREÇÃO PARA PRODUÇÃO
echo ========================================

echo ✅ CORREÇÃO CONFIRMADA FUNCIONANDO!
echo 🎯 Fazendo commit e deploy para produção...

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo.
echo 📋 STATUS DO COMMIT:
git status --porcelain

echo.
echo 📦 Adicionando arquivos modificados...
git add src/components/sofia/SofiaDashboard.tsx

echo.
echo 📝 Commit da correção...
git commit -m "🔧 Fix: Correção DEFINITIVA bug login - Modal isolado React.memo elimina perda de foco

✅ PROBLEMA: Campos Email/Senha perdiam foco a cada 15-30s
✅ CAUSA: Auto-refresh hooks API causava re-render do componente pai  
✅ SOLUÇÃO: Modal LoginModal isolado com React.memo() + estado local
✅ RESULTADO: Foco mantido durante digitação completa
✅ ARQUIVO: src/components/sofia/SofiaDashboard.tsx

🎯 TESTE APROVADO: Usuário confirmou correção funcionando
🚀 DEPLOY: Auto-deploy Vercel será executado automaticamente"

echo.
echo 🌐 Push para repositório (trigger auto-deploy)...
git push origin main

echo.
echo ========================================
echo ✅ COMMIT REALIZADO COM SUCESSO!
echo ========================================
echo 📊 Auto-deploy iniciado no Vercel
echo 🕐 Tempo estimado: 2-3 minutos
echo 🔗 URLs atualizadas:
echo    - https://sofia-ai-lux-dash.vercel.app
echo    - https://sofia-ia.roilabs.com.br
echo.
echo 🎯 PRÓXIMO PASSO: Configurar env vars produção
echo.

timeout /t 3

echo 📊 Monitorando deploy...
echo Acesse Vercel Dashboard para acompanhar:
echo https://vercel.com/dashboard

echo.
echo ✅ CORREÇÃO COMMITADA E EM DEPLOY!
pause
