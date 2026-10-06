import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  FOOTBALL_GM_TEAMS,
  footballGmOpenSlots,
  footballGmPlayerById,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_HISTORICAL_FINAL_FOUR,
  FOOTBALL_GM_MAX_TRADE_PLAYERS,
  FOOTBALL_GM_POSITION_WEIGHTS,
  footballGmAcceptedTargetTradeOffers,
  footballGmAdjustedAssetCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmApplyFreeAgencySigning,
  footballGmContinuity,
  footballGmCurateAcceptedTargetTradeOffers,
  footballGmEffectiveTeamGrade,
  footballGmEligibleFreeAgencyTeams,
  footballGmEvaluateTradeProposal,
  footballGmFreeAgencyCandidatesForTeam,
  footballGmIsOffseasonCompliantV2,
  footballGmSeasonResultV2,
  footballGmSeasonRoll,
  footballGmTitleOdds,
  footballGmTradeAcceptanceMargin,
  footballGmTradeOfferDominates,
  footballGmWeakLinkPenalty,
  type FootballGmTargetTradeOffer,
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

function cheapestRoster(openSlot?: FootballGmRosterSlot): FootballGmRosterEntry[] {
  const usedIds = new Set<string>();
  const usedNames = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS
    .filter((slot) => slot !== openSlot)
    .map((slot) => {
      const player = [...FOOTBALL_GM_PLAYER_POOL]
        .filter((candidate) => (
          candidate.eligibleSlots.includes(slot)
          && !usedIds.has(candidate.id)
          && !usedNames.has(candidate.name)
        ))
        .sort((left, right) => (
          Math.max(left.salaryWindow[1], left.salaryWindow[2]) - Math.max(right.salaryWindow[1], right.salaryWindow[2])
          || left.currentGrade - right.currentGrade
        ))[0];
      if (!player) throw new Error(`No cheap player for ${slot}`);
      usedIds.add(player.id);
      usedNames.add(player.name);
      return { slot, playerId: player.id, acquired: "draft" as const };
    });
}

function weakestRoster(): FootballGmRosterEntry[] {
  const usedIds = new Set<string>();
  const usedNames = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = [...FOOTBALL_GM_PLAYER_POOL]
      .filter((candidate) => (
        candidate.eligibleSlots.includes(slot)
        && !usedIds.has(candidate.id)
        && !usedNames.has(candidate.name)
      ))
      .sort((left, right) => left.currentGrade - right.currentGrade)[0];
    if (!player) throw new Error(`No weak player for ${slot}`);
    usedIds.add(player.id);
    usedNames.add(player.name);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

function acceptedOffer(input: {
  shape: FootballGmTargetTradeOffer["shape"];
  outgoing: string[];
  incoming: string[];
  receives: number;
  sends: number;
  threshold?: number;
  cuts?: number;
}): FootballGmTargetTradeOffer {
  return {
    shape: input.shape,
    proposal: {
      outgoingPlayerIds: input.outgoing,
      incomingPlayerIds: input.incoming,
    },
    evaluation: {
      accepted: true,
      reason: "accepted",
      partnerReceivesValue: input.receives,
      partnerSendsValue: input.sends,
      threshold: input.threshold ?? 1,
      postTradePlayerIds: [],
      requiresCuts: input.cuts ?? 0,
      nextRoster: null,
    },
  };
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

describe("Football GM strategy v2", () => {
  it("uses the calibrated $150M game cap and raises RB to ten percent", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_POSITION_WEIGHTS.RB).toBe(0.10);
    expect(Object.values(FOOTBALL_GM_POSITION_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
  });

  it("calibrates postseason odds to the live Wheel/GM grade scale rather than the AV percentile scale", () => {
    expect(FOOTBALL_GM_HISTORICAL_FINAL_FOUR).toHaveLength(20);
    expect(new Set(FOOTBALL_GM_HISTORICAL_FINAL_FOUR.map((row) => row.season))).toEqual(
      new Set([2021, 2022, 2023, 2024, 2025]),
    );

    expect(footballGmTitleOdds(90)).toBeCloseTo(0.09, 6);
    expect(footballGmTitleOdds(92)).toBeCloseTo(0.16, 6);
    expect(footballGmTitleOdds(94)).toBeCloseTo(0.27, 6);
    expect(footballGmTitleOdds(94)).toBeGreaterThan(footballGmTitleOdds(92));
    expect(footballGmTitleOdds(92)).toBeGreaterThan(footballGmTitleOdds(88));

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
  });

  it("keeps a softer weak-link penalty without double-punishing already-low player grades", () => {
    const roster = weakestRoster();
    const grade = footballGmEffectiveTeamGrade(roster, roster, 1);
    expect(footballGmWeakLinkPenalty(roster, 1)).toBeGreaterThan(0);
    expect(grade.weakLinkPenalty).toBeLessThanOrEqual(0.8);
    expect(grade.rawTeamGrade - grade.teamGrade).toBeCloseTo(grade.weakLinkPenalty, 1);
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

  it("routes a legal 2-for-1 vacancy into cap-safe free agency", () => {
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
    expect(candidates.every((candidate) => candidate.legalSlots.length > 0)).toBe(true);
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

  it("builds the free-agent class only from actual 1YR players who are not already owned", () => {
    const mixedTeam = FOOTBALL_GM_TEAMS.find((team) => {
      const rows = FOOTBALL_GM_PLAYER_POOL.filter((player) => player.team === team);
      return rows.some((player) => player.gameContract === "1YR")
        && rows.some((player) => player.gameContract === "3YR");
    });
    expect(mixedTeam).toBeTruthy();

    const candidates = footballGmFreeAgencyCandidatesForTeam({
      team: mixedTeam!,
      roster: [],
      seed: "real-fa-class",
      consequences: {},
    });
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((candidate) => candidate.player.gameContract === "1YR")).toBe(true);

    const controlled = FOOTBALL_GM_PLAYER_POOL.find(
      (player) => player.team === mixedTeam && player.gameContract === "3YR",
    );
    expect(controlled).toBeTruthy();
    expect(candidates.some((candidate) => candidate.player.id === controlled!.id)).toBe(false);

    const owned = candidates[0]!;
    const ownedRoster: FootballGmRosterEntry[] = [{
      slot: owned.signingOptions[0]!.slot,
      playerId: owned.player.id,
      acquired: "draft",
    }];
    const afterOwnership = footballGmFreeAgencyCandidatesForTeam({
      team: mixedTeam!,
      roster: ownedRoster,
      seed: "real-fa-class",
      consequences: {},
    });
    expect(afterOwnership.some((candidate) => candidate.player.id === owned.player.id)).toBe(false);
  });

  it("lets real cap space expose market-priced free agents and enforces both future caps", () => {
    const roster = cheapestRoster();
    const yearTwoBase = footballGmAdjustedAssetCap(roster, [], 2, "fa-cap", {});
    const yearThreeBase = footballGmAdjustedAssetCap(roster, [], 3, "fa-cap", {});
    expect(yearTwoBase).toBeLessThan(FOOTBALL_GM_CAP);
    expect(yearThreeBase).toBeLessThan(FOOTBALL_GM_CAP);

    const teams = footballGmEligibleFreeAgencyTeams({
      roster,
      seed: "fa-cap",
      consequences: {},
    });
    expect(teams.length).toBeGreaterThan(0);
    const candidates = teams.flatMap((team) => footballGmFreeAgencyCandidatesForTeam({
      team,
      roster,
      seed: "fa-cap",
      consequences: {},
    }));
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(candidate.player.gameContract).toBe("1YR");
      expect(yearTwoBase + candidate.player.salaryWindow[1]).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
      expect(yearThreeBase + candidate.player.salaryWindow[2]).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
    }
  });

  it("allows an off-position free-agent signing to displace an incumbent while preserving the original vacancy", () => {
    const roster = cheapestRoster("LB");
    const incumbent = roster.find((entry) => entry.slot === "WR");
    expect(incumbent).toBeTruthy();

    const candidate = FOOTBALL_GM_TEAMS
      .flatMap((team) => footballGmFreeAgencyCandidatesForTeam({
        team,
        roster,
        seed: "off-position-fa",
        consequences: {},
      }))
      .find((row) => row.signingOptions.some(
        (option) => option.slot === "WR" && option.displacedPlayerId === incumbent!.playerId,
      ));
    expect(candidate).toBeTruthy();

    const signing = footballGmApplyFreeAgencySigning({
      roster,
      playerId: candidate!.player.id,
      slot: "WR",
      seed: "off-position-fa",
      consequences: {},
    });
    expect(signing).not.toBeNull();
    expect(signing!.roster).toHaveLength(roster.length);
    expect(footballGmOpenSlots(signing!.roster)).toContain("LB");
    expect(signing!.tradeChipPlayerIds).toContain(incumbent!.playerId);
    expect(signing!.roster.find((entry) => entry.slot === "WR")?.playerId).toBe(candidate!.player.id);
    expect(new Set(signing!.roster.map((entry) => entry.slot)).size).toBe(signing!.roster.length);
  });

  it("lets a displaced incumbent enter the normal trade flow without forcing a one-for-one position match", () => {
    const roster = cheapestRoster("LB");
    const incumbent = roster.find((entry) => entry.slot === "WR")!;
    const candidate = FOOTBALL_GM_TEAMS
      .flatMap((team) => footballGmFreeAgencyCandidatesForTeam({
        team,
        roster,
        seed: "chip-trade",
        consequences: {},
      }))
      .find((row) => row.signingOptions.some(
        (option) => option.slot === "WR" && option.displacedPlayerId === incumbent.playerId,
      ))!;
    const signing = footballGmApplyFreeAgencySigning({
      roster,
      playerId: candidate.player.id,
      slot: "WR",
      seed: "chip-trade",
      consequences: {},
    })!;
    const owned = new Set([
      ...signing.roster.map((entry) => entry.playerId),
      ...signing.tradeChipPlayerIds,
    ]);
    const target = FOOTBALL_GM_PLAYER_POOL.find((player) => (
      player.eligibleSlots.includes("LB") && !owned.has(player.id)
    ));
    expect(target).toBeTruthy();

    const evaluation = footballGmEvaluateTradeProposal({
      seed: "chip-trade",
      partnerTeam: target!.team,
      roster: signing.roster,
      tradeChipPlayerIds: signing.tradeChipPlayerIds,
      proposal: {
        outgoingPlayerIds: [incumbent.playerId],
        incomingPlayerIds: [target!.id],
      },
      priority: 1,
    });
    expect(evaluation.reason).not.toBe("invalid");
    expect(evaluation.reason).not.toBe("roster");
    expect(evaluation.nextRoster).toHaveLength(7);
    expect(evaluation.nextRoster?.some((entry) => entry.playerId === target!.id)).toBe(true);
  });

  it("does not introduce a special post-FA move limit and blocks finishing with unresolved trade chips", () => {
    const roster = cheapestRoster();
    const firstTeams = footballGmEligibleFreeAgencyTeams({
      roster,
      seed: "fa-breathes",
      consequences: {},
    });
    expect(firstTeams.length).toBeGreaterThan(0);
    const first = footballGmFreeAgencyCandidatesForTeam({
      team: firstTeams[0]!,
      roster,
      seed: "fa-breathes",
      consequences: {},
    })[0]!;
    const firstOption = first.signingOptions[0]!;
    const signing = footballGmApplyFreeAgencySigning({
      roster,
      playerId: first.player.id,
      slot: firstOption.slot,
      seed: "fa-breathes",
      consequences: {},
    });
    expect(signing).not.toBeNull();
    expect(signing!.tradeChipPlayerIds.length).toBeGreaterThan(0);
    expect(footballGmIsOffseasonCompliantV2(
      signing!.roster,
      "fa-breathes",
      {},
      signing!.tradeChipPlayerIds,
    )).toBe(false);

    const nextTeams = footballGmEligibleFreeAgencyTeams({
      roster: signing!.roster,
      tradeChipPlayerIds: signing!.tradeChipPlayerIds,
      seed: "fa-breathes",
      consequences: {},
    });
    expect(nextTeams.length).toBeGreaterThan(0);
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

  it("removes dominated asking prices instead of charging extra assets for the same return", () => {
    const straightUp = acceptedOffer({
      shape: "1-for-1",
      outgoing: ["anchor"],
      incoming: ["target"],
      receives: 101,
      sends: 100,
    });
    const dominated = acceptedOffer({
      shape: "2-for-1",
      outgoing: ["anchor", "star"],
      incoming: ["target"],
      receives: 170,
      sends: 100,
    });
    expect(footballGmTradeOfferDominates(straightUp, dominated)).toBe(true);

    const curated = footballGmCurateAcceptedTargetTradeOffers({
      seed: "dominated",
      partnerTeam: "NYJ",
      targetPlayerId: "target",
      accepted: [dominated, straightUp],
      maxOffers: 5,
    });
    expect(curated).toHaveLength(1);
    expect(curated[0]!.proposal).toEqual(straightUp.proposal);
  });

  it("prefers accepted asking prices closest to the CPU threshold within the same package shape", () => {
    const near = acceptedOffer({
      shape: "2-for-2",
      outgoing: ["anchor", "a"],
      incoming: ["target", "x"],
      receives: 102,
      sends: 100,
      threshold: 1.01,
    });
    const generous = acceptedOffer({
      shape: "2-for-2",
      outgoing: ["anchor", "b"],
      incoming: ["target", "y"],
      receives: 130,
      sends: 100,
      threshold: 1,
    });
    expect(footballGmTradeAcceptanceMargin(near)).toBeLessThan(footballGmTradeAcceptanceMargin(generous));

    const curated = footballGmCurateAcceptedTargetTradeOffers({
      seed: "near-threshold",
      partnerTeam: "NYJ",
      targetPlayerId: "target",
      accepted: [generous, near],
      maxOffers: 1,
    });
    expect(curated).toHaveLength(1);
    expect(curated[0]!.proposal).toEqual(near.proposal);
  });

  it("turns a chosen trade target into no more than five already-accepted asking prices", () => {
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
    for (const offer of offers) {
      expect(offer.evaluation.accepted).toBe(true);
      expect(offer.proposal.outgoingPlayerIds).toContain(anchorPlayerId);
      expect(offer.proposal.incomingPlayerIds).toContain(targetPlayerId);
      expect(offer.evaluation.threshold).toBeGreaterThanOrEqual(1);
      expect(offer.evaluation.threshold).toBeLessThanOrEqual(1.025);
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
