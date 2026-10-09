import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310053_football_daily_product_integration.sql", "utf8");
const routeMigration = readFileSync("supabase/migrations/202612310055_football_hq_daily_route.sql", "utf8");
const sportOwnerRepair = readFileSync("supabase/migrations/202612310056_repair_football_daily_reminder_sport_owner.sql", "utf8");
const persistedRuntimeRepair = readFileSync("supabase/migrations/202612310099_football_daily_persisted_runtime.sql", "utf8");
const page = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const runtime = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const hq = readFileSync("src/features/back-room/FootballBackRoomPage.tsx", "utf8");
const todayHub = readFileSync("src/features/play/TodayChallengeHub.tsx", "utf8");
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

  it("derives reminder sport from the canonical schedule owner", () => {
    expect(sportOwnerRepair).toContain("pg_get_functiondef");
    expect(sportOwnerRepair).toContain("'challenge.sport'");
    expect(sportOwnerRepair).toContain("'schedule.sport'");
    expect(sportOwnerRepair).toContain("join private.daily_challenge_schedule_versions schedule");
    expect(sportOwnerRepair).toContain("on schedule.version = challenge.schedule_version");
    expect(sportOwnerRepair).not.toContain("alter table private.daily_challenges");
    expect(backendTest).toContain("select distinct on (schedule.sport)");
    expect(backendTest).toContain("perform public.dispatch_due_in_app_notifications");
  });

  it("suppresses reminders by exact daily id instead of colliding across sports", () => {
    expect(migration).toContain("attempt.daily_challenge_id = v_daily.id");
    expect(migration).toContain("attempt.attempt_kind = 'official_first'");
    expect(backendTest).toContain("Daily reminder source identity can collide across sports");
  });

  it("returns the persisted Football schedule identity used by leaderboard and history queries", () => {
    expect(runtime).toContain("schedule_version: context.schedule_version");
    expect(runtime).toContain("context = await finalizePending(userClient, admin, context, profileId)");
    expect(runtime).not.toContain("schedule_version: FOOTBALL_TODAY_SCHEDULE_VERSION");
  });

  it("reuses an already-published Football Daily before loading generated game code", () => {
    expect(persistedRuntimeRepair).toContain("get_daily_challenge_materialization_request");
    expect(persistedRuntimeRepair).toContain("private.daily_challenge_schedule_for_day(v_day, p_sport)");
    expect(runtime).toContain('p_sport: "football"');
    expect(runtime).toContain("if (request.required !== true)");
    expect(runtime).toContain("return json(footballPublicPayload(context))");
    expect(runtime).toContain("normalizeLegacyFootballProgress(context, advanceFootballRuntime)");
    expect(runtime).toContain("advanceFootballRuntime(context, action)");
    expect(runtime).not.toContain("buildFootballTodayRuntimeSnapshot(materialized.centralDay");
  });

  it("never lets the Weekly Auction gate strand an already-started Football Daily", () => {
    const legacyFootballStart = runtime.indexOf('if (body.sport === "football") {');
    const legacyFootball = runtime.slice(legacyFootballStart);
    expect(legacyFootball).toContain("const continuingFootballDaily = Number(context.progress_revision ?? 0) > 0");
    expect(legacyFootball).toContain("|| Boolean(asRecord(context.official_attempt))");
    expect(legacyFootball).toContain("if (!continuingFootballDaily) {");
    expect(legacyFootball.indexOf("let context = await getContext(admin, materialized.dailyChallengeId, profileId)"))
      .toBeLessThan(legacyFootball.indexOf("const continuingFootballDaily"));
    expect(legacyFootball.indexOf("const continuingFootballDaily"))
      .toBeLessThan(legacyFootball.indexOf('football_weekly_auction_daily_gate'));

    const averageFanFastStart = runtime.indexOf("async function advanceExistingAverageFan(");
    const averageFanFastEnd = runtime.indexOf("async function continueTwoGameWithoutIntermission(", averageFanFastStart);
    const averageFanFastPath = runtime.slice(averageFanFastStart, averageFanFastEnd);
    expect(averageFanFastPath).toContain("const hasStartedFootballDaily = Number(context.progress_revision ?? 0) > 0");
    expect(averageFanFastPath).toContain("if (!hasStartedFootballDaily) {");
    expect(averageFanFastPath.indexOf("let context = await getContext(admin, requestedDailyId, profileId)"))
      .toBeLessThan(averageFanFastPath.indexOf("const hasStartedFootballDaily"));
    expect(averageFanFastPath.indexOf("const hasStartedFootballDaily"))
      .toBeLessThan(averageFanFastPath.indexOf('football_weekly_auction_daily_gate'));
  });

  it("keeps Football HQ and completed result actions on the canonical Today route", () => {
    expect(hq).toContain('<TodayChallengeHub sport="football" />');
    expect(todayHub).toContain('sport === "football" ? "/football/today"');
    expect(todayHub).not.toContain("<DailyChallengeStandings");
    expect(todayHub).toContain('/championship/" + sport + "?tab=play"');
    expect(hq).toContain('<ChallengeCenter sport="football"');
    expect(page).toContain("shareDailyChallengeResult");
    expect(page).toContain("SHARE RESULT");
    expect(page).not.toContain("<DailyChallengeStandings");
  });
});
