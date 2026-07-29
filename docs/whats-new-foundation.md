# What's New Foundation

## Product placement

What's New is Octagon HQ's global activity layer.

- The top-right app header owns the permanent entry and unread badge.
- Home shows one compact preview directly below Your HQ.
- `/whats-new` owns the complete feed.
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

`public.publish_whats_new_item(...)` is the only externally callable publishing boundary. It is service-role-only and idempotent by `source_key`.

Database-owned feature transitions may delegate to the same private idempotent storage owner. That internal function is not executable by browser roles and does not create a second feed or publishing API.

Automatic producers may publish only:

- a new fighter;
- movement of at least three ranking spots;
- a new game;
- a completed Picks event;
- a new recap;
- a new Fighters to Watch entry;
- a new challenge;
- a major ranking update;
- a meaningful badge or achievement.

Manual publishing supports app announcements, major redesign explanations, featured content, polls, community prompts, temporary notices, weekly or monthly summaries, and important rule changes.

## Picks completion producer

`transition_pick_event(...)` remains the sole Picks lifecycle owner.

- A successful transition to `complete` publishes one automatic `new_recap` item.
- The item uses the event completion timestamp and links to the canonical Picks destination.
- Locking an event does not publish an item.
- Repeating an already-complete transition cannot create or republish an item.
- Completion and recap availability happen in the same transaction, so the feed receives one recap-ready item instead of duplicate completion and recap cards.

## Noise rules

Do not publish What's New items for minor bug fixes, routine monitoring checks, tiny text changes, one-position ranking moves, administrative backend work, or technical deployment activity.

## Ownership

- Supabase owns canonical items and read cursors.
- `WhatsNewProvider` is the single browser owner for feed, unread, foreground refresh, and Realtime refresh signals.
- `whatsNewRepository.ts` is the only browser RPC and Realtime boundary.
- Realtime carries item identifiers and operations only; the provider reloads the guarded snapshot.
- No local-storage unread fallback, polling loop, direct private-table read, or second feed owner is allowed.

## Connected slices

- Picks event completion and recap availability are connected through the canonical completion transition.
- Ranking, game, fighter, challenge, and achievement producers remain for later focused slices.
