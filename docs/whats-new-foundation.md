# What's New Foundation

## Product placement

What's New is Octagon HQ's global activity layer.

- Home owns the permanent What's New preview directly below Your HQ.
- `/whats-new` continues to own the complete feed, including Latest, Archive, read state, and deep links.
- The top-right header slot now belongs to the personal notification bell instead of duplicating the Home feed entry.
- What's New is not part of Your HQ and is not a bottom-navigation destination.
- Feed items deep-link to the permanent fighter, ranking, Picks, game, challenge, or community destination whenever one exists.

## Lifecycle

- Items are active for 7 days.
- Days 8–15 appear in Archive.
- Items older than 15 days are removed from the visible feed.
- The canonical row may remain private for idempotency and audit evidence; the proper feature screen owns permanent history.
- Per-profile read position is stored in Supabase and only moves forward.
- Signed-out visitors can view the feed but receive no unread badge.

## Publishing owner

`public.publish_whats_new_item(...)` is the only general-purpose externally callable publishing boundary. It is service-role-only and idempotent by `source_key`.

Database-owned feature transitions may delegate to the same private idempotent storage owner. Feature-specific service-only synchronizers may call the public publisher after comparing their own canonical state. Neither pattern is executable by browser roles or creates a second feed owner.

Automatic producers may publish only:

- a new fighter;
- movement of at least three ranking spots;
- a new game;
- a completed Picks event;
- a new recap;
- a new Fighters to Watch entry;
- a new app-level challenge format;
- a major ranking update;
- a meaningful permanent badge or achievement.

Manual publishing supports app announcements, major redesign explanations, featured content, polls, community prompts, temporary notices, weekly or monthly summaries, and important rule changes.

## Picks completion producer

`transition_pick_event(...)` remains the sole Picks lifecycle owner.

- A successful transition to `complete` publishes one automatic `new_recap` item.
- The item uses the event completion timestamp and links to the canonical Picks destination.
- Locking an event does not publish an item.
- Repeating an already-complete transition cannot create or republish an item.
- Completion and recap availability happen in the same transaction, so the feed receives one recap-ready item instead of duplicate completion and recap cards.

## Rankings and fighter producers

`rankingModel.ts` remains the sole calculated source for ranked fighter identity, board, and position. `shanesWatchlist.ts` remains the sole source for Shane's Fighters to Watch. A trusted production workflow synchronizes those exact models only after the same `main` SHA has deployed successfully.

- The ranking snapshot still provides disposable comparison evidence for new ranked fighters and position movement.
- The Fighters to Watch historical rollout baseline is stored as durable seen-ID evidence, separate from the disposable current snapshot.
- Fatima Kline, Abdul Rakhman Yakhyaev, and Daniil Donchenko are the historical rollout baseline. Gable Steveson was added afterward and is intentionally backfilled as a real new entry.
- A delayed or skipped deployment cannot silently absorb a new watchlist ID merely because that fighter already appears in a later snapshot.
- Each genuinely new watchlist ID publishes once using a stable source key based on the watchlist ID, then joins the durable seen ledger.
- A fighter slug absent from the prior production ranking snapshot publishes one automatic `new_fighter` item linking to the canonical fighter profile.
- An existing fighter moving at least three positions on the same board publishes one automatic `ranking_movement` item.
- One- and two-position moves are intentionally ignored.
- When five or more fighters move at least three spots in one deployment, one `major_ranking_update` summary replaces a pile of individual cards.
- Unchanged deployments are idempotent and publish nothing.
- The synchronization script refuses the legacy contract and retries until the repaired database function is deployed, preventing frontend/backend deployment races from swallowing an update.
- PR-head deployments never synchronize production comparison state or publish production updates.
- The private snapshots are comparison evidence only. They never become a ranking or watchlist source and are replaced from the canonical models after every successful synchronization.

## Games, challenges, and achievements producers

`playRegistry.ts` remains the sole source for permanent Play games. `engagementUpdateCatalog.ts` is the explicit source for new permanent app-level challenge formats and meaningful badges or achievements when those product features exist.

- The first production synchronization quietly creates all three comparison baselines. It does not announce the six existing games or create placeholder challenge and achievement cards.
- A game ID absent from the prior production game snapshot publishes one automatic `new_game` item linking directly to the game.
- A challenge ID absent from the prior app-level challenge catalog snapshot publishes one automatic `new_challenge` item.
- An achievement ID absent from the prior meaningful achievement catalog snapshot publishes one automatic `achievement` item.
- Personal profile-to-profile challenge deliveries never enter the global feed. They remain visible only through the existing private Challenge Center owner.
- Copy edits to existing entries do not create feed noise. Only a genuinely new stable ID publishes an item.
- Empty challenge and achievement catalogs are valid until those permanent features exist; placeholder announcements are forbidden.
- The same exact-main post-frontend workflow synchronizes rankings, fighters, games, challenge formats, and achievements after the live deployment marker matches the source SHA.

## Noise rules

Do not publish What's New items for minor bug fixes, routine monitoring checks, tiny text changes, one-position ranking moves, administrative backend work, technical deployment activity, personal challenge deliveries, or placeholder future features.

## Ownership

- Supabase owns canonical items and read cursors.
- `WhatsNewProvider` is the single browser owner for feed, unread, foreground refresh, and Realtime refresh signals.
- `whatsNewRepository.ts` is the only browser RPC and Realtime boundary.
- Realtime carries item identifiers and operations only; the provider reloads the guarded snapshot.
- No local-storage unread fallback, polling loop, direct private-table read, or second feed owner is allowed.

## Connected slices

- Picks event completion and recap availability are connected through the canonical completion transition.
- New ranked fighters, meaningful ranking movement, major ranking shakeups, and new Fighters to Watch entries are connected through the exact deployed canonical models.
- New games, permanent app-level challenge formats, and meaningful badges or achievements are connected through the exact deployed canonical models.
- All approved automatic producer families are connected.
