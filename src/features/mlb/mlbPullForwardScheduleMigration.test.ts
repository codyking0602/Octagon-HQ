import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310204_mlb_pull_forward_schedule_and_freeze_wc_odds.sql",
  "utf8",
);

describe("MLB pulled-forward postseason cadence", () => {
  it("moves all ten challenge slots forward and leaves October 27 open", () => {
    for (const [slot, date] of [
      [1, "2026-09-27"],
      [2, "2026-09-29"],
      [3, "2026-10-01"],
      [4, "2026-10-03"],
      [5, "2026-10-06"],
      [6, "2026-10-09"],
      [7, "2026-10-12"],
      [8, "2026-10-15"],
      [9, "2026-10-18"],
      [10, "2026-10-23"],
    ] as const) {
      expect(migration).toContain(`(${slot}::smallint`);
      expect(migration).toContain(`date '${date}'`);
    }
    expect(migration).not.toContain("date '2026-10-27'");
  });

  it("freezes one coherent DraftKings opening series board", () => {
    expect(migration).toContain("DraftKings opening · frozen Sep 27");
    expect(migration).toContain("('nl-wc-1'::text,  105, -125)");
    expect(migration).toContain("('al-wc-1'::text,  125, -145)");
    expect(migration).toContain("('al-wc-2'::text,  140, -170)");
    expect(migration).toContain("('nl-wc-2'::text,  100, -120)");
  });
});
