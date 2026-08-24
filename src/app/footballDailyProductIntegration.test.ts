import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310053_football_daily_product_integration.sql", "utf8");
const routeMigration = readFileSync("supabase/migrations/202612310055_football_hq_daily_route.sql", "utf8");
const page = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const hq = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const backendTest = readFileSync("supabase/tests/football_daily_product_integration.sql", "utf8");

describe("Football Daily product integration", () => {
  it("extends the one reminder dispatcher with collision-free sport scope", () => {
    expect(migration).toContain("create or replace function public.dispatch_due_in_app_notifications");
    expect(migration).toContain("challenge.sport in ('ufc', 'football')");
    expect(migration).toContain("select distinct on (challenge.sport)");
    expect(migration).toContain("'daily-challenge-four-hours:' || v_daily.sport || ':' || v_central_day::text");
    expect(migration).toContain("when v_daily.sport = 'football' then '/back-room/football/today'");
    expect(migration).toContain("when v_daily.game_type = 'find_leader' then '/play/find-leader'");
  });

  it("moves the Football reminder destination forward without creating a second dispatcher", () => {
    expect(routeMigration).toContain("pg_get_functiondef");
    expect(routeMigration).toContain("'/back-room/football/today'");
    expect(routeMigration).toContain("'/football/today'");
    expect(routeMigration).toContain("replace(");
    expect(routeMigration).not.toContain("create or replace function public.dispatch_due_in_app_notifications");
  });

  it("suppresses reminders by exact daily id instead of colliding across sports", () => {
    expect(migration).toContain("attempt.daily_challenge_id = v_daily.id");
    expect(migration).toContain("attempt.attempt_kind = 'official_first'");
    expect(backendTest).toContain("Daily reminder source identity can collide across sports");
  });

  it("keeps Football HQ and completed result actions on the canonical Today route", () => {
    expect(hq).toContain('navigate("/football/today")');
    expect(hq).toContain("<DailyChallengeStandings");
    expect(hq).toContain('<ChallengeCenter sport="football"');
    expect(page).toContain("shareDailyChallengeResult");
    expect(page).toContain("SHARE RESULT");
    expect(page).not.toContain("<DailyChallengeStandings");
  });
});
