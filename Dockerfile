# Stage 1: Build the TypeScript daemon
FROM node:22-bookworm AS builder

WORKDIR /build
COPY packages/agent/package.json packages/agent/package-lock.json* ./
RUN npm install

COPY packages/agent/tsconfig.json ./
COPY packages/agent/src ./src
RUN npx tsc

# Stage 2: Runtime (Ubuntu 24.04 for glibc 2.39 — required by Sui CLI v1.66)
FROM ubuntu:24.04 AS runtime

# Copy Node.js from builder stage (avoids nodesource dependency)
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/bin/npx /usr/local/bin/npx
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# Install minimal deps + Sui CLI (multi-arch: amd64 / arm64)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "arm64" ]; then SUI_ARCH="aarch64"; \
    else SUI_ARCH="x86_64"; fi && \
    SUI_VERSION="testnet-v1.66.2" && \
    curl -fsSL "https://github.com/MystenLabs/sui/releases/download/${SUI_VERSION}/sui-${SUI_VERSION}-ubuntu-${SUI_ARCH}.tgz" \
      -o /tmp/sui.tgz && \
    tar xzf /tmp/sui.tgz -C /usr/local/bin && \
    rm /tmp/sui.tgz && \
    chmod +x /usr/local/bin/sui* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash viral

# Setup directories
WORKDIR /home/viral
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

# Copy entrypoint script (configures Sui client from Docker secret)
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set ownership
RUN chown -R viral:viral /home/viral

USER viral

# Environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV HOME=/home/viral

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:18789/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 18789

# Entrypoint: configure Sui client, then run command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "viral-move/dist/index.js", "loop"]
