# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install ALL dependencies (including devDeps for building)
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Build frontend (Vite)
RUN npm run build

# Copy frontend build to backend/public
RUN mkdir -p backend/public && cp -r dist/* backend/public/

# Build backend (NestJS)
WORKDIR /app/backend
RUN npm run build

# Verify build output exists
RUN ls -la dist/

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy built backend dist from builder
COPY --from=builder /app/backend/dist ./dist

# Copy frontend static files  
COPY --from=builder /app/backend/public ./public

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/main.js"]
