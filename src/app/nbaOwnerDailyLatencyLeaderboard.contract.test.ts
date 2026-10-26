import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildNbaServerDailyPublication } from "../features/nba/nbaDailyServerPublication";
import { advanceNbaOfficialDailyRuntime } from "../features/nba/nbaDailyServerAdvance";
import { advanceCanonicalWhoAmIDailyRuntime } from "../features/play/whoAmITwoRoundDailyRuntime";
import type { OfficialDailyRuntimeContext } from "../features/play/todaysChallengeRuntime";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
const deployment = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const migration = readFileSync("supabase/migrations/202612310411_nba_owner_daily_leaderboard.sql", "utf8");
const client = readFileSync("src/features/play/todayChallengeRepository.ts", "utf8");

describe("NBA owner-test latency and score visibility regressions", () => {
  it("routes all NBA Who Am I actions through a separate canonical lean evaluator", () => {
    const handler = edge.slice(edge.indexOf("async function handleNbaDaily("), edge.indexOf("async function getContext(", edge.indexOf("async function handleNbaDaily(")));
    expect(handler).toContain('context.gameType === "who_am_i"');
    expect(handler).toContain('(await loadWhoAmIAdvanceRuntime()).advanceCanonicalWhoAmIDailyRuntime(context, action)');
    expect(edge).toContain('import("./who-am-i-advance.generated.mjs")');
    expect(bundler).toContain('fileName: "who-am-i-advance.generated.mjs"');
    expect(bundler).toContain('src/features/play/whoAmITwoRoundDailyRuntime.ts');
    expect(deployment).toContain("test -f supabase/functions/daily-challenge-runtime/who-am-i-advance.generated.mjs");
  });

  it("preserves the existing server-authoritative two-round scoring and transitions", () => {
    const published = buildNbaServerDailyPublication("2026-10-26", "nba-daily-owner-prelaunch-v1", "who_am_i");
    let context: OfficialDailyRuntimeContext = {
      gameType: "who_am_i",
      setupKey: published.setupKey,
      publicSetup: published.publicSetup,
      revealSetup: published.revealSetup,
      privateSetupEvidence: published.privateSetupEvidence,
      privateGradingEvidence: published.privateGradingEvidence,
      submissionState: {},
      publicState: published.publicSetup.initial_state as Record<string, unknown>,
    };
    for (const action of [{ type: "reveal" }, { type: "reveal" }]) {
      const lean = advanceCanonicalWhoAmIDailyRuntime(context, action);
      const legacy = advanceNbaOfficialDailyRuntime(context, action);
      expect(lean).toEqual(legacy);
      expect(lean.complete).toBe(false);
      context = { ...context, submissionState: lean.submissionState, publicState: lean.publicState };
    }
  });

  it("retains private owner isolation while allowing today's preview leaderboard and answer review", () => {
    expect(client).toContain('{ p_day: day, p_schedule_version: scheduleVersion, p_sport: sport }');
    expect(migration).toContain("('ufc', 'football', 'nba', 'nba_preview')");
    expect(migration).toContain("p_sport = 'nba_preview' and not exists");
    expect(migration).toContain("from public.pick_control_owners owner_row");
    expect(migration).toContain("profile.normalized_name = 'CODY'");
    expect(migration).toContain("raise exception 'NBA prelaunch tests are restricted to the HQ owner'");
    expect(migration).toContain("where schedule.version = p_schedule_version");
    expect(migration).toContain("and schedule.sport = p_sport");
    expect(migration).toContain("'result_detail', ranked.result_detail");
    expect(migration).toContain("'is_current_user', ranked.profile_id = v_profile");
  });
});
