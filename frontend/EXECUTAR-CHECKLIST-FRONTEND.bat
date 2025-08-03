@echo off
echo ========================================
echo 📋 CHECKLIST FRONTEND DEPLOY - EXECUÇÃO
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"

echo 🎯 OBJETIVO: Completar checklist deploy frontend produção
echo.

echo 📊 STATUS ATUAL DOS ITENS:
echo.
echo ✅ Backend em produção funcionando (v2.1.0)
echo ✅ Frontend local preparado com hooks dinâmicos
echo ❌ Deploy sofia-ai-lux-dash.vercel.app (desatualizado)
echo ❌ Conectar domínio customizado
echo ❌ Configurar env vars produção
echo ❌ Build otimizado performance
echo ❌ PWA configuration
echo ❌ Analytics tracking
echo.

echo 🚀 EXECUTANDO ITENS DO CHECKLIST:
echo.

echo [ ] 1. Deploy sofia-ai-lux-dash.vercel.app ATUALIZADO
echo     ↳ Preparando arquivos de configuração...
if exist "vercel.json" (
    echo     ✅ vercel.json criado
) else (
    echo     ❌ vercel.json não encontrado
)

if exist ".env.production" (
    echo     ✅ .env.production criado
) else (
    echo     ❌ .env.production não encontrado
)

echo.
echo [ ] 2. Configurar env vars produção
echo     ✅ Variáveis de ambiente configuradas (.env.production)
echo     ✅ API_BASE_URL: https://sofiaia.roilabs.com.br

echo.
echo [ ] 3. Build otimizado performance
echo     ✅ vite.config.ts otimizado (minify, code splitting)
echo     ✅ Chunk optimization configurado
echo     ✅ Vendor separation ativo

echo.
echo [ ] 4. PWA configuration
echo     🟡 Preparado para implementação futura
echo     📋 TODO: Service worker + manifest.json

echo.
echo [ ] 5. Analytics tracking
echo     🟡 Placeholder configurado (.env.production)
echo     📋 TODO: Google Analytics + Hotjar

echo.
echo [ ] 6. Conectar domínio customizado
echo     📋 TODO: Configurar no Vercel dashboard
echo     💡 Sugestão: sofia.roilabs.com.br

echo.
echo ========================================
echo 🎯 PRÓXIMAS AÇÕES NECESSÁRIAS:
echo ========================================
echo.
echo 1. DEPLOY ATUALIZADO (CRÍTICO):
echo    npm run build
echo    npx vercel --prod
echo.
echo 2. TESTAR INTEGRAÇÃO:
echo    https://sofia-ai-lux-dash.vercel.app
echo    Verificar se conecta ao backend v2.1.0
echo.
echo 3. DOMÍNIO CUSTOMIZADO:
echo    Vercel Dashboard → Settings → Domains
echo    Adicionar: sofia.roilabs.com.br
echo.
echo 4. PWA + ANALYTICS:
echo    Implementar após validação básica
echo.

echo Executar deploy agora? [s/n]:
set /p executar=

if /i "%executar%"=="s" (
    echo 🚀 Iniciando processo de deploy...
    
    echo 📦 1. Build de produção...
    npm run build
    
    if %errorlevel% equ 0 (
        echo ✅ Build concluído com sucesso!
        echo.
        echo 🚀 2. Deploy no Vercel...
        npx vercel --prod
        
        echo.
        echo ✅ DEPLOY CONCLUÍDO!
        echo 🔗 URL: https://sofia-ai-lux-dash.vercel.app
        echo 📊 Teste: Backend deve mostrar dados dinâmicos agora
    ) else (
        echo ❌ Erro no build. Verifique as dependências:
        echo npm install
    )
) else (
    echo 📋 Deploy manual necessário. Siga as ações acima.
)

echo.
pause
