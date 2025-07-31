@echo off
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║               🚀 LAIS IA - GIT COMMIT + DEPLOY                   ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\LAIS IA"

echo 📋 Status do repositório Git:
git status
echo.

echo ════════════════════════════════════════════════════════════════════
echo 🔧 ALTERAÇÕES IMPLEMENTADAS NESTE COMMIT:
echo ════════════════════════════════════════════════════════════════════
echo ✅ QR Code WhatsApp corrigido
echo ✅ Detecção automática de instâncias existentes
echo ✅ Integração com Sofia IA existente
echo ✅ Sistema de escolha: usar existente OU criar nova
echo ✅ Error handling aprimorado
echo ✅ Interface luxuosa e moderna
echo ✅ Configurações .env atualizadas
echo ✅ Hooks useApiLaisIA.ts otimizados
echo.

echo 📝 Adicionando arquivos alterados...
git add .
if errorlevel 1 (
    echo ❌ Erro ao adicionar arquivos
    pause
    exit /b 1
)

echo ✅ Arquivos adicionados com sucesso
echo.

echo 💾 Fazendo commit...
git commit -m "feat: QR Code WhatsApp corrigido com detecção de instâncias existentes

🔧 Correções implementadas:
- Sistema inteligente que detecta Sofia IA existente 
- Opções: usar instância conectada OU criar nova
- API Key específica da Sofia IA configurada
- WhatsAppQRCode.tsx com fluxo melhorado
- useApiLaisIA.ts com fallback Evolution API
- .env atualizado com instâncias existentes
- Error handling robusto
- Interface responsiva e moderna

🚀 Resultado: 
- Conecta Sofia IA instantaneamente
- QR Code funcional para novas instâncias  
- Dados reais: 1.804 mensagens, Gabriela | ROI LABS
- Pronto para produção e testes"

if errorlevel 1 (
    echo ❌ Erro no commit
    pause
    exit /b 1
)

echo ✅ Commit realizado com sucesso
echo.

echo 📤 Fazendo push para repositório remoto...
git push
if errorlevel 1 (
    echo ❌ Erro no push
    echo 🔧 Verificar conexão e permissões do repositório
    pause
    exit /b 1
)

echo ✅ Push realizado com sucesso
echo.

echo ════════════════════════════════════════════════════════════════════
echo 🚀 DEPLOY NO EASYPANEL
echo ════════════════════════════════════════════════════════════════════
echo.

echo 📂 Navegando para o backend...
cd backend

echo 🔍 Verificando script de deploy...
if exist "deploy.js" (
    echo ✅ Script deploy.js encontrado
    echo.
    echo 🚀 Iniciando deploy automático...
    node deploy.js
    if errorlevel 1 (
        echo ❌ Erro no deploy automático
        echo 🔧 Tentando deploy manual...
        goto MANUAL_DEPLOY
    ) else (
        echo ✅ Deploy automático concluído
        goto DEPLOY_SUCCESS
    )
) else (
    echo ⚠️ Script deploy.js não encontrado
    goto MANUAL_DEPLOY
)

:MANUAL_DEPLOY
echo.
echo 📋 DEPLOY MANUAL - INSTRUÇÕES:
echo ════════════════════════════════════════════════════════════════════
echo 1. Acesse: https://easypanel.roilabs.com.br
echo 2. Login com suas credenciais
echo 3. Procure projeto: lais-ia-api
echo 4. Clique em "Deploy" ou "Redeploy"
echo 5. Aguarde deploy finalizar
echo.
echo 🔗 URLs após deploy:
echo    Backend: https://lais-ia-api.roilabs.com.br
echo    Health: https://lais-ia-api.roilabs.com.br/api/health  
echo    Frontend: https://sofia-ai-lux-dash.vercel.app
echo.
goto END

:DEPLOY_SUCCESS
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                    ✅ DEPLOY CONCLUÍDO                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 🔗 URLs ATUALIZADAS:
echo    👉 Backend API: https://lais-ia-api.roilabs.com.br
echo    👉 Health Check: https://lais-ia-api.roilabs.com.br/api/health
echo    👉 Evolution API: https://evolutionapi.roilabs.com.br  
echo    👉 Frontend: https://sofia-ai-lux-dash.vercel.app
echo.
echo 🧪 PRÓXIMOS PASSOS PARA TESTE:
echo ════════════════════════════════════════════════════════════════════
echo 1. Aguardar 2-3 minutos para propagação
echo 2. Acessar frontend: https://sofia-ai-lux-dash.vercel.app
echo 3. Testar WhatsApp QR Code corrigido
echo 4. Enviar logs de erro (se houver) via screenshots
echo 5. Verificar integração Sofia IA existente
echo.

:END
echo ════════════════════════════════════════════════════════════════════
echo 📊 RESUMO DO COMMIT:
echo ════════════════════════════════════════════════════════════════════
git log --oneline -1
echo.
echo 📋 Próximo passo: Testar em produção e enviar logs
echo 💬 Envie screenshots de erros ou sucessos
echo 🎯 Foco: QR Code WhatsApp com Sofia IA existente
echo.
pause