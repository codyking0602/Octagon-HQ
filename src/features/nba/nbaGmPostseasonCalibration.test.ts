import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// These are historical results, not a validated NBA GM skill-to-win simulator.
const efficiency = readFileSync("docs/nba-gm-150-team-season-efficiency-2022-2026.csv", "utf8")
  .trim().split(/\r?\n/);
const postseason = readFileSync("docs/nba-gm-150-team-season-postseason-2022-2026.csv", "utf8")
  .trim().split(/\r?\n/);
const finishes = ["Champion", "Finals", "Conference Finals", "Conference Semifinals", "First Round", "Missed Playoffs"] as const;
type Finish = typeof finishes[number];
const finishSet = new Set<string>(finishes);
const rows = postseason.slice(1).map((line, i) => {
  const cells = line.split(",");
  if (cells.length !== 3) throw Error(`Malformed postseason history line ${i + 2}`);
  const [season, team, outcome] = cells;
  return { year: Number(season), team, outcome };
});
const efficiencyMap = new Map(efficiency.slice(1).map(line => {
  const [season, team, wins, losses, offense, defense, net] = line.split(",");
  return [`${season},${team}`, { wins: Number(wins), losses: Number(losses), net: Number(net), offense: Number(offense), defense: Number(defense) }] as const;
}));

describe("NBA GM historical postseason cohort integrity", () => {
  it("matches the 150 real efficiency team-seasons exactly, without missing or repeated keys", () => {
    expect(postseason[0]).toBe("seasonEnd,teamCode,postseasonFinish");
    expect(rows).toHaveLength(150);
    expect(efficiencyMap.size).toBe(150);
    const keys = rows.map(row => `${row.year},${row.team}`);
    expect(new Set(keys).size).toBe(150);
    expect(new Set(keys)).toEqual(new Set(efficiencyMap.keys()));
    for (const row of rows) {
      expect([2022, 2023, 2024, 2025, 2026]).toContain(row.year);
      expect(finishSet.has(row.outcome)).toBe(true);
      expect(efficiencyMap.get(`${row.year},${row.team}`)?.wins).toBeGreaterThanOrEqual(0);
    }
  });

  it("records exactly 16 playoff qualifiers and 14 misses each season, with proper round counts", () => {
    const roundCounts: Record<Finish, number> = {
      Champion: 1, Finals: 1, "Conference Finals": 2,
      "Conference Semifinals": 4, "First Round": 8, "Missed Playoffs": 14,
    };
    for (const year of [2022, 2023, 2024, 2025, 2026]) {
      const season = rows.filter(row => row.year === year);
      expect(season).toHaveLength(30);
      for (const [finish, expected] of Object.entries(roundCounts)) {
        expect(season.filter(row => row.outcome === finish)).toHaveLength(expected);
      }
    }
  });

  it("checks actual NBA champions and runners-up against the source bracket, not win thresholds", () => {
    const finals: Record<number, [string, string]> = {
      2022: ["GSW", "BOS"], 2023: ["DEN", "MIA"], 2024: ["BOS", "DAL"],
      2025: ["OKC", "IND"], 2026: ["NYK", "SAS"],
    };
    for (const [year, [champion, runnerUp]] of Object.entries(finals)) {
      expect(rows.find(row => row.year === Number(year) && row.outcome === "Champion")?.team).toBe(champion);
      expect(rows.find(row => row.year === Number(year) && row.outcome === "Finals")?.team).toBe(runnerUp);
    }
    expect(efficiencyMap.get("2023,DEN")?.wins).toBe(53);
    expect(efficiencyMap.get("2026,NYK")?.wins).toBe(53);
  });

  it("keeps play-in losers outside the main playoff bracket, including 2026 Golden State", () => {
    const byKey = new Map(rows.map(row => [`${row.year},${row.team}`, row.outcome]));
    expect(byKey.get("2026,GSW")).toBe("Missed Playoffs");
    expect(byKey.get("2026,PHX")).toBe("First Round");
    expect(byKey.get("2026,ORL")).toBe("First Round");
  });

  it("preserves an empirical warning: 50-plus wins do not guarantee the title", () => {
    const top50 = rows.filter(row => (efficiencyMap.get(`${row.year},${row.team}`)?.wins ?? 0) >= 50);
    expect(top50.length).toBeGreaterThan(35);
    expect(top50.filter(row => row.outcome !== "Champion").length).toBeGreaterThan(30);
    expect(top50.filter(row => row.outcome === "Champion")).toHaveLength(5);
  });
});
