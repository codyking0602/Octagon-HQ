import { describe, expect, it } from "vitest";
import {
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  isMillionaireQuestionApproved,
  millionairePublicQuestion,
  millionaireRuntimeQuestion,
  validateMillionaireQuestion,
  type MillionaireLevel,
  type MillionaireQuestionAuthorityRecord,
} from "./millionaireAuthority";

function fixtureQuestion(level: MillionaireLevel = "Q1"): MillionaireQuestionAuthorityRecord {
  const q8 = level === "Q8";
  return {
    id: `fixture-${level.toLowerCase()}`,
    sport: "ufc",
    level,
    money: MILLIONAIRE_MONEY_BY_LEVEL[level],
    type: "fixture",
    prompt: `Fixture prompt for ${level}`,
    choices: [
      { id: "A", text: "Choice A" },
      { id: "B", text: "Choice B" },
      { id: "C", text: "Choice C" },
      { id: "D", text: "Choice D" },
    ],
    correctChoiceId: "A",
    distractorRationale: {
      B: "B is a plausible but incorrect fixture distractor.",
      C: "C is a plausible but incorrect fixture distractor.",
      D: "D is a plausible but incorrect fixture distractor.",
    },
    explanation: "Fixture explanation.",
    statSheet: q8 ? null : "Fixture Stat Sheet gives an orthogonal path.",
    fiftyFifty: {
      survivorChoiceIds: ["A", "B"],
      removalChoiceIds: ["C", "D"],
    },
    lifelineCompatibility: {
      fiftyFifty: !q8,
      statSheet: !q8,
      doubleDip: !q8,
    },
    sources: [{
      label: "Fixture source",
      authority: "Fixture authority",
      verifiedAt: "2026-09-17",
    }],
    verification: {
      status: "verified",
      verifiedBy: "fixture-reviewer",
      verifiedAt: "2026-09-17",
    },
    tags: {
      primarySubject: "fixture-subject",
      subjects: ["fixture-subject"],
      eras: ["fixture-era"],
      categories: ["fixture-category"],
    },
    review: {
      editorial: "approved",
      factual: "verified",
      difficulty: "calibrated",
      publication: "approved",
    },
  };
}

describe("Millionaire question authority", () => {
  it("locks the eight authored levels to the money ladder", () => {
    expect(MILLIONAIRE_LEVELS).toEqual(["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]);
    expect(MILLIONAIRE_LEVELS.map((level) => MILLIONAIRE_MONEY_BY_LEVEL[level]))
      .toEqual([500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000]);
  });

  it("accepts valid authored Q1-Q7 records with Stat Sheet and deterministic 50/50 evidence", () => {
    for (const level of MILLIONAIRE_LEVELS.slice(0, 7)) {
      expect(validateMillionaireQuestion(fixtureQuestion(level))).toEqual([]);
    }
  });

  it("requires Q8 to omit Stat Sheet and disable every lifeline", () => {
    const valid = fixtureQuestion("Q8");
    expect(validateMillionaireQuestion(valid)).toEqual([]);

    const invalid = {
      ...valid,
      statSheet: "Q8 must not expose this.",
      lifelineCompatibility: { fiftyFifty: true, statSheet: true, doubleDip: true },
    } satisfies MillionaireQuestionAuthorityRecord;
    expect(validateMillionaireQuestion(invalid)).toEqual(expect.arrayContaining([
      "Q8 must not have a Stat Sheet",
      "Q8 must disable every lifeline",
    ]));
  });

  it("requires exactly three distractor rationales and a valid deterministic 50/50 partition", () => {
    const base = fixtureQuestion();
    const invalid = {
      ...base,
      distractorRationale: { B: "Only one rationale." },
      fiftyFifty: {
        survivorChoiceIds: ["B", "C"],
        removalChoiceIds: ["A", "D"],
      },
    } satisfies MillionaireQuestionAuthorityRecord;

    expect(validateMillionaireQuestion(invalid)).toEqual(expect.arrayContaining([
      "distractor rationale must cover exactly the three incorrect choices",
      "50/50 survivors must include the correct choice",
      "50/50 removals must not include the correct choice",
    ]));
  });

  it("does not consider a structurally valid draft publishable until every review gate is approved", () => {
    const approved = fixtureQuestion();
    expect(isMillionaireQuestionApproved(approved)).toBe(true);
    expect(isMillionaireQuestionApproved({
      ...approved,
      review: { ...approved.review, publication: "blocked" },
    })).toBe(false);
    expect(isMillionaireQuestionApproved({
      ...approved,
      verification: { status: "unverified" },
    })).toBe(false);
  });

  it("keeps correct answers, explanations, Stat Sheet text, 50/50 evidence, sources, and review metadata out of the public question", () => {
    const authored = fixtureQuestion("Q5");
    const runtime = millionaireRuntimeQuestion(authored);
    const publicQuestion = millionairePublicQuestion(runtime);

    expect(publicQuestion).toEqual({
      id: authored.id,
      sport: authored.sport,
      level: authored.level,
      money: authored.money,
      type: authored.type,
      prompt: authored.prompt,
      choices: authored.choices,
    });
    expect("correctChoiceId" in publicQuestion).toBe(false);
    expect("explanation" in publicQuestion).toBe(false);
    expect("statSheet" in publicQuestion).toBe(false);
    expect("fiftyFifty" in publicQuestion).toBe(false);
    expect("sources" in publicQuestion).toBe(false);
    expect("review" in publicQuestion).toBe(false);
  });

  it("keeps only mechanic-required private evidence in the runtime projection", () => {
    const authored = fixtureQuestion("Q6");
    const runtime = millionaireRuntimeQuestion(authored);
    expect(runtime.correctChoiceId).toBe(authored.correctChoiceId);
    expect(runtime.fiftyFifty).toEqual(authored.fiftyFifty);
    expect(runtime.statSheet).toBe(authored.statSheet);
    expect("distractorRationale" in runtime).toBe(false);
    expect("sources" in runtime).toBe(false);
    expect("verification" in runtime).toBe(false);
    expect("review" in runtime).toBe(false);
  });
});
