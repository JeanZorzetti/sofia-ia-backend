# SOFIA IA - DEPLOY FRONTEND ATUALIZADO

## 🎯 STATUS ATUAL
- ✅ **Frontend local**: 100% preparado com hooks dinâmicos
- ✅ **Backend produção**: https://sofiaia.roilabs.com.br funcionando
- ✅ **Build**: dist/ folder já existe
- ✅ **Vercel**: projeto configurado (ID: prj_cCybutWlH3K04amyNFRuwCYb48oz)
- 🔄 **Deploy**: Necessário atualizar versão no Vercel

## 🚀 EXECUÇÃO MANUAL IMEDIATA

### Opção A: Via Vercel CLI (MAIS RÁPIDO)
```bash
cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"
npx vercel --prod
```

### Opção B: Via Git Push (MAIS CONFIÁVEL)
```bash
cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA\frontend\sofia-ai-lux-dash-main"
git add .
git commit -m "🚀 Deploy: Frontend v2.1.0 dinâmico"
git push origin main
```

### Opção C: Via Vercel Dashboard (INTERFACE)
1. Acesse: https://vercel.com/dashboard
2. Procure projeto: sofia-ai-lux-dash
3. Clique em "Redeploy" última versão

## 🎯 RESULTADO ESPERADO
- **URL**: https://sofia-ai-lux-dash.vercel.app
- **Dados**: Dinâmicos do backend https://sofiaia.roilabs.com.br
- **Dashboard**: Métricas reais (não hardcoded)
- **WhatsApp Tab**: Funcional com instâncias simuladas

## ✅ CHECKLIST PÓS-DEPLOY
- [ ] Teste URL: dados não são mais hardcoded
- [ ] Dashboard mostra métricas dinâmicas
- [ ] API Health indicator funciona
- [ ] WhatsApp tab carrega instâncias
- [ ] Auto-refresh funciona (30s)

## 🔄 PRÓXIMO PASSO
**Conectar domínio customizado** (2º item do checklist)
