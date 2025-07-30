# 🐳 Dockerfile para EasyPanel Deploy - LAIS IA COMPLETO
FROM node:18-alpine

LABEL maintainer="ROI Labs <contato@roilabs.com.br>"
LABEL description="LAIS IA - Sistema SDR Completo para Imobiliárias"
LABEL version="2.0.0"

ENV NODE_ENV=production
ENV PORT=8000

RUN apk add --no-cache dumb-init ca-certificates

RUN addgroup -g 1001 -S nodejs && adduser -S laisIA -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy all source files (NOT just stub)
COPY src/ ./src/
COPY .env.example ./.env

# Create logs directory and set permissions
RUN mkdir -p logs && chown -R laisIA:nodejs /app
USER laisIA

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
# Execute the FULL system, not the stub
CMD ["node", "src/app.js"]
