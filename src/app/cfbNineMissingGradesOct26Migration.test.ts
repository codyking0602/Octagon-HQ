import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("supabase/migrations/202612310414_cfb_nine_missing_current_ability_grades.sql","utf8");
const evidence = JSON.parse(readFileSync("data/curated/football/cfb/wheel-cfb-nine-new-current-ability-grades-2026-10-26.json","utf8"));
const canonical = JSON.parse(readFileSync("data/generated/football/cfb/wheel-football-current-priorities-2026.json","utf8"));
describe("nine CFB previously missing playable grades", () => {
  it("inserts nine source-reviewed people already in their correct current population", () => {
    expect(evidence.players).toHaveLength(9);
    expect(new Set(evidence.players.map((x: any) => x.school+"|"+x.curatedFamily+"|"+x.displayName)).size).toBe(9);
    for(const player of evidence.players) {
      expect(player.curatedFamily).toBe(player.proposedFamily);
      expect(canonical.teams[player.school][player.curatedFamily]).toContain(player.displayName);
      expect(migration).toContain(player.displayName);
      expect(migration).toContain(String(player.proposedHiddenGrade));
      expect(player.primarySources.length).toBeGreaterThan(0);
    }
  });
  it("retains owner-held family disputes and fails closed on duplicate authority", () => {
    expect(evidence.excludedRoleDecisions).toEqual(["CJ Jimcoily","John Curry","Luke Mergott","Braylan Lovelace"]);
    expect(migration).toContain("v_existing <> 0");
    expect(migration).toContain("date '2026-10-26'");
    expect(migration).not.toContain("on conflict");
    expect(migration).not.toContain("update private.wheel_football_grade_authority");
  });
});
