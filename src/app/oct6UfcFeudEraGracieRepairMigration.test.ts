import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310270_oct6_ufc_feud_era_gracie_repair.sql",
  "utf8",
);

describe("Oct. 6 UFC Sports Feud era-board repair", () => {
  it("publishes Royce Gracie as the top era-defining answer without renumbering existing fighters", () => {
    expect(migration).toContain("'ufc-main-01-2:v12','display_name','Royce Gracie'");
    expect(migration).toContain("jsonb_build_object('points',10,'entityId','ufc-main-01-2:v12')");
    expect(migration).toContain("jsonb_build_object('points',8,'entityId','ufc-main-01-2:a8')");
    expect(migration).toContain("jsonb_build_object('points',5,'entityId','ufc-main-01-2:a3')");
    expect(migration).toContain("jsonb_build_object('points',4,'entityId','ufc-main-01-2:v8')");
  });

  it("repairs Cody's two Gracie strikes into a 27-point board and 86 final score", () => {
    expect(migration).toContain("jsonb_build_array('royce gracie','gracie')");
    expect(migration).toContain("'corrected_first_board_points',27");
    expect(migration).toContain("'corrected_first_board_strikes',0");
    expect(migration).toContain("normalized_score = 86");
    expect(migration).toContain("'main_points',56");
  });
});
