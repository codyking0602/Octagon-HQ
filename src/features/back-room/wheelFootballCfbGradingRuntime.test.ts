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
    expect(wheelFootballPoolTeams("AP_TOP_25")).toHaveLength(25);
    expect(wheelFootballPoolTeams("SEC")).toHaveLength(16);
    expect(wheelFootballPoolTeams("BIG_TEN")).toHaveLength(18);
    expect(wheelFootballPoolTeams("BIG_12")).toHaveLength(16);
    expect(wheelFootballPoolTeams("ACC")).toHaveLength(17);
    expect(wheelFootballPoolTeams("NFL")).toHaveLength(32);
  });

  it("keeps simulated CFB Superteam scores healthy across every locked pool", () => {
    const slots = ["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"] as const;
    type Slot = (typeof slots)[number];
    const finalGrade = (raw: number) => {
      const score = raw <= 95
        ? Math.max(0, 95 + (2.5 * (raw - 95)))
        : Math.min(100, raw);
      return Math.round(score * 10) / 10;
    };

    const options = new Map<string, Readonly<Record<Slot, readonly { nameKey: string; grade: number }[]>>>();
    for (const [schoolId, team] of Object.entries(wheelFootballCfbPriority)) {
      const schoolKey = normalized(team.school);
      const bySlot = Object.fromEntries(slots.map((slot) => {
        const rows = (team[slot] ?? []).map((name) => {
          const nameKey = normalized(name);
          const family = slot === "Flex"
            ? (["RB", "WR", "TE"] as const).find((candidate) =>
                grades.has(`${schoolKey}|${candidate}|${nameKey}`),
              )
            : slot;
          if (!family) throw new Error(`Missing Flex family for ${team.school} ${name}`);
          const grade = grades.get(`${schoolKey}|${family}|${nameKey}`);
          if (grade == null) throw new Error(`Missing grade for ${team.school} ${slot} ${name}`);
          return { nameKey, grade };
        });
        return [slot, rows];
      })) as unknown as Record<Slot, readonly { nameKey: string; grade: number }[]>;
      options.set(schoolId, bySlot);
    }

    const simulate = (schoolIds: readonly string[]) => {
      let seed = 123456789;
      const random = () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const results = new Array<number>(3_000);

      for (let run = 0; run < results.length; run += 1) {
        const chosen = new Map<Slot, number>();
        const used = new Set<string>();
        let previousSchool = "";

        for (let turn = 0; turn < 7; turn += 1) {
          let schoolId = "";
          do schoolId = schoolIds[Math.floor(random() * schoolIds.length)]!;
          while (schoolId === previousSchool);
          previousSchool = schoolId;

          const teamOptions = options.get(schoolId)!;
          let best: { slot: Slot; nameKey: string; grade: number } | null = null;
          for (const slot of slots) {
            if (chosen.has(slot)) continue;
            for (const candidate of teamOptions[slot]) {
              const identity = `${schoolId}|${candidate.nameKey}`;
              if (used.has(identity)) continue;
              if (!best || candidate.grade > best.grade) best = { slot, ...candidate };
            }
          }

          if (!best) throw new Error(`Simulation found no valid pick for ${schoolId} on turn ${turn + 1}`);
          chosen.set(best.slot, best.grade);
          used.add(`${schoolId}|${best.nameKey}`);
        }

        let total = 0;
        for (const slot of slots) total += chosen.get(slot)!;
        results[run] = finalGrade(total / 7);
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
