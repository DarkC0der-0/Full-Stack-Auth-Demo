FROM node:20-alpine

WORKDIR /app

# Copy all package files first
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install frontend dependencies
RUN npm ci

# Install backend dependencies (all, including dev for building)
WORKDIR /app/backend
RUN npm ci

# Copy all source code
WORKDIR /app
COPY . .

# Build frontend
RUN npm run build

# Copy frontend to backend/public
RUN mkdir -p backend/public && cp -r dist/* backend/public/

# Build backend
WORKDIR /app/backend
RUN npm run build

# Verify the build worked
RUN echo "=== Backend dist contents ===" && ls -la dist/ && echo "=== main.js exists ===" && cat dist/main.js | head -5

# Remove devDependencies to slim down
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]
