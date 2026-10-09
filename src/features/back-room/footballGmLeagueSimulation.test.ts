import { describe, expect, it } from "vitest";
import { footballGmSimulateLeagueSeason } from "./footballGmLeagueSimulation";

const solo = (seed: string, grade: number, year: 1 | 2 | 3 = 1) =>
  footballGmSimulateLeagueSeason({ seed, year, franchises: [{ key: "solo", grade }] });

describe("GM v10 shared NFL league", () => {
  it("plays 272 actual games across 32 teams and seeds seven per conference", () => {
    const season = solo("schedule-proof", 92);
    expect(season.clubs).toHaveLength(32);
    expect(season.clubs.every((team) => team.wins + team.losses === 17)).toBe(true);
    expect(season.clubs.reduce((total, team) => total + team.wins, 0)).toBe(272);
    expect(season.clubs.reduce((total, team) => total + team.losses, 0)).toBe(272);
    for (const conference of [0, 1]) {
      const teams = season.clubs.filter((team) => team.conference === conference);
      expect(teams.filter((team) => team.playoffSeed !== null).map((team) => team.playoffSeed).sort())
        .toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(teams.filter((team) => team.finish !== "Missed Playoffs")).toHaveLength(7);
    }
    expect(season.clubs.filter((team) => team.finish === "Champion")).toHaveLength(1);
    expect(season.clubs.filter((team) => team.finish === "Super Bowl Loss")).toHaveLength(1);
  });

  it("gives both head-to-head players one shared bracket regardless of client ordering", () => {
    const sides = [{ key: "left", grade: 91 }, { key: "right", grade: 87 }];
    const first = footballGmSimulateLeagueSeason({ seed: "same-match", year: 2, franchises: sides });
    const second = footballGmSimulateLeagueSeason({ seed: "same-match", year: 2, franchises: [...sides].reverse() });
    expect(first).toEqual(second);
    expect(first.franchises.left?.conference).toBe(0);
    expect(first.franchises.right?.conference).toBe(1);
    expect(solo("same-solo", 92, 1)).toEqual(solo("same-solo", 92, 1));
    expect(solo("same-solo", 92, 1)).not.toEqual(solo("same-solo", 92, 2));
  });

  it("strongly separates poor rosters from elite champions across seeded seasons", () => {
    const samples = 550;
    const summary = (grade: number) => {
      let made = 0; let championships = 0; let wins = 0; let conference = 0;
      for (let i = 0; i < samples; i += 1) {
        const team = solo(`calibration-${i}`, grade).franchises.solo!;
        if (team.playoffSeed !== null) made += 1;
        if (team.finish === "Champion") championships += 1;
        if (["Conference Championship", "Super Bowl Loss", "Champion"].includes(team.finish)) conference += 1;
        wins += team.wins;
      }
      return { playoff: made / samples, champion: championships / samples, conference: conference / samples, wins: wins / samples };
    };
    // Raw grades 84, 86.67, 90, 92, and 92.5 correspond approximately
    // to displayed 82, 88, 96, 98, and 99 OVR respectively.
    const depth = summary(84);
    const average = summary(86.67);
    const good = summary(90);
    const elite = summary(92);
    const exceptional = summary(92.5);

    expect(depth.wins).toBeLessThan(8);
    expect(depth.playoff).toBeLessThan(0.18);
    expect(average.playoff).toBeGreaterThan(0.30);
    expect(average.playoff).toBeLessThan(0.70);
    expect(good.champion).toBeGreaterThan(0.12);
    expect(good.champion).toBeLessThan(0.40);
    expect(elite.wins).toBeGreaterThan(13);
    expect(elite.champion).toBeGreaterThan(0.30);
    expect(elite.champion).toBeLessThan(0.53);
    expect(elite.conference).toBeGreaterThan(0.65);
    expect(exceptional.champion).toBeGreaterThan(elite.champion);
    expect(exceptional.champion).toBeLessThan(0.60);
  });
});

describe("Probability-only continuity in the shared NFL league", () => {
  it("keeps the underlying talent grade unchanged and outcomes seed-deterministic", () => {
    const baseline = solo("continuity-a", 88, 2);
    const changed = footballGmSimulateLeagueSeason({
      seed: "continuity-a", year: 2,
      franchises: [{ key: "solo", grade: 88, winChancePenalty: 0.02 }],
    });
    expect(changed.franchises.solo?.grade).toBe(baseline.franchises.solo?.grade);
    expect(changed.franchises.solo?.winChancePenalty).toBe(0.02);
    expect(footballGmSimulateLeagueSeason({
      seed: "continuity-a", year: 2,
      franchises: [{ key: "solo", grade: 88, winChancePenalty: 0.02 }],
    })).toEqual(changed);
  });

  it("calibrates a 2 pp per-game setback across rebuilding, balanced, strong and elite rosters", () => {
    const samples = 500;
    for (const grade of [84, 87, 90, 92]) {
      function outcomes(penalty: number) {
        const reached = Array(5).fill(0) as number[];
        let wins = 0;
        for (let i = 0; i < samples; i++) {
          const club = footballGmSimulateLeagueSeason({
            seed: `penalty-cal-${i}`, year: 2,
            franchises: [{ key: "solo", grade, winChancePenalty: penalty }],
          }).franchises.solo!;
          wins += club.wins;
          if (club.playoffSeed !== null) reached[0]!++;
          if (["Divisional", "Conference Championship", "Super Bowl Loss", "Champion"].includes(club.finish)) reached[1]!++;
          if (["Conference Championship", "Super Bowl Loss", "Champion"].includes(club.finish)) reached[2]!++;
          if (["Super Bowl Loss", "Champion"].includes(club.finish)) reached[3]!++;
          if (club.finish === "Champion") reached[4]!++;
        }
        return { wins: wins / samples, milestones: reached.map(x => x / samples) };
      }
      const intact = outcomes(0);
      const turnover = outcomes(0.02);
      expect(turnover.wins).toBeLessThan(intact.wins - 0.1);
      for (let i = 0; i < 5; i++) {
        expect(turnover.milestones[i]!).toBeLessThanOrEqual(intact.milestones[i]! + 0.035);
      }
    }
  });
});
