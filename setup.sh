#!/bin/bash
set -e

echo "═══════════════════════════════════════════════════════"
echo "  Viral Move — OpenClaw Setup"
echo "  The Anti-Rug AI Dev on Sui"
echo "═══════════════════════════════════════════════════════"
echo ""

VIRAL_DIR="$(cd "$(dirname "$0")" && pwd)"
OPENCLAW_DIR="$HOME/.openclaw"
WORKSPACE_DIR="$OPENCLAW_DIR/workspace"

# ─── Step 1: Check prerequisites ────────────────────────────
echo "[1/6] Checking prerequisites..."

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "  ✖ $1 not found. $2"
    exit 1
  fi
  echo "  ✔ $1 found"
}

check_cmd "node" "Install Node.js 22+: https://nodejs.org"
check_cmd "sui" "Install Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install"
check_cmd "openclaw" "Install OpenClaw: npm install -g openclaw@latest"

NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "  ⚠ Node.js $NODE_MAJOR detected, OpenClaw requires 22+."
  echo "    Use: PATH=\"/opt/homebrew/opt/node@22/bin:\$PATH\" to prefix Node 22."
fi

# ─── Step 2: Build the agent CLI ────────────────────────────
echo ""
echo "[2/6] Building viral-move CLI..."
cd "$VIRAL_DIR/packages/agent"
npm install
npx tsc
cd "$VIRAL_DIR"

# ─── Step 3: Link CLI globally ──────────────────────────────
echo ""
echo "[3/6] Linking viral-move CLI..."
cd "$VIRAL_DIR/packages/agent"
npm link 2>/dev/null || echo "  (npm link failed — using npx fallback)"
cd "$VIRAL_DIR"

# Test CLI
if command -v viral-move &>/dev/null; then
  echo "  ✔ viral-move CLI available"
else
  echo "  ℹ viral-move not in PATH. Use: node $VIRAL_DIR/packages/agent/dist/index.js"
fi

# ─── Step 4: Setup OpenClaw workspace ───────────────────────
echo ""
echo "[4/6] Setting up OpenClaw workspace..."
mkdir -p "$WORKSPACE_DIR/skills"

# Copy workspace files
cp "$VIRAL_DIR/workspace/SOUL.md" "$WORKSPACE_DIR/SOUL.md"
cp "$VIRAL_DIR/workspace/AGENTS.md" "$WORKSPACE_DIR/AGENTS.md"
cp "$VIRAL_DIR/workspace/HEARTBEAT.md" "$WORKSPACE_DIR/HEARTBEAT.md"

# Copy skills
cp -r "$VIRAL_DIR/workspace/skills/viral-launch" "$WORKSPACE_DIR/skills/"
cp -r "$VIRAL_DIR/workspace/skills/viral-monitor" "$WORKSPACE_DIR/skills/"
cp -r "$VIRAL_DIR/workspace/skills/viral-evolve" "$WORKSPACE_DIR/skills/"

echo "  ✔ Workspace files copied to $WORKSPACE_DIR"

# ─── Step 5: Setup OpenClaw config ──────────────────────────
echo ""
echo "[5/6] Configuring OpenClaw..."

if [ ! -f "$OPENCLAW_DIR/openclaw.json" ]; then
  cp "$VIRAL_DIR/config/openclaw.json" "$OPENCLAW_DIR/openclaw.json"
  echo "  ✔ openclaw.json created"
else
  echo "  ℹ openclaw.json already exists — not overwriting"
  echo "    Merge settings from $VIRAL_DIR/config/openclaw.json if needed"
fi

# ─── Step 6: Load .env into environment ─────────────────────
echo ""
echo "[6/6] Environment check..."

if [ -f "$VIRAL_DIR/.env" ]; then
  echo "  ✔ .env found"
  # Check critical vars
  source "$VIRAL_DIR/.env" 2>/dev/null || true
  [ -n "$SUI_PRIVATE_KEY" ] && echo "  ✔ SUI_PRIVATE_KEY set" || echo "  ⚠ SUI_PRIVATE_KEY missing"
  [ -n "$TELEGRAM_BOT_TOKEN" ] && echo "  ✔ TELEGRAM_BOT_TOKEN set" || echo "  ⚠ TELEGRAM_BOT_TOKEN missing"
  [ -n "$TELEGRAM_CHANNEL_ID" ] && echo "  ✔ TELEGRAM_CHANNEL_ID set" || echo "  ⚠ TELEGRAM_CHANNEL_ID missing"
else
  echo "  ⚠ No .env file — copy .env.example and fill in values"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Setup Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Start OpenClaw gateway:"
echo "    openclaw gateway"
echo ""
echo "  Open dashboard:"
echo "    openclaw dashboard"
echo ""
echo "  Or run viral-move CLI directly:"
echo "    viral-move launch    # Full token launch cycle"
echo "    viral-move status    # Check wallet & config"
echo "    viral-move monitor   # Social metrics"
echo "    viral-move evolve    # Self-evolution"
echo ""
echo "  Chat with the agent via Telegram or OpenClaw WebChat!"
echo ""
