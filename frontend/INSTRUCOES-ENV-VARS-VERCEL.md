# ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE - VERCEL

## ✅ **BACKEND EASYPANEL: CONFIGURADO**

Variáveis já configuradas corretamente:
- ✅ NODE_ENV=production
- ✅ DATABASE_URL (Supabase)
- ✅ ANTHROPIC_API_KEY (Claude)
- ✅ EVOLUTION_API_URL/KEY (WhatsApp)
- ✅ JWT_SECRET

## 🔄 **FRONTEND VERCEL: CONFIGURAÇÃO NECESSÁRIA**

### 📋 **VARIÁVEIS PARA ADICIONAR NO VERCEL:**

```env
VITE_API_URL=https://sofiaia.roilabs.com.br
VITE_APP_NAME=Sofia IA
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_BACKEND_URL=https://sofiaia.roilabs.com.br
VITE_COMPANY_PHONE=+5562983443919
```

### 🔧 **PASSOS DE CONFIGURAÇÃO:**

#### **1. Acesse Vercel Dashboard**
https://vercel.com/dashboard

#### **2. Selecione o Projeto**
- **Projeto**: sofia-ai-lux-dash

#### **3. Navegue para Environment Variables**
- **Settings** > **Environment Variables**

#### **4. Adicione Cada Variável (6 no total):**

| Nome | Valor | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://sofiaia.roilabs.com.br` | Production |
| `VITE_APP_NAME` | `Sofia IA` | Production |
| `VITE_NODE_ENV` | `production` | Production |
| `VITE_ENVIRONMENT` | `production` | Production |
| `VITE_BACKEND_URL` | `https://sofiaia.roilabs.com.br` | Production |
| `VITE_COMPANY_PHONE` | `+5562983443919` | Production |

#### **5. Redeploy o Projeto**
- **Deployments** > último deploy > **⋯** > **Redeploy**

### 🎯 **RESULTADO ESPERADO:**

Após redeploy (2-3 minutos):
- ✅ **Frontend conecta** ao backend produção automaticamente
- ✅ **API calls** usam https://sofiaia.roilabs.com.br
- ✅ **Dados dinâmicos** funcionam em produção
- ✅ **WhatsApp tab** conecta à Evolution API real

### ⚠️ **OBSERVAÇÕES IMPORTANTES:**

1. **Prefixo VITE_**: Obrigatório para variáveis frontend
2. **Redeploy**: Necessário após adicionar variáveis
3. **Environment**: Selecionar "Production" para todas
4. **URLs**: Usar https://sofiaia.roilabs.com.br (backend EasyPanel)

### 🔗 **LINKS DIRETOS:**

- **Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/settings/environment-variables
- **Backend API**: https://sofiaia.roilabs.com.br/health

### 📊 **CHECKLIST DE VERIFICAÇÃO:**

- [ ] 6 variáveis adicionadas no Vercel
- [ ] Todas com prefixo VITE_
- [ ] Environment = Production
- [ ] Redeploy executado
- [ ] Deploy concluído (2-3 min)
- [ ] Frontend conectando ao backend produção
- [ ] Dados dinâmicos funcionando

---

## 🚀 **PRÓXIMO PASSO APÓS CONFIGURAÇÃO:**

Quando completar as variáveis:
- **Testar**: https://sofia-ia.roilabs.com.br
- **Verificar**: Dados dinâmicos do backend
- **Próximo**: Build otimizado performance

**Execute a configuração e confirme quando concluído! ⚙️**
