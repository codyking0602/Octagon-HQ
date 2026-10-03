import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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
  const score = raw <= 95
    ? Math.max(0, 95 + (2.5 * (raw - 95)))
    : Math.min(100, raw);
  return Math.round(score * 10) / 10;
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

  it("resolves the complete curated population exactly once by team and position family", () => {
    const families = ["QB", "RB", "WR", "TE", "Front Seven", "Secondary", "Head Coach"] as const;
    const expected = new Set<string>();

    for (const [team, teamPriority] of Object.entries(priority.teams)) {
      for (const family of families) {
        for (const name of teamPriority[family] ?? []) {
          const key = `${team}|${family}|${normalized(name)}`;
          expect(grades.has(key), key).toBe(true);
          expect(expected.has(key), `duplicate curated identity ${key}`).toBe(false);
          expected.add(key);
        }
      }
    }

    expect(expected.size).toBe(626);
    expect(grades.size).toBe(626);
  });

  it("uses the approved 2.5x separation curve with a monotonic elite tail", () => {
    expect(finalGrade(88)).toBe(77.5);
    expect(finalGrade(89)).toBe(80);
    expect(finalGrade(90)).toBe(82.5);
    expect(finalGrade(92)).toBe(87.5);
    expect(finalGrade(94)).toBe(92.5);
    expect(finalGrade(95)).toBe(95);
    expect(finalGrade(96)).toBe(96);
    expect(finalGrade(99)).toBe(99);
    expect(finalGrade(100)).toBe(100);
  });

  it("keeps every plausible distinct seven-pick total visibly distinct at one decimal", () => {
    const seen = new Map<string, number>();
    for (let total = 7 * 70; total <= 7 * 100; total += 1) {
      const displayed = finalGrade(total / 7).toFixed(1);
      expect(seen.has(displayed), `duplicate display grade ${displayed} for totals ${seen.get(displayed)} and ${total}`).toBe(false);
      seen.set(displayed, total);
    }
  });

  it("uses exact hidden totals as the tie definition", () => {
    const winner = (leftTotal: number, rightTotal: number) => (
      leftTotal === rightTotal ? "tie" : leftTotal > rightTotal ? "left" : "right"
    );
    expect(winner(644, 644)).toBe("tie");
    expect(winner(644, 643)).toBe("left");
    expect(winner(643, 644)).toBe("right");
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
    expect(percentile(0.05)).toBeGreaterThanOrEqual(75);
    expect(percentile(0.05)).toBeLessThanOrEqual(85);
    expect(percentile(0.5)).toBeGreaterThanOrEqual(85);
    expect(percentile(0.5)).toBeLessThanOrEqual(92);
    expect(percentile(0.95)).toBeGreaterThanOrEqual(94);
    expect(percentile(0.95)).toBeLessThanOrEqual(100);
  });
});
