# Profile-backed Picks foundation

## Current owner

- `PicksProvider` is the only runtime Picks state owner.
- `picksRepository.ts` is the only browser-to-Supabase Picks gateway.
- Supabase owns the public current event, the official main-card bout list, lock time, profile selections, and scored season summary.
- Home and the Picks route consume the provider; neither performs its own Picks query.

## Current event

The first production card is UFC Fight Night: Ankalaev vs. Guskov on July 25, 2026 at Etihad Arena in Abu Dhabi.

The card uses the six official main-card bouts. Picks lock at the published main-card start time. The save RPC independently enforces the lock and validates that the selected fighter belongs to the requested bout.

## Intentional boundary

- Results are not guessed or scraped in the browser.
- Event winners will be added through the canonical backend event data, which automatically updates profile records.
- Event recap presentation and automatic event ingestion remain later slices.
- No localStorage Picks fallback exists for authenticated profiles.
