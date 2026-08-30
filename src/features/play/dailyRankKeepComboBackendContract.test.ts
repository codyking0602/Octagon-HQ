import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Daily Blind Rank + Keep/Cut backend contract", () => {
  const runtime = readFileSync(
    "supabase/functions/daily-challenge-runtime/index.ts",
    "utf8",
  );

  it("attaches Blind Rank to every official Keep 4/Cut 4 day independent of schedule version", () => {
    expect(runtime).toContain('publication = gameType === "keep_4_cut_4"\n      ? buildDailyComboSetup(day, scheduleVersion)');
    expect(runtime).not.toContain("DAILY_COMBO_SCHEDULE_VERSION");
    expect(runtime).toContain('const DAILY_COMBO_CONTENT_VERSION = "daily-rank-keep-combo-v1";');
  });

  it("leaves every other official daily game on the canonical single-game materializer", () => {
    expect(runtime).toContain(': buildOfficialDailySetup(gameType, day, scheduleVersion);');
  });
});
