import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  WHEEL_FOOTBALL_AP_TOP_25,
  WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE,
} from "../features/back-room/wheelFootballApTop25";

const rankingSql = readFileSync("supabase/migrations/202612310304_wheel_ufc_all_rankings_oct10.sql", "utf8");
const apSql = readFileSync("supabase/migrations/202612310303_wheel_cfb_ap_oct11_2026.sql", "utf8");

describe("October 14 Wheel current ranking snapshot", () => {
  it("keeps the Oct 11 AP poll synchronized with the versioned backend rows", () => {
    expect(WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE).toBe("2026-10-11");
    const rows = [...apSql.matchAll(/\(2026, date '2026-10-11', (\d+), '([^']+)'/g)]
      .map((match) => ({ rank: Number(match[1]), schoolId: match[2] }));
    expect(rows).toEqual(WHEEL_FOOTBALL_AP_TOP_25);
    expect(rows).toHaveLength(25);
  });

  it("locks the standard UFC All Rankings to one champ and #1-15 per men's division", () => {
    const rows = [...rankingSql.matchAll(/\('([^']+)','([^']+)',(null|\d+),(true|false)\)/g)]
      .map((match) => ({
        division: match[1],
        fighter: match[2],
        rank: match[3] === "null" ? null : Number(match[3]),
        champion: match[4] === "true",
      }));
    expect(rows).toHaveLength(128);
    const divisions = new Set(rows.map((row) => row.division));
    expect(divisions.size).toBe(8);
    for (const division of divisions) {
      const current = rows.filter((row) => row.division === division);
      expect(current.filter((row) => row.champion)).toHaveLength(1);
      expect(current.filter((row) => row.rank != null).map((row) => row.rank).sort((a, b) => a! - b!))
        .toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
      expect(new Set(current.map((row) => row.fighter)).size).toBe(16);
    }
    expect(rows).toContainEqual({ division: "Bantamweight", fighter: "payton-talbott", rank: 7, champion: false });
    expect(rows).toContainEqual({ division: "Light Heavyweight", fighter: "muhammad-saidov", rank: 13, champion: false });
    expect(rows).toContainEqual({ division: "Light Heavyweight", fighter: "reinier-de-ridder", rank: 14, champion: false });
    expect(rows).toContainEqual({ division: "Heavyweight", fighter: "aleksandar-rakic", rank: 14, champion: false });
  });

  it("does not use Meta rankings as Wheel authority or alter historical categories/grades", () => {
    expect(rankingSql).toContain("ranking_source = 'ufc-all-rankings'");
    expect(rankingSql).toContain("rankings_as_of = date '2026-10-10'");
    expect(rankingSql).toContain("private.wheel_ufc_ranking_label");
    expect(rankingSql).not.toMatch(/(?:set|,)\s*(?:spin_category|hidden_grade|grade_version)\s*=/i);
  });
});
