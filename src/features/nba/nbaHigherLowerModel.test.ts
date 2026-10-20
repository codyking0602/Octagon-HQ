import { describe, expect, it } from "vitest";
import {
  createNbaHigherLowerBoard, createNbaHigherLowerDailyPreview,
  NBA_HIGHER_LOWER_VERSION, NBA_HIGHER_LOWER_METRIC_KEYS, NBA_HIGHER_LOWER_GAP_BOUNDS,
  nbaHigherLowerAnswerIsCorrect, parseNbaHigherLowerBoard,
} from "./nbaHigherLowerModel";

describe("NBA Higher or Lower factual boards", () => {
  it("builds deterministic ten-question NBA boards with independent answers", () => {
    const first = createNbaHigherLowerBoard("nba-high-low-fixed");
    expect(createNbaHigherLowerBoard("nba-high-low-fixed")).toEqual(first);
    expect(first.version).toBe(NBA_HIGHER_LOWER_VERSION);
    expect(first.questions).toHaveLength(10);
    expect(new Set(first.questions.map(row => row.id)).size).toBe(10);
    expect(parseNbaHigherLowerBoard(JSON.parse(JSON.stringify(first)))).toEqual(first);
  });
  it("preserves 3 approachable / 5 competitive / 2 tough with no person repeated", () => {
    for (let i = 0; i < 20; i++) {
      const board = createNbaHigherLowerBoard("nba-high-low-quality-" + i);
      const difficulties = board.questions.map(q => q.difficulty);
      expect(difficulties.filter(d => d === "approachable")).toHaveLength(3);
      expect(difficulties.filter(d => d === "competitive")).toHaveLength(5);
      expect(difficulties.filter(d => d === "tough")).toHaveLength(2);
      const names = board.questions.flatMap(q => [q.known.name, q.hidden.name]);
      expect(new Set(names).size).toBe(20);
      expect(new Set(board.questions.map(q => q.metricKey)).size).toBeGreaterThanOrEqual(6);
      expect(board.questions.filter(q => q.category === "season").length).toBeGreaterThanOrEqual(4);
      expect(board.questions.filter(q => q.category === "awards").length).toBeGreaterThanOrEqual(1);
      for (const row of board.questions) {
        expect(row.known.value).not.toBe(row.hidden.value);
        expect(row.answer).toBe(row.hidden.value > row.known.value ? "higher" : "lower");
        expect(nbaHigherLowerAnswerIsCorrect(row, row.answer)).toBe(true);
        expect(nbaHigherLowerAnswerIsCorrect(row, row.answer === "higher" ? "lower" : "higher")).toBe(false);
        for (const candidate of [row.known, row.hidden]) {
          expect(candidate.name.length).toBeGreaterThan(3);
          expect(candidate.context.length).toBeGreaterThan(7);
          if (row.category === "season") {
            expect(candidate.season).toBeGreaterThanOrEqual(1972);
            expect(candidate.context).toMatch(/\d{4}–\d{2}/);
          }
          expect(candidate.formattedValue).toBe(
            row.category === "season" || row.category === "career"
              ? candidate.value.toFixed(1) : String(candidate.value)
          );
        }
      }
    }
  });
  it("never signals the remaining answers via a fixed five-and-five pattern", () => {
    const higherCounts = new Set(Array.from({ length: 45 }, (_, i) =>
      createNbaHigherLowerBoard("nba-direction-" + i).questions.filter(q => q.answer === "higher").length));
    expect(higherCounts.size).toBeGreaterThan(3);
    expect([...higherCounts].some(count => count !== 5)).toBe(true);
  });
  it("rejects runaway stat mismatches and meaningless tenths over a broad replay audit", () => {
    const seen = new Set<string>();
    const categoryFrequency = new Map<string, number>();
    for (let i = 0; i < 120; i++) {
      const board = createNbaHigherLowerBoard("recalibrated-nba-audit-" + i);
      for (const question of board.questions) {
        const bounds = NBA_HIGHER_LOWER_GAP_BOUNDS[question.metricKey]!;
        const difference = Math.abs(question.known.value - question.hidden.value);
        expect(difference, question.id).toBeGreaterThanOrEqual(bounds.min - 1e-8);
        expect(difference, question.id).toBeLessThanOrEqual(bounds.max + 1e-8);
        if (question.category === "season") {
          expect(Math.abs(question.known.season! - question.hidden.season!)).toBeLessThanOrEqual(12);
        }
        if (question.category === "awards" || question.category === "draft") {
          expect(question.difficulty).not.toBe("approachable");
        }
        categoryFrequency.set(question.metricKey, (categoryFrequency.get(question.metricKey) ?? 0) + 1);
        seen.add(question.id);
        expect(question.known.name === "Mike Conley" && question.hidden.name === "Russell Westbrook"
          && question.metricKey === "season-assists" && difference > 3).toBe(false);
        expect(question.known.name === "Steve Francis" && question.hidden.name === "Kobe Bryant"
          && question.metricKey === "season-points" && difference > 10).toBe(false);
      }
    }
    expect(seen.size).toBeGreaterThan(500);
    expect(categoryFrequency.size).toBeGreaterThanOrEqual(9);
  });

  it("includes three pointers, honors, and NBA draft choices as curated metrics", () => {
    expect(NBA_HIGHER_LOWER_METRIC_KEYS).toEqual(expect.arrayContaining([
      "season-threes", "all-star", "all-nba", "draft",
      "career-points", "career-rebounds", "career-assists",
      "season-points", "season-rebounds", "season-assists",
    ]));
  });
  it("gives the same unranked preview each day and rejects corrupted frozen boards", () => {
    const day = createNbaHigherLowerDailyPreview("2026-10-19");
    expect(createNbaHigherLowerDailyPreview("2026-10-19")).toEqual(day);
    expect(day.identity.type).toBe("daily");
    expect(parseNbaHigherLowerBoard({ ...day.board, questions: day.board.questions.slice(1) })).toBeNull();
    expect(parseNbaHigherLowerBoard({
      ...day.board, questions: [
        { ...day.board.questions[0], answer: day.board.questions[0]!.answer === "higher" ? "lower" : "higher" },
        ...day.board.questions.slice(1),
      ],
    })).toBeNull();
  });
});
