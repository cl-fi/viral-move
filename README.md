# Viral Move — The Anti-Rug AI Dev on Sui

> Human devs rug pull, lie about tokenomics, and disappear with funds.
> AI agents don't. Every thought, every decision, every action — permanently on Walrus.

**Viral Move** is an autonomous AI agent that replaces the untrustworthy human meme coin developer with a transparent, self-evolving AI. It generates meme concepts, deploys Move tokens on Sui, spreads via Telegram, trades on social signals, and evolves by discovering new skills — all while logging every reasoning step to Walrus decentralized storage for public verification.

## Why This Matters

Sui's meme ecosystem has a trust crisis:
- Human devs **rug pull** — AI agents can't (every action is on Walrus)
- Human devs **lie about tokenomics** — AI agents publish reasoning before acting
- Human devs **disappear** — AI agents run 24/7 with verifiable on-chain behavior
- Human devs **stagnate** — AI agents self-evolve by installing new skills from ClawHub

Viral Move proves that an **AI dev is a better dev** — not because it's smarter, but because it's **provably honest**.

## Architecture

```
┌─── Docker Container ──────────────────────────────────────────────┐
│                                                                    │
│  OpenClaw Gateway (port 18789)                                    │
│  ├── Telegram Channel ← community interacts with agent            │
│  │                                                                 │
│  ├── Agent: Viral Move (SOUL.md + AGENTS.md)                     │
│  │   ├── Skill: viral-launch   → full token launch cycle          │
│  │   ├── Skill: viral-monitor  → metrics + trade signals          │
│  │   ├── Skill: viral-evolve   → search + install new skills      │
│  │   │                                                             │
│  │   └── Exec Tools:                                              │
│  │       ├── node dist/cli.js launch   (viral cycle)              │
│  │       ├── node dist/cli.js status   (agent state)              │
│  │       ├── node dist/cli.js monitor  (social metrics)           │
│  │       ├── node dist/cli.js evolve   (self-evolution)           │
│  │       └── clawhub install <slug>    (skill installation)       │
│  │                                                                 │
│  ├── HEARTBEAT (every 15 min)                                     │
│  │   → wallet balance check                                       │
│  │   → collect TG metrics → generate trade signals                │
│  │   → search ClawHub → auto-install useful skills                │
│  │   → post status to TG with Walrus proof links                  │
│  │                                                                 │
│  └── Walrus Proof Chain: EVERY action → blob → link in TG        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### The Viral Cycle

```
┌─────────────┐   ┌───────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  1. CONCEPT  │──▶│  2. DEPLOY    │──▶│  3. SPREAD   │──▶│  4. MONITOR  │──▶│  5. EVOLVE   │
│             │   │               │   │              │   │   + TRADE    │   │              │
│ AI generates│   │ Move template │   │ TG announce  │   │ Sentiment →  │   │ Search       │
│ meme concept│   │ → build →     │   │ with proof   │   │ trade signal │   │ ClawHub →    │
│ + narrative │   │ publish → mint│   │ links 🔗     │   │ → execute    │   │ install skill│
│             │   │               │   │              │   │              │   │ → update SOUL│
│ 📝→Walrus  │   │ 📝→Walrus    │   │ 📝→Walrus   │   │ 📝→Walrus   │   │ 📝→Walrus   │
└─────────────┘   └───────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

Every step logs its **reasoning** (why the agent decided to act) and **result** (what happened) to Walrus. Community members verify any decision through proof links shared in every Telegram post.

## Features

### Token Creation Pipeline
- AI generates unique meme coin concepts with names, tickers, descriptions, and TG narratives
- Populates Move template using Sui's One-Time Witness (OTW) pattern
- Builds with `sui move build`, publishes to chain, mints initial supply
- Metadata is frozen on-chain — immutable tokenomics, anti-rug by design

### Walrus Proof Chain (The Anti-Rug Superpower)
- Every thought and action stored as an immutable blob on Walrus
- Proof structure: `{ type, reasoning, action, result, timestamp, txDigest }`
- Public aggregator URLs shared in every TG message
- Anyone can independently verify the agent's decision-making

### Telegram Integration
- Launch announcements with Sui Explorer + Walrus proof links
- Trade announcements with reasoning and on-chain TX links
- Evolution announcements when agent learns new skills
- Heartbeat status updates every 15 minutes

### Social Sentiment Trading
- Keyword-based sentiment analysis (positive: moon/rocket/bull; negative: dump/rug/scam)
- Engagement metrics: member count, message frequency, emoji density
- Trade signal generation: buy/hold/sell with confidence strength
- Every trade decision (including "no trade") logged to Walrus

### Self-Evolution (The Differentiator)
- Agent autonomously searches ClawHub for relevant skills
- Evaluates and installs useful capabilities
- Updates its own SOUL.md with new abilities
- Logs evolution steps to Walrus — community watches the agent grow
- Posts skill installation announcements to Telegram

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Blockchain | Sui (Move) |
| Agent Framework | OpenClaw (Gateway + Skills + Heartbeat) |
| Smart Contracts | Move OTW token template |
| Proof Storage | Walrus decentralized storage |
| Social Channel | Telegram Bot API |
| Runtime | Docker + Node.js 22 |
| Language | TypeScript (ESM) |
| CLI | Commander.js + Chalk |

## Project Structure

```
viral-move/
├── contracts/
│   └── token-template/          # Parameterized Move token template
│       ├── Move.toml.template
│       └── sources/token.move.template
├── packages/agent/              # Core daemon
│   └── src/
│       ├── index.ts             # CLI entry (launch, loop, status, monitor, evolve)
│       ├── config.ts            # Environment configuration
│       ├── types.ts             # TypeScript interfaces
│       ├── sui-client.ts        # Sui client + multi-scheme keypair
│       ├── walrus-proof.ts      # Walrus proof chain storage
│       ├── concept-engine.ts    # AI meme concept generator
│       ├── token-factory.ts     # Move template → build → publish → mint
│       ├── telegram-bot.ts      # TG Bot API integration
│       ├── sentiment-monitor.ts # Social engagement + trade signals
│       ├── trading-engine.ts    # Signal evaluation + on-chain execution
│       └── self-evolve.ts       # ClawHub skill discovery + installation
├── workspace/                   # OpenClaw agent workspace
│   ├── SOUL.md                  # Agent identity + evolved capabilities
│   ├── AGENTS.md                # Role definition
│   ├── HEARTBEAT.md             # Autonomous 15-min cycle
│   └── skills/                  # OpenClaw skill definitions
│       ├── viral-launch/SKILL.md
│       ├── viral-monitor/SKILL.md
│       └── viral-evolve/SKILL.md
├── config/
│   ├── openclaw.json            # Gateway + channel + exec config
│   └── exec-approvals.json      # Read auto-approve, write gated
├── Dockerfile                   # Multi-stage: build + runtime + sui CLI
├── docker-compose.yml           # Production deployment
└── .env.example                 # Configuration template
```

## Quick Start

### Prerequisites

- **Node.js 22+** and npm
- **Sui CLI** installed (`sui --version`)
- **Sui wallet** with testnet SUI (`sui client faucet`)
- **Telegram Bot** token from [@BotFather](https://t.me/BotFather)
- **Telegram Channel** with bot added as admin

### Setup

```bash
# Clone and install
cd viral-move
npm install --prefix packages/agent

# Configure environment
cp .env.example .env
# Edit .env with your:
#   SUI_PRIVATE_KEY (export via: sui keytool export --key-identity <address> --json)
#   TELEGRAM_BOT_TOKEN
#   TELEGRAM_CHANNEL_ID

# Build
npm run build --prefix packages/agent
```

### Run

```bash
# One full viral cycle
node packages/agent/dist/index.js launch

# Check agent status
node packages/agent/dist/index.js status

# Run social monitor
node packages/agent/dist/index.js monitor

# Self-evolution cycle
node packages/agent/dist/index.js evolve

# Autonomous loop (multiple cycles)
node packages/agent/dist/index.js loop -n 5
```

### Docker Deployment

```bash
# Create secrets
mkdir -p secrets
echo "your_sui_private_key" > secrets/sui_private_key.txt

# Build and run
docker compose up --build
```

## Demo

### Testnet Deployment

Successfully deployed tokens on Sui testnet with full proof chain:

```
═══════════════════════════════════════════════════════════════
  VIRAL CYCLE #1
═══════════════════════════════════════════════════════════════

ℹ Agent wallet: 0x...
ℹ Balance: 1.2345 SUI

[Step 1] Generating meme concept...
✔ Concept: Shadow Cat ($SHCAT)
ℹ Description: The shadow cat walks between blockchains...
  🔗 Proof: https://aggregator.walrus-testnet.walrus.space/v1/blobs/...

[Step 2] Deploying token on Sui...
✔ Token deployed!
ℹ Package ID: 0x608be339...
ℹ Coin Type: 0x608be339...::shcat::SHCAT
  🔗 Proof: https://aggregator.walrus-testnet.walrus.space/v1/blobs/...

[Step 3] Spreading on Telegram...
✔ Launch announced on Telegram with proof links!
  🔗 Proof: https://aggregator.walrus-testnet.walrus.space/v1/blobs/...

[Step 4] Monitoring social engagement...
ℹ Signal: HOLD (strength: 30) — Low engagement, monitoring...

[Step 5] Self-evolution — searching for new skills...
✔ Evolved! Installed: sui-dex-analytics
  🔗 Proof: https://aggregator.walrus-testnet.walrus.space/v1/blobs/...

═══════════════════════════════════════════════════════════════
  CYCLE #1 COMPLETE
═══════════════════════════════════════════════════════════════
```

## Trust Model

```
Traditional Meme Dev          Viral Move AI Dev
─────────────────────         ────────────────────
Closed reasoning              Every thought → Walrus
Mutable tokenomics            Frozen metadata on-chain
Can rug pull                  Can't — all actions public
Disappears after launch       Runs 24/7 autonomously
Static capabilities           Self-evolving via ClawHub
"Trust me bro"                "Verify me on Walrus"
```

## Roadmap

- [ ] Real DEX pool creation + swap (Cetus/Turbos integration)
- [ ] Multi-platform spreading (Twitter/Discord bots)
- [ ] Advanced LLM-powered concept generation and sentiment analysis
- [ ] Seal-encrypted proofs (reveal reasoning after token maturity)
- [ ] On-chain agent reputation score
- [ ] Agent-to-agent token trading via Moltbook
- [ ] Community governance: token holders vote on agent parameters
- [ ] Dashboard UI for proof chain visualization

## Hackathon

**Sui x OpenClaw Agent Hackathon** | Track 2: Local God Mode

This project bridges both tracks:
- **Track 1 (Safety)**: Walrus audit trail solves the trust crisis in meme tokens
- **Track 2 (God Mode)**: Full autonomous loop with self-evolution capabilities

## License

MIT
