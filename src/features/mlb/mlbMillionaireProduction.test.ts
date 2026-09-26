import { describe, expect, it } from "vitest";
import { MILLIONAIRE_LEVELS, MILLIONAIRE_MONEY_BY_LEVEL } from "../games/millionaireAuthority";
import { assertMillionaireRun } from "../games/millionaireEngine";
import { MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS } from "../play/MillionaireCasualModel";
import {
  MLB_MILLIONAIRE_PRODUCTION_CHALLENGE_KEY,
  MLB_MILLIONAIRE_PRODUCTION_DATE,
  MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03,
  MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18,
  MLB_MILLIONAIRE_PRODUCTION_SOURCE_NOTES,
  MLB_MILLIONAIRE_SECOND_PRODUCTION_CHALLENGE_KEY,
  MLB_MILLIONAIRE_SECOND_PRODUCTION_DATE,
  MLB_MILLIONAIRE_SECOND_PRODUCTION_SOURCE_NOTES,
  mlbMillionaireProductionRun,
} from "./mlbMillionaireProduction";

describe("MLB Millionaire October 3 production run", () => {
  it("locks the scheduled challenge identity and complete eight-question ladder", () => {
    expect(MLB_MILLIONAIRE_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-03");
    expect(MLB_MILLIONAIRE_PRODUCTION_DATE).toBe("2026-10-03");
    expect(() => assertMillionaireRun(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03)).not.toThrow();
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03).toHaveLength(8);
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.level)).toEqual(MILLIONAIRE_LEVELS);
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.money)).toEqual(
      MILLIONAIRE_LEVELS.map((level) => MILLIONAIRE_MONEY_BY_LEVEL[level]),
    );
  });

  it("keeps the real production bank separate from every owner-review question", () => {
    const reviewPrompts = new Set<string>(MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS);
    const productionPrompts = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.prompt);
    expect(productionPrompts.every((prompt) => !reviewPrompts.has(prompt))).toBe(true);
    expect(new Set(productionPrompts).size).toBe(8);
    expect(new Set(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.id)).size).toBe(8);
  });

  it("balances answer positions and preserves the locked lifeline rules", () => {
    const answers = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.correctChoiceId);
    expect(answers.filter((answer) => answer === "A")).toHaveLength(2);
    expect(answers.filter((answer) => answer === "B")).toHaveLength(2);
    expect(answers.filter((answer) => answer === "C")).toHaveLength(2);
    expect(answers.filter((answer) => answer === "D")).toHaveLength(2);

    MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.slice(0, 7).forEach((question) => {
      expect(question.statSheet).toBeTruthy();
      expect(question.lifelineCompatibility).toMatchObject({
        fiftyFifty: true,
        statSheet: true,
        doubleDip: true,
      });
      expect(question.fiftyFifty.survivorChoiceIds).toContain(question.correctChoiceId);
      expect(question.fiftyFifty.removalChoiceIds).not.toContain(question.correctChoiceId);
    });

    const finalQuestion = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03[7]!;
    expect(finalQuestion.statSheet).toBeNull();
    expect(finalQuestion.lifelineCompatibility).toMatchObject({
      fiftyFifty: false,
      statSheet: false,
      doubleDip: false,
    });
  });

  it("keeps an MLB.com verification source for every production question", () => {
    const questionIds = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.id);
    expect(MLB_MILLIONAIRE_PRODUCTION_SOURCE_NOTES.map((source) => source.questionId)).toEqual(questionIds);
    expect(MLB_MILLIONAIRE_PRODUCTION_SOURCE_NOTES.every((source) => (
      source.authority === "MLB.com"
      && source.url.startsWith("https://www.mlb.com/")
      && source.verifiedAt === "2026-09-25"
    ))).toBe(true);
  });
});


describe("MLB Millionaire October 18 production run", () => {
  it("locks the second scheduled challenge identity and complete eight-question ladder", () => {
    expect(MLB_MILLIONAIRE_SECOND_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-08");
    expect(MLB_MILLIONAIRE_SECOND_PRODUCTION_DATE).toBe("2026-10-18");
    expect(() => assertMillionaireRun(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18)).not.toThrow();
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18).toHaveLength(8);
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.map((question) => question.level)).toEqual(MILLIONAIRE_LEVELS);
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.map((question) => question.money)).toEqual(
      MILLIONAIRE_LEVELS.map((level) => MILLIONAIRE_MONEY_BY_LEVEL[level]),
    );
    expect(mlbMillionaireProductionRun("mlb-2026-play-08", "2026-10-18"))
      .toBe(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18);
  });

  it("does not reuse owner-review prompts or the October 3 production questions", () => {
    const blockedPrompts = new Set<string>([
      ...MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS,
      ...MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03.map((question) => question.prompt),
    ]);
    const productionPrompts = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.map((question) => question.prompt);

    expect(productionPrompts.every((prompt) => !blockedPrompts.has(prompt))).toBe(true);
    expect(new Set(productionPrompts).size).toBe(8);
    expect(new Set(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.map((question) => question.id)).size).toBe(8);
  });

  it("balances answer positions and preserves the locked lifeline rules", () => {
    const answers = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.map((question) => question.correctChoiceId);
    expect(answers.filter((answer) => answer === "A")).toHaveLength(2);
    expect(answers.filter((answer) => answer === "B")).toHaveLength(2);
    expect(answers.filter((answer) => answer === "C")).toHaveLength(2);
    expect(answers.filter((answer) => answer === "D")).toHaveLength(2);

    MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.slice(0, 7).forEach((question) => {
      expect(question.statSheet).toBeTruthy();
      expect(question.lifelineCompatibility).toMatchObject({
        fiftyFifty: true,
        statSheet: true,
        doubleDip: true,
      });
      expect(question.fiftyFifty.survivorChoiceIds).toContain(question.correctChoiceId);
      expect(question.fiftyFifty.removalChoiceIds).not.toContain(question.correctChoiceId);
    });

    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18[7]!.statSheet).toBeNull();
    expect(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18[7]!.lifelineCompatibility).toMatchObject({
      fiftyFifty: false,
      statSheet: false,
      doubleDip: false,
    });
  });

  it("keeps an MLB.com verification source for every October 18 question", () => {
    const questionIds = MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_18.map((question) => question.id);
    expect(MLB_MILLIONAIRE_SECOND_PRODUCTION_SOURCE_NOTES.map((source) => source.questionId)).toEqual(questionIds);
    expect(MLB_MILLIONAIRE_SECOND_PRODUCTION_SOURCE_NOTES.every((source) => (
      source.authority === "MLB.com"
      && source.url.startsWith("https://www.mlb.com/")
      && source.verifiedAt === "2026-09-25"
    ))).toBe(true);
  });
});
