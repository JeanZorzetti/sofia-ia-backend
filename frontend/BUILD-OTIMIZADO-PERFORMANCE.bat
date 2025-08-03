@echo off
echo ========================================
echo 🚀 SOFIA IA - BUILD OTIMIZADO PERFORMANCE
echo ========================================

cd sofia-ai-lux-dash-main

echo 📋 Verificando estrutura...
if not exist "package.json" (
    echo ❌ Erro: package.json não encontrado
    pause
    exit /b 1
)

echo 📦 Limpando cache e builds anteriores...
if exist "dist" rmdir /s /q dist
if exist "node_modules\.vite" rmdir /s /q node_modules\.vite

echo 🧹 Cache limpo! Iniciando build otimizado...
echo.

echo ⚡ BUILD COM OTIMIZAÇÕES:
echo - ✅ Minificação esbuild (mais rápido que terser)
echo - ✅ Source maps desabilitados (menor tamanho)
echo - ✅ Code splitting por chunks
echo - ✅ Vendor splitting otimizado
echo - ✅ Tree shaking automático
echo.

echo 🎯 Executando: npm run build
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD CONCLUÍDO COM SUCESSO!
    echo ========================================
    echo 📊 ESTATÍSTICAS DO BUILD:
    dir dist /s
    echo.
    echo 📁 Pasta de saída: dist/
    echo 🌐 Pronto para deploy: Vercel/Netlify
    echo 🎯 Otimizado para: Performance + SEO
    echo.
    echo 🚀 PRÓXIMOS PASSOS:
    echo 1. Testar build local: npm run preview
    echo 2. Deploy produção: git push para auto-deploy
    echo 3. Verificar performance: Lighthouse
    echo.
) else (
    echo.
    echo ❌ ERRO NO BUILD!
    echo Verifique as mensagens de erro acima
    echo.
)

pause
