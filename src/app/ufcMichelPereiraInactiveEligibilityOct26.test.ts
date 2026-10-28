import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("UFC two confirmed departed fighters eligibility", () => {
  const sql = readFileSync("supabase/migrations/202612310416_ufc_michel_pereira_inactive_eligibility.sql","utf8");
  it("changes only the future eligibility of verified removed unranked fighter", () => {
    expect(sql).toContain("set active=false");
    expect(sql).toContain("fighter_id='michel-pereira'");
    expect(sql).toContain("ranking is null and hidden_grade=74");
    expect(sql).toContain("active) <> 168");
    expect(sql).toContain("fighter_id='rinat-fakhretdinov'");
    expect(sql).toContain("hidden_grade=78.50");
    expect(sql).toContain("ranking between 1 and 15) <> 120");
    expect(sql).toContain("active and is_champion) <> 8");
    expect(sql).not.toMatch(/set\s+hidden_grade\s*=/i);
    expect(sql).not.toMatch(/delete\s+from\s+private\.wheel_ufc_fighters/i);
  });
});
