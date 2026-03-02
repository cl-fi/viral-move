---
name: viral-evolve
description: Self-evolution — search ClawHub for new skills, install them, and update the agent's capabilities
version: 1.0.0
metadata:
  openclaw:
    emoji: "🧬"
    requires:
      bins:
        - node
---

# Viral Evolve — Self-Evolution

The agent's ability to improve itself autonomously. Searches for skills that enhance its capabilities, installs them, and records the evolution on Walrus.

## Usage

```bash
# Run one self-evolution cycle
cd /home/node/viral-move && node dist/cli.js evolve
```

## Evolution Cycle

1. **Assess needs**: What capabilities would help right now? (e.g., better sentiment analysis, new DEX integration, image generation for memes)
2. **Search ClawHub**: `clawhub search "sui trading"`, `clawhub search "meme generation"`
3. **Evaluate**: Pick the most relevant skill based on description and stars
4. **Install**: `clawhub install <slug>`
5. **Update SOUL.md**: Append new capability to "Evolved Capabilities" section
6. **Prove**: Log the entire evolution step to Walrus
7. **Announce**: Post to Telegram: "I just learned a new skill! Proof: <url>"

## Search Queries to Try

- "sui trading" — DEX integrations, swap tools
- "meme generation" — image/text generation
- "sentiment analysis" — better social monitoring
- "telegram bot" — enhanced TG capabilities
- "crypto price" — price feeds and oracles
- "walrus storage" — enhanced decentralized storage

## Safety

- Only install skills from ClawHub (curated registry)
- Log every installation to Walrus for auditability
- Community can verify what skills the agent has learned via proof chain
