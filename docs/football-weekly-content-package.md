# Football weekly editorial content package

Phase 1: canonical storage for the CFB/NFL Player Spotlight + Game of the Week selections. This is editorial production, not the Weekly GM challenge or the Football Picks slate.

## Timing (locked)

- One row per Tuesday, keyed by the DATE week_of.
- **Tuesday at 12:00 AM America/Chicago**, precisely when Monday becomes Tuesday, is the future activation instant.
- The server derives release_at from week_of::timestamp AT TIME ZONE 'America/Chicago'; the UTC instant changes between CST and CDT.
- The **single enabled Football Weekly Content monitoring task** runs Sunday **8:00 AM Central** (five CFB Spotlight + five CFB GOTW recommendations), and Monday **10:30 PM Central** (five NFL Spotlight + five NFL GOTW recommendations, factoring in Monday Night Football). Owner chooses one of each; nothing is auto-selected. This leaves at most 90 minutes before Tuesday midnight, so do not bypass approvals or verification when too late.
- If production is not valid and ready at midnight, retain the last approved live material. Do not silently switch content later on Tuesday or publish partial assets.

## Locked Home Top Games team links

The approved compact premium Home Top Games layout is permanent across weekly editorial content refreshes. Each independently clickable, branded **team pill** links to the team's Sports Reference page for the **PickEvent football season**: CFB at `sports-reference.com/cfb/schools/<canonical-school>/<season>.html`, NFL at `pro-football-reference.com/teams/<PFR-team-id>/<season>.htm`. Clicking the rest of the matchup card still opens its in-app Breakdown; no nested links. The URL is resolved automatically from the canonical school/NFL identity using `footballTeamSportsReference.ts` (including BYU, Notre Dame, long school names, alias/mascot handling, and PFR's non-ESPN franchise IDs). Never hardcode a current-year URL into the weekly content, and never infer the calendar year in January. An unrecognized identity must **not** open a guessed team's statistics page; check/update the canonical team mapping as part of owner-selected editorial preparation if a new program enters the package. Links open the reference website in a separate tab. These Home presentation rules do not alter or relocate the eight-second SeatGeek image carousel in Football Picks.

**Locked neutral Top Games palette for every future weekly release:** Home Top Games uses neutral charcoal/graphite outer and inner card surfaces with understated gray borders (shared `home-football-hq.css`), not navy-blue tinted panels or blue border glow. Preserve the approved compact sizing, layout and readable labels, independent season Sports Reference team links, each team's own colored pill/diagonal/logo, and the Football-blue section headings and Breakdown links. Weekly content automation only changes the featured teams and editorial inputs and must never override these shared layout/color rules. The regression suite `footballWeeklyLayoutLock.test.ts` protects this treatment.

## Package contents

The four independent JSON slots are cfb_spotlight, nfl_spotlight, cfb_game_of_week, and nfl_game_of_week.

Each Spotlight stores player name, team, position, exactly four labeled stats, result, measurements, team color, highlight link, and optional approved image source/path/type. **Every Player Spotlight highlight must link directly to a YouTube video or YouTube Short (youtu.be or youtube.com), never to an NFL.com, publisher, news site, or other web player.** This applies to both manually scheduled Spotlights and future monitored/prepared/published weekly Spotlights; reject non-YouTube links during content preparation. Each GOTW stores opponent identities, kickoff, and optional bindings into the existing Football Picks event, matchup breakdown and 1–4 header photos. Individual slots may remain empty during research; a CFB patch does not delete NFL content.

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

**Approved SeatGeek-only source path (October 13 update):** Never generate the rejected ESPN team-photo composites. For GOTW use a vetted real image from SeatGeek's matchup graphics, save its image URL as one `header_photo_sources` entry, and stage a `football-game-header` manifest with `source_publisher: "SeatGeek"` and `header_source_url`. The normal Asset Ingest workflow validates the source host, renders the *entire* image (no cropped team marks) into the canonical 1600×900 WebP, validates and deploys the exact image, and retains the existing Monday-night asset verification and Central Tuesday-midnight server release gate. No generated or AI images. If the exact source is unavailable or its permitted use is uncertain, do not arm; retain last approved artwork.

Manifests are queued only after photo identity and source have been verified. Automation should prepare potential candidate photographs before the Monday 10 PM approval when possible; only the two approved choices are committed as final weekly media. If action imagery cannot resolve, the processor tries its verified portrait list without requesting an upload. Do not claim production media is ready before its generated asset PR passes validation, merges, and the exact production asset URL is confirmed.

Owner-only RPC prepare_football_weekly_editorial(date,sport,spotlight,game,editorial) stores the complete four-stat Spotlight and GOTW data in the existing four package slots, plus a source-backed full six-section Football matchup breakdown in the production JSON object. Checks enforce exact owner-selected names/opponents/kickoff, four distinct stat labels, correct ESPN media source link, real YouTube highlight, canonical artwork paths, two setup paragraphs, three matchups, two team win paths, three players per team, two HQ unit edges and two sourcing URLs. It returns the updated draft. Nothing is activated, scheduled, or publicly announced.

Prepared content is not automatically proof of asset existence: the later Phase 4 readiness gate must confirm the actual generated files are live, the full editorial has been independently fact-checked, the authorized approval is recorded, and the complete package is ready for atomic Tuesday 12:00 AM America/Chicago activation. A failed quality gate keeps the current approved content instead of shipping unfinished assets.

Runtime owner panel shows EDITORIAL PREPARED only after the authoritative database confirmation, not after an unverified chat reply. The content preparation task must use the owner-authenticated RPC or a narrowly scoped authorized connector operation and verify the stored package; never claim a write succeeded without a receipt.

## Phase 4 — Automatic Tuesday midnight release

The canonical table and owner choices remain the only editorial source of truth. A sport must finish Phase 3 production and have its actual WebP art deployed before it can be armed. The guarded arm_football_weekly_editorial RPC validates the owner-selected player, exact game/kickoff, four stats and sourced breakdown against the prepared package; confirms canonical artwork paths and a production SHA receipt; then locks that sport's contents.

One automatic readiness worker, supabase/functions/football-weekly-publisher, uses the EXISTING database-owned scheduler token and private service-role credentials. Every five minutes Monday 10–11:59 PM America/Chicago it inspects only owner-selected, fully prepared packages; fetches real live 720×900 Spotlight and 1600×900 GOTW WebP files; verifies the container, dimensions and live frontend deployment SHA; and arms only the corresponding sport. Missing files, wrong dimensions or authorization errors are deferred, never published. No impersonation of a Pics owner or extra weekly approval.

**The release instant is entirely server-time-gated.** Public get_live_football_weekly_editorial returns a sport only once its ready_at exists AND its Tuesday week_of at 12:00 AM America/Chicago is no later than database now(). No cron timing or client clock can expose content early; an already-open Home/Picks page polls every 15 seconds. The minute cron performs the subsequent status/published_at audit update only.

CFB and NFL advance independently. If CFB is armed at midnight and NFL is not, only the new CFB goes live; NFL keeps its most recent eligible published week. If neither is ready, the existing manual/last published presentation remains in place. No arming after the midnight deadline, no half-finished content and no delayed Tuesday evening surprise publication.

Existing Home Player Spotlight and six-section Football matchup renderer are reused. Published games enter the established featured-matchup display only if the current Football Picks event includes that same matchup/kickoff. Game-of-the-Week artwork appears in the Football Picks carousel (approximately eight-second rotation), not Home or the breakdown modal. The Home card uses compact legible team marks and names. The setup and bottom line discuss game dynamics, not kickoff times, citations, images, or winner predictions. Event-wide manually curated header galleries and manually authored legacy content are preserved.

The optional in-app owner fallback is Verify Art & Arm Midnight, which checks the actual live images and deployment marker before calling the restricted owner RPC; the automatic worker is the normal no-extra-click path. The exact authenticated owner selection remains mandatory.

SQL regression proof: supabase/tests/football_weekly_editorial_publication.sql. Pure TypeScript tests cover real public mapping, current-event matching, WebP dimensions, invalid content and fail-closed media URL verification. The existing Supabase deployment job deploys and verifies the private worker; the full current-chain backend job verifies the migration and access rules.

First real Monday-night cycle must be observed before claiming that the entire weekly automation has published successfully. Deployment of the system alone is not proof of a complete live image/content batch.

## October 13 automation readiness

- Sunday 8 AM Central: exactly five CFB Spotlight player candidates and five CFB GOTW candidates; Monday 10 PM Central: exactly five NFL Spotlight players and five NFL games. Research from real verified recent performance and upcoming schedules, and request owner selection of one in each category; never invent/auto-select the owner choices.
- Once chosen, research and prepare both sports independently: the Spotlight with four nonredundant game-specific stats, full result and measurements, and ESPN-sourced verified photo; the GOTW with concise neutral analysis and a real verified SeatGeek publisher graphic. Avoid kickoff/network/source credits in setup and bottom line, and never predict winners.
- Both assets must be ingested, visually reviewed, committed on the generated head, pass full validation, merged, and verified live before Monday-night arming. No redundant graphics in Home or the modal: published art is shown only in Football Picks' eight-second gallery.
- The existing database-owned publication scheduler checks every five minutes on Monday night and the public RPC releases armed CFB/NFL independently at exactly Tuesday 12:00 AM America/Chicago, with DST handled by the database. Missed owner selection or failed image verification holds the previous approved sport instead of publishing placeholders or rejected artwork.
- **Do not claim complete end-to-end automation until an actual Monday-night publication cycle has succeeded.** The five suggestions are automated; selecting them remains the owner's decision. Production support for approved publisher artwork does not guarantee a publisher has released a usable graphic that week.
