@echo off
color 0E
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║            🌐 DEPLOY FRONTEND VERCEL - SOFIA IA                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\LAIS IA\frontend\sofia-ai-lux-dash-main\sofia-ai-lux-dash-main"

echo 📂 Diretório atual: %CD%
echo.

echo 🔍 Verificando estrutura do projeto...
if not exist "package.json" (
    echo ❌ Erro: package.json não encontrado
    echo 📁 Verifique se está no diretório correto do frontend
    pause
    exit /b 1
)

if not exist "src" (
    echo ❌ Erro: pasta src não encontrada
    echo 📁 Estrutura do projeto React inválida
    pause
    exit /b 1
)

echo ✅ Estrutura do projeto OK
echo.

echo 🔧 Verificando arquivo .env de produção...
if not exist ".env" (
    echo 📝 Criando .env para produção...
    (
        echo # SOFIA IA - Production Environment
        echo VITE_API_BASE_URL=http://localhost:8000
        echo VITE_API_BASE_URL_PROD=https://lais-ia-api.roilabs.com.br
        echo VITE_EVOLUTION_API_URL=https://evolutionapi.roilabs.com.br
        echo VITE_EVOLUTION_API_KEY=SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz
        echo VITE_EXISTING_INSTANCE_NAME=Sofia IA
        echo VITE_EXISTING_INSTANCE_KEY=91A33F0F576C-40AF-AAA7-4002249E7E3C
        echo VITE_NEW_INSTANCE_NAME=lais_ia_roilabs
        echo VITE_APP_NAME=SOFIA IA
        echo VITE_COMPANY_NAME=ROI Labs
        echo VITE_DEBUG=false
    ) > .env
    echo ✅ Arquivo .env criado para produção
) else (
    echo ✅ Arquivo .env encontrado
)
echo.

echo 📦 Instalando dependências...
call npm install
if errorlevel 1 (
    echo ❌ Erro na instalação das dependências
    pause
    exit /b 1
)

echo ✅ Dependências instaladas
echo.

echo 🏗️ Fazendo build de produção...
call npm run build
if errorlevel 1 (
    echo ❌ Erro no build de produção
    echo 🔧 Verificar erros TypeScript/ESLint
    pause
    exit /b 1
)

echo ✅ Build de produção concluído
echo.

echo 🔍 Verificando Vercel CLI...
call vercel --version
if errorlevel 1 (
    echo ⚠️ Vercel CLI não encontrado
    echo 📦 Instalando Vercel CLI globalmente...
    call npm install -g vercel
    if errorlevel 1 (
        echo ❌ Erro na instalação do Vercel CLI
        echo 🔧 Instale manualmente: npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI disponível
echo.

echo ════════════════════════════════════════════════════════════════════
echo 🚀 OPÇÕES DE DEPLOY:
echo ════════════════════════════════════════════════════════════════════
echo.
echo [1] Deploy automático (usando vercel.json existente)
echo [2] Deploy novo projeto  
echo [3] Deploy com configurações customizadas
echo [4] Apenas mostrar instruções manuais
echo.
set /p opcao="Escolha uma opção (1-4): "

if "%opcao%"=="1" goto AUTO_DEPLOY
if "%opcao%"=="2" goto NEW_DEPLOY  
if "%opcao%"=="3" goto CUSTOM_DEPLOY
if "%opcao%"=="4" goto MANUAL_INSTRUCTIONS

:AUTO_DEPLOY
echo.
echo 🚀 Iniciando deploy automático...
call vercel --prod
if errorlevel 1 (
    echo ❌ Erro no deploy automático
    goto MANUAL_INSTRUCTIONS
) else (
    echo ✅ Deploy automático concluído
    goto DEPLOY_SUCCESS
)

:NEW_DEPLOY
echo.
echo 🆕 Iniciando deploy de novo projeto...
call vercel --prod --name sofia-ia-dashboard
if errorlevel 1 (
    echo ❌ Erro no deploy novo
    goto MANUAL_INSTRUCTIONS
) else (
    echo ✅ Deploy novo projeto concluído
    goto DEPLOY_SUCCESS
)

:CUSTOM_DEPLOY
echo.
echo ⚙️ Deploy customizado...
echo 📋 Configurações:
echo    - Nome: sofia-ia-lux-dash
echo    - Ambiente: Production
echo    - Framework: React + Vite
call vercel --prod --name sofia-ia-lux-dash
if errorlevel 1 (
    echo ❌ Erro no deploy customizado
    goto MANUAL_INSTRUCTIONS
) else (
    echo ✅ Deploy customizado concluído
    goto DEPLOY_SUCCESS
)

:MANUAL_INSTRUCTIONS
echo.
echo ════════════════════════════════════════════════════════════════════
echo 📋 INSTRUÇÕES PARA DEPLOY MANUAL:
echo ════════════════════════════════════════════════════════════════════
echo.
echo OPÇÃO A - VERCEL DASHBOARD:
echo   1. Acesse: https://vercel.com/dashboard
echo   2. Login com GitHub
echo   3. Clique "New Project"
echo   4. Conecte repositório GitHub
echo   5. Configure:
echo      - Framework: React
echo      - Build Command: npm run build
echo      - Output Directory: dist
echo      - Install Command: npm install
echo   6. Adicione Environment Variables:
echo      VITE_API_BASE_URL_PROD=https://lais-ia-api.roilabs.com.br
echo      VITE_EVOLUTION_API_URL=https://evolutionapi.roilabs.com.br
echo      VITE_EVOLUTION_API_KEY=SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz
echo      VITE_EXISTING_INSTANCE_NAME=Sofia IA
echo      VITE_EXISTING_INSTANCE_KEY=91A33F0F576C-40AF-AAA7-4002249E7E3C
echo.
echo OPÇÃO B - VERCEL CLI:
echo   1. Terminal: cd %CD%
echo   2. Comando: vercel login
echo   3. Comando: vercel --prod
echo   4. Seguir instruções na tela
echo.
goto END

:DEPLOY_SUCCESS
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                   ✅ DEPLOY FRONTEND CONCLUÍDO                   ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 🌐 URLs ATUALIZADAS:
echo ════════════════════════════════════════════════════════════════════
echo.
call vercel ls
echo.
echo 🔗 URL Principal: 
call vercel ls --format json > temp_urls.json 2>nul
if exist temp_urls.json (
    echo    Verificar saída acima para URL de produção
    del temp_urls.json
) else (
    echo    https://sofia-ai-lux-dash.vercel.app (verificar no dashboard)
)
echo.

echo 🧪 TESTE PÓS-DEPLOY:
echo ════════════════════════════════════════════════════════════════════
echo 1. Aguardar 1-2 minutos para propagação
echo 2. Acessar URL de produção
echo 3. Verificar login funcionando
echo 4. Testar aba WhatsApp
echo 5. Verificar QR Code modal
echo 6. Confirmar integração Sofia IA
echo.

:END
echo ════════════════════════════════════════════════════════════════════
echo 📊 PRÓXIMOS PASSOS:
echo ════════════════════════════════════════════════════════════════════
echo 1. ✅ Frontend deployado
echo 2. ✅ Backend já em produção (EasyPanel)
echo 3. 🧪 Testar integração completa
echo 4. 📧 Enviar logs/screenshots de teste
echo 5. 🚀 Validar com usuários reais
echo.
echo 🔗 Links importantes:
echo    Frontend: https://sofia-ai-lux-dash.vercel.app
echo    Backend: https://lais-ia-api.roilabs.com.br
echo    Evolution: https://evolutionapi.roilabs.com.br
echo.
pause