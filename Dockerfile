# Stage 1: Build the daemon
FROM node:22-bookworm AS builder

WORKDIR /build
COPY packages/agent/package.json packages/agent/package-lock.json* ./
RUN npm install

COPY packages/agent/tsconfig.json ./
COPY packages/agent/src ./src
RUN npx tsc

# Stage 2: Runtime
FROM node:22-bookworm AS runtime

# Install Sui CLI
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://sui-releases.s3.us-east-1.amazonaws.com/sui-testnet-v1.45.2-linux-x64.tgz | tar xz -C /usr/local/bin && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ClawHub CLI
RUN npm install -g clawhub

# Create non-root user
RUN useradd -m -s /bin/bash node-viral || true

# Setup directories
WORKDIR /home/node
RUN mkdir -p viral-move/dist viral-move/contracts workspace .openclaw/skills

# Copy built daemon
COPY --from=builder /build/dist ./viral-move/dist
COPY --from=builder /build/node_modules ./viral-move/node_modules
COPY packages/agent/package.json ./viral-move/

# Copy contracts templates
COPY contracts/ ./viral-move/contracts/

# Copy OpenClaw workspace
COPY workspace/ ./workspace/

# Copy OpenClaw config
COPY config/ ./.openclaw/

# Set ownership
RUN chown -R node:node /home/node

USER node

# Environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:18789/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 18789

# Start: run the daemon CLI in loop mode
CMD ["node", "viral-move/dist/index.js", "loop"]
