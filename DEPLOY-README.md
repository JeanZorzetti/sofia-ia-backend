# 🚀 GUIA DE DEPLOY - LAIS IA QR CODE WHATSAPP

## 📁 Scripts Criados

Foram criados 3 scripts para facilitar o deploy e teste:

### 1. `git-commit-deploy.bat` 
**Função:** Commit + Push + Deploy Backend EasyPanel  
**Quando usar:** Após implementar correções QR Code WhatsApp

### 2. `test-deploy-status.bat`
**Função:** Verificar status de todos os endpoints pós-deploy  
**Quando usar:** Após deploy para confirmar que tudo funciona

### 3. `deploy-frontend-vercel.bat`
**Função:** Deploy do frontend no Vercel  
**Quando usar:** Se precisar atualizar frontend com correções

---

## 🎯 Execução Recomendada

### **STEP 1: Deploy Completo**
```bash
# Execute este primeiro para commit + deploy backend
git-commit-deploy.bat
```

**O que faz:**
- ✅ `git add .` - Adiciona todas alterações
- ✅ `git commit` - Commit com mensagem detalhada
- ✅ `git push` - Push para repositório remoto  
- ✅ `node deploy.js` - Deploy automático EasyPanel
- ✅ Mostra URLs de produção

### **STEP 2: Verificar Deploy**
```bash
# Execute após deploy para verificar status
test-deploy-status.bat  
```

**O que verifica:**
- 📡 Backend health: `https://lais-ia-api.roilabs.com.br/api/health`
- 📊 Analytics: `https://lais-ia-api.roilabs.com.br/api/analytics`
- 📱 WhatsApp API: `https://lais-ia-api.roilabs.com.br/api/whatsapp/instances`
- 🔄 Evolution API: `https://evolutionapi.roilabs.com.br/instance/fetchInstances`

### **STEP 3: Deploy Frontend (Opcional)**
```bash
# Execute se precisar atualizar frontend
deploy-frontend-vercel.bat
```

**O que faz:**
- 🔧 Configura .env produção
- 📦 `npm install` + `npm run build`  
- 🌐 Deploy Vercel automático
- 🔗 Mostra URLs atualizadas

---

## 🧪 Teste Pós-Deploy

### **URLs para Teste:**

**Backend:**
- Health: https://lais-ia-api.roilabs.com.br/api/health
- Analytics: https://lais-ia-api.roilabs.com.br/api/analytics
- WhatsApp: https://lais-ia-api.roilabs.com.br/api/whatsapp/instances

**Frontend:**
- Dashboard: https://sofia-ai-lux-dash.vercel.app

**Evolution API:**
- Manager: https://evolutionapi.roilabs.com.br/manager/instance/.../dashboard

### **Fluxo de Teste QR Code:**

1. **Acessar:** https://sofia-ai-lux-dash.vercel.app
2. **Login:** qualquer email/senha
3. **WhatsApp Tab:** Navegar para aba WhatsApp
4. **Nova Instância:** Clicar "Nova Instância WhatsApp"
5. **Verificar:** Deve mostrar "Sofia IA" como opção
6. **Testar Opção A:** Clicar "Usar Esta" na Sofia IA
7. **Testar Opção B:** Clicar "Ou Criar Nova Instância"

### **Logs Esperados (F12 Console):**
```javascript
"Evolution API Call: GET /instance/fetchInstances"
"✅ Evolution API OK. Instâncias encontradas: 1"  
"✅ Instância LAIS IA encontrada: Sofia IA"
"📊 Status: open"
```

---

## 📧 Envio de Logs

### **O que Enviar:**

#### **Se Funcionou:**
- ✅ Screenshot do modal QR Code mostrando "Sofia IA"
- ✅ Screenshot da Sofia IA conectando instantaneamente
- ✅ Console logs confirmando API calls funcionando

#### **Se Erro:**
- ❌ Screenshot da tela de erro
- ❌ Console logs (F12 → Console)
- ❌ Network errors (F12 → Network)
- ❌ Response das APIs com erro

### **Como Capturar Logs:**
1. **F12** para abrir DevTools
2. **Console Tab** - Para logs JavaScript
3. **Network Tab** - Para requisições HTTP
4. **Screenshot** da tela inteira incluindo erro
5. **Copy/paste** texto dos erros

---

## ⚡ Execução Rápida (1 Comando)

```bash
# Para fazer tudo de uma vez:
git-commit-deploy.bat
```

**Aguardar 2-3 minutos e testar:**
- https://lais-ia-api.roilabs.com.br/api/health
- https://sofia-ai-lux-dash.vercel.app

---

## 🔧 Troubleshooting

### **Erro no Git:**
- Verificar se está no diretório correto
- `cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\LAIS IA"`

### **Erro no Deploy Backend:**
- Verificar se EasyPanel está acessível
- Login manual em https://easypanel.roilabs.com.br

### **Erro no Frontend:**
- Verificar build: `npm run build`
- Verificar Vercel CLI: `npm install -g vercel`

### **APIs não respondem:**
- Aguardar 2-3 minutos após deploy
- Verificar se Evolution API está up
- Confirmar instância "Sofia IA" ativa

---

## 📊 Checklist Final

### **Pré-Deploy:**
- [ ] Arquivos QR Code WhatsApp implementados
- [ ] .env configurado com instâncias existentes
- [ ] Scripts de deploy criados

### **Pós-Deploy:**
- [ ] Backend responde em /api/health
- [ ] Evolution API retorna instâncias  
- [ ] Frontend carrega sem erros
- [ ] WhatsApp tab funciona
- [ ] QR Code modal abre
- [ ] Opções "Sofia IA" + "Criar Nova" aparecem
- [ ] Logs enviados para análise

---

## 🎉 Resultado Esperado

**Sistema 100% funcional** com:
- ✅ QR Code WhatsApp corrigido
- ✅ Detecção automática Sofia IA existente
- ✅ Sistema de escolha inteligente
- ✅ Interface luxuosa e moderna
- ✅ Error handling robusto
- ✅ Deploy automatizado
- ✅ Pronto para usuários finais

**🚀 Execute `git-commit-deploy.bat` e me envie os logs!**