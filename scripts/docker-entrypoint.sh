#!/bin/bash
set -e

# ─── Configure Sui Client from Docker Secret ──────────────────────
SUI_CONFIG_DIR="$HOME/.sui/sui_config"
mkdir -p "$SUI_CONFIG_DIR"

# Read private key from Docker secret or env
PRIVATE_KEY=""
if [ -f /run/secrets/sui_private_key ]; then
  PRIVATE_KEY=$(cat /run/secrets/sui_private_key | tr -d '[:space:]')
elif [ -n "$SUI_PRIVATE_KEY" ]; then
  PRIVATE_KEY="$SUI_PRIVATE_KEY"
fi

if [ -z "$PRIVATE_KEY" ]; then
  echo "[ERROR] No private key found. Mount a Docker secret or set SUI_PRIVATE_KEY."
  exit 1
fi

NETWORK="${SUI_NETWORK:-testnet}"

if [ "$NETWORK" = "mainnet" ]; then
  RPC_URL="https://fullnode.mainnet.sui.io:443"
elif [ "$NETWORK" = "devnet" ]; then
  RPC_URL="https://fullnode.devnet.sui.io:443"
else
  RPC_URL="https://fullnode.testnet.sui.io:443"
fi

# Initialize keystore if not present
if [ ! -f "$SUI_CONFIG_DIR/sui.keystore" ]; then
  echo "[]" > "$SUI_CONFIG_DIR/sui.keystore"
fi

# Write client.yaml first (sui keytool needs it)
cat > "$SUI_CONFIG_DIR/client.yaml" <<YAML
---
keystore:
  File: $SUI_CONFIG_DIR/sui.keystore
envs:
  - alias: $NETWORK
    rpc: "$RPC_URL"
    ws: ~
    basic_auth: ~
active_env: $NETWORK
active_address: "0x0000000000000000000000000000000000000000000000000000000000000000"
YAML

# Import the key — capture address from output
echo "Importing Sui keypair..."
IMPORT_OUTPUT=$(sui keytool import "$PRIVATE_KEY" secp256k1 2>&1 || true)
echo "$IMPORT_OUTPUT"

# Extract address from import output (looks for 0x followed by 64 hex chars)
ADDRESS=$(echo "$IMPORT_OUTPUT" | grep -oE '0x[a-f0-9]{64}' | head -1 || echo "")

# Fallback: try to get address from keytool list
if [ -z "$ADDRESS" ]; then
  ADDRESS=$(sui keytool list 2>/dev/null | grep -oE '0x[a-f0-9]{64}' | head -1 || echo "")
fi

# Update client.yaml with actual address
if [ -n "$ADDRESS" ]; then
  sed -i "s|active_address: .*|active_address: \"$ADDRESS\"|" "$SUI_CONFIG_DIR/client.yaml"
  echo "Sui client configured: network=$NETWORK address=$ADDRESS"
else
  echo "[WARN] Could not detect address. Sui CLI publish may fail."
fi

echo "──────────────────────────────────────────"
echo "  Viral Move Agent Starting"
echo "  Network: $NETWORK"
echo "  Address: ${ADDRESS:-unknown}"
echo "──────────────────────────────────────────"

# ─── Launch the agent ──────────────────────────────────────────────
exec "$@"
