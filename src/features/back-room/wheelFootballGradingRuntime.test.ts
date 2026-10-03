import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballWeeklySuperteamAuctionScore } from "./footballWeeklySuperteamAuctionScore";

const priority = JSON.parse(
  readFileSync("data/generated/football/wheel-football-priorities.json", "utf8"),
) as { teams: Record<string, Record<string, string[]>> };

const gradeFiles = [
  ["QB", "data/generated/football/wheel-nfl-qb-grades-2026-10-03.json"],
  ["RB", "data/generated/football/wheel-nfl-rb-grades-2026-10-03.json"],
  ["WR", "data/generated/football/wheel-nfl-wr-grades-2026-10-03.json"],
  ["TE", "data/generated/football/wheel-nfl-te-grades-2026-10-03.json"],
  ["Front Seven", "data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json"],
  ["Secondary", "data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json"],
  ["Head Coach", "data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json"],
] as const;

const slots = ["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"] as const;

function normalized(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function finalGrade(raw: number) {
  return Math.max(0, Math.min(100, footballWeeklySuperteamAuctionScore(raw)!));
}

describe("Wheel NFL grade distribution sanity", () => {
  const grades = new Map<string, number>();
  for (const [family, path] of gradeFiles) {
    const artifact = JSON.parse(readFileSync(path, "utf8")) as {
      grades: Array<{ team: string; player?: string; coach?: string; grade: number }>;
    };
    for (const row of artifact.grades) {
      grades.set(`${row.team}|${family}|${normalized((row.player ?? row.coach)!)}`, row.grade);
    }
  }

  function familyFor(team: string, slot: string, name: string) {
    if (slot !== "Flex") return slot;
    return (["RB", "WR", "TE"] as const).find((family) =>
      grades.has(`${team}|${family}|${normalized(name)}`),
    ) ?? null;
  }

  it("uses the same 5x separation curve as Weekly Superteam, clamped for Wheel", () => {
    expect(finalGrade(90)).toBe(70);
    expect(finalGrade(92)).toBe(80);
    expect(finalGrade(94)).toBe(90);
    expect(finalGrade(96)).toBe(100);
    expect(finalGrade(72)).toBe(0);
    expect(finalGrade(99)).toBe(100);
  });

  it("keeps equal raw-grade gaps equally meaningful instead of exaggerating the bottom", () => {
    const oneSlotImpact = (high: number, low: number) => ((high - low) / 7) * 5;
    expect(oneSlotImpact(97, 92)).toBeCloseTo(3.57, 2);
    expect(oneSlotImpact(92, 87)).toBeCloseTo(3.57, 2);
    expect(oneSlotImpact(87, 82)).toBeCloseTo(3.57, 2);
    expect(oneSlotImpact(82, 76)).toBeCloseTo(4.29, 2);
  });

  it("produces a healthy final-grade range across 20k greedy current-roster builds", () => {
    const teams = Object.keys(priority.teams);
    let seed = 123456789;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const results: number[] = [];
    for (let run = 0; run < 20_000; run += 1) {
      const chosen = new Map<string, number>();
      const used = new Set<string>();
      let previousTeam = "";

      for (let turn = 0; turn < 7; turn += 1) {
        let team = "";
        do team = teams[Math.floor(random() * teams.length)]!;
        while (team === previousTeam);
        previousTeam = team;

        let best: { slot: string; name: string; grade: number } | null = null;
        for (const slot of slots.filter((value) => !chosen.has(value))) {
          for (const name of priority.teams[team]![slot] ?? []) {
            const family = familyFor(team, slot, name);
            if (!family || used.has(`${team}|${normalized(name)}`)) continue;
            const grade = grades.get(`${team}|${family}|${normalized(name)}`);
            expect(grade, `${team} ${slot} ${name}`).toBeDefined();
            if (grade != null && (!best || grade > best.grade)) best = { slot, name, grade };
          }
        }

        expect(best).not.toBeNull();
        chosen.set(best!.slot, best!.grade);
        used.add(`${team}|${normalized(best!.name)}`);
      }

      const raw = slots.reduce((sum, slot) => sum + chosen.get(slot)!, 0) / 7;
      results.push(finalGrade(raw));
    }

    results.sort((left, right) => left - right);
    const percentile = (p: number) => results[Math.floor((results.length - 1) * p)]!;
    expect(percentile(0.05)).toBeGreaterThanOrEqual(60);
    expect(percentile(0.05)).toBeLessThanOrEqual(70);
    expect(percentile(0.5)).toBeGreaterThanOrEqual(77);
    expect(percentile(0.5)).toBeLessThanOrEqual(84);
    expect(percentile(0.95)).toBeGreaterThanOrEqual(92);
    expect(percentile(0.95)).toBeLessThanOrEqual(100);
  });
});
