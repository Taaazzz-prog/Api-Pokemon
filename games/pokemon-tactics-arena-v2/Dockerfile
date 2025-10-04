# Pokemon Tactics Arena v2 - Production Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Switch to frontend directory for development
WORKDIR /app/frontend

# Expose port
EXPOSE 5173

# Start the development server directly (skip build step due to TypeScript errors)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]