# ─── Stage 1: Build the TypeScript CLI ───────────────────────────────────────
FROM node:22-bookworm AS builder

WORKDIR /build
COPY packages/agent/package.json packages/agent/package-lock.json* ./
RUN npm install

COPY packages/agent/tsconfig.json ./
COPY packages/agent/src ./src
RUN npx tsc

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
# Ubuntu 24.04 provides glibc 2.39 — required by Sui CLI v1.66.2
FROM ubuntu:24.04 AS runtime

# ── Copy Node.js from builder (avoids nodesource/apt dependency) ──
COPY --from=builder /usr/local/bin/node    /usr/local/bin/node
COPY --from=builder /usr/local/bin/npx    /usr/local/bin/npx
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# ── Install OpenClaw gateway ──
RUN npm install -g openclaw

# ── Install Sui CLI (multi-arch: amd64 / arm64) ──
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "arm64" ]; then SUI_ARCH="aarch64"; \
    else SUI_ARCH="x86_64"; fi && \
    SUI_VERSION="testnet-v1.66.2" && \
    curl -fsSL \
      "https://github.com/MystenLabs/sui/releases/download/${SUI_VERSION}/sui-${SUI_VERSION}-ubuntu-${SUI_ARCH}.tgz" \
      -o /tmp/sui.tgz && \
    tar xzf /tmp/sui.tgz -C /usr/local/bin && \
    rm /tmp/sui.tgz && \
    chmod +x /usr/local/bin/sui* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ── Create non-root user ──
RUN useradd -m -s /bin/bash viral

WORKDIR /home/viral

# ── Directory layout ──
RUN mkdir -p \
    viral-move/dist \
    viral-move/contracts \
    .openclaw/workspace/skills

# ── Copy built CLI + deps ──
COPY --from=builder /build/dist         ./viral-move/dist
COPY --from=builder /build/node_modules ./viral-move/node_modules
COPY packages/agent/package.json        ./viral-move/

# ── Register viral-move as a global command ──
RUN echo '#!/bin/sh\nexec node /home/viral/viral-move/dist/index.js "$@"' \
    > /usr/local/bin/viral-move && chmod +x /usr/local/bin/viral-move

# ── Copy Move contract templates ──
COPY contracts/ ./viral-move/contracts/

# ── Copy OpenClaw workspace (SOUL, AGENTS, HEARTBEAT, skills) ──
#    OpenClaw looks for workspace at the path set in openclaw.json
#    Our config sets: "workspace": "~/.openclaw/workspace"
COPY workspace/ ./.openclaw/workspace/

# ── Copy OpenClaw config (openclaw.json + exec-approvals.json) ──
COPY config/ ./.openclaw/

# ── Copy entrypoint (initialises Sui client from secret/env) ──
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ── Fix ownership ──
RUN chown -R viral:viral /home/viral

USER viral

# ── Environment ──
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV HOME=/home/viral
ENV TOKEN_TEMPLATE_DIR=/home/viral/viral-move/contracts/token-template
ENV GENERATED_CONTRACTS_DIR=/home/viral/viral-move/contracts/generated

# ── Health check: OpenClaw gateway readiness endpoint ──
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s \
  CMD node -e "fetch('http://localhost:18789/healthz').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

EXPOSE 18789

# ── Entrypoint: init Sui client, then start OpenClaw Gateway ──
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["openclaw", "gateway"]
