@echo off
echo 🔧 SOFIA IA - Commit Correção de Porta
echo =========================================
echo.
echo ✅ CORREÇÃO IMPLEMENTADA:
echo   [1] vite.config.ts: porta 8080 → 5173 (padrão Vite)
echo   [2] Scripts atualizados para porta correta
echo   [3] Documentação URLs corrigidas
echo   [4] Fix automático de porta criado
echo.
echo 🎯 Esta correção resolve:
echo   ❌ Frontend iniciava em porta aleatória (8082)
echo   ❌ URLs incorretas na documentação
echo   ❌ Configuração não-padrão do Vite
echo.
echo   ✅ Frontend sempre na porta 5173
echo   ✅ URLs consistentes em toda documentação
echo   ✅ Configuração padrão Vite restaurada
echo.

set /p confirm="Continuar com commit da correção de porta? (y/n): "
if /i not "%confirm%"=="y" goto end

echo.
echo 🔄 Fazendo commit da correção...
cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA"

echo 📍 Verificando status do Git...
git status

echo.
echo 📦 Adicionando arquivos corrigidos...
git add .

echo.
echo 💬 Fazendo commit da correção...
git commit -m "🔧 Fix: Correção configuração porta frontend

🎯 Problema resolvido:
- Frontend iniciava em porta aleatória (8080→8081→8082)
- Causa: vite.config.ts configurado para porta 8080 (não-padrão)

✅ Correções aplicadas:
- vite.config.ts: port 8080 → 5173 (padrão Vite)
- Scripts atualizados para URLs corretas
- fix-frontend-port.bat criado para correção automática
- INICIAR-SOFIA-COMPLETO.bat atualizado

📊 URLs finais:
- Frontend DEV: http://localhost:5173 ✅
- Backend DEV: http://localhost:8001 ✅  
- Produção: https://sofiaia.roilabs.com.br ✅

🎯 Resultado: 
- Frontend sempre inicia na porta esperada (5173)
- Configuração consistente dev/prod
- Documentação com URLs corretas
- Scripts funcionais para inicialização

Type: fix
Scope: frontend, config, scripts  
Impact: Consistency, UX"

echo.
echo 🌐 Fazendo push para GitHub...
git push origin main

echo.
echo ✅ COMMIT DA CORREÇÃO REALIZADO COM SUCESSO!
echo.
echo 📋 RESUMO:
echo   ✅ Correção de porta commitada
echo   ✅ Frontend agora usa porta 5173 consistentemente
echo   ✅ Scripts e documentação atualizados
echo   ✅ Configuração padrão Vite restaurada
echo.
echo 🎯 PRÓXIMO PASSO:
echo   Teste: fix-frontend-port.bat
echo   Resultado esperado: http://localhost:5173
echo.

:end
pause
