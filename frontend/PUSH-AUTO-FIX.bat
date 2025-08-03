@echo off
echo 🚀 CORREÇÃO RÁPIDA - BRANCH GIT SOFIA IA
echo ==========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo ✅ Correção login aprovada - Fazendo push...
echo.

echo 🔧 Tentativa 1: Push para master (mais comum)...
git push origin master

if errorlevel 1 (
    echo.
    echo 🔧 Tentativa 2: Push genérico...
    git push origin HEAD
    
    if errorlevel 1 (
        echo.
        echo 🔧 Tentativa 3: Forçar para main...
        git push origin HEAD:main
        
        if errorlevel 1 (
            echo.
            echo ❌ Erro persistente. Diagnóstico necessário:
            echo.
            git remote -v
            echo.
            git branch
            echo.
            echo 📞 Reporte o resultado acima para ajuda manual
        ) else (
            echo ✅ SUCESSO! Push realizado para main
        )
    ) else (
        echo ✅ SUCESSO! Push realizado
    )
) else (
    echo ✅ SUCESSO! Push realizado para master
)

echo.
echo ==========================================
echo 🎯 Se sucesso: Auto-deploy iniciado
echo ⏱️  Aguarde 2-3 minutos
echo 🔗 URL: https://sofia-ia.roilabs.com.br
echo ==========================================
pause
