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
  FOOTBALL_GM_MAX_TRADE_PLAYERS,
  FOOTBALL_GM_POSITION_WEIGHTS,
  footballGmAdjustedSalaryForPlayer,
  footballGmContinuity,
  footballGmEffectiveTeamGrade,
  footballGmEligibleFreeAgencyTeams,
  footballGmEvaluateTradeProposal,
  footballGmFreeAgencyCandidatesForTeam,
  footballGmSeasonResultV2,
  footballGmSeasonRoll,
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

describe("Football GM strategy v2", () => {
  it("uses the calibrated $150M game cap and raises RB to ten percent", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_POSITION_WEIGHTS.RB).toBe(0.10);
    expect(Object.values(FOOTBALL_GM_POSITION_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
  });

  it("anchors outcomes to derived 2021-2025 finalist cores instead of hand-entered grades", () => {
    expect(FOOTBALL_GM_HISTORICAL_FINAL_FOUR).toHaveLength(20);
    expect(new Set(FOOTBALL_GM_HISTORICAL_FINAL_FOUR.map((row) => row.season))).toEqual(
      new Set([2021, 2022, 2023, 2024, 2025]),
    );
    const champions = FOOTBALL_GM_HISTORICAL_FINAL_FOUR.filter((row) => row.finish === "Champion");
    expect(champions).toHaveLength(5);
    expect(FOOTBALL_GM_HISTORICAL_ANCHORS.finalFourMin).toBe(92.4);
    expect(FOOTBALL_GM_HISTORICAL_ANCHORS.finalFourMedian).toBe(95.1);
    expect(FOOTBALL_GM_HISTORICAL_ANCHORS.championAverage).toBeCloseTo(95.42, 2);

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

  it("applies a modest weak-link effect without erasing positional value", () => {
    const roster = codyRunRoster();
    const grade = footballGmEffectiveTeamGrade(roster, roster, 1);
    expect(grade.rawTeamGrade).toBeGreaterThan(grade.teamGrade);
    expect(grade.weakLinkPenalty).toBeGreaterThan(0);
    expect(grade.weakLinkPenalty).toBeLessThanOrEqual(1.5);
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
