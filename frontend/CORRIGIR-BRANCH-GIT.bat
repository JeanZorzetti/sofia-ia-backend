@echo off
echo ========================================
echo 🔧 SOFIA IA - CORREÇÃO ERRO BRANCH GIT
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 📋 DIAGNÓSTICO DO PROBLEMA:
echo.

echo 1. Verificando branch atual...
git branch --show-current

echo.
echo 2. Verificando todas as branches...
git branch -a

echo.
echo 3. Verificando status...
git status

echo.
echo 4. Verificando remotes...
git remote -v

echo.
echo ========================================
echo 🔧 CORREÇÕES POSSÍVEIS:
echo ========================================
echo.
echo OPÇÃO A - Se branch é 'master':
echo   git push origin master
echo.
echo OPÇÃO B - Se precisa criar branch main:
echo   git checkout -b main
echo   git push origin main
echo.
echo OPÇÃO C - Se remote não existe:
echo   git remote add origin [URL_DO_REPO]
echo   git push origin main
echo.
echo OPÇÃO D - Força push (se necessário):
echo   git push origin HEAD:main
echo.
echo ========================================
echo 🎯 EXECUÇÃO AUTOMÁTICA:
echo ========================================

echo Tentando descobrir branch automaticamente...
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i

if defined CURRENT_BRANCH (
    echo ✅ Branch atual: %CURRENT_BRANCH%
    echo 🚀 Tentando push para origin %CURRENT_BRANCH%...
    git push origin %CURRENT_BRANCH%
) else (
    echo ❌ Não foi possível detectar branch
    echo 🔧 Tentando push genérico...
    git push origin HEAD
)

echo.
echo ========================================
echo 📊 Se ainda não funcionar, use:
echo ========================================
echo git push origin master
echo OU
echo git push origin HEAD:main
echo.
pause
