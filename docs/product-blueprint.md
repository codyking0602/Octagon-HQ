# Octagon HQ V2 Product Blueprint

## Product promise
Octagon HQ is a UFC-only rankings, games, picks, and community product built for debate and the group chat.

## Locked experience
- A branded black startup screen prevents unfinished UI and theme flicker.
- Fresh launches always open Home.
- Routes load independently so one feature cannot delay the entire app.
- War Room is absent from navigation, Home, routes, onboarding, and notifications unless the user has access.
- Public language uses Octagon HQ. Internal labels such as “UFC App” and “GOAT26” are never shown.
- Home includes Your HQ: Daily streak, Current Picks record, Favorite fighter, and Open challenges.
- Sharing is minimal, native, consistent, and uses clean links.

## Architecture owners
- `src/main.tsx`: one application entry.
- `src/app/router.tsx`: one routing owner.
- `src/app/App.tsx`: one startup readiness owner.
- `src/lib/supabase.ts`: one Supabase client owner.
- `src/styles/tokens.css`: one semantic color and spacing source.
- Feature folders own their screens, state, and tests.
- `src/features/picks/PicksProvider.tsx`: the only app-facing Picks state owner.
- `src/features/picks/picksRepository.ts`: the only browser Supabase owner for Picks.
- Backend RPCs own authoritative scoring, official results, event transitions, and completed-event projections.

## Intentionally absent from the foundation
- No service worker.
- No custom cache or update manager.
- No copied V1 scripts or CSS.
- No authentication fallback.
- No War Room placeholder.
- No production database connection until the V2 development project is ready.

## Migration order
1. Foundation and preview deployment.
2. Rankings and fighter profiles.
3. Home personalization and onboarding.
4. Games and Challenge Center.
5. Picks and event recaps.
6. Profiles, War Room, mentions, and notifications.
7. Standardized sharing, installability, and cutover.

## Picks lifecycle presentation

The player-facing Picks lifecycle is derived from the existing event timestamps, backend event status, and backend bout-result state. React does not own a second event lifecycle.

- **UPCOMING:** before `locks_at`; eyebrow `NEXT UFC EVENT`; picks remain interactive.
- **PICKS LOCKED:** at or after `locks_at`, before the event has started and before any official result has been recorded; eyebrow `PICKS LOCKED`; picks are read-only.
- **AWAITING RESULTS:** at or after `starts_at`, or as soon as any official result is recorded; eyebrow `EVENT IN PROGRESS`; status `AWAITING RESULTS`; picks remain read-only.
- **EVENT COMPLETE:** completed events are excluded from the active-event backend projection and live in completed recaps. A defensive frontend check also refuses to present a returned completed event as the active hero.

Judgment call: when `locks_at` and `starts_at` are the same timestamp, the presentation moves directly from `UPCOMING` to `AWAITING RESULTS`. A distinct `PICKS LOCKED` window exists only when the canonical card data provides a real gap between lock time and event start, or when the backend has advanced the event to `locked` before `starts_at`.

# PICKS FUTURE ROADMAP — LOCKED PRODUCT DIRECTION

The following phases are locked product direction. They must remain separate, narrow implementations and must preserve the current Picks owners and scoring rules.

## PHASE 2 — PRIVATE FIGHT NIGHT CONTROL

Build a separate owner-only operational page for Cody. It must not appear inside the normal player Picks page.

### Card
- Create and edit an event.
- Edit event name, subtitle, date, time, venue, and location.
- Add, remove, and reorder fights.
- Replace a fighter.
- Edit weight class and lock time.
- Cancel a fight.
- Publish or lock an event.
- Show a compact readiness status.

### Results
- One-tap red fighter winner.
- One-tap blue fighter winner.
- Draw.
- No contest.
- Cancelled.
- Clear an unresolved result.
- Disable `Complete Event` until every bout is resolved.
- Show compact progress such as `5 of 6 results entered`.
- Preserve the existing backend result-transition owner as canonical.

### Corrections
- Do not add a broad V1-style `Reopen Event` button.
- Add a future audited `Correct Result` action.
- Require a correction reason.
- Preserve append-only correction history.
- Atomically recalculate event and season results.

## PHASE 3 — AUTOMATIC ODDS

One backend owner should:
- fetch American odds;
- update unlocked bouts;
- preserve source and update timestamp;
- freeze lock-time odds;
- run on a normal schedule;
- run more frequently on event day;
- allow Cody to trigger a manual refresh;
- allow a manual per-fight override;
- display freshness and unmatched-fight warnings.

Do not:
- let the browser own authoritative odds;
- let post-lock changes alter scoring;
- recreate V1 repository health-file commits;
- combine odds fetching with every other event automation.

## PHASE 4 — CARD CHANGES AND CANCELLATIONS

Automatic monitoring should detect and stage changes for owner approval rather than silently making destructive edits.

### Cancelled fight
- Preserve original picks.
- Mark the fight cancelled.
- Exclude it from scoring.
- Show the cancellation in the recap.

### Fighter replacement
- Preserve the old selection in audit history.
- Mark the prior pick invalid.
- Require a new pick.
- Never silently transfer the pick to the replacement fighter.

### Fight reordered
- Preserve the pick.
- Update display order and lock information safely.

### Fight moved off the pickable card
- Preserve the pick historically.
- Exclude it from scoring when appropriate.
- Do not delete it silently.

### Post-lock change
- Require owner approval and a reason.
- Never happen silently.

## PHASE 5 — EVENT MEDIA / POSTER

Cody likes adding a real promotional media image for each event.

Locked direction:
- Add optional event media or poster support.
- Use a real stored asset only.
- Do not fabricate image paths.
- Do not AI-generate UFC event media.
- Display the event image inside or directly beneath the event hero.
- Include useful alt text.
- Do not render an empty media frame when no image exists.
- Keep date, venue, card size, and odds freshness readable.

Potential future data shape should account for:
- media asset path or URL;
- media alt text;
- optional source or credit metadata;
- optional focal positioning.

## PHASE 6 — FIGHT SPOTLIGHT

Fight Spotlight is selective, not automatic for every fight.

Locked direction:
- Use it for main events, title fights, marquee co-mains, or special debates.
- Use a compact entry card inside Picks.
- Open a full-screen panel, modal, or dedicated route.
- Do not place the entire long preview inline in the normal fight list.

Future content:
- promotional image or fighter imagery;
- short matchup preview;
- tale of the tape;
- matchup edges;
- optional external `Watch Fight Spotlight` link;
- clean close and back behavior.

Potential future data shape should account for:
- spotlight enabled;
- spotlight bout ID;
- headline;
- preview copy;
- age, height, reach, and stance;
- matchup edges;
- media asset;
- optional external URL.

## V1 reference boundary

Old V1 repository: `codyking0602/ufc-goat-rankings`.

V1 may be inspected for product reference only.

Useful concepts to preserve:
- one-tap winner entry;
- odds source and freshness;
- Underdog Lock scoring;
- event poster;
- Fight Spotlight;
- awareness of fight replacements and cancellations.

Do not restore:
- rooms;
- room codes;
- commissioner ownership;
- local tokens;
- local fallback picks;
- giant settings panels;
- multiple browser polling loops;
- GitHub files as the production event database;
- combined card, odds, results, and season administration inside the player page;
- giant analytics clutter.
