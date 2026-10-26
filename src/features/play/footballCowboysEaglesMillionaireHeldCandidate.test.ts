import { describe, expect, it } from "vitest";
import { assertMillionaireRun } from "../games/millionaireEngine";
import { buildMillionaireDailySetup } from "./millionaireDailyRuntime";
import { cowboysEaglesMillionaireModernHeldCandidate } from "./footballCowboysEaglesMillionaireHeldCandidate";
import { footballThemedMillionaireRunForDay } from "./footballTeamThemeDailyPacks";

const correctAnswer = (question: ReturnType<typeof cowboysEaglesMillionaireModernHeldCandidate>[number]) =>
  question.choices.find(choice => choice.id === question.correctChoiceId)?.text;

describe("Cowboys/Eagles Millionaire release-held editorial candidate", () => {
  it("preserves every published October 26 question and proof without publishing the candidate", () => {
    const version = "football-daily-v21-locked-oct25";
    const before = buildMillionaireDailySetup("football", "2026-10-26", version);
    const published = footballThemedMillionaireRunForDay("2026-10-26");
    expect(published).not.toBeNull();
    const candidate = cowboysEaglesMillionaireModernHeldCandidate();
    const after = buildMillionaireDailySetup("football", "2026-10-26", version);

    expect(candidate.slice(0, 4)).toEqual(published!.slice(0, 4));
    expect(candidate.slice(4)).not.toEqual(published!.slice(4));
    expect(published!.slice(4).map(correctAnswer)).toEqual([
      "Bob Lilly", "Chuck Howley", "Randy White", "Everson Walls",
    ]);
    expect(after).toEqual(before);
    expect((after.privateSetupEvidence.run as typeof candidate).slice(4).map(correctAnswer))
      .toEqual(["Bob Lilly", "Chuck Howley", "Randy White", "Everson Walls"]);
    expect(candidate.slice(4).every(question => question.id.includes("modern-held"))).toBe(true);
  });

  it("presents eight valid questions with modern Q5-Q8, a true Eagles rivalry finish, and locked Q8 rules", () => {
    const run = cowboysEaglesMillionaireModernHeldCandidate();
    expect(() => assertMillionaireRun(run)).not.toThrow();
    expect(run).toHaveLength(8);
    expect(run.map(question => question.level)).toEqual([
      "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
    ]);
    expect(run.slice(4).map(correctAnswer))
      .toEqual(["Trevon Diggs", "Dak Prescott", "Brett Maher", "Amari Cooper"]);
    expect(run[7].prompt).toMatch(/Philadelphia.*December 2018/);
    expect(run[7].type).toBe("cowboys-eagles-rivalry");

    for (const question of run) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map(choice => choice.text)).size).toBe(4);
      expect(question.choices.some(choice => choice.id === question.correctChoiceId)).toBe(true);
      expect(question.fiftyFifty.survivorChoiceIds).toContain(question.correctChoiceId);
      expect(question.fiftyFifty.removalChoiceIds).toHaveLength(2);
      expect(question.fiftyFifty.removalChoiceIds).not.toContain(question.correctChoiceId);
    }
    expect(run[7].statSheet).toBeNull();
    expect(run[7].lifelineCompatibility).toEqual({
      fiftyFifty: false, statSheet: false, doubleDip: false,
    });
    for (const question of run.slice(4, 7)) {
      expect(question.lifelineCompatibility).toEqual({
        fiftyFifty: true, statSheet: true, doubleDip: true,
      });
      expect(question.statSheet).toBeTruthy();
      expect(question.statSheet?.toLowerCase()).not.toContain(correctAnswer(question)!.toLowerCase());
    }
  });
});
