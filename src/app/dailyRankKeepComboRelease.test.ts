import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync(
  "supabase/functions/daily-challenge-runtime/index.ts",
  "utf8",
);
const dailyPage = readFileSync(
  "src/features/play/OfficialTodayChallengePage.tsx",
  "utf8",
);
const blindRankResult = readFileSync(
  "src/features/play/OfficialBlindRankResult.tsx",
  "utf8",
);
const publicationMigration = readFileSync(
  "supabase/migrations/202612310034_allow_daily_rank_keep_combo_publication.sql",
  "utf8",
);
const rotationMigration = readFileSync(
  "supabase/migrations/202612310035_daily_rank_keep_combo_rotation.sql",
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

  it("reveals the completed Blind Rank board only after the combined attempt is final", () => {
    expect(runtime).toContain('const publicState = attempt && stage === "keep_4_cut_4"');
    expect(runtime).toContain("combo_blind_rank_result: requiredRecord(");
    expect(runtime).toContain("context.publicState.blind_rank_5");
    expect(runtime).toContain("public_state: publicState");
  });

  it("renders both component result experiences with their own scores", () => {
    expect(dailyPage).toContain("<OfficialBlindRankComboResult projection={runtime.projection} />");
    expect(dailyPage).toContain("normalizedScore: keepCutComponentScore");
    expect(blindRankResult).toContain('title="YOUR FINAL RANKING"');
    expect(blindRankResult).toContain('title="OCTAGON HQ ORDER"');
    expect(blindRankResult).toContain("dailyRankKeepComboComponentScore(projection, \"blind_rank\")");
  });

  it("admits the combo scoring version through the canonical publication RPC", () => {
    expect(publicationMigration).toContain("p_game_type = 'keep_4_cut_4'");
    expect(publicationMigration).toContain("'play-official-score-v4'");
    expect(publicationMigration).toContain("create or replace function public.publish_daily_challenge_setup(");
  });

  it("locks the approved weights and the August 20 same-day replacement", () => {
    expect(rotationMigration).toContain("v_target_day constant date := date '2026-08-20'");
    expect(rotationMigration).toContain("v_source_version constant text := 'play-rotation-v3'");
    expect(rotationMigration).toContain("v_replacement_version constant text := 'play-rotation-v4'");
    expect(rotationMigration).toContain("if v_central_today <> v_target_day then");
    expect(rotationMigration).toContain("disable trigger daily_challenge_attempts_immutable");
    expect(rotationMigration).toContain("where progress.daily_challenge_id = v_existing_daily_id");
    expect(rotationMigration).toContain("where attempt.daily_challenge_id = v_existing_daily_id");
    expect(rotationMigration).toContain("where daily.id = v_existing_daily_id");
  });

  it("uses one canonical score with equal weight for the two component scores", () => {
    expect(rotationMigration).toContain("p_scoring_version = 'play-official-score-v4'");
    expect(rotationMigration).toContain("private.grade_daily_challenge_pre_combo(");
    expect(rotationMigration).toContain("'blind_rank_5',");
    expect(rotationMigration).toContain("'keep_4_cut_4',");
    expect(rotationMigration).toContain("(v_blind_rank.normalized_score + v_keep_cut.normalized_score) / 2.0");
    expect(rotationMigration).toContain("'combo_version', 'daily-rank-keep-combo-v1'");
  });
});
