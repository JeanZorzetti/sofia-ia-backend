@echo off
echo ========================================
echo 🚨 RESOLVER DIVERGENCIA GIT + DEPLOY
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🔄 Situacao atual: Branch divergiu, rebase em andamento
echo 📋 Opcoes para resolver:

echo.
echo OPCAO 1 - Continuar rebase (se conflitos resolvidos):
echo git rebase --continue
echo git push origin main --force-with-lease

echo.
echo OPCAO 2 - Abortar rebase e forcar push:  
echo git rebase --abort
echo git push origin main --force

echo.
echo OPCAO 3 - Reset para remoto (perde commits locais):
echo git fetch origin
echo git reset --hard origin/main
echo git push origin main

echo.
echo ========================================
echo 🎯 RECOMENDACAO: Usar OPCAO 1
echo ========================================
echo.
echo Escolha uma opcao [1/2/3]:
set /p opcao=

if "%opcao%"=="1" (
    echo 🔄 Continuando rebase...
    git rebase --continue
    echo 🚀 Push forcado...
    git push origin main --force-with-lease
) else if "%opcao%"=="2" (
    echo 🔄 Abortando rebase...
    git rebase --abort
    echo ➕ Adicionando mudancas...
    git add .
    echo 📝 Commit...
    git commit -m "🔥 DEPLOY: Endpoints WhatsApp v2.1.0 - FORCE"
    echo 🚀 Push forcado...
    git push origin main --force
) else if "%opcao%"=="3" (
    echo 🔄 Reset para remoto...
    git fetch origin
    git reset --hard origin/main
    echo ⚠️  Commits locais perdidos! Reimplementar endpoints...
)

echo.
echo ✅ Resolucao Git concluida!
echo 🔗 Teste: https://sofiaia.roilabs.com.br/api/whatsapp/instances
echo.
pause
