---
name: viral-launch
description: Launch a new meme token on Sui with full viral cycle — concept generation, Move deployment, Telegram spreading, all with Walrus proofs
version: 1.0.0
metadata:
  openclaw:
    emoji: "🚀"
    requires:
      bins:
        - node
        - sui
---

# Viral Launch

Triggers a complete viral token launch cycle. The agent:

1. Generates a meme coin concept (name, ticker, narrative)
2. Compiles and publishes a Move token package on Sui
3. Mints initial token supply
4. Posts launch announcement to Telegram with Walrus proof links
5. Monitors social engagement
6. Generates trade signals based on community response

## Usage

```bash
# Launch one full viral cycle
cd /home/node/viral-move && node dist/cli.js launch
```

## Safety

- Check wallet balance before launching (need at least 0.5 SUI for gas)
- Every step is logged to Walrus before execution
- All Telegram posts include proof links for community verification
- Gas budget capped at 100_000_000 MIST (0.1 SUI) per publish
