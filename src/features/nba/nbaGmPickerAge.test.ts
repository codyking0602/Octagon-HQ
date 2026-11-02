import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_PICKER_VERIFIED_BIRTHDATES, nbaGmPickerAge } from "./nbaGmPickerAge";

const page = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const fixtures = readFileSync("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql", "utf8");
const catalogSql = readFileSync("supabase/migrations/202612310908_nba_gm_private_v4_new_starts.sql", "utf8");

describe("NBA GM player-picker NFL age parity", () => {
  it("shows POSITION · AGE N on the shared candidate card for draft, trade and free agency", () => {
    expect(page).toContain('import { nbaGmPickerAge } from "./nbaGmPickerAge"');
    expect(page).toContain("const age=nbaGmPickerAge(player);");
    expect(page).toContain('player.positions.join(" / ")} · AGE {age??"—"} ·');
    expect(page).toContain("players.map(player=><PlayerCard");
    expect(page).toContain("candidates.map(player=><PlayerCard");
    expect(page).toContain("emergency.map(player=><PlayerCard");
  });

  it("prioritizes authoritative backend age over any client fallback", () => {
    expect(nbaGmPickerAge({id:"nba-gm-draft-kyrieirving",ageAtStart:35})).toBe(35);
    expect(nbaGmPickerAge({id:"any-other-player",ageAtStart:27})).toBe(27);
    expect(catalogSql).toContain("'ageAtStart',case when p.verified_birth_date is null then null else");
  });

  it("covers every one of the 29 verified-but-unfilled player birthdates as of Oct 30 2026", () => {
    const entries = Object.entries(NBA_GM_PICKER_VERIFIED_BIRTHDATES);
    expect(entries).toHaveLength(29);
    expect(new Set(entries.map(([id])=>id)).size).toBe(29);
    for (const [id,dob] of entries) {
      expect(fixtures).toContain(id);
      expect(dob).toMatch(/^\d{4}-\d\d-\d\d$/);
      expect(new Date(dob+"T00:00:00Z").toISOString().slice(0,10)).toBe(dob);
      const age = nbaGmPickerAge({ id, ageAtStart: null });
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThanOrEqual(50);
    }
    expect(nbaGmPickerAge({id:"nba-gm-draft-kyrieirving"})).toBe(34);
    expect(nbaGmPickerAge({id:"nba-gm-draft-damianlillard"})).toBe(36);
    expect(nbaGmPickerAge({id:"nba-gm-draft-treylyles"})).toBe(30);
    expect(nbaGmPickerAge({id:"nba-gm-draft-thomassorber"})).toBe(20);
    expect(nbaGmPickerAge({id:"nba-gm-draft-nateament"})).toBe(19);
    expect(nbaGmPickerAge({id:"nba-gm-draft-labaronphilon"})).toBe(20);
  });

  it("never invents an age when both server and verified fallback are missing", () => {
    expect(nbaGmPickerAge({id:"unverified-rookie",ageAtStart:null})).toBeNull();
    expect(nbaGmPickerAge({id:"unverified-rookie"})).toBeNull();
  });
});
