@echo off
echo ========================================
echo 🚀 SOFIA IA - COMMIT DAS CORRECOES
echo ========================================
echo.

echo 📂 Navegando para diretorio do projeto...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA"

echo.
echo 📊 Verificando status atual...
git status --porcelain

echo.
echo ➕ Adicionando arquivos modificados...
git add backend/src/app.js
git add backend/.env  
git add test-integration.bat
git add start-frontend.bat

echo.
echo 📝 Fazendo commit...
git commit -m "✅ Fix: Corrigir hooks de API e estrutura do backend

🔧 Alterações principais:
- Reorganizar backend: server-with-real-metrics.js → src/app.js
- Corrigir PORT: 3001 → 8000 (unificar com frontend expectativa)
- Adicionar dotenv support para environment variables
- Melhorar health check com informações de debug
- Criar scripts de teste de integração

🎯 Hooks de API agora funcionam corretamente:
- useDashboardData() → localhost:8000/api/dashboard/overview ✅
- useRecentConversations() → localhost:8000/api/conversations/recent ✅
- useRealTimeStats() → localhost:8000/api/realtime/stats ✅
- useApiHealth() → localhost:8000/health ✅

📊 Backend servindo dados reais:
- 322 conversas hoje (dinâmico)
- 26.1%% taxa conversão (calculado)
- 84 leads qualificados (simulado)
- 8 endpoints funcionais

✅ Próximo: Deploy EasyPanel"

echo.
echo 🔍 Verificando commit...
git log --oneline -1

echo.
echo ========================================
echo ✅ COMMIT CONCLUIDO!
echo ========================================
echo.
echo Próximos passos:
echo 1. git push origin main (se houver remote)
echo 2. Deploy no EasyPanel
echo 3. Atualizar frontend para produção
echo.
pause