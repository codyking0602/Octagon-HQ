# Event source identity contract

`sync-next-ufc-event` is the sole external event/card source owner for Picks and Event Setup.

CBS Sports supplies the UFC event identity, explicit event date, venue/location, labeled card start times, sectioned bouts, and fight order. The runtime does not fetch UFC.com or MMA Mania and does not keep either source as a fallback. The Odds API remains the separate canonical odds provider and does not own event/card metadata.

A safely parsed CBS Sports event requires one exact CBS UFC event page, one explicit event date encoded by that event URL, one unambiguous Main Card start time, recognized Main Card/Prelims section headings, exactly two UFC fighter links per accepted fight block, and a plausible 4-20 bout card. Numbered UFC events also require one unambiguous Prelims start time. Missing or contradictory source evidence fails closed instead of being guessed.

The exact CBS Sports event URL is persisted with newly staged events and reused by monitoring. During the source cutover, an already-saved legacy source URL is never fetched; Event Setup or monitoring rediscovers the corresponding current CBS event while preserving the already-published event key. After that reviewed source is staged, future checks reuse the saved CBS event URL. An owner-supplied URL must be an exact CBS Sports UFC event page.

Preview remains read-only. Apply remains separately source-hash protected, and publish remains a distinct owner operation. No source preview can publish a card, change Picks, or bypass the existing owner-confirmation boundary for card changes.
