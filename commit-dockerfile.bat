@echo off
echo ========================================
echo 🔧 SOFIA IA - COMMIT DOCKERFILE
echo ========================================
echo.

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA"

echo ➕ Adicionando Dockerfile na raiz...
git add Dockerfile
git add .dockerignore

echo.
echo 📝 Fazendo commit...
git commit -m "🐳 Add: Dockerfile na raiz para EasyPanel

- Dockerfile otimizado para estrutura backend/src/app.js
- .dockerignore para build eficiente  
- Health check integrado
- Usuário não-root para segurança
- Exposição porta 8000

✅ Fix EasyPanel deploy error: Dockerfile not found"

echo.
echo 🚀 Push para GitHub...
git push origin main

echo.
echo ========================================
echo ✅ DOCKERFILE COMMITADO!
echo ========================================
echo.
echo Agora tente o deploy novamente no EasyPanel
echo.
pause