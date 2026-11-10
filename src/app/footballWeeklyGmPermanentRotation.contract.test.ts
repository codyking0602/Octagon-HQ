import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612311523_permanent_weekly_football_gm.sql", "utf8");
const play = readFileSync("src/features/play/PlayV2Page.tsx", "utf8");
const archive = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");
const weekly = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const gm = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");

describe("Permanent Tuesday NFL GM featured championship", () => {
  it("never routes the featured football game back to Auction", () => {
    expect(play).toContain('to="/football/weekly-gm"');
    expect(play).not.toContain('to={gmWeek ? "/football/weekly-gm" : "/football/weekly-auction"}');
    expect(archive).toContain('return now.getTime() >= Date.parse("2026-10-13T05:00:00Z");');
    expect(archive).toContain("repository.loadHistory()");
  });

  it("automatically creates the next Chicago-time Tuesday GM event without an Auction Daily gate", () => {
    expect(migration).toContain("create or replace function private.ensure_current_football_weekly_gm");
    expect(migration).toContain("v_week_start := date '2026-11-10' +");
    expect(migration).toContain("on conflict (week_start) do nothing");
    expect(migration).toContain("perform private.ensure_current_football_weekly_gm()");
    expect(migration).toContain("VOLATILE SECURITY DEFINER");
    expect(migration).toContain("if (p_at at time zone 'America/Chicago')::date >= date '2026-11-03' then");
    expect(migration).not.toContain("and (p_at at time zone 'America/Chicago')::date < date '2026-11-10' then");
  });

  it("keeps standard seven-spin GM and server scoring for all future weeks", () => {
    expect(weekly).toContain('weekStart >= "2026-11-03"');
    expect(weekly).toContain('state.week_start >= "2026-11-03"');
    expect(gm).toContain("isStandardWeeklyGmSeed(weeklyRun.seed)");
    expect(migration).toContain("if v_attempt.week_start >= date '2026-11-03' then");
    expect(migration).toContain("v_verified_score := private.football_weekly_gm_verified_score(p_state)");
    expect(migration).toContain("Standard Weekly GM must begin with an empty roster");
  });
});
