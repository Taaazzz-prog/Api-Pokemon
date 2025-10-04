# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/contracts/package*.json ./packages/contracts/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/contracts ./packages/contracts
COPY backend ./backend

# Build contracts package
RUN cd packages/contracts && npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S pokemon && \
    adduser -S pokemon -u 1001

# Install production dependencies
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files and install production deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/packages/contracts/package*.json ./packages/contracts/

# Copy built applications
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Create logs directory
RUN mkdir -p /app/logs && chown -R pokemon:pokemon /app

# Switch to non-root user
USER pokemon

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/dist/server.js"]