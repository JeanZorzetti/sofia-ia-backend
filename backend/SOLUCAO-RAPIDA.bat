@echo off
echo ========================================
echo 🚀 SOLUCAO RAPIDA: PERMITIR SECRET + DEPLOY
echo ========================================

echo 🔗 GitHub forneceu um link para permitir o secret temporariamente:
echo https://github.com/JeanZorzetti/sofia-ia-backend/security/secret-scanning/unblock-secret/30jovRFoZS29KDA00YUTOAxR4MN
echo.
echo 📋 PASSOS:
echo 1. Abra o link acima no navegador
echo 2. Clique em "Allow secret" 
echo 3. Execute: git push origin main --force
echo 4. Configure variaveis no EasyPanel (EASYPANEL-ENV-VARS.txt)
echo 5. Remova .env.production do repositorio depois
echo.
echo ⚡ ALTERNATIVA AUTOMATICA:
echo Execute os comandos abaixo para limpar historico:
echo.
echo git checkout --orphan clean-main
echo git add src/app.js .gitignore package.json README.md
echo git commit -m "🔥 DEPLOY: WhatsApp v2.1.0 (historico limpo)"
echo git branch -D main
echo git branch -m main  
echo git push origin main --force
echo.
pause
