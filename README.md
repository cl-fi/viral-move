# Viral Move — The Anti-Rug AI Dev on Sui

> Human devs rug pull, lie about tokenomics, and disappear with funds.
> AI agents don't. Every thought, every decision, every action — permanently on Walrus.

**Viral Move** is an autonomous AI agent built on the **OpenClaw** framework. It replaces the untrustworthy human meme coin developer with a transparent, self-evolving AI that generates meme concepts, deploys Move tokens on Sui, spreads via Telegram, trades on social signals, and evolves by discovering new skills — all while logging every reasoning step to Walrus for public verification.

## Why This Matters

Sui's meme ecosystem has a trust crisis:
- Human devs **rug pull** — AI agents can't (every action is on Walrus)
- Human devs **lie about tokenomics** — AI agents publish reasoning before acting
- Human devs **disappear** — AI agents run 24/7 with verifiable on-chain behavior
- Human devs **stagnate** — AI agents self-evolve by installing new skills from ClawHub

Viral Move proves that an **AI dev is a better dev** — not because it's smarter, but because it's **provably honest**.

## Architecture

Viral Move runs entirely on the **OpenClaw Gateway** — a production-grade agent runtime that provides LLM integration, Telegram channel management, a web dashboard, heartbeat automation, and skill orchestration out of the box.

```
┌─── OpenClaw Gateway (port 18789) ─────────────────────────────┐
│                                                                │
│  Channels                                                      │
│  ├── Telegram ← community talks to the agent directly         │
│  └── WebChat  ← dashboard at http://localhost:18789           │
│                                                                │
│  Agent: "viral-move" (SOUL.md personality + AGENTS.md rules)  │
│  ├── LLM: Claude Sonnet 4.6 (fallback: GPT-4.1-mini)        │
│  │                                                             │
│  ├── Skills (loaded from workspace/skills/)                   │
│  │   ├── viral-launch  → trigger token launch cycle           │
│  │   ├── viral-monitor → check metrics & generate signals     │
│  │   └── viral-evolve  → search ClawHub & install new skills  │
│  │                                                             │
│  ├── Exec Tools (CLI commands the agent invokes)              │
│  │   ├── viral-move launch   (full viral cycle)               │
│  │   ├── viral-move status   (wallet + token state)           │
│  │   ├── viral-move monitor  (social metrics)                 │
│  │   ├── viral-move evolve   (self-evolution)                 │
│  │   └── clawhub install ... (skill installation)             │
│  │                                                             │
│  ├── HEARTBEAT (every 15 min, defined in HEARTBEAT.md)        │
│  │   → check wallet balance                                   │
│  │   → collect TG metrics → generate trade signals            │
│  │   → search ClawHub → auto-install useful skills            │
│  │   → post status to TG with Walrus proof links              │
│  │                                                             │
│  └── Walrus Proof Chain: EVERY action → immutable blob        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### How OpenClaw Powers Viral Move

| Capability | Provided By |
|-----------|------------|
| Conversational AI | OpenClaw LLM integration (Claude / GPT) |
| Telegram bot (send + receive) | OpenClaw Telegram channel adapter |
| Web dashboard + chat history | OpenClaw WebChat UI at gateway port |
| Autonomous heartbeat loop | OpenClaw heartbeat scheduler |
| Skill discovery + loading | OpenClaw skill system (SKILL.md files) |
| Tool execution with approvals | OpenClaw exec tool with allowlist security |
| Agent personality + rules | OpenClaw workspace (SOUL.md, AGENTS.md) |

Our custom code provides the **Sui-specific tools**: token deployment, Walrus proof chain, sentiment analysis, trading engine, and self-evolution logic — all exposed as CLI commands that OpenClaw skills invoke.

### The Viral Cycle

```
┌─────────────┐   ┌───────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  1. CONCEPT  │──>│  2. DEPLOY    │──>│  3. SPREAD   │──>│  4. MONITOR  │──>│  5. EVOLVE   │
│             │   │               │   │              │   │   + TRADE    │   │              │
│ AI generates│   │ Move template │   │ TG announce  │   │ Sentiment -> │   │ Search       │
│ meme concept│   │ -> build ->   │   │ with proof   │   │ trade signal │   │ ClawHub ->   │
│ + narrative │   │ publish -> mint   │ links        │   │ -> execute   │   │ install skill│
│             │   │               │   │              │   │              │   │ -> update SOUL
│ proof->Walrus   │ proof->Walrus │   │ proof->Walrus│   │ proof->Walrus│   │ proof->Walrus│
└─────────────┘   └───────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

Every step logs its **reasoning** (why the agent decided to act) and **result** (what happened) to Walrus. Community members verify any decision through proof links shared in Telegram.

## Features

### Token Creation Pipeline
- AI generates unique meme coin concepts with names, tickers, descriptions, and narratives
- Populates Move template using Sui's One-Time Witness (OTW) pattern
- Builds with `sui move build`, publishes to chain, mints initial supply
- Metadata is frozen on-chain — immutable tokenomics, anti-rug by design

### Walrus Proof Chain (The Anti-Rug Superpower)
- Every thought and action stored as an immutable blob on Walrus
- Proof structure: `{ type, reasoning, action, result, timestamp, txDigest }`
- Public aggregator URLs shared in every TG message
- Anyone can independently verify the agent's decision-making

### Conversational Telegram Bot
- Full two-way conversations powered by OpenClaw's LLM integration
- Users can ask the agent questions, request launches, check status
- Launch/trade/evolution announcements with Walrus proof links
- Heartbeat status updates every 15 minutes

### Social Sentiment Trading
- Keyword-based sentiment analysis (positive/negative signal detection)
- Engagement metrics: member count, message frequency, emoji density
- Trade signal generation with confidence scoring
- Every trade decision (including "no trade") logged to Walrus

### Self-Evolution (The Differentiator)
- Agent autonomously searches ClawHub for relevant skills
- Evaluates and installs useful capabilities
- Updates its own SOUL.md with new abilities
- Logs evolution steps to Walrus — community watches the agent grow
- Posts skill installation announcements to Telegram

### Web Dashboard
- Built-in OpenClaw WebChat UI at `http://localhost:18789`
- View full conversation history with the agent
- Monitor heartbeat cycles and skill invocations
- Direct chat interface for testing and management

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Agent Framework | **OpenClaw** (Gateway + Skills + Heartbeat + WebChat) |
| LLM | Claude Sonnet 4.6 via OpenClaw (fallback: GPT-4.1-mini) |
| Blockchain | Sui (Move) |
| Smart Contracts | Move OTW token template |
| Proof Storage | Walrus decentralized storage |
| Social Channel | Telegram via OpenClaw channel adapter |
| Runtime | Node.js 22+ |
| Language | TypeScript (ESM) |
| CLI | Commander.js + Chalk |

## Project Structure

```
viral-move/
├── workspace/                   # OpenClaw agent workspace
│   ├── SOUL.md                  # Agent identity, personality, values
│   ├── AGENTS.md                # Operating contract + workflow rules
│   ├── HEARTBEAT.md             # Autonomous 15-min cycle checklist
│   └── skills/                  # OpenClaw skill definitions
│       ├── viral-launch/SKILL.md    # Trigger token launch
│       ├── viral-monitor/SKILL.md   # Check metrics + trade
│       └── viral-evolve/SKILL.md    # Self-evolution via ClawHub
├── config/
│   ├── openclaw.json            # Gateway, channels, exec, model config
│   └── exec-approvals.json      # Tool execution security rules
├── packages/agent/              # CLI tools (invoked by OpenClaw skills)
│   └── src/
│       ├── index.ts             # CLI entry (launch, status, monitor, evolve)
│       ├── config.ts            # Environment configuration
│       ├── types.ts             # TypeScript interfaces
│       ├── sui-client.ts        # Sui client + keypair management
│       ├── walrus-proof.ts      # Walrus proof chain storage
│       ├── concept-engine.ts    # Meme concept generator
│       ├── token-factory.ts     # Move template -> build -> publish -> mint
│       ├── telegram-bot.ts      # TG Bot API (supplementary posting)
│       ├── sentiment-monitor.ts # Social engagement + trade signals
│       ├── trading-engine.ts    # Signal evaluation + on-chain execution
│       └── self-evolve.ts       # ClawHub skill discovery + installation
├── contracts/
│   └── token-template/          # Parameterized Move token template
│       ├── Move.toml.template
│       └── sources/token.move.template
├── setup.sh                     # One-command setup script
├── Dockerfile                   # Docker deployment (optional)
├── docker-compose.yml
└── .env.example                 # Configuration template
```

## Quick Start

### Prerequisites

- **Node.js 22+** (`node --version`)
- **Sui CLI** installed (`sui --version`)
- **Sui wallet** with testnet SUI (`sui client faucet`)
- **OpenClaw** installed globally (`npm install -g openclaw`)
- **Telegram Bot** token from [@BotFather](https://t.me/BotFather)
- **Telegram Channel/Group** with bot added as admin
- **LLM API Key** — at least one of: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`

### Setup

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your keys:
#   SUI_PRIVATE_KEY        — from: sui keytool export --key-identity <address> --json
#   TELEGRAM_BOT_TOKEN     — from @BotFather
#   TELEGRAM_CHANNEL_ID    — your channel/group ID
#   ANTHROPIC_API_KEY      — for Claude (primary LLM)

# 2. Run setup (builds CLI, installs workspace, configures OpenClaw)
bash setup.sh

# 3. Verify skills are loaded
openclaw skills list
# Should show:
#   viral-launch   ✓ ready
#   viral-monitor  ✓ ready
#   viral-evolve   ✓ ready
```

### Run

```bash
# Start the OpenClaw Gateway (this is the main runtime)
openclaw gateway

# The gateway provides:
#   - Telegram bot: responds to messages in your channel/group
#   - Web dashboard: http://localhost:18789
#   - Heartbeat: autonomous checks every 15 minutes
#   - Skills: agent can invoke viral-launch, viral-monitor, viral-evolve
```

Once the gateway is running, you can:
- **Chat via Telegram**: Send messages to your bot — the agent responds conversationally
- **Chat via Web**: Open `http://localhost:18789` for the dashboard
- **Trigger a launch**: Tell the agent "launch a new meme token" in TG or web chat
- **Check status**: Ask "what's your status?" or "check wallet balance"
- **Self-evolve**: Ask "search for new skills" or wait for the heartbeat cycle

### CLI Tools (for direct testing)

The CLI tools can also be run directly outside of OpenClaw:

```bash
# One full viral cycle
viral-move launch

# Check agent status
viral-move status

# Run social monitor
viral-move monitor

# Self-evolution cycle
viral-move evolve

# Autonomous loop (multiple cycles)
viral-move loop -n 5
```

## Trust Model

```
Traditional Meme Dev          Viral Move AI Dev
─────────────────────         ────────────────────
Closed reasoning              Every thought -> Walrus
Mutable tokenomics            Frozen metadata on-chain
Can rug pull                  Can't — all actions public
Disappears after launch       Runs 24/7 via OpenClaw
Static capabilities           Self-evolving via ClawHub
"Trust me bro"                "Verify me on Walrus"
```

## Roadmap

- [ ] Real DEX pool creation + swap (Cetus/Turbos integration)
- [ ] Multi-platform spreading (Twitter/Discord via OpenClaw channels)
- [ ] Advanced LLM-powered sentiment analysis
- [ ] Seal-encrypted proofs (reveal reasoning after token maturity)
- [ ] On-chain agent reputation score
- [ ] Agent-to-agent token trading via Moltbook
- [ ] Community governance: token holders vote on agent parameters

## Hackathon

**Sui x OpenClaw Agent Hackathon** | Track 2: Local God Mode

This project bridges both tracks:
- **Track 1 (Safety)**: Walrus audit trail solves the trust crisis in meme tokens
- **Track 2 (God Mode)**: Full autonomous loop with self-evolution capabilities

Built on OpenClaw: Gateway runtime, Telegram channel, WebChat dashboard, heartbeat scheduler, skill system, and exec tool orchestration.

## License

MIT
