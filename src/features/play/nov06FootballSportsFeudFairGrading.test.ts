import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer } from "../games/familyFeudEngine";
import { buildFootballFeudRebuildPack } from "./sportsFeudDailyBanks";
import {
  advanceFamilyFeudDailyCore,
  hydrateFootballFeudFairAnswers,
  type FamilyFeudDailyRuntimeContext,
} from "./familyFeudDailyCore";

const original = buildFootballFeudRebuildPack("nfl", "2026-11-06");

function run(mainOne: string[], mainTwo: string[], fast: string[]) {
  let context: FamilyFeudDailyRuntimeContext = {
    setupKey: "nov06-football-feud-replay",
    publicSetup: {},
    privateSetupEvidence: { pack: original, proof: "original-immutable-proof" },
    submissionState: {},
  };
  let last: ReturnType<typeof advanceFamilyFeudDailyCore> | null = null;
  for (const answer of [...mainOne, ...mainTwo, ...fast]) {
    last = advanceFamilyFeudDailyCore(context, { type: "answer", answer });
    context = { ...context, submissionState: last.submissionState };
  }
  return last!;
}

describe("November 6 Football Feud fair answer replay", () => {
  it("only augments candidates; original official ranked boards and proof remain untouched", () => {
    expect(original.mainBoards.map((board) => board.id)).toEqual([
      "nfl-feud-r2-main-career-100-sacks", "nfl-main-11-1",
    ]);
    const hydrated = hydrateFootballFeudFairAnswers(original);
    expect(hydrated.mainBoards.map((board) => board.answers)).toEqual(original.mainBoards.map((board) => board.answers));
    expect(hydrated.mainBoards[0]!.candidateIds.length).toBeGreaterThan(original.mainBoards[0]!.candidateIds.length);
    // Entire official 100-sack population through the 2025 season (46),
    // not a hand-picked subset that wrongly strikes eligible players.
    expect(hydrated.mainBoards[0]!.candidateIds).toHaveLength(46);
    expect(matchFamilyFeudAnswer(hydrated, hydrated.mainBoards[0]!, "Andre Tippett").status).toBe("matched");
    expect(matchFamilyFeudAnswer(hydrated, hydrated.mainBoards[0]!, "Cameron Jordan").status).toBe("matched");
    expect(matchFamilyFeudAnswer(hydrated, hydrated.mainBoards[0]!, "Lawrence Taylor").status).toBe("matched");
    expect(matchFamilyFeudAnswer(hydrated, hydrated.mainBoards[0]!, "Demarcus Lawrence").status).not.toBe("matched");
    expect(matchFamilyFeudAnswer(hydrated, hydrated.mainBoards[0]!, "Max Crosby").status).not.toBe("matched");
    expect(hydrateFootballFeudFairAnswers(hydrated).mainBoards).toEqual(hydrated.mainBoards);
    expect(original.mainBoards[0]!.candidateIds.some(id => id.includes(":fair"))).toBe(false);
  });

  it("replays Cody in actual guess order: four answers per board and fair Fast Money", () => {
    // The fifth original sack guess (Von Miller) and late Raiders/Chiefs
    // are excluded after each corrected board's fourth successful answer.
    const result = run(
      ["Jj Watt", "Lawrence Taylor", "Myles Garrett", "Demarcus Ware"],
      ["Cowboys Eagles", "Ravens Steelers", "Packers Bears", "San Francisco Cowboys"],
      ["Fire", "Chiefs", "Trade", "Hot Dog", "Beer"],
    );
    expect(result.complete).toBe(true);
    expect(result.finalSubmission).toMatchObject({
      main_points: 42, fast_money_points: 25, native_score: 67, normalized_score: 67,
    });
    expect(result.publicState.main_boards).toMatchObject([
      { strikes: 0, settled: true }, { strikes: 0, settled: true },
    ]);
  });

  it("replays Shane in actual order, crediting valid rivalries but not incorrect sacks/AFC picks", () => {
    const result = run(
      ["Aaron Donald", "Myles Garret", "Demarcus Lawrence", "Tj Watt", "Max Crosby", "Jj Watt"],
      ["Cowboys Eagles", "Dallas Cowboys - New York Giants", "New England- Giants", "Jets - Giants"],
      ["Saftey Blitz", "Cowboys", "Trade Up", "Hotdog", "Beer"],
    );
    expect(result.complete).toBe(true);
    expect(result.finalSubmission).toMatchObject({
      main_points: 25, fast_money_points: 23, native_score: 48, normalized_score: 48,
    });
    expect(result.publicState.main_boards).toMatchObject([
      { strikes: 2, settled: true }, { strikes: 0, settled: true },
    ]);
    const fast = (result.publicState.fast_money as { results: { points: number }[] }).results;
    expect(fast.map((row) => row.points)).toEqual([7, 0, 7, 8, 1]);
  });
});
