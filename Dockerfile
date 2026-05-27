# ── Stage 1: Install all dependencies ──────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Production image ───────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy app source from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Create logs directory
RUN mkdir -p logs && chown -R node:node /app

# Use non-root user for security
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "backend/server.js"]
