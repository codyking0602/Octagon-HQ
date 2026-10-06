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
  FOOTBALL_GM_HISTORICAL_FINAL_FOUR,
  FOOTBALL_GM_POSITION_WEIGHTS,
  footballGmAdjustedSalaryForPlayer,
  footballGmContinuity,
  footballGmEffectiveTeamGrade,
  footballGmEvaluateTradeProposal,
  footballGmSeasonResultV2,
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
  it("uses the tighter $120M game cap and raises RB to ten percent", () => {
    expect(FOOTBALL_GM_CAP).toBe(120_000_000);
    expect(FOOTBALL_GM_POSITION_WEIGHTS.RB).toBe(0.10);
    expect(Object.values(FOOTBALL_GM_POSITION_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
  });

  it("anchors the model to five real recent NFL final fours without making any grade an automatic finish", () => {
    expect(FOOTBALL_GM_HISTORICAL_FINAL_FOUR).toHaveLength(20);
    expect(new Set(FOOTBALL_GM_HISTORICAL_FINAL_FOUR.map((row) => row.season))).toEqual(
      new Set([2021, 2022, 2023, 2024, 2025]),
    );
    const champions = FOOTBALL_GM_HISTORICAL_FINAL_FOUR.filter((row) => row.finish === "Champion");
    expect(champions).toHaveLength(5);

    const roster = codyRunRoster();
    const outcomes = new Set<string>();
    for (let index = 0; index < 40; index += 1) {
      outcomes.add(footballGmSeasonResultV2({
        seed: `variance-${index}`,
        yearOneRoster: roster,
        roster,
        year: 1,
      }).finish);
    }
    expect(outcomes.size).toBeGreaterThan(1);
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
