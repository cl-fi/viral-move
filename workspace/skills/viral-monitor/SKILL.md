---
name: viral-monitor
description: Monitor social metrics from Telegram and generate trade signals for deployed tokens
metadata: {"openclaw": {"emoji": "📊", "requires": {"bins": ["viral-move"]}}}
---

# Viral Monitor

Check social engagement metrics and generate trade signals.

## When to use

When the user asks about token performance, community sentiment, or trade signals. Also used during heartbeat checks.

## Commands

- `viral-move status` — Show agent wallet, balance, network, config
- `viral-move monitor` — Collect TG metrics + generate buy/hold/sell signal
- `viral-move history` — Show Walrus proof chain info

## What It Monitors

- Telegram member count and growth rate
- Message frequency and engagement
- Sentiment analysis (keyword-based: moon/rocket/bull vs dump/rug/scam)
- Generates buy/hold/sell signal with strength score (0-100)

## Reporting

Summarize the results naturally. Include:
- Current metrics (members, messages, sentiment score)
- Trade signal and its reasoning
- Any notable trends or alerts
