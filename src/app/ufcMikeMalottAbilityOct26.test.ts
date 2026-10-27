import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import evidence from "../../data/curated/ufc/wheel-malott-current-ability-2026-10-26.json";

const sql = readFileSync("supabase/migrations/202612310491_ufc_malott_current_ability_grade.sql","utf8");

describe("verified UFC Oct 26 Mike Malott current ability authority", () => {
  it("moves only Mike Malott 80.8 -> 86 with original identity/rank and peer calibration", () => {
    expect(evidence.oldGrade).toBe(80.8);
    expect(evidence.newGrade).toBe(86);
    expect(evidence.gradeDelta).toBe(5.2);
    expect(evidence.sources.length).toBeGreaterThanOrEqual(2);
    expect(sql).toContain("fighter_id='mike-malott'");
    expect(sql).toContain("hidden_grade=80.80");
    expect(sql).toContain("hidden_grade=86.00");
    expect(sql).toContain("hidden_grade=84.50");
    expect(sql).toContain("ufc-wheel-malott-ability-2026-10-26-v1");
  });
  it("leaves original ranked population, historic score snapshots and fight results untouched", () => {
    expect(sql).toContain("where active) <> 168");
    expect(sql).toContain("ranking between 1 and 15) <> 120");
    expect(sql).toContain("active and is_champion) <> 8");
    expect(sql).not.toMatch(/(?:update|delete\s+from)\s+private\.wheel_ufc_picks\b/i);
    expect(sql).not.toMatch(/set\s+(?:ranking|active|is_champion)\s*=/i);
  });
});
