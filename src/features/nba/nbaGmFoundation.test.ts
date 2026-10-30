import { describe, expect, it } from "vitest";
import {
  NBA_GM_BUDGET_SCENARIOS,
  NBA_GM_ROSTER_SLOTS,
  NBA_GM_TEAM_CODES,
  nbaGmCatalogErrors,
  nbaGmEligibleForSlot,
  nbaGmRosterReview,
  nbaGmRosterTraitAverages,
  nbaGmTeamCandidates,
  type NbaGmPlayer,
  type NbaGmPosition,
  type NbaGmPick,
  type NbaGmSalaryWindow,
  type NbaGmTeamCode,
} from "./nbaGmFoundation";

const cap: NbaGmSalaryWindow = [185_000_000, 185_000_000, 185_000_000];

function syntheticPlayer(
  id: string,
  positions: readonly NbaGmPosition[],
  teamCode: NbaGmTeamCode = "ATL",
  salary = 20_000_000,
  overall = 83,
): NbaGmPlayer {
  return {
    id,
    name: "Synthetic " + id,
    teamCode,
    positions,
    currentGrade: overall,
    salaries: [salary, salary + 1_000_000, salary + 2_000_000],
    skills: {
      scoring: 80,
      playmaking: 85,
      shooting: 75,
      perimeterDefense: 90,
      interiorDefense: 70,
      rebounding: 65,
    },
    sources: {
      rosterUrl: "https://example.org/rosters",
      contractUrl: "https://example.org/contracts",
      abilityUrls: ["https://example.org/scouting"],
    },
  };
}

const roster = [
  syntheticPlayer("point", ["PG"]),
  syntheticPlayer("shooting", ["SG"]),
  syntheticPlayer("wing", ["SF"]),
  syntheticPlayer("forward", ["PF"]),
  syntheticPlayer("center", ["C"]),
  syntheticPlayer("sixth", ["PG", "SG"]),
  syntheticPlayer("flex", ["PF", "C"]),
];
const picks: NbaGmPick[] = roster.map((player, index) => ({
  slot: NBA_GM_ROSTER_SLOTS[index]!,
  playerId: player.id,
}));
const byId = new Map(roster.map(player => [player.id, player]));

describe("NBA GM unreleased seven-player foundation", () => {
  it("supports all 30 NBA teams and calibration-only budget scenarios", () => {
    expect(NBA_GM_TEAM_CODES.length).toBe(30);
    expect(new Set(NBA_GM_TEAM_CODES).size).toBe(30);
    expect(NBA_GM_ROSTER_SLOTS).toEqual(["PG", "SG", "SF", "PF", "C", "SIXTH", "FLEX"]);
    expect(NBA_GM_BUDGET_SCENARIOS).toEqual([185_000_000, 192_500_000, 200_000_000]);
  });

  it("validates a complete seven-player rotation and all three game-season budgets", () => {
    const review = nbaGmRosterReview(picks, byId, cap, true);
    expect(review.valid).toBe(true);
    expect(review.complete).toBe(true);
    expect(review.spendBySeason).toEqual([140_000_000, 147_000_000, 154_000_000]);
    expect(nbaGmRosterReview(picks, byId, [185_000_000, 185_000_000, 150_000_000]).errors)
      .toContain("NBA salary budget exceeded for season 3.");
  });

  it("keeps multidimensional eligibility without letting a center masquerade as PG", () => {
    expect(nbaGmEligibleForSlot(roster[5]!, "SG")).toBe(true);
    expect(nbaGmEligibleForSlot(roster[4]!, "PG")).toBe(false);
    expect(nbaGmEligibleForSlot(roster[4]!, "SIXTH")).toBe(true);
    const illegal = picks.map((pick, i) => i === 0 ? { ...pick, playerId: "center" } : pick);
    const review = nbaGmRosterReview(illegal, byId, cap);
    expect(review.errors).toContain("NBA player not eligible for slot: center / PG");
    expect(review.errors).toContain("Duplicate NBA player selection: center");
  });

  it("does not allow duplicate slots, unknown players or incomplete submitted teams", () => {
    expect(nbaGmRosterReview(picks.slice(0, 6), byId, cap, true).complete).toBe(false);
    expect(nbaGmRosterReview(picks.slice(0, 6), byId, cap, true).valid).toBe(false);
    expect(nbaGmRosterReview([...picks.slice(0, 1), picks[0]!], byId, cap).errors)
      .toContain("Duplicate NBA roster slot: PG");
    expect(nbaGmRosterReview([{ slot: "PG", playerId: "missing" }], byId, cap).errors)
      .toContain("Unknown NBA player: missing");
  });

  it("only previews affordable eligible players from the actually spun team", () => {
    const catalog = [
      ...roster,
      syntheticPlayer("budget-buster", ["SG"], "ATL", 190_000_000, 99),
      syntheticPlayer("higher-rated", ["PG"], "ATL", 4_000_000, 94),
      syntheticPlayer("other-team", ["PG"], "BOS", 4_000_000, 99),
    ];
    const options = nbaGmTeamCandidates("ATL", "PG", [], catalog, cap);
    expect(options.map(player => player.id)).toEqual(["higher-rated", "point", "sixth"]);
    expect(nbaGmTeamCandidates("ATL", "PG", [{ slot: "PG", playerId: "point" }], catalog, cap)).toEqual([]);
    expect(nbaGmTeamCandidates("ATL", "FLEX", [{ slot: "PG", playerId: "point" }], catalog, cap)
      .some(player => player.id === "point")).toBe(false);
  });

  it("fails closed on missing identity, source evidence, abilities and salary inputs", () => {
    expect(nbaGmCatalogErrors(roster)).toEqual([]);
    expect(nbaGmCatalogErrors([])).toContain("NBA research catalog is empty; no players may be published.");
    const broken = {
      ...roster[0]!,
      salaries: [20_000_000, -1, 20_000_000] as NbaGmSalaryWindow,
      skills: { ...roster[0]!.skills, shooting: NaN },
      sources: { ...roster[0]!.sources, abilityUrls: [] },
    };
    const errors = nbaGmCatalogErrors([broken, broken]);
    expect(errors.some(error => error.includes("Duplicate or empty NBA player identity"))).toBe(true);
    expect(errors.some(error => error.includes("Invalid three-season NBA game salary"))).toBe(true);
    expect(errors.some(error => error.includes("Missing or invalid NBA skill grade"))).toBe(true);
    expect(errors.some(error => error.includes("Missing evidence"))).toBe(true);
  });

  it("exposes raw basketball skills without inventing team-chemistry or championship scores", () => {
    const traits = nbaGmRosterTraitAverages(picks, byId);
    expect(traits).toEqual({
      scoring: 80, playmaking: 85, shooting: 75,
      perimeterDefense: 90, interiorDefense: 70, rebounding: 65,
    });
    expect(nbaGmRosterTraitAverages([{ slot: "PG", playerId: "missing" }], byId)).toBeNull();
  });
});
