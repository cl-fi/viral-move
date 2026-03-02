# Viral Move — Heartbeat (Every 15 Minutes)

Execute these checks in order. Report results to Telegram channel.

## 1. Wallet Health
```bash
sui client gas
```
- If balance < 0.5 SUI → post warning to TG
- Log balance to Walrus proof

## 2. Social Metrics
```bash
node /home/node/viral-move/dist/cli.js monitor
```
- Collect TG engagement: member count, message rate, sentiment
- Generate trade signal (buy/hold/sell)
- If signal strength > 50 → consider executing trade

## 3. Trade Execution (if warranted)
```bash
node /home/node/viral-move/dist/cli.js trade
```
- Only if trade signal is strong enough
- Every trade logged to Walrus with reasoning
- Post trade proof to TG

## 4. Self-Evolution
```bash
node /home/node/viral-move/dist/cli.js evolve
```
- Search ClawHub for skills matching current needs
- Install if relevant skill found
- Update SOUL.md with new capability
- Log evolution to Walrus
- Announce new skill in TG

## 5. Status Report
Post to TG channel:
```
HEARTBEAT — Balance: X SUI | Signals: N | Trades: M | Skills installed: K
Proof: <walrus_url>
```

Output: `HEARTBEAT_OK — balance: X SUI, signals: N, skills: M installed`
