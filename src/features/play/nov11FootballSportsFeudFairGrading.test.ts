import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, type FamilyFeudPack } from "../games/familyFeudEngine";
import { buildFamilyFeudDailySetup, advanceFamilyFeudDailyRuntime, hydrateFootballFeudFairAnswers } from "./familyFeudDailyRuntime";
import { buildFootballFeudRebuildPack } from "./sportsFeudDailyBanks";

const day = "2026-11-11";
const schedule = "football-daily-v22-higher-lower-oct27";
const pregame = "cfb-feud-r2-fast-cfb-pregame-segments";
const injury = "cfb-feud-r2-fast-college-injury-sideline";

function question(pack: FamilyFeudPack, id: string) {
  const found = pack.fastMoney.find((row) => row.id === id);
  if (!found) throw new Error("Missing Feud question " + id);
  return found;
}

describe("November 11 Football Sports Feud fair grading", () => {
  it("publishes distinct concepts, never a second answer for analyst picks", () => {
    const pack = buildFootballFeudRebuildPack("cfb", day);
    const pregameBoard = question(pack, pregame);
    const injuryBoard = question(pack, injury);
    const names = pregameBoard.candidateIds.map((id) =>
      pack.entities.find((entity) => entity.id === id)?.displayName);
    expect(names).toContain("Game predictions");
    expect(names).toContain("Fan interviews");
    expect(names).not.toContain("Analyst picks");

    for (const input of ["Picks", "Analyst picks", "Game picks", "Predictions"]) {
      const matched = matchFamilyFeudAnswer(pack, pregameBoard, input);
      expect(matched.status, input).toBe("matched");
      if (matched.status === "matched") {
        expect(pregameBoard.answers.find((row) => row.entityId === matched.entityId)?.points).toBe(8);
      }
    }
    for (const input of ["Tape", "Tape up", "Apply tape", "Tape ankle"]) {
      const matched = matchFamilyFeudAnswer(pack, injuryBoard, input);
      expect(matched.status, input).toBe("matched");
      if (matched.status === "matched") {
        expect(injuryBoard.answers.find((row) => row.entityId === matched.entityId)?.points).toBe(5);
      }
    }
  });

  it("replays Cody's actual 8+5 corrected answers from the old, immutable published question bank", () => {
    const historical = structuredClone(buildFootballFeudRebuildPack("cfb", day));
    expect(historical.mainBoards.map((board) => board.id)).toEqual([
      "cfb-feud-r2-main-cfb-davey-obrien",
      "cfb-feud-r2-main-heisman-running-back-schools",
    ]);
    expect(historical.fastMoney.map((board) => board.id)).toEqual([
      pregame,
      "cfb-feud-r2-fast-locker-room-objects",
      "cfb-fast1-01-1",
      "cfb-feud-r2-fast-cfb-scoreboard",
      injury,
    ]);

    // Reconstruct the pre-fix immutable publication: Analyst picks was an
    // unranked duplicate, while both ranked answers had no authored aliases.
    for (const entity of historical.entities) {
      if (entity.id === pregame + ":a1" || entity.id === injury + ":a4") {
        entity.aliases = [];
      }
      if (entity.id === pregame + ":v4") {
        entity.displayName = "Analyst picks";
        entity.aliases = [];
      }
    }
    const frozenPublication = structuredClone(historical);
    const hydrated = hydrateFootballFeudFairAnswers(historical);
    expect(hydrated.mainBoards.map((row) => row.answers)).toEqual(historical.mainBoards.map((row) => row.answers));
    expect(hydrated.fastMoney.map((row) => row.answers)).toEqual(historical.fastMoney.map((row) => row.answers));
    expect(historical).toEqual(frozenPublication);
    expect(question(hydrated, pregame).candidateIds).not.toContain(pregame + ":v4");
    expect(matchFamilyFeudAnswer(hydrated, question(hydrated, pregame), "Analyst picks")).toMatchObject({
      status: "matched", entityId: pregame + ":a1",
    });

    const published = buildFamilyFeudDailySetup(historical, day, schedule);
    const frozenEvidence = structuredClone(published.privateSetupEvidence);
    let submissionState: Record<string, unknown> = {};
    let final: ReturnType<typeof advanceFamilyFeudDailyRuntime> | null = null;
    const submissions = [
      "Cam Newton", "Joe Burrow", "Johnny Manziel", "Marcus Mariota",
      "Alabama", "USC", "Texas", "Oklahoma",
      "Picks", "Towels", "Alabama", "Score", "Tape",
    ];
    for (const answer of submissions) {
      final = advanceFamilyFeudDailyRuntime({
        setupKey: published.setupKey,
        publicSetup: published.publicSetup,
        privateSetupEvidence: published.privateSetupEvidence,
        submissionState,
      }, { type: "answer", answer });
      submissionState = final.submissionState;
    }
    expect(final?.complete).toBe(true);
    expect(final?.finalSubmission).toMatchObject({
      main_points: 50, fast_money_points: 32, native_score: 82, normalized_score: 82,
    });
    const result = final!.publicState.fast_money as { results: { points: number; board_rank: number | null }[] };
    expect(result.results.map((row) => row.points)).toEqual([8, 3, 8, 8, 5]);
    expect(result.results.map((row) => row.board_rank)).toEqual([1, 6, 1, 1, 4]);
    expect(published.privateSetupEvidence).toEqual(frozenEvidence);
  });

  it("does not alter unrelated UFC packs or other football questions", () => {
    const ufc: FamilyFeudPack = { id: "ufc", sport: "ufc", entities: [], mainBoards: [], fastMoney: [] };
    expect(hydrateFootballFeudFairAnswers(ufc)).toBe(ufc);
    const nfl = buildFootballFeudRebuildPack("nfl", day);
    expect(hydrateFootballFeudFairAnswers(nfl)).toBe(nfl);
  });
});
