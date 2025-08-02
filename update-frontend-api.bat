@echo off
echo ========================================
echo 🔧 SOFIA IA - ATUALIZAR API FRONTEND
echo ========================================
echo.

set /p PROD_URL="Digite a URL de producao do backend (sem / no final): "

echo.
echo 🔄 Criando backup do arquivo original...
copy "frontend\sofia-ai-lux-dash-main\src\hooks\useSofiaApi.ts" "frontend\sofia-ai-lux-dash-main\src\hooks\useSofiaApi.ts.backup"

echo.
echo 🔧 Atualizando API_BASE_URL...

REM Usar PowerShell para substituir a linha
powershell -Command "(Get-Content 'frontend\sofia-ai-lux-dash-main\src\hooks\useSofiaApi.ts') -replace 'const API_BASE_URL = ''http://localhost:8000'';', 'const API_BASE_URL = ''%PROD_URL%'';' | Set-Content 'frontend\sofia-ai-lux-dash-main\src\hooks\useSofiaApi.ts'"

echo ✅ API_BASE_URL atualizada para: %PROD_URL%
echo.

echo 📋 VERIFICANDO ALTERACAO...
powershell -Command "Get-Content 'frontend\sofia-ai-lux-dash-main\src\hooks\useSofiaApi.ts' | Select-String 'API_BASE_URL'"

echo.
echo ========================================
echo ✅ FRONTEND CONFIGURADO PARA PRODUCAO!
echo ========================================
echo.
echo 🎯 PROXIMO PASSO:
echo 1. Testar frontend: npm run dev (na pasta frontend)
echo 2. Verificar se dashboard carrega dados da API
echo 3. Se funcionar: Deploy frontend no Vercel
echo.
echo 📄 Backup salvo em: useSofiaApi.ts.backup
echo.
pause