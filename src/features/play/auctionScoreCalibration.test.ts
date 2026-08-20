import { describe, expect, it } from "vitest";
import calibrationMigration from "../../../supabase/migrations/202612310037_auction_score_calibration.sql?raw";

const calibratedFloors = [
  ["knockout-artists", 72],
  ["fighter-performances", 70],
  ["greatest-ufc-card", 70],
  ["finishes", 70],
  ["wars", 70],
  ["rivalries", 72],
  ["iconic-moments", 72],
  ["nicknames", 72],
] as const;

const preservedFamilies = [
  "ultimate-fighter",
  "jon-jones-performances",
  "conor-mcgregor-performances",
  "charles-oliveira-performances",
  "strikers",
  "grapplers",
] as const;

describe("Auction score calibration v6", () => {
  it("rotates v5 to v6 while preserving the canonical grading version", () => {
    expect(calibrationMigration).toContain("'ufc-auction-2026-08-v6'");
    expect(calibrationMigration).toContain("'ufc-private-grader-2026-08-v2'");
    expect(calibrationMigration).toContain("where source.content_version = 'ufc-auction-2026-08-v5'");
  });

  it("uses category-specific floors only for the audited compressed families", () => {
    for (const [mode, floor] of calibratedFloors) {
      expect(calibrationMigration).toContain(`('${mode}', ${floor}::numeric)`);
    }
    for (const mode of preservedFamilies) {
      expect(calibrationMigration).toContain(`v6.mode_id = '${mode}'`);
    }
  });

  it("locks the known Wars compression while preserving healthy Strikers and Grapplers", () => {
    expect(calibrationMigration).toContain("v_wars_min <> 89 or v_wars_max <> 100");
    expect(calibrationMigration).toContain("v_strikers_min <> 77 or v_strikers_max <> 99");
    expect(calibrationMigration).toContain("v_grapplers_min <> 78 or v_grapplers_max <> 99");
  });

  it("widens weak-to-elite separation without adding bankroll or value scoring", () => {
    expect(calibrationMigration).toContain("(v_new_max - v_new_min) < 27");
    expect(calibrationMigration).not.toContain("budget efficiency");
    expect(calibrationMigration).not.toContain("leftover bankroll");
    expect(calibrationMigration).not.toContain("value bonus");
  });

  it("leaves authoritative final-score rounding for PR4", () => {
    expect(calibrationMigration).not.toContain("challenger_final_score = round");
    expect(calibrationMigration).not.toContain("recipient_final_score = round");
    expect(calibrationMigration).not.toContain("round(avg(score_value), 0)");
  });

  it("keeps the six-round, three-selection, thirty-dollar standard format and Ultimate Fighter special", () => {
    expect(calibrationMigration).toContain("then 6");
    expect(calibrationMigration).toContain("then 3");
    expect(calibrationMigration).toContain("then 30");
    expect(calibrationMigration).toContain("when mode_id = 'ultimate-fighter' then 10");
    expect(calibrationMigration).toContain("when mode_id = 'ultimate-fighter' then 5");
    expect(calibrationMigration).toContain("when mode_id = 'ultimate-fighter' then 50");
  });
});