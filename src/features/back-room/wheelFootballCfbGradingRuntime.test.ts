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

  it("keeps simulated CFB Superteam scores healthy across every locked pool", () => {
    const slots = ["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"] as const;
    const familyFor = (school: string, slot: string, name: string) => {
      if (slot !== "Flex") return slot;
      return (["RB", "WR", "TE"] as const).find((family) =>
        grades.has(`${normalized(school)}|${family}|${normalized(name)}`),
      ) ?? null;
    };
    const finalGrade = (raw: number) => {
      const score = raw <= 95
        ? Math.max(0, 95 + (2.5 * (raw - 95)))
        : Math.min(100, raw);
      return Math.round(score * 10) / 10;
    };
    const simulate = (schoolIds: readonly string[]) => {
      let seed = 123456789;
      const random = () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const results: number[] = [];

      for (let run = 0; run < 10_000; run += 1) {
        const chosen = new Map<string, number>();
        const used = new Set<string>();
        let previousSchool = "";

        for (let turn = 0; turn < 7; turn += 1) {
          let schoolId = "";
          do schoolId = schoolIds[Math.floor(random() * schoolIds.length)]!;
          while (schoolId === previousSchool);
          previousSchool = schoolId;

          const team = wheelFootballCfbPriority[schoolId]!;
          let best: { slot: string; name: string; grade: number } | null = null;
          for (const slot of slots.filter((value) => !chosen.has(value))) {
            for (const name of team[slot] ?? []) {
              const family = familyFor(team.school, slot, name);
              const identity = `${schoolId}|${normalized(name)}`;
              if (!family || used.has(identity)) continue;
              const grade = grades.get(`${normalized(team.school)}|${family}|${normalized(name)}`);
              expect(grade, `${team.school} ${slot} ${name}`).toBeDefined();
              if (grade != null && (!best || grade > best.grade)) best = { slot, name, grade };
            }
          }

          expect(best).not.toBeNull();
          chosen.set(best!.slot, best!.grade);
          used.add(`${schoolId}|${normalized(best!.name)}`);
        }

        const raw = slots.reduce((sum, slot) => sum + chosen.get(slot)!, 0) / 7;
        results.push(finalGrade(raw));
      }

      results.sort((left, right) => left - right);
      const percentile = (p: number) => results[Math.floor((results.length - 1) * p)]!;
      return { p05: percentile(0.05), p50: percentile(0.5), p95: percentile(0.95) };
    };

    const allIds = Object.keys(wheelFootballCfbPriority);
    const byConference = (conference: string) => allIds.filter((id) =>
      wheelFootballCfbPriority[id]!.conference === conference
    );

    const national = simulate(allIds);
    const sec = simulate(byConference("SEC"));
    const bigTen = simulate(byConference("Big Ten"));
    const big12 = simulate(byConference("Big 12"));
    const acc = simulate(byConference("ACC"));

    expect(national.p05).toBeGreaterThanOrEqual(72);
    expect(national.p50).toBeGreaterThanOrEqual(80);
    expect(national.p50).toBeLessThanOrEqual(84);
    expect(national.p95).toBeGreaterThanOrEqual(88);

    expect(sec.p50).toBeGreaterThanOrEqual(84);
    expect(sec.p50).toBeLessThanOrEqual(89);
    expect(bigTen.p50).toBeGreaterThanOrEqual(81);
    expect(bigTen.p50).toBeLessThanOrEqual(85);
    expect(big12.p50).toBeGreaterThanOrEqual(75);
    expect(big12.p50).toBeLessThanOrEqual(79);
    expect(acc.p50).toBeGreaterThanOrEqual(77);
    expect(acc.p50).toBeLessThanOrEqual(81);

    for (const result of [national, sec, bigTen, big12, acc]) {
      expect(result.p05).toBeGreaterThanOrEqual(65);
      expect(result.p95).toBeLessThanOrEqual(100);
    }
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
