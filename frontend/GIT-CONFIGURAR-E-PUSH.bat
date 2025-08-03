@echo off
echo ========================================
echo 🔥 SOFIA IA - CONFIGURAR GIT E PUSH AGORA
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo ✅ REPOSITÓRIO ENCONTRADO: sofia-ai-lux-dash
echo 🔧 Configurando remote origin...

git remote remove origin 2>nul
git remote add origin https://github.com/JeanZorzetti/sofia-ai-lux-dash.git

echo.
echo 📋 Verificando configuração...
git remote -v

echo.
echo 📦 Adicionando arquivos...
git add .

echo.
echo 📝 Fazendo commit...
git commit -m "🔧 Fix: Bug login corrigido - Modal isolado React.memo elimina perda de foco completamente

✅ PROBLEMA: Campos Email/Senha perdiam foco a cada 15-30s
✅ CAUSA: Auto-refresh hooks API causava re-render do componente pai  
✅ SOLUÇÃO: Modal LoginModal isolado com React.memo() + estado local
✅ RESULTADO: Foco mantido durante digitação completa
✅ TESTE: Aprovado pelo usuário - funcionando perfeitamente
✅ ARQUIVO: src/components/sofia/SofiaDashboard.tsx"

echo.
echo 🚀 Fazendo push para GitHub...
git push -u origin master

if errorlevel 1 (
    echo.
    echo 🔧 Tentando push para main...
    git push -u origin HEAD:main
    
    if errorlevel 1 (
        echo ❌ Erro no push. Possíveis causas:
        echo - Precisa autenticação GitHub
        echo - Branch conflitos
        echo.
        echo 📋 Configure GitHub Token:
        echo https://github.com/settings/tokens
        echo.
        echo 🔧 Ou tente manualmente:
        echo git push origin master --force
    ) else (
        echo ✅ SUCESSO! Push realizado para main
    )
) else (
    echo ✅ SUCESSO! Push realizado para master
)

echo.
echo ========================================
echo 🎯 Se sucesso: Auto-deploy Vercel iniciado
echo ⏱️  Aguarde 2-3 minutos  
echo 🔗 URL: https://sofia-ia.roilabs.com.br
echo ========================================
pause
