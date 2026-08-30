import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeFootballEvent } from "../../supabase/functions/sync-next-football-event/normalize";

const migration = readFileSync("supabase/migrations/202608300002_football_pick_event_ingestion.sql", "utf8");
const edge = readFileSync("supabase/functions/sync-next-football-event/index.ts", "utf8");

describe("Football Picks ingestion", () => {
  it("normalizes ESPN identity and The Odds API ATS into the shared draft shape", () => {
    const event = normalizeFootballEvent({ id: "401", shortName: "DAL @ PHI", season: { year: 2026 }, competitions: [{ date: "2026-09-10T00:20:00Z", venue: { fullName: "The Linc", address: { city: "Philadelphia", state: "PA" } }, competitors: [{ homeAway: "home", team: { id: "1", displayName: "Philadelphia Eagles", abbreviation: "PHI" } }, { homeAway: "away", team: { id: "2", displayName: "Dallas Cowboys", abbreviation: "DAL" } }] }] }, [{ home_team: "Philadelphia Eagles", away_team: "Dallas Cowboys", bookmakers: [{ last_update: "2026-09-09T12:00:00Z", markets: [{ key: "spreads", outcomes: [{ name: "Philadelphia Eagles", point: -3.5 }, { name: "Dallas Cowboys", point: 3.5 }] }] }] }], "nfl");
    expect(event).toMatchObject({ source_event_key: "espn:401", sport: "football", league: "nfl", locks_at: "2026-09-10T00:20:00.000Z" });
    expect(event.bouts[0]).toMatchObject({ home_team_slug: "philadelphia-eagles", away_team_slug: "dallas-cowboys", spread_home: -3.5, spread_source: "the-odds-api" });
  });

  it("keeps the canonical Picks RPCs as the only staging and publication owner", () => {
    expect(edge.match(/stage_pick_event_draft/g)).toHaveLength(1);
    expect(edge).not.toContain("publish_pick_event_draft");
    expect(edge).not.toMatch(/\.from\(["']pick_/);
    expect(migration).toContain("private.stage_pick_event_draft_football_core(p_payload)");
    expect(migration).toContain("private.publish_pick_event_draft_football_core(p_draft_id)");
    expect(migration).not.toMatch(/create table .*football_picks|footballPicksRepository|FootballPicksProvider/i);
  });

  it("keeps the shared Football event contract compatible with multi-game weekly slates", () => {
    expect(migration).toContain("p_payload->>'event_kind' not in ('game','slate')");
    expect(migration).toContain("jsonb_array_length(coalesce(p_payload->'bouts','[]'::jsonb)) < 1");
    expect(migration).not.toContain("jsonb_array_length(coalesce(p_payload->'bouts','[]'::jsonb)) <> 1");
  });
});
