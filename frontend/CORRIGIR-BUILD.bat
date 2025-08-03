@echo off
echo ========================================
echo 🔧 CORRIGIR ERRO TERSER + BUILD
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 🚨 Problema: Terser não instalado (Vite v3+ dependency)
echo 🔧 Solução: Instalar terser + build novamente

echo.
echo 1. Instalando terser...
npm install terser --save-dev

echo.
echo 2. Atualizando browserslist database...
npx update-browserslist-db@latest

echo.
echo 3. Build de produção (tentativa 2)...
npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ BUILD CONCLUÍDO COM SUCESSO!
    echo 📊 Arquivos gerados em: dist/
    echo.
    echo 🚀 Próximo: Deploy no Vercel
    echo npx vercel --prod
    echo.
    echo Executar deploy agora? [s/n]:
    set /p deploy=
    
    if /i "%deploy%"=="s" (
        echo 🚀 Fazendo deploy...
        npx vercel --prod
        echo.
        echo ✅ DEPLOY COMPLETO!
        echo 🔗 URL: https://sofia-ai-lux-dash.vercel.app
        echo 📊 Teste: Deve mostrar dados dinâmicos do backend agora
    )
) else (
    echo ❌ Erro no build mesmo após instalar terser
    echo 📋 Verifique dependências: npm install
)

echo.
pause
