# Rich preview architecture

Octagon HQ has one server-side rich-preview owner in `worker/`.

## Complete rollout

The Worker runs before the SPA for approved share routes and injects route-specific HTML metadata before social and messaging crawlers receive the page.

Implemented previews:

- Fighter profiles
- Direct ranking positions
- Fighter comparisons
- Picks recaps
- Challenge invitations
- Completed matchup results
- Major ranking updates

Every preview provides a specific title, description, canonical URL, and relevant visual. Fighter and comparison cards use real deployed fighter photos. Game cards use one restrained Octagon HQ art set. Picks recaps prefer the two main-event fighters. Major ranking updates prefer the largest movers.

## Ownership

- `rankingModel.ts` remains the only fighter rank, OVR, name, and presentation source.
- `playRegistry.ts` remains the only game-definition source.
- `vite.config.ts` emits one compact deployment catalog derived from those canonical models and real deployed fighter files.
- `public.get_rich_preview_data(...)` exposes only the small dynamic card projection required for an explicitly shared destination.
- `worker/previewModel.ts` is the only preview-data resolver.
- `worker/index.ts` is the only server metadata injection owner.
- Existing React route owners and Share buttons remain unchanged.
- Hashed assets continue to bypass the Worker.

## Dynamic preview privacy

The public preview projection never returns full Picks history, submitted picks, challenge setup, hidden sender results, PIN data, notification data, or administrative fields.

- An unfinished profile challenge exposes only its game title and public summary.
- A completed shared matchup exposes the two display names, public score labels, and final verdict.
- A Picks recap exposes the event name, first-place result, entrant count, and main-event fighters.
- A major ranking update exposes only the already-published update summary and the relevant rank movements.

Unknown, private, incomplete, malformed, or unavailable dynamic data falls back safely without creating another lookup path.

## Copy standard

Preview copy uses plain `GOAT` and `resume` everywhere. Build-time and Worker output normalize incoming presentation text before it reaches preview metadata.

## Visual fallback

When the relevant real fighter file exists, the preview uses it. Otherwise, the destination uses its approved game, Picks, or ranking-update art. The Octagon HQ app icon is the final fallback only, not the normal preview for an approved share destination.
