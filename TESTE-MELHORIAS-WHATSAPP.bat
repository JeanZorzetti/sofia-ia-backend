@echo off
echo 🎯 TESTANDO MELHORIAS DO WHATSAPP TAB
echo =====================================

echo ✅ 1. Função de excluir instância adicionada
echo ✅ 2. Modal responsiva corrigida
echo ✅ 3. UX melhorada

echo.
echo 📱 Navegue para WhatsApp Tab e teste:
echo    - Modal de nova instância (deve caber na tela)
echo    - Botão de deletar instâncias (ícone lixeira)
echo    - Confirmação antes de excluir

echo.
echo 🌐 Abrindo frontend...
cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"
start http://localhost:5173
npm run dev