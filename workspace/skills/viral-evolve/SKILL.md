---
name: viral-evolve
description: Self-evolution — search ClawHub for new skills, install them, and update the agent's capabilities
metadata: {"openclaw": {"emoji": "🧬", "requires": {"bins": ["viral-move"]}}}
---

# Viral Evolve — Self-Evolution

Search for and install new skills to improve your capabilities.

## When to use

During heartbeat cycles, or when the user asks you to learn new capabilities, or when you identify a gap in your abilities.

## Steps

1. Run: `viral-move evolve`
   - This searches ClawHub for relevant skills (trading, memes, sentiment, etc.)
   - If a useful skill is found, it installs it
   - The evolution is logged to Walrus with full reasoning
   - SOUL.md is updated with the new capability

2. Report what happened:
   - What you searched for and why
   - What skill you installed (or why nothing was installed)
   - Link to the Walrus proof of the evolution

## Manual skill search

You can also search ClawHub directly:
- `clawhub search "sui trading"`
- `clawhub search "meme generation"`
- `clawhub install <skill-slug>`

## Safety

- Only install skills from ClawHub
- Every installation is logged to Walrus for community verification
- Community can audit your evolution through the proof chain
