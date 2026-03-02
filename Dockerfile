# ─── Stage 1: Build + Download ────────────────────────────────────────────────
# node:22-bookworm is Debian-based: has git (for openclaw deps) and curl.
# We do ALL network downloads here so the runtime needs zero apt-get calls.
FROM node:22-bookworm AS builder

WORKDIR /build

# Build the TypeScript CLI
COPY packages/agent/package.json packages/agent/package-lock.json* ./
RUN npm install
COPY packages/agent/tsconfig.json ./
COPY packages/agent/src ./src
RUN npx tsc

# Install OpenClaw globally (git is available in bookworm)
RUN npm install -g openclaw

# Download Sui CLI for the target arch (runs inside the build container's arch)
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "arm64" ]; then SUI_ARCH="aarch64"; \
    else SUI_ARCH="x86_64"; fi && \
    SUI_VERSION="testnet-v1.66.2" && \
    curl -fsSL \
      "https://github.com/MystenLabs/sui/releases/download/${SUI_VERSION}/sui-${SUI_VERSION}-ubuntu-${SUI_ARCH}.tgz" \
      -o /tmp/sui.tgz && \
    tar xzf /tmp/sui.tgz -C /usr/local/bin && \
    rm /tmp/sui.tgz && \
    chmod +x /usr/local/bin/sui*

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Ubuntu 24.04 provides glibc 2.39 — required by Sui CLI v1.66.2.
# No apt-get needed: everything is copied from the builder stage.
FROM ubuntu:24.04 AS runtime

# ── Copy Node.js ──
COPY --from=builder /usr/local/bin/node          /usr/local/bin/node
COPY --from=builder /usr/local/bin/npx           /usr/local/bin/npx
COPY --from=builder /usr/local/lib/node_modules  /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# ── Symlink openclaw into PATH ──
# Must be a symlink (not a copy): openclaw.mjs uses relative imports
# like ./dist/entry.js that Node resolves via import.meta.url → real file path.
RUN ln -sf /usr/local/lib/node_modules/openclaw/openclaw.mjs /usr/local/bin/openclaw

# ── Copy Sui CLI ──
COPY --from=builder /usr/local/bin/sui           /usr/local/bin/sui

# ── Create non-root user ──
RUN useradd -m -s /bin/bash viral

WORKDIR /home/viral

# ── Directory layout ──
RUN mkdir -p \
    viral-move/dist \
    viral-move/contracts \
    .openclaw/workspace/skills

# ── Copy built CLI ──
COPY --from=builder /build/dist          ./viral-move/dist
COPY --from=builder /build/node_modules  ./viral-move/node_modules
COPY packages/agent/package.json         ./viral-move/

# ── Register viral-move as a global command ──
RUN printf '#!/bin/sh\nexec node /home/viral/viral-move/dist/index.js "$@"\n' \
    > /usr/local/bin/viral-move && chmod +x /usr/local/bin/viral-move

# ── Copy Move contract templates ──
COPY contracts/ ./viral-move/contracts/

# ── Copy OpenClaw workspace to ~/.openclaw/workspace/ ──
COPY workspace/ ./.openclaw/workspace/

# ── Copy OpenClaw config (openclaw.json + exec-approvals.json) ──
COPY config/ ./.openclaw/

# ── Copy entrypoint (initialises Sui client from secret/env var) ──
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

# ── Health check ──
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s \
  CMD node -e "fetch('http://localhost:18789/healthz').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

EXPOSE 18789

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["openclaw", "gateway"]
