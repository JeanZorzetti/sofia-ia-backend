@echo off
echo ========================================
echo 🔧 SOFIA IA - CONFIGURAR GITHUB REPO
echo ========================================
echo.

echo 📍 Situacao atual: Repositorio remoto nao encontrado
echo 🎯 Solucao: Criar novo repositorio ou atualizar remote
echo.

echo 📋 OPCOES DISPONIVEIS:
echo.
echo 1) CRIAR NOVO REPOSITORIO GITHUB
echo    - Va para: https://github.com/new
echo    - Nome: sofia-ia-sdr
echo    - Publico/Privado: Sua escolha
echo    - NAO inicializar com README
echo.
echo 2) USAR REPOSITORIO EXISTENTE
echo    - Se ja tem repositorio, precisa do URL correto
echo.
echo 3) TRABALHAR APENAS LOCAL
echo    - Manter apenas commits locais por enquanto
echo.

echo ========================================
echo 🚀 COMANDOS PARA EXECUTAR:
echo ========================================
echo.

echo Se CRIAR NOVO REPOSITORIO:
echo git remote remove origin
echo git remote add origin https://github.com/JeanZorzetti/sofia-ia-sdr.git
echo git branch -M main
echo git push -u origin main
echo.

echo Se USAR REPOSITORIO EXISTENTE:
echo git remote set-url origin [URL_DO_REPOSITORIO_CORRETO]
echo git push origin main
echo.

echo Se TRABALHAR APENAS LOCAL:
echo # Nada a fazer - commits ja estao salvos localmente
echo # Deploy direto no EasyPanel sem GitHub
echo.

echo ========================================
echo 💡 RECOMENDACAO:
echo ========================================
echo.
echo Para o Sofia IA, recomendo:
echo 1. Criar repositorio privado: sofia-ia-sdr
echo 2. Fazer push do codigo corrigido
echo 3. Usar GitHub para deploy automatico EasyPanel
echo.

pause