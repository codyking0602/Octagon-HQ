import { describe, expect, it } from "vitest";
import authority from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
import audit from "../../../data/curated/football/gm-nfl-development-review-audit-2026-10-08.json";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmAddPick,
  footballGmCandidatesForTeam,
  footballGmEligibleTeams,
  footballGmProjectedGradeForPlayer,
  footballGmSpinTeam,
  type FootballGmRosterEntry,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT,
  FOOTBALL_GM_DEVELOPMENT_SEED_TAG,
  footballGmDevelopmentOdds,
  footballGmDevelopmentProfile,
} from "./wheelFootballGmEconomy";
import {
  footballGmAdjustedSalaryForPlayer,
  footballGmAdjustedRosterCap,
  footballGmIsOffseasonCompliantV2,
  footballGmSeasonResultV2,
} from "./footballGmStrategy";
import { footballGmCpuOffseason } from "./footballGmCpu";

const seed = (i: number) => `full-development-audit-${i}${FOOTBALL_GM_DEVELOPMENT_SEED_TAG}`;

const name = (value: string) => {
  const found = FOOTBALL_GM_PLAYER_POOL.find((player) => player.name === value);
  if (!found) throw new Error(`Player ${value} missing`);
  return found;
};

function cheapestRoster(): FootballGmRosterEntry[] {
  const used = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = FOOTBALL_GM_PLAYER_POOL
      .filter((item) => item.eligibleSlots.includes(slot) && !used.has(item.id))
      .sort((a, b) => a.salaryWindow[1] - b.salaryWindow[1])[0]!;
    used.add(player.id);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

function playableRoster(i: number, strategy: "balanced" | "upside" | "value"): FootballGmRosterEntry[] {
  const usedIds = new Set<string>();
  const usedNames = new Set<string>();
  const roster: FootballGmRosterEntry[] = [];
  for (let index = 0; index < FOOTBALL_GM_ROSTER_SLOTS.length; index += 1) {
    const slot = FOOTBALL_GM_ROSTER_SLOTS[index]!;
    const taken = roster.reduce((sum, entry) => sum + (FOOTBALL_GM_PLAYER_POOL.find((p) => p.id === entry.playerId)?.salaryApy ?? 0), 0);
    const reserve = FOOTBALL_GM_ROSTER_SLOTS.slice(index + 1).reduce((sum, remaining) => {
      return sum + Math.min(...FOOTBALL_GM_PLAYER_POOL.filter((p) => p.eligibleSlots.includes(remaining)).map((p) => p.salaryApy));
    }, 0);
    const available = FOOTBALL_GM_PLAYER_POOL.filter((p) =>
      p.eligibleSlots.includes(slot) && !usedIds.has(p.id) && !usedNames.has(p.name)
      && taken + p.salaryApy + reserve <= FOOTBALL_GM_CAP);
    const ordered = available.sort((left, right) => {
      const score = (player: typeof left) => {
        const forwardSalary = player.salaryWindow[1] / 1_000_000;
        return strategy === "upside"
          ? player.currentGrade + (player.age <= 25 ? 3 : 0) - forwardSalary * 0.20
          : strategy === "value"
            ? player.currentGrade - forwardSalary * 0.55
            : player.currentGrade - forwardSalary * 0.32;
      };
      return score(right) - score(left) || left.id.localeCompare(right.id);
    });
    const choice = ordered[(i * 7 + index * 13) % Math.min(10, ordered.length)]!;
    if (!choice) throw new Error(`Cannot construct ${strategy} roster at ${slot}`);
    usedIds.add(choice.id);
    usedNames.add(choice.name);
    roster.push({ slot, playerId: choice.id, acquired: "draft" });
  }
  return roster;
}

describe("full NFL GM development calibration", () => {
  it("binds exactly one explicit, source-anchored profile to every canonical NFL player", () => {
    const ids = new Set(FOOTBALL_GM_PLAYER_POOL.map((player) => player.id));
    const profiles = authority.profiles;
    expect(FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT).toBe(594);
    expect(profiles.length).toBe(ids.size);
    expect(new Set(profiles.map((profile) => profile.id)).size).toBe(profiles.length);
    expect(new Set(profiles.map((profile) => profile.team)).size).toBe(32);
    expect(profiles.filter((p) => p.calibration === "individual-review").length).toBe(594);
    expect(audit.reviewCount).toBe(594);
    expect(audit.followupReviewCount).toBe(417);
    expect(audit.reviews.filter((p) => p.reviewClass !== "priority-individual")).toHaveLength(417);
    expect(audit.reviews.filter((p) => p.supportingHQEvidence).length).toBe(123);
    expect(audit.reviews.filter((p) => p.recentEvidence).length).toBeGreaterThanOrEqual(10);
    expect(new Set(audit.reviews.map(p => p.id)).size).toBe(594);
    // None of the long scouting-review notes should ship in the player-facing bundle.
    expect(profiles.every((p) => !("reviewRationale" in p) && !("recentEvidence" in p))).toBe(true);
    for (const review of audit.reviews) {
      const player = FOOTBALL_GM_PLAYER_POOL.find((p) => p.id === review.id);
      expect(player, review.id).not.toBeUndefined();
      expect(player!.currentGrade).toBe(review.gradeAtReview);
      expect(review.reviewRationale.length, review.id).toBeGreaterThan(65);
    }
    for (const profile of profiles) {
      expect(ids.has(profile.id), profile.id).toBe(true);
      const player = FOOTBALL_GM_PLAYER_POOL.find((p) => p.id === profile.id)!;
      expect(footballGmDevelopmentProfile(profile.id)).toEqual(profile);
      expect(profile.name).toBe(player.name);
      expect(profile.ageAtCalibration).toBe(player.age);
      expect(profile.gradeAtCalibration).toBe(player.currentGrade);
      expect(profile.breakoutPct).toBeGreaterThanOrEqual(0);
      expect(profile.improvePct).toBeGreaterThanOrEqual(0);
      expect(profile.declinePct).toBeGreaterThanOrEqual(0);
      expect(profile.breakoutPct + profile.improvePct + profile.declinePct).toBeLessThanOrEqual(100);
      expect(profile.maxAnnualGain).toBeGreaterThan(0);
      expect(profile.maxAnnualLoss).toBeGreaterThan(0);
      expect(profile.marketVariancePct).toBeGreaterThan(0);
    }
  });

  it("separates demonstrated superstars from risky prospects, uneven starters, and old veterans", () => {
    const superstar = footballGmDevelopmentProfile(name("Josh Allen").id)!;
    const boom = footballGmDevelopmentProfile(name("Caleb Williams").id)!;
    const uneven = footballGmDevelopmentProfile(name("Justin Herbert").id)!;
    const aging = footballGmDevelopmentProfile(name("Aaron Rodgers").id)!;
    expect(superstar.declinePct).toBeLessThan(boom.declinePct);
    expect(superstar.maxAnnualLoss).toBeLessThan(uneven.maxAnnualLoss);
    expect(boom.breakoutPct).toBeGreaterThan(uneven.breakoutPct);
    expect(aging.declinePct).toBeGreaterThan(uneven.declinePct);

    for (let i = 0; i < 200; i += 1) {
      const star = footballGmProjectedGradeForPlayer(name("Josh Allen"), 2, seed(i));
      const prospect = footballGmProjectedGradeForPlayer(name("Caleb Williams"), 2, seed(i));
      const starSubject = name("Josh Allen");
      const prospectSubject = name("Caleb Williams");
      const starProfile = footballGmDevelopmentProfile(starSubject.id)!;
      const prospectProfile = footballGmDevelopmentProfile(prospectSubject.id)!;
      expect(star).toBeGreaterThanOrEqual(Math.max(70, starSubject.currentGrade - starProfile.maxAnnualLoss));
      expect(prospect).toBeGreaterThanOrEqual(Math.max(70, prospectSubject.currentGrade - prospectProfile.maxAnnualLoss));
      expect(prospect).toBeLessThanOrEqual(Math.min(99, prospectSubject.currentGrade + prospectProfile.maxAnnualGain));
    }
  });

  it("retains Year 2 identity odds but reduces repeat breakouts after a Year 2 leap", () => {
    const player = name("Caleb Williams");
    const input = {
      playerId: player.id,
      position: "QB" as const,
      age: player.age + 1,
      originalGrade: player.currentGrade,
    };
    const first = footballGmDevelopmentOdds({
      ...input, age: player.age, step: 0, grade: player.currentGrade,
    })!;
    const curated = footballGmDevelopmentProfile(player.id)!;
    expect(first).toEqual({
      breakoutPct: curated.breakoutPct,
      improvePct: curated.improvePct,
      declinePct: curated.declinePct,
      steadyPct: 100 - curated.breakoutPct - curated.improvePct - curated.declinePct,
    });

    const breakout = footballGmDevelopmentOdds({ ...input, step: 1, grade: 93 })!;
    const setback = footballGmDevelopmentOdds({ ...input, step: 1, grade: 82 })!;
    expect(breakout.breakoutPct).toBeLessThan(first.breakoutPct * 0.5);
    expect(breakout.improvePct).toBeLessThan(first.improvePct);
    expect(setback.breakoutPct).toBeGreaterThan(breakout.breakoutPct);
    expect(setback.improvePct).toBeGreaterThan(first.improvePct);
    expect(breakout.steadyPct).toBeGreaterThan(first.steadyPct);
  });

  it("makes age-related Year 3 regression more likely without changing player identity", () => {
    const runningBack = name("Derrick Henry");
    const fixed = {
      playerId: runningBack.id,
      step: 1 as const,
      grade: runningBack.currentGrade,
      originalGrade: runningBack.currentGrade,
      position: "RB" as const,
    };
    const prior = footballGmDevelopmentOdds({ ...fixed, age: 26 })!;
    const aged = footballGmDevelopmentOdds({ ...fixed, age: runningBack.age + 1 })!;
    expect(aged.declinePct).toBeGreaterThan(prior.declinePct);
    expect(aged.declinePct).toBeGreaterThanOrEqual(55);
  });

  it("keeps every Year 3 probability valid through setbacks, leaps and the rating ceiling", () => {
    for (const player of FOOTBALL_GM_PLAYER_POOL) {
      const marketPosition = player.eligibleSlots.includes("QB") ? "QB"
        : player.eligibleSlots.includes("RB") ? "RB"
          : player.family === "TE" ? "FLEX"
            : player.eligibleSlots.includes("WR") ? "WR"
              : player.eligibleSlots.includes("LB") ? "LB"
                : player.eligibleSlots.includes("DB") ? "DB" : "DL";
      for (const grade of [
        Math.max(70, player.currentGrade - 5),
        player.currentGrade,
        Math.min(99, player.currentGrade + 6),
        99,
      ]) {
        const odds = footballGmDevelopmentOdds({
          playerId: player.id,
          step: 1,
          grade,
          originalGrade: player.currentGrade,
          position: marketPosition,
          age: player.age + 1,
        })!;
        for (const value of Object.values(odds)) {
          expect(value, player.id).toBeGreaterThanOrEqual(0);
          expect(value, player.id).toBeLessThanOrEqual(100);
        }
        expect(
          odds.breakoutPct + odds.improvePct + odds.declinePct + odds.steadyPct,
        ).toBeCloseTo(100, 7);
      }
    }
  });

  it("replays Year 3 exactly, with its own outcome and no second contract repricing", () => {
    const player = name("Caleb Williams");
    const runs = Array.from({ length: 200 }, (_, i) => {
      const key = seed(1000 + i);
      return {
        year2: footballGmProjectedGradeForPlayer(player, 2, key),
        year3: footballGmProjectedGradeForPlayer(player, 3, key),
        salary2: footballGmAdjustedSalaryForPlayer(player, 2, key, {}),
        salary3: footballGmAdjustedSalaryForPlayer(player, 3, key, {}),
      };
    });
    expect(new Set(runs.map((row) => row.year3 - row.year2)).size).toBeGreaterThan(12);
    for (let i = 0; i < runs.length; i += 1) {
      expect(footballGmProjectedGradeForPlayer(player, 3, seed(1000 + i))).toBe(runs[i]!.year3);
      expect(runs[i]!.salary3).toBe(runs[i]!.salary2);
    }
  });

  it("keeps 1YR offers and 3YR locked salaries stable in the same run, across all 594 players", () => {
    for (const player of FOOTBALL_GM_PLAYER_POOL) {
      const now = footballGmAdjustedSalaryForPlayer(player, 1, seed(4), {});
      const next = footballGmAdjustedSalaryForPlayer(player, 2, seed(4), {});
      const third = footballGmAdjustedSalaryForPlayer(player, 3, seed(4), {});
      expect(now).toBe(player.salaryApy);
      expect(next).toBe(third);
      expect(Number.isFinite(next)).toBe(true);
      expect(next).toBeGreaterThan(0);
      if (player.gameContract === "3YR") expect(next).toBe(now);
      for (const year of [1, 2, 3] as const) {
        expect(footballGmProjectedGradeForPlayer(player, year, seed(4))).toBeGreaterThanOrEqual(70);
        expect(footballGmProjectedGradeForPlayer(player, year, seed(4))).toBeLessThanOrEqual(99);
      }
    }
  });

  it("simulates complete three-season economy/season outcomes across diverse draft strategies", () => {
    const metric: Record<string, { runs: number; ready: number; fixed: number; year2Caps: number[]; year2Grades: number[]; scores: number[] }> = {};
    for (const strategy of ["value", "balanced", "upside"] as const) {
      metric[strategy] = { runs: 0, ready: 0, fixed: 0, year2Caps: [], year2Grades: [], scores: [] };
      for (let i = 0; i < 24; i += 1) {
        const roster = playableRoster(i, strategy);
        const key = seed(i + 100 * (strategy === "upside" ? 2 : strategy === "balanced" ? 1 : 0));
        const previous = footballGmAdjustedRosterCap(roster, 1, key, {});
        expect(previous).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
        const ready = footballGmIsOffseasonCompliantV2(roster, key, {}, []);
        const cpu = footballGmCpuOffseason({ yearOneRoster: roster, seed: key });
        const settled = cpu.compliant ? cpu.roster : cheapestRoster();
        expect(footballGmIsOffseasonCompliantV2(settled, key, {}, [])).toBe(true);
        const years = [1, 2, 3] as const;
        const finishes = years.map((year) =>
          footballGmSeasonResultV2({
            seed: key,
            yearOneRoster: roster,
            roster: year === 1 ? roster : settled,
            year,
          }));
        expect(finishes.map((year) => year.year)).toEqual([1, 2, 3]);
        expect(finishes.every((year) => year.wins! + year.losses! === 17)).toBe(true);
        expect(footballGmAdjustedRosterCap(settled, 2, key, {})).toBe(footballGmAdjustedRosterCap(settled, 3, key, {}));
        const row = metric[strategy]!;
        row.runs++;
        row.ready += Number(ready);
        row.fixed += Number(cpu.compliant);
        row.year2Caps.push(footballGmAdjustedRosterCap(settled, 2, key, {}) / 1_000_000);
        row.year2Grades.push(finishes[1].teamGrade);
        row.scores.push(finishes.filter((year) => year.finish === "Champion").length);
      }
    }
    for (const [strategy, value] of Object.entries(metric)) {
      const mean = (items: number[]) => Math.round(items.reduce((sum, x) => sum + x, 0) / items.length * 10) / 10;
      console.info("GM 3Y calibration", { strategy, runs: value.runs, initiallyCompliant: value.ready, CPURescued: value.fixed,
        averageYear2CapMillions: mean(value.year2Caps), averageYear2TeamGrade: mean(value.year2Grades),
        titlesAcrossSeasons: value.scores.reduce((a, b) => a + b, 0) });
      expect(mean(value.year2Grades)).toBeGreaterThan(75);
      expect(mean(value.year2Grades)).toBeLessThan(99);
    }
  });
  it("plays wheel-constrained drafts through all three seasons with CPU cap repairs", () => {
    const audit = {
      drafts: 0,
      offseasonCrises: 0,
      rescued: 0,
      year3Varies: 0,
      capped: 0,
      previousTeams: 0,
      observed: new Set<string>(),
    };
    for (let i = 0; i < 64; i += 1) {
      const key = seed(1500 + i);
      let roster: FootballGmRosterEntry[] = [];
      let previousTeam: string | null = null;
      for (let turn = 0; turn < FOOTBALL_GM_ROSTER_SLOTS.length; turn += 1) {
        const eligible = footballGmEligibleTeams({ roster, year: 1, previousTeam });
        expect(eligible.length, `draft ${i} pick ${turn}`).toBeGreaterThan(0);
        const team = footballGmSpinTeam(key, turn, eligible);
        expect(team).not.toBeNull();
        if (team !== previousTeam) audit.previousTeams++;
        const candidates = footballGmCandidatesForTeam({ team: team!, roster, year: 1 });
        expect(candidates.length).toBeGreaterThan(0);
        const choices = candidates.flatMap(({ player, legalSlots }) =>
          legalSlots.map(slot => ({ player, slot })));
        const strategy = i % 3;
        const score = (item: typeof choices[number]) =>
          strategy === 0
            ? item.player.currentGrade - item.player.salaryApy / 2_000_000
            : strategy === 1
              ? item.player.currentGrade + (item.player.age <= 25 ? 3 : 0) - item.player.salaryApy / 6_000_000
              : item.player.currentGrade - item.player.salaryApy / 4_000_000;
        choices.sort((a,b) => score(b) - score(a) || Number(a.slot === "FLEX") - Number(b.slot === "FLEX") || a.player.id.localeCompare(b.player.id));
        const selected = choices[(i + turn) % Math.min(3, choices.length)]!;
        roster = footballGmAddPick(roster, selected.player.id, selected.slot);
        audit.observed.add(selected.player.id);
        previousTeam = team;
      }
      expect(roster).toHaveLength(7);
      expect(footballGmAdjustedRosterCap(roster, 1, key, {})).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
      const compliant = footballGmIsOffseasonCompliantV2(roster, key, {}, []);
      audit.offseasonCrises += Number(!compliant);
      const offseason = footballGmCpuOffseason({ yearOneRoster: roster, seed: key });
      if (offseason.compliant) audit.rescued++;
      expect(offseason.compliant, `wheel run ${i} could not be repaired`).toBe(true);
      expect(footballGmAdjustedRosterCap(offseason.roster, 2, key, {})).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
      expect(footballGmAdjustedRosterCap(offseason.roster, 3, key, {})).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
      const seasons = ([1,2,3] as const).map(year => footballGmSeasonResultV2({
        yearOneRoster: roster,
        roster: year === 1 ? roster : offseason.roster,
        year,
        seed: key,
      }));
      for(const season of seasons){
        expect(season.wins! + season.losses!).toBe(17);
        expect(season.teamGrade).toBeGreaterThanOrEqual(70);
        expect(season.teamGrade).toBeLessThanOrEqual(99);
      }
      if (seasons[1].teamGrade !== seasons[2].teamGrade) audit.year3Varies++;
      audit.drafts++;
      audit.capped++;
    }
    console.info("GM wheel player-reviewed 3Y audit",{
      runs:audit.drafts,
      futureCapCrises:audit.offseasonCrises,
      resolvedCapCrises:audit.rescued,
      distinctDraftedPlayers:audit.observed.size,
      distinctYear3Outcomes:audit.year3Varies,
      completedSeasons: audit.drafts * 3,
    });
    expect(audit.observed.size).toBeGreaterThan(70);
    expect(audit.year3Varies).toBeGreaterThan(35);
    expect(audit.offseasonCrises).toBeGreaterThan(0);
  });

});
