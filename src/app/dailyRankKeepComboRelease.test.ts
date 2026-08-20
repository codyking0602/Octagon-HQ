import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync(
  "supabase/functions/daily-challenge-runtime/index.ts",
  "utf8",
);
const migration = readFileSync(
  "supabase/migrations/202612310032_daily_rank_keep_combo_rotation.sql",
  "utf8",
);

describe("bundled Blind Rank + Keep Cut Daily release", () => {
  it("orchestrates both canonical game runtimes as one official attempt", () => {
    expect(runtime).toContain('const DAILY_COMBO_SCHEDULE_VERSION = "play-rotation-v4"');
    expect(runtime).toContain('buildOfficialDailySetup("blind_rank_5", day, scheduleVersion)');
    expect(runtime).toContain('buildOfficialDailySetup("keep_4_cut_4", day, scheduleVersion)');
    expect(runtime).toContain('combo_stage: "blind_rank_5"');
    expect(runtime).toContain('combo_stage: "keep_4_cut_4"');
    expect(runtime).toContain("blind_rank: blindRankFinal");
    expect(runtime).toContain("keep_cut: keepCutFinal");
    expect(runtime).toContain("? advanceDailyCombo(context, body.action)");
  });

  it("keeps the second board private until Blind Rank is finished", () => {
    const publicSetupStart = runtime.indexOf("publicSetup: {");
    const privateSetupStart = runtime.indexOf("privateSetupEvidence: {");
    expect(publicSetupStart).toBeGreaterThan(-1);
    expect(privateSetupStart).toBeGreaterThan(publicSetupStart);
    const browserSetup = runtime.slice(publicSetupStart, privateSetupStart);
    expect(browserSetup).toContain('combo_stage: "blind_rank_5"');
    expect(browserSetup).not.toContain("keepCutChild.public_setup");
    expect(runtime.slice(privateSetupStart)).toContain("keep_4_cut_4: keepCutChild");
  });

  it("locks the approved weights and the August 20 same-day replacement", () => {
    expect(migration).toContain("v_target_day constant date := date '2026-08-20'");
    expect(migration).toContain("v_source_version constant text := 'play-rotation-v3'");
    expect(migration).toContain("v_replacement_version constant text := 'play-rotation-v4'");
    expect(migration).toContain("if v_central_today <> v_target_day then");
    expect(migration).toContain("disable trigger daily_challenge_attempts_immutable");
    expect(migration).toContain("where progress.daily_challenge_id = v_existing_daily_id");
    expect(migration).toContain("where attempt.daily_challenge_id = v_existing_daily_id");
    expect(migration).toContain("where daily.id = v_existing_daily_id");
  });

  it("uses one canonical score with equal weight for the two component scores", () => {
    expect(migration).toContain("p_scoring_version = 'play-official-score-v4'");
    expect(migration).toContain("private.grade_daily_challenge_pre_combo(");
    expect(migration).toContain("'blind_rank_5',");
    expect(migration).toContain("'keep_4_cut_4',");
    expect(migration).toContain("(v_blind_rank.normalized_score + v_keep_cut.normalized_score) / 2.0");
    expect(migration).toContain("'combo_version', 'daily-rank-keep-combo-v1'");
  });
});
