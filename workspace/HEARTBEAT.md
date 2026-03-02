# Heartbeat Checklist

Run these checks each cycle:

1. Check wallet balance with `viral-move status`
   - If balance < 0.3 SUI, alert: "Low balance — need gas for token deployment"
2. Run `viral-move monitor` to collect social engagement metrics
   - If strong buy signal detected, note it for next launch decision
3. Run `viral-move evolve` to search ClawHub for new useful skills
   - If a skill was installed, announce it
4. If nothing requires attention, reply HEARTBEAT_OK
