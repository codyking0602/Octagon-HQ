# Rich preview architecture

Octagon HQ has one server-side rich-preview owner in `worker/`.

## First production slice

The Worker runs before the SPA only for fighter and Rankings share routes. It reads a compact ranking preview catalog emitted from the canonical ranking model during the normal Vite build, then injects route-specific HTML metadata before social and messaging crawlers receive the page.

Implemented previews:

- fighter profiles;
- direct ranking positions;
- fighter comparisons.

Each preview provides a route-specific title, description, canonical URL, and relevant fighter imagery. Comparison previews expose both fighters in the requested left/right order.

## Ownership

- `rankingModel.ts` remains the only fighter rank, OVR, name, and presentation source.
- `vite.config.ts` emits only a compact deployment artifact derived from that model.
- `worker/previewModel.ts` is the only preview-data resolver.
- `worker/index.ts` is the only server metadata injection owner.
- The React route owners remain unchanged.
- Hashed assets continue to bypass the Worker.

## Copy standard

Preview copy uses plain `GOAT` and `resume` everywhere.

## Safe fallback

Unknown, incomplete, malformed, or unavailable preview data falls back to the existing Octagon HQ title, description, and app icon. No private profile, Picks, challenge, or result data is exposed by this foundation.

## Remaining second PR

The next rich-preview PR should extend this owner to Picks recaps, reproducible challenges, completed profile-matchup results, and major ranking updates. It should not add another Worker, route resolver, metadata injector, or preview catalog.
