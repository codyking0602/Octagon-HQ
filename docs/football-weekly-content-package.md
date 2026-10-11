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
