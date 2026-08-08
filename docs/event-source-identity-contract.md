# Event source identity contract

`sync-next-ufc-event` is the sole external event/card source owner for Picks and Event Setup.

MMA Mania supplies the UFC event identity, explicit event date, venue/location, labeled card start times, sectioned bouts, and fight order. The runtime does not fetch UFC.com and does not keep UFC.com as a fallback source. The Odds API remains the separate canonical odds provider and does not own event/card metadata.

A safely parsed MMA Mania event requires a specific MMA Mania fight-card article with a labeled UFC event identity, one explicit event date, one unambiguous Main Card start time, recognized card sections, and a plausible 4-20 bout card. Numbered UFC events also require an unambiguous Prelims start time. Missing or contradictory source evidence fails closed instead of being guessed.

The exact MMA Mania article URL is persisted with the reviewed event. Monitoring reuses that saved article and preserves the already-published event identity while comparing the current source against the live card. Event Setup may automatically discover a current or upcoming MMA Mania fight-card article only when no saved or owner-supplied article URL exists.

Preview remains read-only. Apply remains separately source-hash protected, and publish remains a distinct owner operation. No source preview can publish a card, change Picks, or bypass the existing owner-confirmation boundary for card changes.
