import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310258_wheel_ufc_v1.sql", "utf8");
const seed = migration.match(/\$wheel_ufc_rows\$\n([\s\S]*?)\n\$wheel_ufc_rows\$\);/)?.[1] ?? "";
const rows = seed.split("\n").filter(Boolean).map((line) => {
  const parts = line.split("|");
  return {
    fighterId: parts[0]!,
    name: parts[1]!,
    division: parts[2]!,
    rank: parts[3] ? Number(parts[3]) : null,
    champion: parts[4] === "true",
    young: parts[7] === "true",
    veteran: parts[8] === "true",
    grade: Number(parts[9]),
  };
});

describe("Wheel of UFC launch balance", () => {
  it("locks the audited current-ability grading authority", () => {
    expect(migration).toContain("ufc-wheel-current-v3-anchor-audit-20261004");
    expect(migration).toContain("Meta UFC ranking controls wheel eligibility only; it is not converted directly into grade.");
    expect(migration).toContain("70-74 developmental/replacement level");
  });
  it("has a complete current Meta Top 15 plus champion in every men's division", () => {
    const divisions = [
      "Flyweight", "Bantamweight", "Featherweight", "Lightweight",
      "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight",
    ];
    for (const division of divisions) {
      const pool = rows.filter((row) => row.division === division);
      expect(pool.filter((row) => row.champion)).toHaveLength(1);
      expect(pool.filter((row) => row.rank !== null)).toHaveLength(15);
      expect(pool.filter((row) => row.rank === null && !row.champion).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("keeps non-elite spins capable of producing real steals without compressing the ladder", () => {
    const allGrades = rows.map((row) => row.grade).sort((a, b) => a - b);
    const topFive = rows.filter((row) => row.rank !== null && row.rank <= 5).map((row) => row.grade);
    const sixToFifteen = rows.filter((row) => row.rank !== null && row.rank >= 6).map((row) => row.grade);
    const unranked = rows.filter((row) => row.rank === null && !row.champion).map((row) => row.grade);

    expect(Math.min(...allGrades)).toBeLessThanOrEqual(70);
    expect(Math.max(...allGrades)).toBeGreaterThanOrEqual(99);
    expect(Math.max(...allGrades) - Math.min(...allGrades)).toBeGreaterThanOrEqual(29);
    expect(allGrades[Math.floor(allGrades.length * 0.25)]).toBeLessThan(80);
    expect(Math.min(...sixToFifteen)).toBeLessThanOrEqual(74);
    expect(Math.max(...unranked)).toBeGreaterThan(Math.min(...topFive));
    expect(Math.max(...unranked)).toBeGreaterThanOrEqual(93);
  });

  it("keeps the eight divisions on one common grading standard", () => {
    const divisionAverages = new Map<string, number>();
    for (const division of new Set(rows.map((row) => row.division))) {
      const grades = rows.filter((row) => row.division === division).map((row) => row.grade);
      divisionAverages.set(division, grades.reduce((sum, grade) => sum + grade, 0) / grades.length);
    }
    const averages = [...divisionAverages.values()];
    expect(Math.max(...averages) - Math.min(...averages)).toBeLessThanOrEqual(1.5);
  });

  it("keeps every audited 10-plus UFC-fight veteran in the Veteran pool", () => {
    const requiredVeterans = [
      "joshua-van",
      "manel-kape",
      "kyoji-horiguchi",
      "sumudaerji",
      "aiemann-zahabi",
      "charles-jourdain",
      "movsar-evloev",
      "lerone-murphy",
      "pat-sabatini",
      "youssef-zalal",
      "joanderson-brito",
      "melquizael-costa",
      "benoit-saint-denis",
      "ignacio-bahamondes",
      "sean-brady",
      "uros-medic",
      "khaos-williams",
      "randy-brown",
      "christian-leroy-duncan",
      "sergei-pavlovich",
      "waldo-cortes-acosta",
      "vitor-petrino",
    ];
    for (const fighterId of requiredVeterans) {
      expect(rows.find((row) => row.fighterId === fighterId)?.veteran, fighterId).toBe(true);
    }
  });

  it("keeps Young Gun and Veteran as real cross-division paths", () => {
    expect(new Set(rows.filter((row) => row.young).map((row) => row.division)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(rows.filter((row) => row.veteran).map((row) => row.division)).size).toBe(8);
  });
});
