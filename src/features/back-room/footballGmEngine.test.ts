import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  FOOTBALL_GM_TEAMS,
  footballGmCandidatesForTeam,
  footballGmEligibleTeams,
  footballGmFinalResult,
  footballGmIsOffseasonCompliant,
  footballGmPlayerById,
  footballGmRosterCap,
  footballGmSeasonResult,
  footballGmSpinTeam,
  footballGmTradeOffers,
  type FootballGmRosterEntry,
} from "./footballGmEngine";

function greedyValueRoster(seed = "gm-engine-test") {
  const roster: FootballGmRosterEntry[] = [];
  let previousTeam: string | null = null;

  for (let turn = 0; turn < FOOTBALL_GM_ROSTER_SLOTS.length; turn += 1) {
    const teams = footballGmEligibleTeams({ roster, previousTeam, year: 1 });
    const team = footballGmSpinTeam(seed, turn, teams);
    expect(team).not.toBeNull();
    const candidates = footballGmCandidatesForTeam({ team: team!, roster, year: 1 });
    expect(candidates.length).toBeGreaterThan(0);
    const candidate = [...candidates].sort((left, right) => left.salary - right.salary)[0]!;
    roster.push({
      slot: candidate.legalSlots[0]!,
      playerId: candidate.player.id,
      acquired: "draft",
    });
    previousTeam = candidate.player.team;
  }

  return roster;
}

describe("Football GM playtest engine", () => {
  it("uses the complete contract authority without changing the seven locked GM slots", () => {
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(FOOTBALL_GM_TEAMS).toHaveLength(32);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toEqual(["QB", "RB", "WR", "FLEX", "DL", "LB", "DB"]);
  });

  it("builds a deterministic legal Year 1 roster under the $155M cap", () => {
    const left = greedyValueRoster("same-seed");
    const right = greedyValueRoster("same-seed");
    expect(right).toEqual(left);
    expect(left).toHaveLength(7);
    expect(new Set(left.map((entry) => entry.slot)).size).toBe(7);
    expect(footballGmRosterCap(left, 1)).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
  });

  it("keeps exact future extension money hidden from the draft-facing risk model but applies it internally", () => {
    const puka = FOOTBALL_GM_PLAYER_POOL.find((player) => player.name === "Puka Nacua");
    expect(puka).toBeDefined();
    expect(puka!.gameContract).toBe("1YR");
    expect(puka!.salaryWindow[0]).toBe(1_021_245);
    expect(puka!.salaryWindow[1]).toBe(41_000_000);
    expect(puka!.salaryWindow[2]).toBe(41_000_000);
    expect(puka!.extensionRisk).toBe("HIGH");
  });

  it("creates deterministic season results and the locked three-year score math", () => {
    const roster = greedyValueRoster("season-score");
    const yearOne = footballGmSeasonResult(roster, 1);
    const yearTwo = footballGmSeasonResult(roster, 2);
    const yearThree = footballGmSeasonResult(roster, 3);
    const result = footballGmFinalResult(roster, roster);

    expect(yearOne.teamGrade).toBeGreaterThan(0);
    expect(yearTwo.teamGrade).toBeGreaterThan(0);
    expect(yearThree.teamGrade).toBeGreaterThan(0);
    expect(result.coreScore).toBeCloseTo(
      (yearOne.teamGrade + yearTwo.teamGrade + yearThree.teamGrade) / 3,
      1,
    );
    expect(result.score).toBeCloseTo(result.coreScore + result.postseasonBonus, 1);
  });

  it("generates no more than two deterministic CPU trade offers and never duplicates the incoming player", () => {
    const roster = greedyValueRoster("trade-roster");
    const offers = footballGmTradeOffers("trade-seed", roster);
    expect(offers.length).toBeLessThanOrEqual(2);
    expect(new Set(offers.map((offer) => offer.incomingPlayerId)).size).toBe(offers.length);
    for (const offer of offers) {
      expect(footballGmPlayerById(offer.outgoingPlayerId)).not.toBeNull();
      expect(footballGmPlayerById(offer.incomingPlayerId)).not.toBeNull();
      expect(offer.yearTwoSavings).toBeGreaterThan(0);
    }
  });

  it("recognizes a value-oriented roster that survives the offseason", () => {
    const roster = greedyValueRoster("cheap-window");
    expect(footballGmIsOffseasonCompliant(roster)).toBe(
      footballGmRosterCap(roster, 2) <= FOOTBALL_GM_CAP
      && footballGmRosterCap(roster, 3) <= FOOTBALL_GM_CAP,
    );
  });
});
