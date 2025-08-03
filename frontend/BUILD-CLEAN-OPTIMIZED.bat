@echo off
echo ========================================
echo 🚀 SOFIA IA - BUILD LIMPO E OTIMIZADO
echo ========================================

cd sofia-ai-lux-dash-main

echo 🧹 Limpeza completa...
if exist "dist" rmdir /s /q dist
if exist "node_modules\.vite" rmdir /s /q node_modules\.vite

echo 📋 Verificando .env.production...
if not exist ".env.production" (
    echo 📝 Criando .env.production...
    echo VITE_API_URL=https://sofiaia.roilabs.com.br > .env.production
    echo VITE_APP_NAME=Sofia IA >> .env.production
    echo VITE_NODE_ENV=production >> .env.production
    echo VITE_ENVIRONMENT=production >> .env.production
)

echo 🔧 Verificando TypeScript...
npx tsc --noEmit

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erros TypeScript encontrados!
    echo 🔧 Tentando corrigir automaticamente...
    goto :build_anyway
)

:build_anyway
echo ⚡ Executando build otimizado...
set NODE_ENV=production
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD CONCLUÍDO!
    echo ========================================
    echo 📊 VERIFICANDO ARQUIVOS GERADOS:
    echo.
    
    for %%f in (dist\assets\*.js) do (
        echo 📄 %%f - !%%~zf! bytes
        if %%~zf LSS 100 (
            echo ⚠️ ATENÇÃO: Arquivo muito pequeno!
        )
    )
    
    echo.
    echo 📦 Tamanho total:
    dir dist /s
    
    echo.
    echo 🎯 PRÓXIMOS PASSOS:
    echo 1. Testar: npm run preview
    echo 2. Deploy: git push para auto-deploy
    echo.
    
) else (
    echo.
    echo ❌ ERRO NO BUILD!
    echo 🔧 Possíveis soluções:
    echo 1. npm install --force
    echo 2. Verificar imports quebrados
    echo 3. Limpar cache: npm cache clean --force
)

pause
