@echo off
echo ========================================
echo 🌍 SOFIA IA - CONFIGURAR FRONTEND PRODUCAO
echo ========================================
echo.

echo 🎯 ESTE SCRIPT CONFIGURA O FRONTEND PARA PRODUCAO
echo.

set /p PROD_URL="Digite a URL de producao do backend (sem / no final): "

echo.
echo 🔧 Configurando API_BASE_URL no frontend...
echo.

REM Criar arquivo de configuração para produção
echo const API_BASE_URL = '%PROD_URL%'; > frontend\sofia-ai-lux-dash-main\src\config\api.js
echo export { API_BASE_URL }; >> frontend\sofia-ai-lux-dash-main\src\config\api.js

echo ✅ Arquivo api.js criado com URL de producao
echo.

echo 📝 PROXIMO PASSO:
echo 1. Edite frontend/sofia-ai-lux-dash-main/src/hooks/useSofiaApi.ts
echo 2. Substitua: const API_BASE_URL = 'http://localhost:8000';
echo 3. Por: import { API_BASE_URL } from '../config/api';
echo.
echo Ou execute: update-frontend-api.bat
echo.

echo ========================================
echo 🚀 CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo URL configurada: %PROD_URL%
echo.
echo Para testar frontend:
echo 1. cd frontend/sofia-ai-lux-dash-main
echo 2. npm run dev
echo 3. Abrir: http://localhost:8080
echo.
pause