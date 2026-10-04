import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  loadWheelFootballRoster,
  wheelFootballPoolTeams,
  wheelFootballShortlist,
} from "./wheelFootballModel";
import { wheelFootballCfbPriority } from "./wheelFootballCfbPriority";

const gradeFiles = [
  ["QB", "data/generated/football/wheel-cfb-qb-grades-2026-10-03.json"],
  ["RB", "data/generated/football/wheel-cfb-rb-grades-2026-10-03.json"],
  ["WR", "data/generated/football/wheel-cfb-wr-grades-2026-10-03.json"],
  ["TE", "data/generated/football/wheel-cfb-te-grades-2026-10-03.json"],
  ["Front Seven", "data/generated/football/wheel-cfb-front-seven-grades-2026-10-03.json"],
  ["Secondary", "data/generated/football/wheel-cfb-secondary-grades-2026-10-03.json"],
  ["Head Coach", "data/generated/football/wheel-cfb-head-coach-grades-2026-10-03.json"],
] as const;

function normalized(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

describe("CFB Wheel runtime authority", () => {
  const grades = new Map<string, number>();

  for (const [family, path] of gradeFiles) {
    const artifact = JSON.parse(readFileSync(path, "utf8")) as {
      grades: Array<{ school: string; player?: string; coach?: string; grade: number }>;
    };
    for (const row of artifact.grades) {
      const name = row.player ?? row.coach;
      if (!name) throw new Error(`Missing CFB grade identity in ${path}`);
      const key = `${normalized(row.school)}|${family}|${normalized(name)}`;
      expect(grades.has(key), key).toBe(false);
      grades.set(key, row.grade);
    }
  }

  it("covers all 1,335 audited CFB grade identities exactly once", () => {
    expect(grades.size).toBe(1335);

    const families = ["QB", "RB", "WR", "TE", "Front Seven", "Secondary", "Head Coach"] as const;
    for (const team of Object.values(wheelFootballCfbPriority)) {
      for (const family of families) {
        for (const name of team[family]) {
          const key = `${normalized(team.school)}|${family}|${normalized(name)}`;
          expect(grades.has(key), key).toBe(true);
        }
      }

      for (const name of team.Flex) {
        const found = (["RB", "WR", "TE"] as const).filter((family) =>
          grades.has(`${normalized(team.school)}|${family}|${normalized(name)}`),
        );
        expect(found.length, `${team.school} Flex ${name}`).toBe(1);
      }
    }
  });

  it("locks the approved CFB wheel pool sizes without artificial pairings", () => {
    expect(wheelFootballPoolTeams("CFB")).toHaveLength(68);
    expect(wheelFootballPoolTeams("SEC")).toHaveLength(16);
    expect(wheelFootballPoolTeams("BIG_TEN")).toHaveLength(18);
    expect(wheelFootballPoolTeams("BIG_12")).toHaveLength(16);
    expect(wheelFootballPoolTeams("ACC")).toHaveLength(17);
    expect(wheelFootballPoolTeams("NFL")).toHaveLength(32);
  });

  it("builds every audited school option even when ESPN omits a roster identity", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ athletes: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;

    const candidates = await loadWheelFootballRoster("alabama", fetcher);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/football/cfb-roster?team=333",
      { headers: { Accept: "application/json" } },
    );

    expect(wheelFootballShortlist(candidates, "QB", "alabama").map((candidate) => candidate.name))
      .toEqual(wheelFootballCfbPriority.alabama.QB);
    expect(wheelFootballShortlist(candidates, "Flex", "alabama").map((candidate) => candidate.name))
      .toEqual(wheelFootballCfbPriority.alabama.Flex);
    expect(wheelFootballShortlist(candidates, "Front Seven", "alabama").map((candidate) => candidate.name))
      .toEqual(wheelFootballCfbPriority.alabama["Front Seven"]);
    expect(wheelFootballShortlist(candidates, "Secondary", "alabama").map((candidate) => candidate.name))
      .toEqual(wheelFootballCfbPriority.alabama.Secondary);
    expect(wheelFootballShortlist(candidates, "Head Coach", "alabama").map((candidate) => candidate.name))
      .toEqual(["Kalen DeBoer"]);
  });
});
