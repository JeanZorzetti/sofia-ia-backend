# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache dumb-init ca-certificates curl

# Create app user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S laisIA -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=laisIA:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=laisIA:nodejs src/ ./src/

# Create logs directory
RUN mkdir -p logs && chown -R laisIA:nodejs logs

# Switch to non-root user
USER laisIA

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]
