# 🐳 Dockerfile para EasyPanel Deploy - LAIS IA COMPLETO
FROM node:18-alpine

LABEL maintainer="ROI Labs <contato@roilabs.com.br>"
LABEL description="LAIS IA - Sistema SDR Completo para Imobiliárias"
LABEL version="2.0.0"

ENV NODE_ENV=production
ENV PORT=8000

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    curl

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S laisIA -u 1001

WORKDIR /app

# Copy package files FIRST for better caching
COPY --chown=laisIA:nodejs package*.json ./

# Install ALL dependencies (production + dev for build)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy all source files
COPY --chown=laisIA:nodejs src/ ./src/

# Copy environment template
COPY --chown=laisIA:nodejs .env.example ./.env

# Create logs directory
RUN mkdir -p logs && chown -R laisIA:nodejs /app

# Switch to non-root user
USER laisIA

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]
