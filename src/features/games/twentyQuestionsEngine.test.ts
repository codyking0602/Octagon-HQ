import { describe, expect, it } from "vitest";
import {
  TWENTY_QUESTIONS_ENDGAME_THRESHOLD,
  TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT,
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  TWENTY_QUESTIONS_WRONG_GUESS_PENALTY,
  chooseTwentyQuestionsFootballLeague,
  formatTwentyQuestionsScoreImpact,
  twentyQuestionsCostForSplit,
  twentyQuestionsEligibleQuestions,
  twentyQuestionsFinalGuessChoices,
  twentyQuestionsFinalGuessIsDirectlyPlayable,
  twentyQuestionsFinalScore,
  twentyQuestionsRecommendedQuestions,
  twentyQuestionsRequiresFinalGuess,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
  twentyQuestionsScoreImpact,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSubject,
} from "./twentyQuestionsEngine";

describe("20 Questions scoring contract", () => {
  it("uses the locked 10-question cap and 100-point start", () => {
    expect(TWENTY_QUESTIONS_LIMIT).toBe(10);
    expect(TWENTY_QUESTIONS_START_SCORE).toBe(100);
    expect(TWENTY_QUESTIONS_WRONG_GUESS_PENALTY).toBe(10);
  });

  it("converts internal 5-8 calibration to the actual player-facing score impact", () => {
    expect([5, 6, 7, 8].map((cost) => twentyQuestionsScoreImpact(cost as 5 | 6 | 7 | 8)))
      .toEqual([2, 2.4, 2.8, 3.2]);
    expect([5, 6, 7, 8].map((cost) => formatTwentyQuestionsScoreImpact(cost as 5 | 6 | 7 | 8)))
      .toEqual(["−2.0 pts", "−2.4 pts", "−2.8 pts", "−3.2 pts"]);
  });

  it("prices questions once from their full-universe split", () => {
    expect(twentyQuestionsCostForSplit(5, 100)).toBe(5);
    expect(twentyQuestionsCostForSplit(20, 100)).toBe(6);
    expect(twentyQuestionsCostForSplit(30, 100)).toBe(7);
    expect(twentyQuestionsCostForSplit(40, 100)).toBe(8);
    expect(twentyQuestionsCostForSplit(50, 100)).toBe(8);
  });

  it("applies question and wrong-guess deductions and rounds only the final score", () => {
    let score = 100;
    score = twentyQuestionsScoreAfterQuestion(score, 8);
    expect(score).toBeCloseTo(96.8);
    score = twentyQuestionsScoreAfterWrongGuess(score);
    expect(score).toBeCloseTo(86.8);
    expect(twentyQuestionsFinalScore(score)).toBe(87);
    expect(twentyQuestionsFinalScore(-10)).toBe(0);
    expect(twentyQuestionsFinalScore(110)).toBe(100);
  });

  it("makes ten cheap questions equal 80 before guess penalties", () => {
    let score = 100;
    for (let index = 0; index < 10; index += 1) score = twentyQuestionsScoreAfterQuestion(score, 5);
    expect(score).toBe(80);
  });
});

describe("20 Questions final-guess contract", () => {
  const subjects: readonly TwentyQuestionsSubject[] = [
    { id: "hidden", name: "Hidden", kind: "player", league: "NFL" },
    { id: "survivor-a", name: "Survivor A", kind: "player", league: "NFL" },
    { id: "survivor-b", name: "Survivor B", kind: "player", league: "NFL" },
    { id: "distractor-a", name: "Distractor A", kind: "player", league: "NFL" },
    { id: "distractor-b", name: "Distractor B", kind: "player", league: "NFL" },
    { id: "distractor-c", name: "Distractor C", kind: "player", league: "NFL" },
    { id: "distractor-d", name: "Distractor D", kind: "player", league: "NFL" },
    { id: "distractor-e", name: "Distractor E", kind: "player", league: "NFL" },
    { id: "distractor-f", name: "Distractor F", kind: "player", league: "NFL" },
    { id: "distractor-g", name: "Distractor G", kind: "player", league: "NFL" },
    { id: "distractor-h", name: "Distractor H", kind: "coach", league: "NFL" },
    { id: "distractor-i", name: "Distractor I", kind: "coach", league: "NFL" },
  ];

  it("requires the final guess as soon as one identity remains or the question cap is reached", () => {
    expect(twentyQuestionsRequiresFinalGuess(2, 1)).toBe(true);
    expect(twentyQuestionsRequiresFinalGuess(TWENTY_QUESTIONS_LIMIT, 7)).toBe(true);
    expect(twentyQuestionsRequiresFinalGuess(TWENTY_QUESTIONS_LIMIT - 1, 2)).toBe(false);
  });

  it("uses a roughly ten-name directly playable final board", () => {
    expect(TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT).toBe(10);
    expect(twentyQuestionsFinalGuessIsDirectlyPlayable(1)).toBe(true);
    expect(twentyQuestionsFinalGuessIsDirectlyPlayable(10)).toBe(true);
    expect(twentyQuestionsFinalGuessIsDirectlyPlayable(11)).toBe(false);
  });

  it("always includes the hidden identity and mixes survivors with distractors", () => {
    const remaining = subjects.slice(0, 3);
    const board = twentyQuestionsFinalGuessChoices(subjects, remaining, "hidden");
    const ids = board.map((subject) => subject.id);
    const remainingIds = new Set(remaining.map((subject) => subject.id));

    expect(board).toHaveLength(10);
    expect(ids).toContain("hidden");
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some((id) => !remainingIds.has(id))).toBe(true);
    expect([...ids].sort()).not.toEqual(remaining.map((subject) => subject.id).sort());
  });
});

describe("20 Questions live question intelligence", () => {
  const subjects: readonly TwentyQuestionsSubject[] = [
    { id: "a", name: "A", kind: "player", league: "NFL" },
    { id: "b", name: "B", kind: "player", league: "NFL" },
    { id: "c", name: "C", kind: "coach", league: "NFL" },
    { id: "d", name: "D", kind: "player", league: "NFL" },
    { id: "e", name: "E", kind: "player", league: "NFL" },
    { id: "f", name: "F", kind: "player", league: "NFL" },
  ];
  const questions: readonly TwentyQuestionsQuestion[] = [
    { id: "role:player", label: "Is this a player?", internalCost: 6, answer: (id) => id !== "c" },
    { id: "position:quarterback", label: "Is this a quarterback?", internalCost: 6, answer: (id) => id === "a" },
    { id: "league:nfl", label: "Is this in the NFL?", internalCost: 5, answer: () => true },
    { id: "impossible", label: "Impossible?", internalCost: 5, answer: () => false },
  ];

  it("keeps human-useful questions visible even when they no longer split the private live pool", () => {
    expect(twentyQuestionsEligibleQuestions(questions, subjects).map((question) => question.id))
      .toEqual(["role:player", "position:quarterback", "league:nfl", "impossible"]);
    expect(twentyQuestionsEligibleQuestions(questions, subjects.slice(0, 2)).map((question) => question.id))
      .toEqual(["role:player", "position:quarterback", "league:nfl", "impossible"]);
    expect(twentyQuestionsEligibleQuestions(questions, subjects.slice(0, 1))).toEqual([]);
  });

  it("keeps Recommended focused on questions that actually narrow the live pool", () => {
    const recommended = twentyQuestionsRecommendedQuestions(questions, subjects.slice(0, 2), 5);
    expect(recommended.map((question) => question.id)).toEqual(["position:quarterback"]);
  });

  it("never exposes fine numeric fingerprint clues in normal or Recommended play", () => {
    const fingerprint: TwentyQuestionsQuestion = {
      id: "stat:exact-fingerprint",
      label: "Exact fingerprint?",
      internalCost: 8,
      humanValue: 1,
      recommendationFamily: "endgame-fingerprint",
      answer: (id) => id === "a",
    };
    const bank = [...questions, fingerprint];
    expect(twentyQuestionsEligibleQuestions(bank, subjects).map((question) => question.id)).not.toContain(fingerprint.id);
    expect(twentyQuestionsRecommendedQuestions(bank, subjects, 10).map((question) => question.id)).not.toContain(fingerprint.id);
  });

  it("ranks human-recognizable clues ahead of a mathematically cleaner low-value split during normal play", () => {
    const candidates: readonly TwentyQuestionsQuestion[] = [
      {
        id: "stat:fights:15",
        label: "At least 15 games?",
        internalCost: 8,
        humanValue: 1,
        answer: (id) => ["a", "b", "c"].includes(id),
      },
      {
        id: "era:active-2000s",
        label: "2010s?",
        internalCost: 5,
        humanValue: 4,
        answer: (id) => ["a", "b"].includes(id),
      },
    ];
    expect(subjects.length).toBeGreaterThan(TWENTY_QUESTIONS_ENDGAME_THRESHOLD);
    expect(twentyQuestionsRecommendedQuestions(candidates, subjects, 2).map((question) => question.id))
      .toEqual(["era:active-2000s", "stat:fights:15"]);
  });

  it("diversifies Recommended before repeating a clue family", () => {
    const candidates: readonly TwentyQuestionsQuestion[] = [
      { id: "stat:yards:1000", label: "1,000 yards?", internalCost: 8, humanValue: 3, recommendationFamily: "production", answer: (id) => ["a", "b", "c"].includes(id) },
      { id: "stat:yards:900", label: "900 yards?", internalCost: 8, humanValue: 3, recommendationFamily: "production", answer: (id) => ["a", "b", "d"].includes(id) },
      { id: "era:2010s", label: "2010s?", internalCost: 6, humanValue: 3, recommendationFamily: "era", answer: (id) => ["a", "d"].includes(id) },
      { id: "team:dallas", label: "Played for Dallas?", internalCost: 6, humanValue: 3, recommendationFamily: "team", answer: (id) => ["b", "e"].includes(id) },
    ];
    const recommended = twentyQuestionsRecommendedQuestions(candidates, subjects, 3);
    expect(recommended.map((question) => question.id)).toEqual(["stat:yards:1000", "era:2010s", "team:dallas"]);
  });

  it("switches to exact candidate separation when five or fewer identities remain", () => {
    const endgameSubjects = subjects.slice(0, TWENTY_QUESTIONS_ENDGAME_THRESHOLD);
    const candidates: readonly TwentyQuestionsQuestion[] = [
      {
        id: "era:recognizable-but-narrow",
        label: "Recognizable but narrow?",
        internalCost: 5,
        humanValue: 4,
        answer: (id) => id === "a",
      },
      {
        id: "stat:clean-split",
        label: "Clean split?",
        internalCost: 8,
        humanValue: 1,
        answer: (id) => ["a", "b"].includes(id),
      },
    ];
    expect(twentyQuestionsRecommendedQuestions(candidates, endgameSubjects, 2).map((question) => question.id))
      .toEqual(["stat:clean-split", "era:recognizable-but-narrow"]);
  });

  it("does not recommend anything after deduction leaves one identity", () => {
    expect(twentyQuestionsRecommendedQuestions(questions, subjects.slice(0, 1))).toEqual([]);
  });
});

describe("Football 20 Questions league selection", () => {
  it("uses the locked 50/50 split", () => {
    expect(chooseTwentyQuestionsFootballLeague(() => 0)).toBe("NFL");
    expect(chooseTwentyQuestionsFootballLeague(() => 0.4999)).toBe("NFL");
    expect(chooseTwentyQuestionsFootballLeague(() => 0.5)).toBe("CFB");
    expect(chooseTwentyQuestionsFootballLeague(() => 0.9999)).toBe("CFB");
  });
});
