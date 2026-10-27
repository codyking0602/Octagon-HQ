import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import revision from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json";
import originalQb from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import profiles from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
import { FOOTBALL_GM_PLAYER_POOL, footballGmPlayerById } from "./footballGmEngine";

const migration = readFileSync("supabase/migrations/202612310604_nfl_oct27_qb_current_ability_batch.sql", "utf8");
const expected = [
  { team: "ATL", key: "michaelpenixjr", name: "Michael Penix Jr.", oldGrade: 78, newGrade: 83, playerId: "ATL|QB|michaelpenix" },
  { team: "DET", key: "jaredgoff", name: "Jared Goff", oldGrade: 89, newGrade: 92, playerId: "DET|QB|jaredgoff" },
  { team: "JAX", key: "trevorlawrence", name: "Trevor Lawrence", oldGrade: 87, newGrade: 90, playerId: "JAX|QB|trevorlawrence" },
  { team: "LV", key: "kirkcousins", name: "Kirk Cousins", oldGrade: 80, newGrade: 85, playerId: "LV|QB|kirkcousins" },
  { team: "NYJ", key: "genosmith", name: "Geno Smith", oldGrade: 82, newGrade: 85, playerId: "NYJ|QB|genosmith" },
] as const;

describe("NFL-only five-QB current-ability correction batch (2026 Week 7)", () => {
  it("records a sourced, identity-bound peer regrade for each of five existing QB subjects", () => {
    expect(revision.sport).toBe("NFL");
    expect(revision.changes).toHaveLength(expected.length);
    expect(new Set(revision.changes.map(c => c.team + "|" + c.family + "|" + c.player)).size).toBe(expected.length);
    for (const item of expected) {
      const change = revision.changes.find(c => c.team === item.team && c.player === item.name);
      expect(change).toMatchObject({ family: "QB", oldGrade: item.oldGrade, newGrade: item.newGrade, priorVersion: "nfl-wheel-qb-grades-2026-10-03-v1" });
      expect(change?.sourceUrls.length).toBeGreaterThanOrEqual(2);
      expect(change?.reason.length).toBeGreaterThan(110);
      expect(originalQb.grades.find(c => c.team === item.team && c.player === item.name)?.grade).toBe(item.oldGrade);
      expect(migration).toContain(`('${item.team}','${item.key}','${item.name}',${item.oldGrade},${item.newGrade})`);
      expect(migration).toContain(`('${item.team}','QB','${item.key}','${item.name}',${item.newGrade},date '2026-10-27'`);
    }
  });

  it("flows approved current Wheel grades into newly generated GM candidates without changing identities or development profiles", () => {
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(profiles.profiles).toHaveLength(594);
    for (const item of expected) {
      expect(footballGmPlayerById(item.playerId)).toEqual(expect.objectContaining({team:item.team,position:"QB",currentGrade:item.newGrade}));
      expect(profiles.profiles.find(p => p.id === item.playerId)).toBeDefined();
    }
    expect(migration).toContain("insert into private.wheel_football_grade_authority");
    expect(migration).toContain("nfl-wheel-qb-week7-current-ability-2026-10-27-v1");
    expect(migration).toContain("date '2026-10-03'");
    expect(migration).not.toMatch(/\b(?:update|delete\s+from|truncate)\s+private\.wheel_football_(?:grade_authority|picks)\b/i);
    expect(migration).not.toMatch(/\b(?:insert\s+into|update|delete\s+from)\s+private\.football_gm_/i);
  });
});
