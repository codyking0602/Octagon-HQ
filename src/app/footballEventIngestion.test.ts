import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeFootballEvent, normalizeFootballFinalResult } from "../../supabase/functions/sync-next-football-event/normalize";

const migration = readFileSync("supabase/migrations/202612310066_football_pick_event_ingestion.sql", "utf8");
const finalMigration = readFileSync("supabase/migrations/202612310073_football_pick_final_score_ingestion.sql", "utf8");
const edge = readFileSync("supabase/functions/sync-next-football-event/index.ts", "utf8");

const espnGame = (completed: boolean, homeScore: unknown = "24", awayScore: unknown = "17") => ({
  id: "401",
  shortName: "DAL @ PHI",
  season: { year: 2026 },
  competitions: [{
    date: "2026-09-10T00:20:00Z",
    status: { type: { completed } },
    venue: { fullName: "The Linc", address: { city: "Philadelphia", state: "PA" } },
    competitors: [
      { homeAway: "home", score: homeScore, team: { id: "1", displayName: "Philadelphia Eagles", abbreviation: "PHI" } },
      { homeAway: "away", score: awayScore, team: { id: "2", displayName: "Dallas Cowboys", abbreviation: "DAL" } },
    ],
  }],
});

describe("Football Picks ingestion", () => {
  it("normalizes ESPN identity and The Odds API ATS into the shared draft shape", () => {
    const event = normalizeFootballEvent(espnGame(false), [{ home_team: "Philadelphia Eagles", away_team: "Dallas Cowboys", bookmakers: [{ last_update: "2026-09-09T12:00:00Z", markets: [{ key: "spreads", outcomes: [{ name: "Philadelphia Eagles", point: -3.5 }, { name: "Dallas Cowboys", point: 3.5 }] }] }] }], "nfl");
    expect(event).toMatchObject({ source_event_key: "espn:401", sport: "football", league: "nfl", locks_at: "2026-09-10T00:20:00.000Z" });
    expect(event.bouts[0]).toMatchObject({ home_team_slug: "philadelphia-eagles", away_team_slug: "dallas-cowboys", spread_home: -3.5, spread_source: "the-odds-api" });
  });

  it("normalizes only completed ESPN games into official Football final scores", () => {
    expect(normalizeFootballFinalResult(espnGame(false), "nfl")).toBeNull();
    expect(normalizeFootballFinalResult(espnGame(true), "nfl")).toMatchObject({
      source: "espn",
      source_event_key: "espn:401",
      league: "nfl",
      home_team_slug: "philadelphia-eagles",
      away_team_slug: "dallas-cowboys",
      home_final_score: 24,
      away_final_score: 17,
    });
  });

  it("fails closed when ESPN marks a game complete without valid final scores", () => {
    expect(() => normalizeFootballFinalResult(espnGame(true, "", "17"), "nfl")).toThrow("ESPN final score is incomplete");
    expect(() => normalizeFootballFinalResult(espnGame(true, "24.5", "17"), "nfl")).toThrow("ESPN final score is invalid");
  });

  it("short-circuits completed games before the Odds API and canonical draft staging", () => {
    const espnFetch = edge.indexOf("site.web.api.espn.com");
    const finalBranch = edge.indexOf("const finalResult = normalizeFootballFinalResult");
    const oddsFetch = edge.indexOf("api.the-odds-api.com");
    expect(espnFetch).toBeGreaterThan(-1);
    expect(finalBranch).toBeGreaterThan(espnFetch);
    expect(oddsFetch).toBeGreaterThan(finalBranch);
    expect(edge.match(/record_football_pick_final/g)).toHaveLength(1);
    expect(edge).toContain("p_league: finalResult.league");
    expect(edge.match(/stage_pick_event_draft/g)).toHaveLength(1);
  });

  it("keeps the canonical Picks RPCs as the only staging and publication owner", () => {
    expect(edge.match(/stage_pick_event_draft/g)).toHaveLength(1);
    expect(edge).not.toContain("publish_pick_event_draft");
    expect(edge).not.toMatch(/\.from\(["']pick_/);
    expect(migration).toContain("private.stage_pick_event_draft_football_core(p_payload)");
    expect(migration).toContain("private.publish_pick_event_draft_football_core(p_draft_id)");
    expect(migration).not.toMatch(/create table .*football_picks|footballPicksRepository|FootballPicksProvider/i);
  });

  it("records exactly one active published Football game without mutating its frozen line", () => {
    expect(finalMigration).toContain("event.sport = 'football'");
    expect(finalMigration).toContain("event.league = v_league");
    expect(finalMigration).toContain("event.status in ('upcoming', 'locked')");
    expect(finalMigration).toContain("if v_match_count <> 1 then");
    expect(finalMigration).toContain("home_final_score = p_home_final_score");
    expect(finalMigration).toContain("away_final_score = p_away_final_score");
    expect(finalMigration).not.toMatch(/set[\s\S]{0,120}frozen_spread_home\s*=/i);
    expect(finalMigration).not.toMatch(/set[\s\S]{0,120}spread_source\s*=/i);
  });

  it("uses the canonical Picks completion owner only after every included game is resolved", () => {
    expect(finalMigration).toContain("pending.result_status = 'pending'");
    expect(finalMigration).toContain("public.transition_pick_event(v_bout.event_id, 'locked')");
    expect(finalMigration).toContain("public.transition_pick_event(v_bout.event_id, 'complete')");
    expect(finalMigration).toContain("grant execute on function public.record_football_pick_final(text,text,text,integer,integer) to service_role");
    expect(finalMigration).not.toContain("grant execute on function public.record_football_pick_final(text,text,text,integer,integer) to authenticated");
  });

  it("keeps the shared Football event contract compatible with multi-game weekly slates", () => {
    expect(migration).toContain("p_payload->>'event_kind' not in ('game','slate')");
    expect(migration).toContain("jsonb_array_length(coalesce(p_payload->'bouts','[]'::jsonb)) < 1");
    expect(migration).not.toContain("jsonb_array_length(coalesce(p_payload->'bouts','[]'::jsonb)) <> 1");
  });
});
