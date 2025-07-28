# 🐳 Dockerfile para EasyPanel Deploy - STUB SERVICE
FROM node:18-alpine

LABEL maintainer="ROI Labs <contato@roilabs.com.br>"
LABEL description="LAIS IA - Stub Service (N8N Powered)"
LABEL version="2.0.0"

ENV NODE_ENV=production
ENV PORT=8000

RUN apk add --no-cache dumb-init ca-certificates

RUN addgroup -g 1001 -S nodejs && adduser -S laisIA -u 1001

WORKDIR /app

COPY package.json ./
RUN npm install --only=production && npm cache clean --force

COPY src/app-stub.js ./src/

RUN mkdir -p logs && chown -R laisIA:nodejs /app
USER laisIA

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app-stub.js"]