import { describe, expect, it } from "vitest";
import {
  FOOTBALL_HIGHER_LOWER_MODERN_QUESTION_MIN,
  FOOTBALL_HIGHER_LOWER_MODERN_YEAR,
  FOOTBALL_HIGHER_LOWER_QUESTION_COUNT,
  FOOTBALL_HIGHER_LOWER_VERSION,
  createFootballHigherLowerBoard,
  footballHigherLowerCandidateSummary,
  footballHigherLowerAnswerIsCorrect,
  parseFootballHigherLowerBoard,
  type FootballHigherLowerScope,
} from "./footballHigherLowerModel";
import { getFootballSubject } from "./footballSubjectRegistry";

function boardShape(scope: FootballHigherLowerScope) {
  const board = createFootballHigherLowerBoard(`higher-lower-test-${scope}`, scope);
  const difficulties = board.questions.reduce<Record<string, number>>((counts, question) => {
    counts[question.difficulty] = (counts[question.difficulty] ?? 0) + 1;
    return counts;
  }, {});
  return { board, difficulties };
}

describe("Football Higher or Lower", () => {
  it("audits the candidate pool", () => {
    console.log("HIGHER_LOWER_CANDIDATES", JSON.stringify(footballHigherLowerCandidateSummary()));
  });

  it.each(["NFL", "CFB", "MIXED"] as const)("builds a deterministic ten-question %s board", (scope) => {
    const first = createFootballHigherLowerBoard("same-seed", scope);
    const second = createFootballHigherLowerBoard("same-seed", scope);
    expect(second).toEqual(first);
    expect(first.version).toBe(FOOTBALL_HIGHER_LOWER_VERSION);
    expect(first.questions).toHaveLength(FOOTBALL_HIGHER_LOWER_QUESTION_COUNT);
    expect(new Set(first.questions.map((question) => question.id)).size).toBe(FOOTBALL_HIGHER_LOWER_QUESTION_COUNT);
  });

  it.each(["NFL", "CFB", "MIXED"] as const)("locks the approved difficulty, answer, category, and reuse rules for %s", (scope) => {
    const { board, difficulties } = boardShape(scope);
    expect(difficulties).toEqual({ approachable: 3, competitive: 5, tough: 2 });
    expect(board.questions.filter((question) => question.answer === "higher")).toHaveLength(5);
    expect(board.questions.filter((question) => question.answer === "lower")).toHaveLength(5);
    expect(new Set(board.questions.map((question) => question.category)).size).toBeGreaterThanOrEqual(5);
    expect(board.questions.filter((question) => question.category === "career").length).toBeLessThanOrEqual(2);

    const subjectIds = board.questions.flatMap((question) => [question.known.subjectId, question.hidden.subjectId]);
    expect(new Set(subjectIds).size).toBe(subjectIds.length);
    for (let index = 1; index < board.questions.length; index += 1) {
      expect(board.questions[index]!.category).not.toBe(board.questions[index - 1]!.category);
    }
  });

  it("keeps Mixed exactly five NFL and five CFB without three straight from one sport", () => {
    const board = createFootballHigherLowerBoard("mixed-balance", "MIXED");
    expect(board.questions.filter((question) => question.league === "NFL")).toHaveLength(5);
    expect(board.questions.filter((question) => question.league === "CFB")).toHaveLength(5);
    for (let index = 2; index < board.questions.length; index += 1) {
      expect(new Set(board.questions.slice(index - 2, index + 1).map((question) => question.league)).size).toBe(2);
    }
  });

  it.each(["NFL", "CFB", "MIXED"] as const)("keeps %s recognizable, modern-first, and stat-position sane", (scope) => {
    for (let seedIndex = 0; seedIndex < 12; seedIndex += 1) {
      const board = createFootballHigherLowerBoard(`quality-${scope}-${seedIndex}`, scope);
      const modernQuestions = board.questions.filter((question) => (
        (question.known.referenceYear ?? 0) >= FOOTBALL_HIGHER_LOWER_MODERN_YEAR
        && (question.hidden.referenceYear ?? 0) >= FOOTBALL_HIGHER_LOWER_MODERN_YEAR
      ));
      expect(modernQuestions.length).toBeGreaterThanOrEqual(FOOTBALL_HIGHER_LOWER_MODERN_QUESTION_MIN);

      for (const question of board.questions) {
        for (const row of [question.known, question.hidden]) {
          const subject = getFootballSubject(row.subjectId);
          expect(subject).not.toBeNull();
          if (subject!.kind !== "team-season") {
            expect(["A", "B"]).toContain(subject!.recognizabilityTier);
          }

          if (/passing/i.test(question.metricLabel) && subject!.kind !== "team-season") {
            expect(subject!.position).toBe("QB");
          }
          if (/receiving/i.test(question.metricLabel) && subject!.kind !== "team-season") {
            expect(["WR", "TE"]).toContain(subject!.position);
          }
          if (/rushing/i.test(question.metricLabel) && subject!.kind !== "team-season") {
            expect(["QB", "RB"]).toContain(subject!.position);
            if (/yards/i.test(question.metricLabel)) {
              expect(row.value).toBeGreaterThanOrEqual(subject!.position === "QB" ? 500 : 800);
            } else if (/TDs/i.test(question.metricLabel)) {
              expect(row.value).toBeGreaterThanOrEqual(subject!.position === "QB" ? 6 : 8);
            }
          }
          if (/sacks/i.test(question.metricLabel) && subject!.kind !== "team-season") {
            expect(["DL", "LB"]).toContain(subject!.position);
          }
        }
      }
    }
  });

  it("does not surface the first-pass deep-cut examples in a broad seed sample", () => {
    const blockedNames = new Set(["Jim Plunkett", "DaeSean Hamilton", "Orlando Pace"]);
    for (const scope of ["NFL", "CFB", "MIXED"] as const) {
      for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
        const board = createFootballHigherLowerBoard(`recognition-${scope}-${seedIndex}`, scope);
        const names = board.questions.flatMap((question) => [question.known.name, question.hidden.name]);
        expect(names.some((name) => blockedNames.has(name))).toBe(false);
      }
    }
  });

  it("uses real unequal values and grades the frozen answer", () => {
    const board = createFootballHigherLowerBoard("grade-board", "NFL");
    for (const question of board.questions) {
      expect(question.known.value).not.toBe(question.hidden.value);
      expect(question.answer).toBe(question.hidden.value > question.known.value ? "higher" : "lower");
      expect(footballHigherLowerAnswerIsCorrect(question, question.answer)).toBe(true);
      expect(footballHigherLowerAnswerIsCorrect(question, question.answer === "higher" ? "lower" : "higher")).toBe(false);
    }
  });

  it("round-trips an exact challenge snapshot instead of regenerating it", () => {
    const board = createFootballHigherLowerBoard("frozen-board", "CFB");
    const parsed = parseFootballHigherLowerBoard(JSON.parse(JSON.stringify(board)));
    expect(parsed).toEqual(board);
    expect(parseFootballHigherLowerBoard({ ...board, questions: board.questions.slice(0, 9) })).toBeNull();
  });
});
