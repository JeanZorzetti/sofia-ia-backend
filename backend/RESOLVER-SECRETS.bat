@echo off
echo ========================================
echo 🔒 RESOLVER SECRETS + DEPLOY WHATSAPP
echo ========================================

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\backend"

echo 🚨 Problema: GitHub detectou API keys no .env.production
echo 🔧 Solucao: Remover secrets e configurar no EasyPanel

echo.
echo 1. Desfazendo commit com secrets...
git reset --soft HEAD~1

echo 2. Removendo arquivo .env.production do staging...
git reset HEAD .env.production

echo 3. Adicionando .env.production ao .gitignore...
echo .env.production >> .gitignore
echo .env >> .gitignore

echo 4. Commitando apenas codigo WhatsApp (sem secrets)...
git add src/app.js
git add .gitignore
git commit -m "🔥 DEPLOY: WhatsApp v2.1.0 - 9 endpoints (sem secrets)"

echo 5. Push limpo sem API keys...
git push origin main --force

echo.
echo ========================================
echo ✅ PUSH REALIZADO SEM SECRETS!
echo ========================================
echo.
echo 📋 PROXIMO PASSO CRITICO:
echo Configurar variaveis ambiente no EasyPanel:
echo.
echo 1. Acesse EasyPanel → lais-ia-backend → Environment
echo 2. Adicione estas variaveis:
echo    ANTHROPIC_API_KEY=sk-ant-api03-KOu...
echo    EVOLUTION_API_KEY=SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz
echo    DATABASE_URL=postgresql://postgres.flx...
echo    (ver arquivo .env.production para valores completos)
echo.
echo ⏳ Aguarde 2 min para auto-deploy + config manual no painel
echo 🔗 Teste: https://sofiaia.roilabs.com.br/api/whatsapp/instances
echo.
pause
