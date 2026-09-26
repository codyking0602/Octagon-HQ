import { describe, expect, it } from "vitest";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "../play/familyFeudDailyRuntime";
import { assertFamilyFeudPack, type FamilyFeudPack } from "../games/familyFeudEngine";
import { MLB_SPORTS_FEUD_OWNER_PACK } from "./MlbSportsFeudOwnerRun";
import {
  MLB_SPORTS_FEUD_OCT12_DATE,
  MLB_SPORTS_FEUD_OCT12_KEY,
  MLB_SPORTS_FEUD_OCT12_PACK,
  MLB_SPORTS_FEUD_OCT12_VERSION,
  MLB_SPORTS_FEUD_OCT27_DATE,
  MLB_SPORTS_FEUD_OCT27_KEY,
  MLB_SPORTS_FEUD_OCT27_PACK,
  MLB_SPORTS_FEUD_OCT27_VERSION,
  MLB_SPORTS_FEUD_PRODUCTION_CONFIGS,
  mlbSportsFeudProductionConfig,
} from "./mlbSportsFeudProduction";

function entityName(pack: FamilyFeudPack, entityId: string) {
  const entity = pack.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Missing Sports Feud entity ${entityId}`);
  return entity.displayName;
}

function playPerfect(pack: FamilyFeudPack, day: string, version: string) {
  const publication = buildFamilyFeudDailySetup(pack, day, version);
  let submissionState: Record<string, unknown> = {};
  let finalSubmission: Record<string, unknown> | null = null;

  const advance = (action: Record<string, unknown>) => {
    const next = advanceFamilyFeudDailyRuntime({
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      submissionState,
    }, action);
    submissionState = next.submissionState;
    finalSubmission = next.finalSubmission;
  };

  pack.mainBoards.forEach((board) => {
    board.answers.slice(0, 4).forEach((answer) => {
      advance({ type: "answer", answer: entityName(pack, answer.entityId) });
    });
  });

  pack.fastMoney.forEach((question, index) => {
    const answer = question.answers[0]!;
    advance({
      type: "answer",
      answer: entityName(pack, answer.entityId),
      question_id: question.id,
      question_index: index,
      time_remaining_ms: 50_000 - index * 1_000,
    });
  });

  return finalSubmission;
}

describe("MLB Sports Feud production cards", () => {
  it("locks exactly the two approved Sports Feud dates", () => {
    expect(MLB_SPORTS_FEUD_PRODUCTION_CONFIGS).toHaveLength(2);
    expect(MLB_SPORTS_FEUD_PRODUCTION_CONFIGS.map((config) => ({
      key: config.challengeKey,
      date: config.challengeDate,
    }))).toEqual([
      { key: MLB_SPORTS_FEUD_OCT12_KEY, date: MLB_SPORTS_FEUD_OCT12_DATE },
      { key: MLB_SPORTS_FEUD_OCT27_KEY, date: MLB_SPORTS_FEUD_OCT27_DATE },
    ]);
    expect(mlbSportsFeudProductionConfig(MLB_SPORTS_FEUD_OCT12_KEY, MLB_SPORTS_FEUD_OCT12_DATE)?.pack)
      .toBe(MLB_SPORTS_FEUD_OCT12_PACK);
    expect(mlbSportsFeudProductionConfig(MLB_SPORTS_FEUD_OCT27_KEY, MLB_SPORTS_FEUD_OCT27_DATE)?.pack)
      .toBe(MLB_SPORTS_FEUD_OCT27_PACK);
    expect(mlbSportsFeudProductionConfig("wrong", MLB_SPORTS_FEUD_OCT12_DATE)).toBeNull();
  });

  it("keeps both production cards on the canonical two-board plus five-Fast-Money engine", () => {
    for (const pack of [MLB_SPORTS_FEUD_OCT12_PACK, MLB_SPORTS_FEUD_OCT27_PACK]) {
      expect(() => assertFamilyFeudPack(pack)).not.toThrow();
      expect(pack.sport).toBe("mlb");
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
      expect(pack.mainBoards.every((question) => question.candidateIds.length >= 14)).toBe(true);
      expect(pack.fastMoney.every((question) => question.candidateIds.length >= 10)).toBe(true);
    }
  });

  it("burns every owner-review prompt and answer identity from both real cards", () => {
    const ownerNames = new Set(MLB_SPORTS_FEUD_OWNER_PACK.entities.map((entity) => entity.displayName));
    const ownerPrompts = new Set([
      ...MLB_SPORTS_FEUD_OWNER_PACK.mainBoards,
      ...MLB_SPORTS_FEUD_OWNER_PACK.fastMoney,
    ].map((question) => question.prompt));

    for (const pack of [MLB_SPORTS_FEUD_OCT12_PACK, MLB_SPORTS_FEUD_OCT27_PACK]) {
      expect(pack.entities.every((entity) => !ownerNames.has(entity.displayName))).toBe(true);
      expect([
        ...pack.mainBoards,
        ...pack.fastMoney,
      ].every((question) => !ownerPrompts.has(question.prompt))).toBe(true);
    }
  });

  it("keeps the two real Sports Feud cards distinct from each other", () => {
    const oct12Prompts = new Set([
      ...MLB_SPORTS_FEUD_OCT12_PACK.mainBoards,
      ...MLB_SPORTS_FEUD_OCT12_PACK.fastMoney,
    ].map((question) => question.prompt));

    expect([
      ...MLB_SPORTS_FEUD_OCT27_PACK.mainBoards,
      ...MLB_SPORTS_FEUD_OCT27_PACK.fastMoney,
    ].every((question) => !oct12Prompts.has(question.prompt))).toBe(true);
  });

  it("can produce the canonical 100-point score on both dates", () => {
    expect(playPerfect(
      MLB_SPORTS_FEUD_OCT12_PACK,
      MLB_SPORTS_FEUD_OCT12_DATE,
      MLB_SPORTS_FEUD_OCT12_VERSION,
    )).toMatchObject({
      native_score: 100,
      normalized_score: 100,
      main_points: 60,
      fast_money_points: 40,
    });

    expect(playPerfect(
      MLB_SPORTS_FEUD_OCT27_PACK,
      MLB_SPORTS_FEUD_OCT27_DATE,
      MLB_SPORTS_FEUD_OCT27_VERSION,
    )).toMatchObject({
      native_score: 100,
      normalized_score: 100,
      main_points: 60,
      fast_money_points: 40,
    });
  });
});
