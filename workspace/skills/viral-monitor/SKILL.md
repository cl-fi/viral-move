---
name: viral-monitor
description: Monitor social metrics from Telegram and generate trade signals for deployed tokens
version: 1.0.0
metadata:
  openclaw:
    emoji: "📊"
    requires:
      bins:
        - node
---

# Viral Monitor

Check social engagement metrics and generate trade signals.

## Usage

```bash
# Show agent status (balance, deployed tokens, recent signals)
cd /home/node/viral-move && node dist/cli.js status

# Run one monitoring round (collect metrics + generate signal)
cd /home/node/viral-move && node dist/cli.js monitor

# Execute a trade based on current signal
cd /home/node/viral-move && node dist/cli.js trade

# View Walrus proof history
cd /home/node/viral-move && node dist/cli.js history
```

## What It Monitors

- Telegram member count and growth rate
- Message frequency and engagement
- Sentiment analysis (keyword-based: moon/rocket vs dump/rug)
- Generates buy/hold/sell signal with strength score (0-100)
