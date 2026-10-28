import { describe, expect, it } from "vitest";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "../play/familyFeudDailyRuntime";
import {
  assertFamilyFeudPack,
  matchFamilyFeudAnswer,
  type FamilyFeudPack,
} from "../games/familyFeudEngine";
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

function prompts(pack: FamilyFeudPack) {
  return [...pack.mainBoards, ...pack.fastMoney].map((question) => question.prompt);
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

  it("publishes the approved ultra-easy MLB subjects on today's replacement card", () => {
    expect(prompts(MLB_SPORTS_FEUD_OCT12_PACK)).toEqual([
      "Name an MLB team you think of as one of baseball's most famous franchises.",
      "Name a baseball superstar from the 2000s or later that almost every sports fan knows.",
      "Name a famous New York Yankees player.",
      "Name a famous Los Angeles Dodgers player.",
      "Name a baseball player you immediately think of when you hear \"home runs.\"",
      "Name a famous MLB pitcher.",
      "Name an MLB team you would expect to see playing in October.",
    ]);
  });

  it("publishes the approved ultra-easy MLB subjects on the October 25 card", () => {
    expect(prompts(MLB_SPORTS_FEUD_OCT27_PACK)).toEqual([
      "Name an all-time baseball legend almost everybody has heard of.",
      "Name a current MLB superstar.",
      "Name a famous Boston Red Sox player.",
      "Name an MLB team you associate with the color red.",
      "Name a baseball player who became famous well beyond baseball.",
      "Name an MLB team with a logo or hat you think almost everyone would recognize.",
      "Name a baseball player you would expect a non-baseball fan to recognize.",
    ]);
  });

  it("keeps both production cards on the canonical two-board plus five-Fast-Money engine", () => {
    for (const pack of [MLB_SPORTS_FEUD_OCT12_PACK, MLB_SPORTS_FEUD_OCT27_PACK]) {
      expect(() => assertFamilyFeudPack(pack)).not.toThrow();
      expect(pack.sport).toBe("mlb");
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
      expect(pack.mainBoards.every((question) => question.candidateIds.length >= 12)).toBe(true);
      expect(pack.fastMoney.every((question) => question.candidateIds.length >= 10)).toBe(true);
    }
  });

  it("allows obvious owner-review identities back into production instead of forcing obscure replacements", () => {
    const ownerNames = new Set(MLB_SPORTS_FEUD_OWNER_PACK.entities.map((entity) => entity.displayName));
    for (const pack of [MLB_SPORTS_FEUD_OCT12_PACK, MLB_SPORTS_FEUD_OCT27_PACK]) {
      const overlap = pack.entities.filter((entity) => ownerNames.has(entity.displayName));
      expect(overlap.length).toBeGreaterThan(20);
    }
  });

  it("keeps the old narrow knowledge filters out of both MLB cards", () => {
    const allPrompts = [
      ...prompts(MLB_SPORTS_FEUD_OCT12_PACK),
      ...prompts(MLB_SPORTS_FEUD_OCT27_PACK),
    ].join(" ");

    expect(allPrompts).not.toMatch(/debuted in the 2010s|Dominican-born|Cuban-born|switch-hitting|utility player/i);
    expect(allPrompts).not.toMatch(/second baseman since|third baseman|stolen-base threat|throwing 100 mph/i);
  });

  it("accepts the obvious shorthand a casual fan is likely to type", () => {
    const todaysYankees = MLB_SPORTS_FEUD_OCT12_PACK.fastMoney[0]!;
    expect(matchFamilyFeudAnswer(MLB_SPORTS_FEUD_OCT12_PACK, todaysYankees, "Jeter"))
      .toMatchObject({ status: "matched" });
    expect(matchFamilyFeudAnswer(MLB_SPORTS_FEUD_OCT12_PACK, MLB_SPORTS_FEUD_OCT12_PACK.mainBoards[0]!, "Yankees"))
      .toMatchObject({ status: "matched" });

    const futureCurrentStars = MLB_SPORTS_FEUD_OCT27_PACK.mainBoards[1]!;
    expect(matchFamilyFeudAnswer(MLB_SPORTS_FEUD_OCT27_PACK, futureCurrentStars, "Ohtani"))
      .toMatchObject({ status: "matched" });
  });

  it("keeps the two real Sports Feud cards distinct from each other", () => {
    const todayPrompts = new Set(prompts(MLB_SPORTS_FEUD_OCT12_PACK));
    expect(prompts(MLB_SPORTS_FEUD_OCT27_PACK).every((prompt) => !todayPrompts.has(prompt))).toBe(true);
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
