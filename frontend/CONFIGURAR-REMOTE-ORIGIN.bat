@echo off
echo ========================================
echo 🔧 SOFIA IA - CONFIGURAR REMOTE ORIGIN
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 🎯 PROBLEMA: Remote 'origin' não existe
echo ✅ SOLUÇÃO: Configurar remote + push

echo.
echo 📋 Verificando remotes atuais...
git remote -v

echo.
echo 🔧 OPÇÕES DE CONFIGURAÇÃO:
echo ========================================
echo.
echo OPÇÃO A - Repositório GitHub existente:
echo   git remote add origin https://github.com/JeanZorzetti/sofia-ai-lux-dash.git
echo   git push -u origin master
echo.
echo OPÇÃO B - Novo repositório GitHub:
echo   1. Criar repo em github.com/JeanZorzetti
echo   2. git remote add origin [URL_NOVO_REPO]
echo   3. git push -u origin master
echo.
echo OPÇÃO C - Deploy direto Vercel (SEM GIT):
echo   1. Acesse vercel.com/dashboard
echo   2. Import projeto diretamente da pasta local
echo   3. Deploy manual sem Git
echo.
echo ========================================
echo 🚀 EXECUÇÃO AUTOMÁTICA (Tentativa):
echo ========================================

echo Tentando repositório provável...
git remote add origin https://github.com/JeanZorzetti/sofia-ai-lux-dash.git

if errorlevel 1 (
    echo ❌ Falha ao adicionar remote. Repositório pode não existir.
    echo.
    echo 🔧 SOLUÇÕES MANUAIS:
    echo.
    echo 1. CRIAR NOVO REPO:
    echo    - Acesse: https://github.com/new
    echo    - Nome: sofia-ai-lux-dash
    echo    - Copie URL e execute:
    echo      git remote add origin [URL_COPIADA]
    echo      git push -u origin master
    echo.
    echo 2. DEPLOY DIRETO VERCEL:
    echo    - Acesse: https://vercel.com/new
    echo    - Import From Git > Continue with GitHub
    echo    - Add GitHub Account
    echo    - Import This Repository
    echo.
) else (
    echo ✅ Remote adicionado! Fazendo push...
    git push -u origin master
    
    if errorlevel 1 (
        echo ❌ Push falhou. Possíveis causas:
        echo - Repositório não existe
        echo - Sem permissão de escrita
        echo - Precisa autenticação GitHub
        echo.
        echo 📋 Configure GitHub Token primeiro:
        echo https://github.com/settings/tokens
    ) else (
        echo ✅ SUCESSO! Correção enviada para GitHub
        echo 🚀 Auto-deploy Vercel iniciado
        echo ⏱️  Aguarde 2-3 minutos
        echo 🔗 URL: https://sofia-ia.roilabs.com.br
    )
)

echo.
echo ========================================
echo 📊 STATUS: Remote configurado
echo 🎯 PRÓXIMO: Env vars produção
echo ========================================
pause
