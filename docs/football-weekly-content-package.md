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
