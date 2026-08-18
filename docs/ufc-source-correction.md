# Picks source correction

This corrective change restores the locked source ownership for Picks automation:

- UFC.com is the sole event and fight-card source.
- `sync-next-ufc-event` remains the sole source owner.
- CBS Sports and MMA Mania are not runtime fallbacks or alternate providers.
- Existing third-party source URLs are treated as legacy persisted state and are ignored during official UFC rediscovery instead of blocking Event Setup.
- The Odds API remains odds-only.

The corrective PR must prove the exact deployed backend can return the current UFC card from a UFC.com event URL before merge.
