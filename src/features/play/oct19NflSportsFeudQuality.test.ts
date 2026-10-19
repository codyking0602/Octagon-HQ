import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer } from "../games/familyFeudEngine";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import { buildFamilyFeudDailySetup } from "./familyFeudDailyRuntime";

const day = "2026-10-19";
const main = [
  "Name an NFL team in the AFC East or NFC East.",
  "Name an NFL franchise that has won at least two Super Bowls.",
];
const fast = [
  "Name one of the NFL's geographic divisions.",
  "Name a current NFL franchise that began play before 1970.",
  "Name an NFL defender with at least 100 official regular-season sacks.",
  "Name a player who made the Pro Bowl while playing for the Raiders.",
  "Name a tight end with at least 5,000 NFL regular-season receiving yards.",
];

describe("October 19 NFL Sports Feud editorial replacement", () => {
  const pack = buildSportsFeudPack("nfl", day);
  const lookup = (i: number, text: string, isFast = false) => {
    const q = (isFast ? pack.fastMoney : pack.mainBoards)[i]!;
    const match = matchFamilyFeudAnswer(pack, q, text);
    expect(match.status, text).toBe("matched");
    return match.status === "matched"
      ? pack.entities.find((e) => e.id === match.entityId)?.displayName
      : undefined;
  };

  it("provides exactly two objective four-guess main boards and five Fast Money prompts", () => {
    expect(() => assertFamilyFeudPack(pack)).not.toThrow();
    expect(pack.mainBoards.map((q) => q.prompt)).toEqual(main);
    expect(pack.fastMoney.map((q) => q.prompt)).toEqual(fast);
    expect(pack.mainBoards.map((q) => q.id)).toEqual([
      "nfl-oct19-east-teams", "nfl-oct19-multiple-sb-winners",
    ]);
    expect(pack.mainBoards[0]?.candidateIds).toHaveLength(8);
    expect(pack.mainBoards[1]?.candidateIds).toHaveLength(17);
    expect(pack.mainBoards.map((q) => q.answers.slice(0, 4)
      .reduce((sum, answer) => sum + answer.points, 0))).toEqual([30, 30]);
  });

  it("credits obvious shorthand, all East teams, and Seattle's second title in February 2026", () => {
    expect(lookup(0, "Bills")).toBe("Buffalo Bills");
    expect(lookup(0, "Jets")).toBe("New York Jets");
    expect(lookup(0, "Commanders")).toBe("Washington Commanders");
    expect(lookup(1, "Steelers")).toBe("Pittsburgh Steelers");
    expect(lookup(1, "Seahawks")).toBe("Seattle Seahawks");
    expect(lookup(1, "Eagles")).toBe("Philadelphia Eagles");
    expect(matchFamilyFeudAnswer(pack, pack.mainBoards[0]!, "Seattle Seahawks").status)
      .toBe("unrecognized");
  });

  it("accepts valid Fast Money answers beyond the original top eight", () => {
    expect(lookup(1, "Bengals", true)).toBe("Cincinnati Bengals");
    expect(lookup(2, "Jason Taylor", true)).toBe("Jason Taylor");
    expect(lookup(3, "Maxx Crosby", true)).toBe("Maxx Crosby");
    expect(lookup(4, "Jason Witten", true)).toBe("Jason Witten");
    expect(lookup(0, "NFC East", true)).toBe("NFC East");
    expect(pack.fastMoney.map((q) => q.answers[0]!.points)).toEqual([8, 8, 8, 8, 8]);
  });

  it("preserves the official published setup/scoring structure", () => {
    const setup = buildFamilyFeudDailySetup(pack, day, "football-daily-v20-resume-v18-oct3");
    expect(setup.setupKey).toContain("nfl-oct19-east-teams-nfl-oct19-multiple-sb-winners");
    expect(setup.scoringVersion).toBe("family-feud-score-v2");
    expect(setup.privateSetupEvidence.proof).toBe(setup.privateGradingEvidence.proof);
    expect((setup.publicSetup.fast_money_prompts as {prompt:string}[]).map((q) => q.prompt)).toEqual(fast);
  });
});
