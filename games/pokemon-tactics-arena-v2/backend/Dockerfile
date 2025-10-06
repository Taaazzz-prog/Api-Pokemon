# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy main package files
COPY package.json ./
COPY package-lock.json ./

# Copy packages structure
COPY packages/contracts/package.json ./packages/contracts/
COPY backend/package.json ./backend/

# Install dependencies using npm workspaces (this will handle the lack of individual package-lock.json files)
RUN npm install

# Copy source code
COPY packages/contracts ./packages/contracts
COPY backend ./backend

# Build shared contracts
RUN cd packages/contracts && npm run build

# Generate Prisma client
RUN cd backend && npx prisma generate

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine AS production

# Create application user
RUN addgroup -g 1001 -S pokemon && \
    adduser -S pokemon -u 1001

# Install runtime tools
RUN apk add --no-cache dumb-init openssl && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy manifests for reference (not used at runtime but kept for transparency)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/

# Copy node modules and build artefacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist

# Prepare log directory
RUN mkdir -p /app/logs && chown -R pokemon:pokemon /app

USER pokemon

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/dist/server.js"]
