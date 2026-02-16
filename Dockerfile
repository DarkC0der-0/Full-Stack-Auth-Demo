# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install ALL dependencies (including devDeps for building)
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Copy frontend build to backend/public
RUN mkdir -p backend/public && cp -r dist/* backend/public/

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy backend package files and install production deps only
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy built backend from builder
COPY --from=builder /app/backend/dist ./dist

# Copy frontend static files
COPY --from=builder /app/backend/public ./public

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/main.js"]
