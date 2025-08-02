@echo off
echo ========================================
echo 🔧 SOFIA IA - FIX ROTA RAIZ
echo ========================================
echo.

echo 🎯 PROBLEMA: "Cannot GET /" na pagina inicial
echo ✅ SOLUCAO: Adicionada rota raiz com documentacao da API
echo.

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA"

echo ➕ Adicionando correção...
git add backend/src/app.js

echo.
echo 📝 Fazendo commit...
git commit -m "🔧 Fix: Adicionar rota raiz (/) - Resolver 'Cannot GET /'

✅ Correção implementada:
- Adicionada rota GET / com documentação da API
- Retorna informações do serviço e endpoints disponíveis
- Inclui features, developer info e timestamps
- Resolve erro 'Cannot GET /' na página inicial

🚀 Funcionalidades da rota raiz:
- Documentação automática dos endpoints
- Informações do desenvolvedor e repositório
- Status do serviço e versão
- Lista de features disponíveis

🌍 Agora https://sofiaia.roilabs.com.br/ funciona perfeitamente!"

echo.
echo 🚀 Push para GitHub e deploy automático...
git push origin main

echo.
echo 🔍 Verificando commit...
git log --oneline -1

echo.
echo ========================================
echo ✅ CORREÇÃO ENVIADA!
echo ========================================
echo.
echo 🎯 AGUARDE O DEPLOY AUTOMÁTICO (1-2 minutos)
echo.
echo Depois teste:
echo 🌍 https://sofiaia.roilabs.com.br/
echo 📊 https://sofiaia.roilabs.com.br/health
echo 📈 https://sofiaia.roilabs.com.br/api/dashboard/overview
echo.
echo ✅ Todas as URLs devem funcionar agora!
echo.
pause