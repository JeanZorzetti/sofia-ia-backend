# 🌐 SOFIA IA - CONFIGURAÇÃO DOMÍNIO CUSTOMIZADO

## ✅ STATUS ATUAL
- ✅ **Deploy frontend**: https://sofia-ai-lux-dash.vercel.app (funcionando)
- ✅ **Backend produção**: https://sofiaia.roilabs.com.br (funcionando)
- 🔄 **Próximo passo**: Conectar domínio customizado

## 🎯 DOMÍNIO PLANEJADO
- **Frontend**: `sofia-ia.roilabs.com.br`
- **Backend**: `api.sofia-ia.roilabs.com.br` (já configurado)

## 📋 CONFIGURAÇÃO STEP-BY-STEP

### STEP 1: Configurar DNS (Registrar.com)
```dns
Tipo    Nome        Valor                           TTL
A       sofia-ia    76.76.19.61                    3600
CNAME   www         sofia-ia-lux-dash.vercel.app   3600
```

### STEP 2: Adicionar Domínio no Vercel
1. **Acesse**: https://vercel.com/dashboard
2. **Projeto**: sofia-ai-lux-dash (ID: prj_cCybutWlH3K04amyNFRuwCYb48oz)
3. **Navegue**: Settings > Domains
4. **Adicione**:
   - `sofia-ia.roilabs.com.br`
   - `www.sofia-ia.roilabs.com.br`
5. **Configure**: Redirect www para apex domain

### STEP 3: Aguardar Propagação
- **Tempo**: 2-24 horas
- **Status**: Verificar em https://dnschecker.org
- **Certificado SSL**: Automático (Let's Encrypt)

## 🔧 COMANDOS DE VERIFICAÇÃO

### Verificar DNS
```bash
nslookup sofia-ia.roilabs.com.br
dig sofia-ia.roilabs.com.br A
```

### Testar conectividade
```bash
curl -I https://sofia-ia.roilabs.com.br
```

## ✅ RESULTADO ESPERADO
- **URL principal**: https://sofia-ia.roilabs.com.br
- **Redirect www**: https://www.sofia-ia.roilabs.com.br → https://sofia-ia.roilabs.com.br
- **SSL**: Certificado válido automático
- **Performance**: Mesma velocidade que .vercel.app

## 🎯 PRÓXIMOS PASSOS PÓS-DOMÍNIO
1. ✅ Conectar domínio customizado
2. 🔄 Configurar env vars produção
3. 🔄 Build otimizado performance  
4. 🔄 PWA configuration
5. 🔄 Analytics tracking

## 💡 OBSERVAÇÕES
- **Custo**: R$ 0 (DNS já está pago)
- **Tempo setup**: 15 minutos
- **Manutenção**: Automática
- **Benefício**: URL profissional para clientes

## 🚀 IMPACTO NO NEGÓCIO
- ✅ **Credibilidade**: Domínio próprio vs .vercel.app
- ✅ **Branding**: sofia-ia.roilabs.com.br é memorável
- ✅ **SEO**: Melhor ranqueamento Google
- ✅ **Confiança**: Clientes preferem domínios próprios
