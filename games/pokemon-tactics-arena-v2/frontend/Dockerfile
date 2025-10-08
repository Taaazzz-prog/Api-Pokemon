# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/contracts/package*.json ./packages/contracts/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/contracts ./packages/contracts
COPY frontend ./frontend

# Build contracts package
RUN cd packages/contracts && npm run build

# Build frontend
ENV NODE_ENV=production
RUN cd frontend && npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Create nginx user
RUN addgroup -g 1001 -S pokemon && \
    adduser -S pokemon -u 1001 -G pokemon

# Set permissions
RUN chown -R pokemon:pokemon /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Switch to non-root user
USER pokemon

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]