# 🏠 Sofia IA - Backend Dockerfile
# Otimizado para estrutura atual: backend/src/app.js

FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json do backend
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código do backend
COPY backend/ ./

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Ajustar permissões
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 8000, path: '/health', timeout: 2000 }; const request = http.request(options, (res) => { console.log(\`STATUS: \${res.statusCode}\`); if (res.statusCode == 200) { process.exit(0) } else { process.exit(1) } }); request.on('error', function(err) { console.log('ERROR'); process.exit(1); }); request.end();"

# Comando para iniciar o servidor
CMD ["node", "src/app.js"]