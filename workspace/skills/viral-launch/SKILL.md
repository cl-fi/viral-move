---
name: viral-launch
description: Launch a new meme token on Sui — concept generation, Move deployment, Telegram announcement, all with Walrus proofs
metadata: {"openclaw": {"emoji": "🚀", "requires": {"bins": ["viral-move", "sui"]}}}
---

# Viral Launch

Run a full token launch cycle using the `viral-move` CLI.

## When to use

When the user asks to "launch a token", "create a coin", "deploy a meme token", or says "LFG".

## Steps

1. First check balance: `viral-move status`
   - Need at least 0.3 SUI for gas
   - If low, tell user to fund the wallet

2. Run the launch: `viral-move launch`
   - This generates a meme concept, builds + publishes Move package, stores Walrus proofs, and posts to TG
   - The output includes package ID, coin type, explorer URL, and proof links

3. Share results with the user:
   - Token name and ticker
   - Sui Explorer link
   - Walrus proof URLs (one per step)
   - Explain what each proof contains (concept reasoning, deploy details, etc.)

## Safety

- Gas budget capped at 0.5 SUI per transaction
- Every step logged to Walrus BEFORE execution
- Token metadata is frozen on-chain (immutable tokenomics)
