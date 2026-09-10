import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtimeSource = readFileSync(
  "supabase/functions/daily-challenge-runtime/index.ts",
  "utf8",
);
const rerollMigration = readFileSync(
  "supabase/migrations/202612310069_reroll_august_30_rank_keep_combo.sql",
  "utf8",
);

describe("Daily Challenge Blind Rank + Keep/Cut contract", () => {
  it("attaches Blind Rank to Keep/Cut without pinning the combo to a schedule version", () => {
    expect(runtimeSource).not.toContain("DAILY_COMBO_SCHEDULE_VERSION");
    expect(runtimeSource).toContain(
      'publication = gameType === "keep_4_cut_4"\n      ? buildDailyComboSetup(day, scheduleVersion)\n      : buildOfficialDailySetup(gameType, day, scheduleVersion);',
    );
  });

  it("rerolls only the August 30 Keep/Cut challenge through a new schedule identity", () => {
    expect(rerollMigration).toContain("v_target_day constant date := date '2026-08-30'");
    expect(rerollMigration).toContain("v_source_version constant text := 'play-rotation-v5'");
    expect(rerollMigration).toContain("v_replacement_version constant text := 'play-rotation-v6'");
    expect(rerollMigration).toContain("v_expected_game is distinct from 'keep_4_cut_4'");
    expect(rerollMigration).toContain("v_central_today <> v_target_day");
    expect(rerollMigration).toContain("source.anchor_day");
    expect(rerollMigration).toContain("delete from private.daily_challenge_progress");
    expect(rerollMigration).toContain("delete from private.daily_challenge_attempts");
    expect(rerollMigration).toContain("delete from private.daily_challenges");
  });
});
