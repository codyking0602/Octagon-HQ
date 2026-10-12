# Football weekly editorial content package

Phase 1: canonical storage for the CFB/NFL Player Spotlight + Game of the Week selections. This is editorial production, not the Weekly GM challenge or the Football Picks slate.

## Timing (locked)

- One row per Tuesday, keyed by the DATE week_of.
- **Tuesday at 12:00 AM America/Chicago**, precisely when Monday becomes Tuesday, is the future activation instant.
- The server derives release_at from week_of::timestamp AT TIME ZONE 'America/Chicago'; the UTC instant changes between CST and CDT.
- Sunday 8 AM Central: college recommendations. Monday 10 PM Central: NFL recommendations, allowing up to two hours to prepare before Tuesday midnight.
- If production is not valid and ready at midnight, retain the last approved live material. Do not silently switch content later on Tuesday or publish partial assets.

## Package contents

The four independent JSON slots are cfb_spotlight, nfl_spotlight, cfb_game_of_week, and nfl_game_of_week.

Each Spotlight stores player name, team, position, exactly four labeled stats, result, measurements, team color, highlight link, and optional approved image source/path/type. Each GOTW stores opponent identities, kickoff, and optional bindings into the existing Football Picks event, matchup breakdown and 1–4 header photos. Individual slots may remain empty during research; a CFB patch does not delete NFL content.

**Approved photo fallback:** real action image, then correct real headshot/portrait, then owner-approved manual image. No invented player identities. Keep established Football Spotlight and GOTW visual treatments.

## Security and implementation contract

- Migration 202612310297_football_weekly_content_packages.sql creates a server-owned table with restricted browser access and row-level security.
- Owner-only RPCs get_football_weekly_content_package(date) and save_football_weekly_content_draft(date,jsonb) reuse existing Picks owner access. Slot patches cannot set approval, readiness, or published state.
- src/features/home/footballWeeklyContentRepository.ts provides typed schema validation, draft saving, and owner-only loading.
- Verify Supabase Backend runs supabase/tests/football_weekly_content_packages.sql on the current full migration chain. TypeScript contract tests cover field validation and safety.
- **Phase 1 does not change the active Home/Picks renderers, cron schedules, images, existing Spotlight pairs, or production Picks data.** Phases 2–4 will implement user selections/approval, approved real-image ingestion, readiness gates, and atomic midnight activation using established product paths.

## Phase 2: shortlisted recommendations and owner approval

- Five vetted Player Spotlight candidates and five Game of the Week candidates per sport are staged for the next Tuesday week. They are never selected implicitly.
- The owner-only RPC stage_football_weekly_editorial_candidates(date, sport, candidates) accepts exactly five unique player records and five unique game records. Each candidate has a stable lowercase ID, descriptive summary, and either player identity/team/position or game opponents/kickoff.
- Staging the CFB set does not overwrite the NFL set. The current sport's shortlisted choices cannot be replaced after the owner selects one.
- On the existing Football Picks owner control-center page, the new Weekly Football Editorial panel displays five player and five game options. The owner picks one of each and taps Save.
- The owner-only RPC select_football_weekly_editorial_choices(date, sport, player_id, game_id) verifies both IDs against the stored shortlist, then saves the full immutable-option snapshots and an audit timestamp/owner ID into the weekly package choices.
- The selected choices do not change the package draft status, release any content, edit existing code-based Spotlights, or mutate Football Picks. Later phases generate full editorials and imagery and separately authorize exact midnight activation.
- The conversation's recommendation task can deliver candidate lists; it must explicitly stage them through an authorized connected backend operation to make them appear in the app. Never tell the owner a chat-only recommendation was saved to the package if it was not.
- If a reply in chat identifies picks, reconcile them against this same canonical stored candidate list before any authorized save. The in-app owner panel remains a simple fallback.

### Candidate staging shape

Each sport's candidate object contains a players array and games array, each with exactly five entries. Players: id, name, team, position, summary. Games: id, home_team, away_team, kickoff_at as an offset-aware ISO timestamp, summary. No dummy or inferred result values should be staged in production.

Phase 2 verification is in supabase/tests/football_weekly_editorial_approval.sql and the frontend repository/selection panel tests.

## Phase 3: automated real-photo asset production and editorial preparation

Only the owner-selected CFB/NFL player and game (saved in choices) may be prepared. The existing **Asset Ingest** workflow is reused: the weekly research automation finds/identity-checks real ESPN image candidates, adds small .asset-ingest manifests on a branch, and GitHub Actions processes them, opens the asset PR, runs exact-head validation, merges and deploys the verified art. Candidate ordering is real action photos first, portraits next, approved manually supplied real images last. Do not make the user upload photos by default. Never create an artificial athlete face.

Approved Football image manifests use kind football-spotlight or football-game-header; sport cfb/nfl; week_of Tuesday date; and the exact canonical destination public/assets/football/weekly/YYYY-MM-DD/SPORT/spotlight.webp or game-header.webp. The source photo array objects carry kind, url on official ESPN CDN, and the verified ESPN player identity_reference_url; the processor fails closed for untrusted sources, placeholders, missing photos, wrong week, or unrecognized paths.

Spotlight manifests also specify player_name and photos (up to 12 verified candidates). The worker deterministically produces a real 720x900 WebP portrait. The existing Football HQ Spotlight component owns all words, colors, stats, result and links; do not bake copy or synthetic likeness into the photo.

Game-header manifests specify away_team, home_team, away_color, home_color, away_photos, home_photos, and two verified direct ESPN logo URLs (away_logo_url, home_logo_url). The worker renders a 1600x900 WebP photo composite using real team-associated athlete photos, ESPN team marks, team-color accents, compact game title and readable team names. It never changes the existing player Picks header view before Phase 4. Retain existing approved composition where manually approved custom art exists; deterministic template is the repeatable automatic fallback.

Manifests are queued only after photo identity and source have been verified. Automation should prepare potential candidate photographs before the Monday 10 PM approval when possible; only the two approved choices are committed as final weekly media. If action imagery cannot resolve, the processor tries its verified portrait list without requesting an upload. Do not claim production media is ready before its generated asset PR passes validation, merges, and the exact production asset URL is confirmed.

Owner-only RPC prepare_football_weekly_editorial(date,sport,spotlight,game,editorial) stores the complete four-stat Spotlight and GOTW data in the existing four package slots, plus a source-backed full six-section Football matchup breakdown in the production JSON object. Checks enforce exact owner-selected names/opponents/kickoff, four distinct stat labels, correct ESPN media source link, real YouTube highlight, canonical artwork paths, two setup paragraphs, three matchups, two team win paths, three players per team, two HQ unit edges and two sourcing URLs. It returns the updated draft. Nothing is activated, scheduled, or publicly announced.

Prepared content is not automatically proof of asset existence: the later Phase 4 readiness gate must confirm the actual generated files are live, the full editorial has been independently fact-checked, the authorized approval is recorded, and the complete package is ready for atomic Tuesday 12:00 AM America/Chicago activation. A failed quality gate keeps the current approved content instead of shipping unfinished assets.

Runtime owner panel shows EDITORIAL PREPARED only after the authoritative database confirmation, not after an unverified chat reply. The content preparation task must use the owner-authenticated RPC or a narrowly scoped authorized connector operation and verify the stored package; never claim a write succeeded without a receipt.

## Phase 4 — Automatic Tuesday midnight release

The canonical table and owner choices remain the only editorial source of truth. A sport must finish Phase 3 production and have its actual WebP art deployed before it can be armed. The guarded arm_football_weekly_editorial RPC validates the owner-selected player, exact game/kickoff, four stats and sourced breakdown against the prepared package; confirms canonical artwork paths and a production SHA receipt; then locks that sport's contents.

One automatic readiness worker, supabase/functions/football-weekly-publisher, uses the EXISTING database-owned scheduler token and private service-role credentials. Every five minutes Monday 10–11:59 PM America/Chicago it inspects only owner-selected, fully prepared packages; fetches real live 720×900 Spotlight and 1600×900 GOTW WebP files; verifies the container, dimensions and live frontend deployment SHA; and arms only the corresponding sport. Missing files, wrong dimensions or authorization errors are deferred, never published. No impersonation of a Pics owner or extra weekly approval.

**The release instant is entirely server-time-gated.** Public get_live_football_weekly_editorial returns a sport only once its ready_at exists AND its Tuesday week_of at 12:00 AM America/Chicago is no later than database now(). No cron timing or client clock can expose content early; an already-open Home/Picks page polls every 15 seconds. The minute cron performs the subsequent status/published_at audit update only.

CFB and NFL advance independently. If CFB is armed at midnight and NFL is not, only the new CFB goes live; NFL keeps its most recent eligible published week. If neither is ready, the existing manual/last published presentation remains in place. No arming after the midnight deadline, no half-finished content and no delayed Tuesday evening surprise publication.

Existing Home Player Spotlight and six-section Football matchup renderer are reused. Published games enter the established featured-matchup display only if the current Football Picks event includes that same matchup/kickoff. The real 1600×900 GOTW art appears in the home row and Picks breakdown. Event-wide manually curated header galleries and manually authored legacy content are preserved.

The optional in-app owner fallback is Verify Art & Arm Midnight, which checks the actual live images and deployment marker before calling the restricted owner RPC; the automatic worker is the normal no-extra-click path. The exact authenticated owner selection remains mandatory.

SQL regression proof: supabase/tests/football_weekly_editorial_publication.sql. Pure TypeScript tests cover real public mapping, current-event matching, WebP dimensions, invalid content and fail-closed media URL verification. The existing Supabase deployment job deploys and verifies the private worker; the full current-chain backend job verifies the migration and access rules.

First real Monday-night cycle must be observed before claiming that the entire weekly automation has published successfully. Deployment of the system alone is not proof of a complete live image/content batch.
