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

Every approved destination points to one rendered 1200×630 PNG card. The card itself contains the relevant fighter, matchup, score, verdict, challenge, recap result, or ranking movement. Messaging clients do not have to combine multiple image tags or infer the important content from plain metadata.

## Ownership

- `rankingModel.ts` remains the only fighter rank, OVR, name, and presentation source.
- `playRegistry.ts` remains the only game-definition source.
- `vite.config.ts` emits one compact deployment catalog derived from those canonical models and real deployed fighter files.
- `vite.worker.config.ts` embeds that validated catalog into the exact Worker artifact so runtime metadata does not depend on fetching a second asset.
- `public.get_rich_preview_data(...)` exposes only the small dynamic card projection required for an explicitly shared destination.
- `worker/previewModel.ts` remains the only preview-data resolver.
- `worker/previewCard.ts` is the only visual-card composer.
- `worker/index.ts` is the only server metadata, PNG rendering, and card-cache owner.
- Existing React route owners and Share buttons remain unchanged.
- Hashed application assets continue to bypass the Worker.

## Rendered card delivery

The metadata page publishes exactly one `og:image` and one matching Twitter image. That URL is content-fingerprinted and served from `/share-preview/...png`.

- Cloudflare Browser Run renders the controlled card HTML at 1200×630.
- The Worker caches the resulting PNG at the edge under its immutable fingerprinted URL.
- Fighter and comparison cards use the real deployed fighter files.
- Picks recaps and ranking updates can place two relevant fighters into the same card.
- Game-result cards place both score labels and the verdict directly on the image.
- Recognized share destinations receive a destination-specific card even if optional dynamic data is temporarily unavailable; they never silently become the generic app preview.

## Fresh shares and canonical URLs

The native-share owner adds a short `share` token to each outgoing URL so messaging clients request fresh metadata. The Worker removes that token from the canonical URL and from the destination used to resolve card data.

## Dynamic preview privacy

The public preview projection never returns full Picks history, submitted picks, challenge setup, hidden sender results, PIN data, notification data, or administrative fields.

- An unfinished profile challenge exposes only its game title and public summary.
- A completed shared matchup exposes the two display names, public score labels, and final verdict.
- A Picks recap exposes the event name, first-place result, entrant count, and main-event fighters.
- A major ranking update exposes only the already-published update summary and the relevant rank movements.

Unknown, private, malformed, or unsupported routes still fall back safely without creating another lookup path.

## Copy standard

Preview copy uses plain `resume` where that word appears and avoids legacy ranking labels. Build-time and Worker output normalize incoming presentation text before it reaches preview metadata.

## Production proof

The Cloudflare deployment is not considered successful merely because the homepage and JavaScript chunks load. It must also prove live crawler responses for a fighter, a comparison, and a game challenge, then fetch the published card image and verify its PNG signature and exact 1200×630 dimensions.
