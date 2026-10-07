import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmPlayerById,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_HISTORICAL_ANCHORS,
  FOOTBALL_GM_HISTORICAL_FINAL_FOUR,
  FOOTBALL_GM_LIVE_OUTCOME_ANCHORS,
  FOOTBALL_GM_MAX_TRADE_PLAYERS,
  FOOTBALL_GM_POSITION_WEIGHTS,
  FOOTBALL_GM_SCORE_WEIGHTS,
  footballGmAcceptedTargetTradeOffers,
  footballGmAdjustedHoldingsCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmCanUseFreeAgency,
  footballGmContinuity,
  footballGmEffectiveTeamGrade,
  footballGmEligibleFreeAgencyTeams,
  footballGmEvaluateTradeProposal,
  footballGmFreeAgencyCandidatesForTeam,
  footballGmFinalResultV2,
  footballGmOutcomeProbabilities,
  footballGmResolveTradeAssets,
  footballGmScoreFromComponents,
  footballGmSeasonResumeScore,
  footballGmSeasonResultV2,
  footballGmSeasonRoll,
  footballGmTeamOverall,
  footballGmThreeYearResumeScore,
  footballGmSignFreeAgent,
  footballGmTargetOfferDominates,
  footballGmTitleOdds,
  footballGmTradeOfferAcceptanceSlack,
  footballGmWeakLinkPenalty,
} from "./footballGmStrategy";

function playerId(name: string) {
  const player = FOOTBALL_GM_PLAYER_POOL.find((row) => row.name === name);
  if (!player) throw new Error(`Missing test player ${name}`);
  return player.id;
}

function codyRunRoster(): FootballGmRosterEntry[] {
  return [
    { slot: "DB", playerId: playerId("Derwin James Jr."), acquired: "draft" },
    { slot: "WR", playerId: playerId("Tetairoa McMillan"), acquired: "draft" },
    { slot: "FLEX", playerId: playerId("Trey McBride"), acquired: "draft" },
    { slot: "LB", playerId: playerId("Anthony Hill Jr."), acquired: "draft" },
    { slot: "QB", playerId: playerId("Lamar Jackson"), acquired: "draft" },
    { slot: "DL", playerId: playerId("Abdul Carter"), acquired: "draft" },
    { slot: "RB", playerId: playerId("Travis Etienne Jr."), acquired: "draft" },
  ];
}

function fullTurnoverRoster(original: readonly FootballGmRosterEntry[]) {
  const excluded = new Set(original.map((entry) => entry.playerId));
  const used = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = FOOTBALL_GM_PLAYER_POOL.find((candidate) => (
      !excluded.has(candidate.id)
      && !used.has(candidate.id)
      && candidate.eligibleSlots.includes(slot)
    ));
    if (!player) throw new Error(`No replacement for ${slot}`);
    used.add(player.id);
    return { slot, playerId: player.id, acquired: "trade" as const };
  });
}

function rosterBySalary(
  slots: readonly FootballGmRosterSlot[],
  excludedIds: ReadonlySet<string> = new Set(),
) {
  const usedIds = new Set<string>();
  const usedNames = new Set<string>();
  return slots.map((slot) => {
    const player = FOOTBALL_GM_PLAYER_POOL
      .filter((candidate) => (
        !excludedIds.has(candidate.id)
        && !usedIds.has(candidate.id)
        && !usedNames.has(candidate.name)
        && candidate.eligibleSlots.includes(slot)
      ))
      .sort((left, right) => (
        left.salaryWindow[1] - right.salaryWindow[1]
        || left.currentGrade - right.currentGrade
        || left.name.localeCompare(right.name)
      ))[0];
    if (!player) throw new Error(`No cheap GM player for ${slot}`);
    usedIds.add(player.id);
    usedNames.add(player.name);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

function cheapRosterMissing(
  missingSlot: FootballGmRosterSlot,
  excludedIds: ReadonlySet<string> = new Set(),
) {
  return rosterBySalary(
    FOOTBALL_GM_ROSTER_SLOTS.filter((slot) => slot !== missingSlot),
    excludedIds,
  );
}

function weakestFullRoster() {
  const usedIds = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = FOOTBALL_GM_PLAYER_POOL
      .filter((candidate) => !usedIds.has(candidate.id) && candidate.eligibleSlots.includes(slot))
      .sort((left, right) => left.currentGrade - right.currentGrade || left.name.localeCompare(right.name))[0];
    if (!player) throw new Error(`No weak GM player for ${slot}`);
    usedIds.add(player.id);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

function findDisplacementScenario() {
  for (const missingSlot of FOOTBALL_GM_ROSTER_SLOTS) {
    const roster = cheapRosterMissing(missingSlot);
    const teams = footballGmEligibleFreeAgencyTeams({
      roster,
      seed: "displacement-scenario",
      consequences: {},
    });
    for (const team of teams) {
      const candidate = footballGmFreeAgencyCandidatesForTeam({
        team,
        roster,
        seed: "displacement-scenario",
        consequences: {},
      }).find((row) => row.legalSlots.length === 0 && row.displacementOptions.length > 0);
      if (candidate) return { missingSlot, roster, candidate };
    }
  }
  throw new Error("Expected at least one cap-safe non-position-matching 1YR free agent");
}

function findAccessibleEliteFreeAgent() {
  const elites = FOOTBALL_GM_PLAYER_POOL
    .filter((player) => player.gameContract === "1YR" && player.currentGrade >= 90)
    .sort((left, right) => right.currentGrade - left.currentGrade);
  for (const player of elites) {
    for (const missingSlot of player.eligibleSlots) {
      const roster = cheapRosterMissing(missingSlot, new Set([player.id]));
      const candidate = footballGmFreeAgencyCandidatesForTeam({
        team: player.team,
        roster,
        seed: "elite-fa-access",
        consequences: {},
      }).find((row) => row.player.id === player.id);
      if (candidate) return { roster, candidate };
    }
  }
  throw new Error("Expected cap room to expose at least one 90+ real 1YR free agent");
}

describe("Football GM strategy v7", () => {
  it("keeps the calibrated $150M cap and locked position weights", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_POSITION_WEIGHTS.RB).toBe(0.10);
    expect(Object.values(FOOTBALL_GM_POSITION_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
  });

  it("keeps historical AV finalist data as reference but calibrates gameplay to the live grade ecosystem", () => {
    expect(FOOTBALL_GM_HISTORICAL_FINAL_FOUR).toHaveLength(20);
    expect(new Set(FOOTBALL_GM_HISTORICAL_FINAL_FOUR.map((row) => row.season))).toEqual(
      new Set([2021, 2022, 2023, 2024, 2025]),
    );
    expect(FOOTBALL_GM_HISTORICAL_ANCHORS.finalFourMedian).toBe(95.1);

    expect(FOOTBALL_GM_LIVE_OUTCOME_ANCHORS.leagueMedianBestCore).toBe(85.5);
    expect(FOOTBALL_GM_LIVE_OUTCOME_ANCHORS.seattle).toBe(90);
    expect(FOOTBALL_GM_LIVE_OUTCOME_ANCHORS.kansasCity).toBe(91.1);
    expect(FOOTBALL_GM_LIVE_OUTCOME_ANCHORS.baltimore).toBe(92.8);
    expect(FOOTBALL_GM_LIVE_OUTCOME_ANCHORS.detroit).toBe(93.7);
    expect(FOOTBALL_GM_LIVE_OUTCOME_ANCHORS.losAngelesRams).toBe(94);

    expect(footballGmTitleOdds(88)).toBeCloseTo(0.08, 6);
    expect(footballGmTitleOdds(90)).toBeCloseTo(0.32, 6);
    expect(footballGmTitleOdds(91)).toBeCloseTo(0.46, 6);
    expect(footballGmTitleOdds(92)).toBeCloseTo(0.60, 6);
    expect(footballGmTitleOdds(93)).toBeCloseTo(0.67, 6);
    expect(footballGmTitleOdds(94)).toBeCloseTo(0.72, 6);
    expect(footballGmTitleOdds(98)).toBeCloseTo(0.85, 6);

    const roster = codyRunRoster();
    const outcomes = new Set<string>();
    for (let index = 0; index < 80; index += 1) {
      outcomes.add(footballGmSeasonResultV2({
        seed: `variance-${index}`,
        yearOneRoster: roster,
        roster,
        year: 1,
      }).finish);
    }
    expect(outcomes.size).toBeGreaterThan(2);
  });

  it("calibrates every integer team grade with a smooth higher-floor postseason curve", () => {
    const expected = [
      [78, 0.80, 0.001],
      [79, 0.77, 0.002],
      [80, 0.73, 0.003],
      [81, 0.69, 0.004],
      [82, 0.64, 0.006],
      [83, 0.58, 0.008],
      [84, 0.50, 0.012],
      [85, 0.34, 0.02],
      [86, 0.25, 0.035],
      [87, 0.17, 0.055],
      [88, 0.10, 0.08],
      [89, 0.02, 0.19],
      [90, 0.005, 0.32],
      [91, 0.001, 0.46],
      [92, 0, 0.60],
      [93, 0, 0.67],
      [94, 0, 0.72],
      [95, 0, 0.76],
      [96, 0, 0.79],
      [97, 0, 0.82],
      [98, 0, 0.85],
    ] as const;

    let previousMiss = Number.POSITIVE_INFINITY;
    let previousChampion = -1;
    for (const [grade, expectedMiss, expectedChampion] of expected) {
      const probabilities = footballGmOutcomeProbabilities(grade);
      const total = Object.values(probabilities).reduce((sum, value) => sum + value, 0);
      expect(total).toBeCloseTo(1, 10);
      expect(probabilities["Missed Playoffs"]).toBeCloseTo(expectedMiss, 10);
      expect(probabilities.Champion).toBeCloseTo(expectedChampion, 10);
      expect(probabilities["Missed Playoffs"]).toBeLessThanOrEqual(previousMiss);
      expect(probabilities.Champion).toBeGreaterThanOrEqual(previousChampion);
      previousMiss = probabilities["Missed Playoffs"];
      previousChampion = probabilities.Champion;
    }

    expect(footballGmOutcomeProbabilities(90)["Missed Playoffs"]).toBeCloseTo(0.005, 10);
    expect(footballGmOutcomeProbabilities(90).Divisional).toBe(0.14);
    expect(footballGmOutcomeProbabilities(90)["Conference Championship"]).toBe(0.26);
    expect(footballGmOutcomeProbabilities(90)["Super Bowl Loss"]).toBe(0.24);

    const repeatAt94 = (2 * (0.72 ** 2)) - (0.72 ** 3);
    const threePeatAt94 = 0.72 ** 3;
    expect(repeatAt94).toBeCloseTo(0.663552, 6);
    expect(threePeatAt94).toBeCloseTo(0.373248, 6);
  });

  it("translates hidden team grades into a wider fan-facing Team OVR scale", () => {
    expect(footballGmTeamOverall(85)).toBe(84);
    expect(footballGmTeamOverall(89)).toBe(94);
    expect(footballGmTeamOverall(90)).toBe(96);
    expect(footballGmTeamOverall(94)).toBe(99);
    expect(footballGmTeamOverall(98)).toBe(99);
  });

  it("makes championships matter in the three-year GM résumé without replacing roster quality", () => {
    expect(FOOTBALL_GM_SCORE_WEIGHTS.rosterManagement).toBe(0.55);
    expect(FOOTBALL_GM_SCORE_WEIGHTS.threeYearResume).toBe(0.45);
    expect(FOOTBALL_GM_SCORE_WEIGHTS.rosterManagement + FOOTBALL_GM_SCORE_WEIGHTS.threeYearResume).toBe(1);

    const titleAndTwoMisses = footballGmThreeYearResumeScore(["Champion", "Missed Playoffs", "Missed Playoffs"]);
    const threeDivisionals = footballGmThreeYearResumeScore(["Divisional", "Divisional", "Divisional"]);
    expect(titleAndTwoMisses).toBe(88.7);
    expect(threeDivisionals).toBe(88);
    expect(titleAndTwoMisses).toBeGreaterThan(threeDivisionals);

    const sameRosterQuality = 90;
    expect(footballGmScoreFromComponents(sameRosterQuality, titleAndTwoMisses))
      .toBeGreaterThan(footballGmScoreFromComponents(sameRosterQuality, threeDivisionals));
    expect(footballGmSeasonResumeScore("Champion")).toBe(100);
    expect(footballGmSeasonResumeScore("Super Bowl Loss")).toBe(97);
    expect(footballGmSeasonResumeScore("Conference Championship")).toBe(94);
    expect(footballGmSeasonResumeScore("Divisional")).toBe(88);
    expect(footballGmSeasonResumeScore("Wild Card")).toBe(85);
    expect(footballGmSeasonResumeScore("Missed Playoffs")).toBe(83);
  });

  it("puts playoff résumé on the same high-end scale as normalized Team OVR", () => {
    const resume = footballGmThreeYearResumeScore(["Champion", "Divisional", "Wild Card"]);
    expect(resume).toBe(91);
    expect(footballGmScoreFromComponents(93.3, resume)).toBe(92.3);
  });

  it("keeps shared-roll postseason floors monotonic from 89 through 98", () => {
    const finishes = ["Missed Playoffs", "Wild Card", "Divisional", "Conference Championship", "Super Bowl Loss"] as const;
    let previous = Object.fromEntries(finishes.map((finish) => [finish, 1])) as Record<(typeof finishes)[number], number>;
    for (let grade = 89; grade <= 98; grade += 1) {
      const probabilities = footballGmOutcomeProbabilities(grade);
      let cumulative = 0;
      for (const finish of finishes) {
        cumulative += probabilities[finish];
        expect(cumulative).toBeLessThanOrEqual(previous[finish] + 1e-12);
        previous[finish] = cumulative;
      }
    }
  });

  it("honors persisted season results instead of rerolling a completed franchise", () => {
    const roster = codyRunRoster();
    const baseline = footballGmFinalResultV2({ seed: "locked-results", yearOneRoster: roster, finalRoster: roster });
    const locked = baseline.seasons.map((season, index) => ({
      ...season,
      finish: index === 0 ? "Champion" as const : season.finish,
    }));
    const result = footballGmFinalResultV2({
      seed: "a-different-seed-that-must-not-reroll",
      yearOneRoster: roster,
      finalRoster: roster,
      resolvedSeasons: locked,
    });
    expect(result.seasons).toEqual(locked);
    expect(result.seasons[0]!.finish).toBe("Champion");
  });

  it("lands expected GM scores in intuitive bands across the locked outcome curve", () => {
    const expectedScore = (grade: number) => {
      const probabilities = footballGmOutcomeProbabilities(grade);
      const expectedResume = Object.entries(probabilities).reduce(
        (sum, [finish, probability]) => sum + (footballGmSeasonResumeScore(finish as keyof typeof probabilities) * probability),
        0,
      );
      return footballGmScoreFromComponents(footballGmTeamOverall(grade), expectedResume);
    };

    expect(expectedScore(88)).toBeCloseTo(91.1, 1);
    expect(expectedScore(90)).toBeCloseTo(95.7, 1);
    expect(expectedScore(94)).toBeCloseTo(99.0, 1);
  });

  it("uses independent deterministic season rolls instead of carrying the same luck year to year", () => {
    const pairs: Array<[number, number]> = [];
    for (let index = 0; index < 512; index += 1) {
      pairs.push([
        footballGmSeasonRoll(`independent-${index}`, 1),
        footballGmSeasonRoll(`independent-${index}`, 2),
      ]);
    }
    const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const xs = pairs.map(([x]) => x);
    const ys = pairs.map(([, y]) => y);
    const mx = mean(xs);
    const my = mean(ys);
    const covariance = pairs.reduce((sum, [x, y]) => sum + ((x - mx) * (y - my)), 0);
    const xVariance = xs.reduce((sum, x) => sum + ((x - mx) ** 2), 0);
    const yVariance = ys.reduce((sum, y) => sum + ((y - my) ** 2), 0);
    const correlation = covariance / Math.sqrt(xVariance * yVariance);

    expect(Math.abs(correlation)).toBeLessThan(0.15);
    expect(footballGmSeasonRoll("stable-seed", 1)).toBe(footballGmSeasonRoll("stable-seed", 1));

    const matchSeed = "0123456789abcdef0123456789abcdef";
    const left = `${matchSeed}:11111111-1111-4111-8111-111111111111`;
    const right = `${matchSeed}:22222222-2222-4222-8222-222222222222`;
    for (const year of [1, 2, 3] as const) {
      expect(footballGmSeasonRoll(left, year)).toBe(footballGmSeasonRoll(right, year));
    }
  });

  it("makes every failed 1YR negotiation consequence a real salary increase", () => {
    const cheapOneYear = FOOTBALL_GM_PLAYER_POOL
      .filter((player) => player.gameContract === "1YR")
      .sort((left, right) => left.salaryWindow[1] - right.salaryWindow[1])[0]!;
    const base = footballGmAdjustedSalaryForPlayer(cheapOneYear, 2, "markup-floor", {});
    const once = footballGmAdjustedSalaryForPlayer(cheapOneYear, 2, "markup-floor", { [cheapOneYear.id]: 1 });
    const twice = footballGmAdjustedSalaryForPlayer(cheapOneYear, 2, "markup-floor", { [cheapOneYear.id]: 2 });

    expect(once).toBeGreaterThanOrEqual(base + 500_000);
    expect(twice).toBeGreaterThanOrEqual(base + 1_000_000);
  });

  it("keeps a weak-link effect but caps the extra double-punishment at 0.8", () => {
    const roster = weakestFullRoster();
    const penalty = footballGmWeakLinkPenalty(roster, 1);
    const grade = footballGmEffectiveTeamGrade(roster, roster, 1);
    expect(penalty).toBeGreaterThan(0);
    expect(penalty).toBeLessThanOrEqual(0.8);
    expect(grade.rawTeamGrade - grade.teamGrade).toBeCloseTo(penalty, 1);
  });

  it("rewards continuity and lets a full rebuild partially recover in Year 3", () => {
    const original = codyRunRoster();
    const intact = footballGmContinuity(original, original, 2);
    const rebuilt = fullTurnoverRoster(original);
    const resetYear2 = footballGmContinuity(original, rebuilt, 2);
    const resetYear3 = footballGmContinuity(original, rebuilt, 3);

    expect(intact.retained).toBe(7);
    expect(intact.adjustment).toBeGreaterThan(0);
    expect(resetYear2.retained).toBe(0);
    expect(resetYear2.adjustment).toBeLessThan(0);
    expect(resetYear3.adjustment).toBeGreaterThan(resetYear2.adjustment);
  });

  it("raises a 1YR star's extension demand after failed trade talks without changing his player grade", () => {
    const lamar = footballGmPlayerById(playerId("Lamar Jackson"));
    expect(lamar).not.toBeNull();
    const base = footballGmAdjustedSalaryForPlayer(lamar!, 2, "camp-test", {});
    const annoyed = footballGmAdjustedSalaryForPlayer(lamar!, 2, "camp-test", { [lamar!.id]: 1 });
    expect(base).toBe(63_500_000);
    expect(annoyed).toBeGreaterThan(base);
    expect(annoyed).toBeLessThanOrEqual(68_500_000);
    expect(lamar!.currentGrade).toBe(96);
  });

  it("allows accepted 1-for-2 packages to wait for one user-selected cut", () => {
    const roster = codyRunRoster();
    const evaluation = footballGmEvaluateTradeProposal({
      seed: "one-for-two",
      partnerTeam: "NYJ",
      roster,
      proposal: {
        outgoingPlayerIds: [playerId("Lamar Jackson")],
        incomingPlayerIds: [playerId("Geno Smith"), playerId("Garrett Wilson")],
      },
      priority: 1,
    });

    expect(evaluation.reason).not.toBe("invalid");
    expect(evaluation.reason).not.toBe("roster");
    expect(evaluation.postTradePlayerIds).toHaveLength(8);
    expect(evaluation.requiresCuts).toBe(1);
    expect(evaluation.nextRoster).toBeNull();
  });

  it("rejects packages larger than the two-player limit on either side", () => {
    const roster = codyRunRoster();
    expect(FOOTBALL_GM_MAX_TRADE_PLAYERS).toBe(2);
    const evaluation = footballGmEvaluateTradeProposal({
      seed: "too-large",
      partnerTeam: "NYJ",
      roster,
      proposal: {
        outgoingPlayerIds: roster.slice(0, 3).map((entry) => entry.playerId),
        incomingPlayerIds: [playerId("Geno Smith")],
      },
      priority: 1,
    });
    expect(evaluation.reason).toBe("invalid");
  });

  it("supports uneven cross-position trade packages instead of replacement swaps", () => {
    const roster = codyRunRoster();
    const evaluation = footballGmEvaluateTradeProposal({
      seed: "uneven-package",
      partnerTeam: "NYJ",
      roster,
      proposal: {
        outgoingPlayerIds: [playerId("Lamar Jackson"), playerId("Anthony Hill Jr.")],
        incomingPlayerIds: [playerId("Geno Smith")],
      },
      priority: 1,
    });

    expect(evaluation.reason).not.toBe("invalid");
    expect(evaluation.reason).not.toBe("roster");
    expect(evaluation.nextRoster).not.toBeNull();
    expect(evaluation.nextRoster).toHaveLength(6);
    expect(evaluation.nextRoster?.some((entry) => entry.playerId === playerId("Geno Smith"))).toBe(true);
    expect(evaluation.nextRoster?.some((entry) => entry.playerId === playerId("Lamar Jackson"))).toBe(false);
  });

  it("allows free agency for every genuine vacancy while treating displaced assets as holdings", () => {
    const sixPlayerRoster = cheapRosterMissing("LB");
    expect(footballGmCanUseFreeAgency(sixPlayerRoster)).toBe(true);

    const heldChip = FOOTBALL_GM_PLAYER_POOL.find((player) => (
      !sixPlayerRoster.some((entry) => entry.playerId === player.id)
    ))!;
    expect(footballGmCanUseFreeAgency(sixPlayerRoster, [heldChip.id])).toBe(false);

    const fivePlayerRoster = sixPlayerRoster.slice(0, 5);
    expect(footballGmCanUseFreeAgency(fivePlayerRoster, [heldChip.id])).toBe(true);
  });

  it("builds free agency only from real 1YR players outside the user's holdings", () => {
    const roster = cheapRosterMissing("LB");
    const rosterIds = new Set(roster.map((entry) => entry.playerId));
    const teams = footballGmEligibleFreeAgencyTeams({
      roster,
      seed: "real-fa-class",
      consequences: {},
    });
    expect(teams.length).toBeGreaterThan(0);

    const candidates = teams.flatMap((team) => footballGmFreeAgencyCandidatesForTeam({
      team,
      roster,
      seed: "real-fa-class",
      consequences: {},
    }));
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(({ player }) => player.gameContract === "1YR")).toBe(true);
    expect(candidates.every(({ player }) => !rosterIds.has(player.id))).toBe(true);
    expect(candidates.some(({ player }) => player.gameContract === "3YR")).toBe(false);
  });

  it("spins free agency toward teams that can directly fill a real vacancy", () => {
    const roster = cheapRosterMissing("LB");
    const teams = footballGmEligibleFreeAgencyTeams({
      roster,
      seed: "direct-vacancy-fit",
      consequences: {},
    });
    expect(teams.length).toBeGreaterThan(0);

    for (const team of teams) {
      const candidates = footballGmFreeAgencyCandidatesForTeam({
        team,
        roster,
        seed: "direct-vacancy-fit",
        consequences: {},
      });
      expect(candidates.some((candidate) => candidate.legalSlots.includes("LB"))).toBe(true);
    }
  });

  it("makes high-end 1YR talent reachable when the user preserved enough future cap room", () => {
    const { roster, candidate } = findAccessibleEliteFreeAgent();
    expect(candidate.player.currentGrade).toBeGreaterThanOrEqual(90);
    expect(candidate.player.gameContract).toBe("1YR");

    const year2 = footballGmAdjustedHoldingsCap(roster, [], 2, "elite-fa-access", {})
      + footballGmAdjustedSalaryForPlayer(candidate.player, 2, "elite-fa-access", {});
    const year3 = footballGmAdjustedHoldingsCap(roster, [], 3, "elite-fa-access", {})
      + footballGmAdjustedSalaryForPlayer(candidate.player, 3, "elite-fa-access", {});
    expect(year2).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
    expect(year3).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
  });

  it("checks every FA option against both Year 2 and Year 3 cap", () => {
    const roster = cheapRosterMissing("DB");
    const teams = footballGmEligibleFreeAgencyTeams({
      roster,
      seed: "fa-both-caps",
      consequences: {},
    });
    const candidates = teams.flatMap((team) => footballGmFreeAgencyCandidatesForTeam({
      team,
      roster,
      seed: "fa-both-caps",
      consequences: {},
    }));
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      const year2 = footballGmAdjustedHoldingsCap(roster, [], 2, "fa-both-caps", {})
        + footballGmAdjustedSalaryForPlayer(candidate.player, 2, "fa-both-caps", {});
      const year3 = footballGmAdjustedHoldingsCap(roster, [], 3, "fa-both-caps", {})
        + footballGmAdjustedSalaryForPlayer(candidate.player, 3, "fa-both-caps", {});
      expect(year2).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
      expect(year3).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
    }
  });

  it("allows a non-position-matching FA signing to displace an incumbent into normal trade flow", () => {
    const { missingSlot, roster, candidate } = findDisplacementScenario();
    const displacement = candidate.displacementOptions[0]!;
    const signed = footballGmSignFreeAgent({
      roster,
      playerId: candidate.player.id,
      slot: displacement.slot,
      displacedPlayerId: displacement.displacedPlayerId,
      seed: "displacement-scenario",
      consequences: {},
    });

    expect(signed).not.toBeNull();
    expect(signed!.roster).toHaveLength(FOOTBALL_GM_ROSTER_SLOTS.length - 1);
    expect(signed!.tradeChipPlayerIds).toEqual([displacement.displacedPlayerId]);
    expect(signed!.roster.some((entry) => entry.playerId === candidate.player.id)).toBe(true);
    expect(signed!.roster.some((entry) => entry.slot === missingSlot)).toBe(false);
    expect(new Set(signed!.roster.map((entry) => entry.slot)).size).toBe(signed!.roster.length);
    expect(new Set([
      ...signed!.roster.map((entry) => entry.playerId),
      ...signed!.tradeChipPlayerIds,
    ]).size).toBe(FOOTBALL_GM_ROSTER_SLOTS.length);

    const tradeChipId = signed!.tradeChipPlayerIds[0]!;
    const tradeChip = footballGmPlayerById(tradeChipId)!;
    const target = FOOTBALL_GM_PLAYER_POOL.find((player) => (
      player.team !== tradeChip.team
      && player.eligibleSlots.length === 1
      && player.eligibleSlots[0] === "QB"
      && !signed!.roster.some((entry) => entry.playerId === player.id)
      && !signed!.tradeChipPlayerIds.includes(player.id)
    )) ?? FOOTBALL_GM_PLAYER_POOL.find((player) => (
      player.team !== tradeChip.team
      && !signed!.roster.some((entry) => entry.playerId === player.id)
      && !signed!.tradeChipPlayerIds.includes(player.id)
    ));
    expect(target).toBeDefined();

    const evaluation = footballGmEvaluateTradeProposal({
      seed: "displaced-normal-trade",
      partnerTeam: target!.team,
      roster: signed!.roster,
      tradeChipPlayerIds: signed!.tradeChipPlayerIds,
      proposal: {
        outgoingPlayerIds: [tradeChipId],
        incomingPlayerIds: [target!.id],
      },
      priority: 1,
    });
    expect(evaluation.reason).not.toBe("invalid");
    expect(evaluation.reason).not.toBe("roster");
  });

  it("does not introduce a special post-FA trade limit or an invalid holding state", () => {
    const { roster, candidate } = findDisplacementScenario();
    const displacement = candidate.displacementOptions[0]!;
    const signed = footballGmSignFreeAgent({
      roster,
      playerId: candidate.player.id,
      slot: displacement.slot,
      displacedPlayerId: displacement.displacedPlayerId,
      seed: "repeat-trade-flow",
      consequences: {},
    });
    expect(signed).not.toBeNull();

    const firstChip = signed!.tradeChipPlayerIds[0]!;
    const firstChipPlayer = footballGmPlayerById(firstChip)!;
    const qbTarget = FOOTBALL_GM_PLAYER_POOL.find((player) => (
      player.team !== firstChipPlayer.team
      && player.eligibleSlots.length === 1
      && player.eligibleSlots[0] === "QB"
      && !signed!.roster.some((entry) => entry.playerId === player.id)
      && !signed!.tradeChipPlayerIds.includes(player.id)
    ));
    expect(qbTarget).toBeDefined();

    const afterFirstTrade = footballGmResolveTradeAssets({
      roster: signed!.roster,
      tradeChipPlayerIds: signed!.tradeChipPlayerIds,
      proposal: {
        outgoingPlayerIds: [firstChip],
        incomingPlayerIds: [qbTarget!.id],
      },
    });
    expect(afterFirstTrade).not.toBeNull();
    expect(afterFirstTrade!.roster.length + afterFirstTrade!.tradeChipPlayerIds.length).toBe(7);
    expect(new Set(afterFirstTrade!.roster.map((entry) => entry.slot)).size).toBe(afterFirstTrade!.roster.length);
    expect(new Set([
      ...afterFirstTrade!.roster.map((entry) => entry.playerId),
      ...afterFirstTrade!.tradeChipPlayerIds,
    ]).size).toBe(7);

    if (afterFirstTrade!.tradeChipPlayerIds.length) {
      const nextChip = footballGmPlayerById(afterFirstTrade!.tradeChipPlayerIds[0]!)!;
      const nextTarget = FOOTBALL_GM_PLAYER_POOL.find((player) => (
        player.team !== nextChip.team
        && !afterFirstTrade!.roster.some((entry) => entry.playerId === player.id)
        && !afterFirstTrade!.tradeChipPlayerIds.includes(player.id)
      ));
      expect(nextTarget).toBeDefined();
      const secondEvaluation = footballGmEvaluateTradeProposal({
        seed: "repeat-trade-flow-2",
        partnerTeam: nextTarget!.team,
        roster: afterFirstTrade!.roster,
        tradeChipPlayerIds: afterFirstTrade!.tradeChipPlayerIds,
        proposal: {
          outgoingPlayerIds: [nextChip.id],
          incomingPlayerIds: [nextTarget!.id],
        },
        priority: 1,
      });
      expect(secondEvaluation.reason).not.toBe("invalid");
      expect(secondEvaluation.reason).not.toBe("roster");
    }
  });

  it("routes a legal 2-for-1 vacancy into the cap-safe 1YR free-agent market", () => {
    const roster = codyRunRoster();
    const evaluation = footballGmEvaluateTradeProposal({
      seed: "free-agency-vacancy",
      partnerTeam: "NYJ",
      roster,
      proposal: {
        outgoingPlayerIds: [playerId("Lamar Jackson"), playerId("Anthony Hill Jr.")],
        incomingPlayerIds: [playerId("Geno Smith")],
      },
      priority: 1,
    });

    expect(evaluation.reason).not.toBe("invalid");
    expect(evaluation.reason).not.toBe("roster");
    expect(evaluation.nextRoster).not.toBeNull();
    expect(evaluation.nextRoster).toHaveLength(6);

    const teams = footballGmEligibleFreeAgencyTeams({
      roster: evaluation.nextRoster!,
      seed: "free-agency-vacancy",
      consequences: {},
    });
    expect(teams.length).toBeGreaterThan(0);

    const candidates = footballGmFreeAgencyCandidatesForTeam({
      team: teams[0]!,
      roster: evaluation.nextRoster!,
      seed: "free-agency-vacancy",
      consequences: {},
    });
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((candidate) => candidate.player.gameContract === "1YR")).toBe(true);
    expect(candidates.every((candidate) => (
      candidate.legalSlots.length > 0 || candidate.displacementOptions.length > 0
    ))).toBe(true);
  });

  it("keeps a voluntarily released player off that free-agency spin", () => {
    const roster: FootballGmRosterEntry[] = [
      { slot: "WR", playerId: playerId("Jaxon Smith-Njigba"), acquired: "draft" },
      { slot: "DL", playerId: playerId("Rueben Bain Jr."), acquired: "draft" },
      { slot: "DB", playerId: playerId("Pat Surtain II"), acquired: "draft" },
      { slot: "FLEX", playerId: playerId("Trey McBride"), acquired: "draft" },
      { slot: "RB", playerId: playerId("Kenneth Walker"), acquired: "draft" },
      { slot: "LB", playerId: playerId("Edgerrin Cooper"), acquired: "draft" },
      { slot: "QB", playerId: playerId("Jayden Daniels"), acquired: "draft" },
    ];
    const releasedId = playerId("Edgerrin Cooper");
    const stripped = roster.filter((entry) => entry.playerId !== releasedId);
    const teams = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      seed: "voluntary-free-agency",
      consequences: {},
      excludedPlayerIds: [releasedId],
    });

    expect(teams.length).toBeGreaterThan(0);
    for (const team of teams) {
      const candidates = footballGmFreeAgencyCandidatesForTeam({
        team,
        roster: stripped,
        seed: "voluntary-free-agency",
        consequences: {},
        excludedPlayerIds: [releasedId],
      });
      expect(candidates.some((candidate) => candidate.player.id === releasedId)).toBe(false);
    }
  });

  it("uses only a zero to 2.5 percent CPU trade premium", () => {
    const roster = codyRunRoster();
    const thresholds = new Set<number>();
    for (let index = 0; index < 200; index += 1) {
      const evaluation = footballGmEvaluateTradeProposal({
        seed: `threshold-${index}`,
        partnerTeam: "NYJ",
        roster,
        proposal: {
          outgoingPlayerIds: [playerId("Lamar Jackson")],
          incomingPlayerIds: [playerId("Geno Smith")],
        },
        priority: 1,
      });
      thresholds.add(evaluation.threshold);
      expect(evaluation.threshold).toBeGreaterThanOrEqual(1);
      expect(evaluation.threshold).toBeLessThanOrEqual(1.025);
    }
    expect(thresholds.has(1)).toBe(true);
    expect(thresholds.has(1.025)).toBe(true);
  });

  it("curates asking prices to non-dominated near-threshold packages with useful shape diversity", () => {
    const roster: FootballGmRosterEntry[] = [
      { slot: "WR", playerId: playerId("Jaxon Smith-Njigba"), acquired: "draft" },
      { slot: "DL", playerId: playerId("Rueben Bain Jr."), acquired: "draft" },
      { slot: "DB", playerId: playerId("Pat Surtain II"), acquired: "draft" },
      { slot: "FLEX", playerId: playerId("Trey McBride"), acquired: "draft" },
      { slot: "RB", playerId: playerId("Kenneth Walker"), acquired: "draft" },
      { slot: "LB", playerId: playerId("Edgerrin Cooper"), acquired: "draft" },
      { slot: "QB", playerId: playerId("Jayden Daniels"), acquired: "draft" },
    ];
    const anchorPlayerId = playerId("Edgerrin Cooper");
    const targetPlayerId = playerId("Devin Lloyd");
    const offers = footballGmAcceptedTargetTradeOffers({
      seed: "4f21ffe3-2802-45a6-8941-a6ae81b49ca3",
      partnerTeam: "CAR",
      roster,
      anchorPlayerId,
      targetPlayerId,
      shoppedPlayerIds: [anchorPlayerId],
      maxOffers: 5,
    });

    expect(offers.length).toBeGreaterThan(0);
    expect(offers.length).toBeLessThanOrEqual(5);
    expect(new Set(offers.map((offer) => JSON.stringify(offer.proposal))).size).toBe(offers.length);
    const slacks = offers.map(footballGmTradeOfferAcceptanceSlack);
    expect(Math.max(...slacks) - Math.min(...slacks)).toBeLessThanOrEqual(0.0800001);

    for (const [index, offer] of offers.entries()) {
      expect(offer.evaluation.accepted).toBe(true);
      expect(offer.proposal.outgoingPlayerIds).toContain(anchorPlayerId);
      expect(offer.proposal.incomingPlayerIds).toContain(targetPlayerId);
      for (const [otherIndex, other] of offers.entries()) {
        if (index === otherIndex) continue;
        expect(footballGmTargetOfferDominates(other, offer)).toBe(false);
      }
    }
  });

  it("does not make an identical second offer easier just because it is Priority 2", () => {
    const roster = codyRunRoster();
    const proposal = {
      outgoingPlayerIds: [playerId("Lamar Jackson")],
      incomingPlayerIds: [playerId("Geno Smith")],
    };
    const first = footballGmEvaluateTradeProposal({
      seed: "same-package",
      partnerTeam: "NYJ",
      roster,
      proposal,
      priority: 1,
    });
    const second = footballGmEvaluateTradeProposal({
      seed: "same-package",
      partnerTeam: "NYJ",
      roster,
      proposal,
      priority: 2,
    });

    expect(second.threshold).toBe(first.threshold);
    expect(second.accepted).toBe(first.accepted);
  });

  it("keeps all roster slots unique after a legal trade reassignment", () => {
    const roster = codyRunRoster();
    const evaluation = footballGmEvaluateTradeProposal({
      seed: "slot-test",
      partnerTeam: "NYJ",
      roster,
      proposal: {
        outgoingPlayerIds: [playerId("Lamar Jackson")],
        incomingPlayerIds: [playerId("Geno Smith")],
      },
      priority: 1,
    });
    expect(evaluation.nextRoster).not.toBeNull();
    const slots = evaluation.nextRoster!.map((entry) => entry.slot as FootballGmRosterSlot);
    expect(new Set(slots).size).toBe(slots.length);
  });
});
