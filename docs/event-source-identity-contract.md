# Event source identity contract

`sync-next-ufc-event` is the sole external event/card source owner for Picks and Event Setup.

UFC.com supplies the UFC event identity, event date, venue/location, card start times, sectioned bouts, and fight order. The runtime does not fetch CBS Sports or MMA Mania and does not keep either source as a fallback. The Odds API remains the separate canonical odds provider and does not own event/card metadata.

A safely parsed UFC event requires one exact UFC.com event page, a stable official event identity, one event date, a Main Card start time, recognized Main Card/Prelims sections, exactly two fighters per accepted fight row, and a plausible 4-20 bout card. Numbered UFC events also require a Prelims start time before the Main Card. Missing or contradictory official source evidence fails closed instead of being guessed.

The exact UFC.com event URL is persisted with newly staged events and reused by monitoring. A saved pre-cutover CBS Sports or MMA Mania URL is legacy state only: it is never fetched and never blocks Event Setup. The canonical owner rediscovers the current event from UFC.com, preserves a canonical `event/<slug>` identity when available, and replaces the source URL only through the existing reviewed staging/apply flow. An owner-supplied URL must be an exact UFC.com event page.

Preview remains read-only. Apply remains separately source-hash protected, and publish remains a distinct owner operation. No source preview can publish a card, change Picks, or bypass the existing owner-confirmation boundary for card changes.
