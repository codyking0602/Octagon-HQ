# Football weekly editorial content package

Phase 1: canonical storage for the CFB/NFL Player Spotlight + Game of the Week selections. This is editorial production, not the Weekly GM challenge or the Football Picks slate.

## Timing (locked)

- One row per Tuesday, keyed by the DATE week_of.
- **Tuesday at 8:00 AM America/Chicago** is the target activation instant. Only owner-approved content with a verified deployed player Spotlight photo appears; owner-provided GOTW headers are optional and never a gate, and a sport verified later in its editorial week may publish late without bypassing checks.
- The server derives release_at from (week_of::timestamp + interval '8 hours') AT TIME ZONE 'America/Chicago'; the UTC instant changes between CST and CDT.
- The existing **Football Weekly Content** monitor provides five CFB Player Spotlight candidates, five CFB GOTW candidates, five NFL Spotlight candidates and five NFL GOTW candidates together on Monday. Cody approves one player and one game per sport; never auto-select. The existing **Football Editorial Completion** task then prepares the approved content. Verified CFB/NFL releases are independent, with an 8 AM Central Tuesday target and same-week late catch-up.
- If production is not valid and ready at the Tuesday 8 AM target, retain the last approved live material for that sport; after independent verification of all media and editorial, allow the approved sport to go live later in the same editorial week. Never publish partial assets.

## Locked Home Top Games team links

The approved compact premium Home Top Games layout is permanent across weekly editorial content refreshes. Each independently clickable, branded **team pill** links to the team's Sports Reference page for the **PickEvent football season**: CFB at `sports-reference.com/cfb/schools/<canonical-school>/<season>.html`, NFL at `pro-football-reference.com/teams/<PFR-team-id>/<season>.htm`. Clicking the rest of the matchup card still opens its in-app Breakdown; no nested links. The URL is resolved automatically from the canonical school/NFL identity using `footballTeamSportsReference.ts` (including BYU, Notre Dame, long school names, alias/mascot handling, and PFR's non-ESPN franchise IDs). Never hardcode a current-year URL into the weekly content, and never infer the calendar year in January. An unrecognized identity must **not** open a guessed team's statistics page; check/update the canonical team mapping as part of owner-selected editorial preparation if a new program enters the package. Links open the reference website in a separate tab. These Home presentation rules do not alter or relocate the existing owner-provided 16:9 image carousel in Football Picks.

**Locked neutral Top Games palette for every future weekly release:** Home Top Games uses neutral charcoal/graphite outer and inner card surfaces with understated gray borders (shared `home-football-hq.css`), not navy-blue tinted panels or blue border glow. Preserve the approved compact sizing, layout and readable labels, independent season Sports Reference team links, each team's own colored pill/diagonal/logo, and the Football-blue section headings and Breakdown links. Weekly content automation only changes the featured teams and editorial inputs and must never override these shared layout/color rules. The regression suite `footballWeeklyLayoutLock.test.ts` protects this treatment.

## Package contents

The four independent JSON slots are cfb_spotlight, nfl_spotlight, cfb_game_of_week, and nfl_game_of_week.

Each Spotlight stores player name, team, position, exactly four labeled stats, result, measurements, team color, highlight link, and optional approved image source/path/type. **Every Player Spotlight highlight must link directly to a YouTube video or YouTube Short (youtu.be or youtube.com), never to an NFL.com, publisher, news site, or other web player.** This applies to both manually scheduled Spotlights and future monitored/prepared/published weekly Spotlights; reject non-YouTube links during content preparation. Each GOTW stores opponent identities, kickoff, and optional bindings into the existing Football Picks event, matchup breakdown ; the owner supplies any 16:9 header separately without delaying the content. Individual slots may remain empty during research; a CFB patch does not delete NFL content.

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

For October 27 and future weeks, automate ONLY kind football-spotlight, sport cfb/nfl, week_of Tuesday date, canonical destination public/assets/football/weekly/YYYY-MM-DD/SPORT/spotlight.webp. The historical football-game-header processor is not a current-week instruction. The source photo array objects carry kind, url on official ESPN CDN, and the verified ESPN player identity_reference_url; the processor fails closed for untrusted sources, placeholders, missing photos, wrong week, or unrecognized paths.

Spotlight manifests also specify player_name and photos (up to 12 verified candidates). The worker deterministically produces a real 720x900 WebP portrait. The existing Football HQ Spotlight component owns all words, colors, stats, result and links; do not bake copy or synthetic likeness into the photo.

**Locked October 27+ GOTW image standard:** Cody supplies all 16:9 header artwork. Do not create or seek SeatGeek substitutes, fabricate a design, use generated game-header manifests, or delay approved content while waiting. Publish the complete sourced GOTW breakdown and the verified player Spotlight at Tuesday 8 AM Central (or same-week verified catch-up). Add an owner header later through the existing independent versioned owner-header override or Picks gallery; do not modify the published weekly package. Historical October 20 SeatGeek assets are left intact.

Manifests are queued only after photo identity and source have been verified. Automation should prepare potential candidate photographs before the Monday 10 PM approval when possible; only the two approved choices are committed as final weekly media. If action imagery cannot resolve, the processor tries its verified portrait list without requesting an upload. Do not claim production media is ready before its generated asset PR passes validation, merges, and the exact production asset URL is confirmed.

Owner-only RPC prepare_football_weekly_editorial(date,sport,spotlight,game,editorial) stores the complete four-stat Spotlight and GOTW data in the existing four package slots, plus the locked concise three-section Football matchup breakdown in the production JSON object. Checks enforce exact owner-selected names/opponents/kickoff, four distinct stat labels, correct ESPN media source link, real YouTube highlight, the canonical player photo path, exactly one THE SETUP paragraph, exactly three titled THINGS THAT MATTER, one researched THE BOTTOM LINE paragraph and at least two sourcing URLs. It returns the updated draft. Nothing is activated, scheduled, or publicly announced.

Prepared content is not automatically proof of asset existence: the later Phase 4 readiness gate must confirm the actual generated files are live, the full editorial has been independently fact-checked, the authorized approval is recorded, and the sport is ready for its Tuesday 8:00 AM America/Chicago release (with verified same-week catch-up). A failed quality gate keeps the current approved content instead of shipping unfinished assets.

Runtime owner panel shows EDITORIAL PREPARED only after the authoritative database confirmation, not after an unverified chat reply. The content preparation task must use the owner-authenticated RPC or a narrowly scoped authorized connector operation and verify the stored package; never claim a write succeeded without a receipt.

## Phase 4 — Tuesday 8 AM target with verified late catch-up

The canonical table and owner choices remain the only editorial source of truth. A sport must finish Phase 3 production and have its actual player Spotlight WebP deployed; a GOTW header may be absent before it can be armed. The guarded arm_football_weekly_editorial RPC validates the owner-selected player, exact game/kickoff, four stats and sourced breakdown against the prepared package; confirms the canonical player-photo path and a production SHA receipt; then locks that sport's contents.

One automatic readiness worker, supabase/functions/football-weekly-publisher, uses the EXISTING database-owned scheduler token and private service-role credentials. Every five minutes throughout the editorial week it inspects only owner-selected, fully prepared packages; fetches the real live 720×900 player Spotlight WebP only; verifies the container, dimensions and live frontend deployment SHA; and arms only the corresponding sport. Missing files, wrong dimensions or authorization errors are deferred, never published. No impersonation of a Pics owner or extra weekly approval.

**The release instant is entirely server-time-gated.** Public get_live_football_weekly_editorial returns a sport only once its ready_at exists AND its Tuesday week_of at 8:00 AM America/Chicago is no later than database now(). No cron timing or client clock can expose content early; an already-open Home/Picks page polls every 15 seconds. The minute cron performs the subsequent status/published_at audit update only.

CFB and NFL advance independently. If CFB is verified at 8 AM and NFL is not, only the new CFB goes live; NFL keeps its most recent eligible published week. If neither is ready, the existing manual/last published presentation remains in place. Late verified publication may proceed during that Tuesday-through-Monday editorial week; owner GOTW header availability never changes this schedule.

Existing Home Player Spotlight and the exact compact THE SETUP / 3 THINGS THAT MATTER / THE BOTTOM LINE matchup renderer are reused. Published games enter the established featured-matchup display only if the current Football Picks event includes that same matchup/kickoff. Game-of-the-Week artwork appears in the Football Picks carousel (approximately eight-second rotation), not Home or the breakdown modal. The Home card uses compact legible team marks and names. The setup and bottom line discuss game dynamics, not kickoff times, citations, images, or winner predictions. Event-wide manually curated header galleries and manually authored legacy content are preserved.

The optional in-app owner fallback is Verify Art & Arm Midnight, which checks the actual live images and deployment marker before calling the restricted owner RPC; the automatic worker is the normal no-extra-click path. The exact authenticated owner selection remains mandatory.

SQL regression proof: supabase/tests/football_weekly_editorial_publication.sql. Pure TypeScript tests cover real public mapping, current-event matching, WebP dimensions, invalid content and fail-closed media URL verification. The existing Supabase deployment job deploys and verifies the private worker; the full current-chain backend job verifies the migration and access rules.

First real Monday-night cycle must be observed before claiming that the entire weekly automation has published successfully. Deployment of the system alone is not proof of a complete live image/content batch.

## October 13 automation readiness

- Monday 10:30 PM Central: exactly five CFB and five NFL Spotlight candidates, plus five CFB and five NFL GOTW candidates, delivered together. Research from real verified recent performance and upcoming schedules, and request owner selection of one in each category; never invent/auto-select the owner choices.
- Once chosen, research and prepare both sports independently: the Spotlight with four nonredundant game-specific stats, full result and measurements, and ESPN-sourced verified photo; the GOTW with the sourced compact three-section analysis; Cody provides the 16:9 header separately if and when desired. Avoid kickoff/network/source credits in setup and bottom line, and never predict winners.
- The player Spotlight photo must be ingested, visually reviewed, committed on the generated head, pass full validation, merged, and verified live before automatic verified arming. No redundant graphics in Home or the modal: published art is shown only in Football Picks' eight-second gallery.
- The existing database-owned publication scheduler checks every five minutes through the week and the public RPC releases CFB/NFL independently no earlier than Tuesday 8:00 AM America/Chicago, including verified late completions, with DST handled by the database. Missed owner selection or failed image verification holds the previous approved sport instead of publishing placeholders or rejected artwork.
- **Do not claim complete end-to-end automation until an actual Monday-night publication cycle has succeeded.** The five suggestions are automated; selecting them remains the owner's decision. Missing owner-supplied 16:9 game artwork is never a publication blocker or an instruction to generate artwork.
