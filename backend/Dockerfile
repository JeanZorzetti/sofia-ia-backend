# 🐳 Dockerfile para EasyPanel Deploy
FROM node:18-alpine

# Metadados
LABEL maintainer="ROI Labs <contato@roilabs.com.br>"
LABEL description="LAIS IA - Sistema SDR Inteligente para Imobiliárias"
LABEL version="1.0.0"

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8000

# Instalar dependências do sistema
RUN apk add --no-cache \
    dumb-init \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium do Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S laisIA -u 1001

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install --only=production && npm cache clean --force

# Copiar código da aplicação
COPY src/ ./src/
COPY setup.js ./

# Criar diretórios necessários
RUN mkdir -p logs uploads temp backups

# Dar permissões para o usuário
RUN chown -R laisIA:nodejs /app
USER laisIA

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]