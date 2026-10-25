import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  UFC_HIGHER_LOWER_DAILY_APPEARANCES, UFC_HIGHER_LOWER_DAILY_EPOCH,
  UFC_HIGHER_LOWER_METRIC_KEYS, UFC_HIGHER_LOWER_SNAPSHOT,
  createUfcHigherLowerBoard, ufcHigherLowerAuditedInventory,
  ufcHigherLowerDailyBoard, ufcHigherLowerSixMonthBoards,
} from "./ufcHigherLowerModel";
import { UFC_LOCKED_WEIGHTED_CYCLE } from "./dailyChallengeRotation";

const unkeyedPair = (left: string, right: string) => [left,right].sort().join("|");
const dateFor = (i: number) => new Date(Date.parse(UFC_HIGHER_LOWER_DAILY_EPOCH + "T00:00:00Z") + i * 2 * 86_400_000)
  .toISOString().slice(0,10);

describe("UFC Higher or Lower six-month factual readiness", () => {
  it("keeps the approved 2x future weight staged without changing current UFC rotations", () => {
    expect(UFC_LOCKED_WEIGHTED_CYCLE).not.toContain("higher_lower");
    expect(UFC_HIGHER_LOWER_SNAPSHOT).toBe("2026-08-18");
    expect(UFC_HIGHER_LOWER_DAILY_APPEARANCES).toBe(92);
  });
  it("builds 92 successive every-other-day boards with zero matchup or concept duplication", () => {
    const boards = ufcHigherLowerSixMonthBoards();
    expect(boards).toHaveLength(92);
    const pairs = new Set<string>();
    const pairMetrics = new Set<string>();
    const subjectCounts = new Map<string,number>();
    const metricCounts = new Map<string,number>();
    for (const [dayIndex, board] of boards.entries()) {
      expect(ufcHigherLowerDailyBoard(dateFor(dayIndex))).toEqual(board);
      expect(board.questions).toHaveLength(10);
      expect(board.questions.map(q => q.difficulty)).toEqual([
        "approachable","approachable","approachable",
        "competitive","competitive","competitive","competitive","competitive","tough","tough",
      ]);
      expect(board.questions.filter(q => q.answer === "higher")).toHaveLength(5);
      expect(board.questions.filter(q => q.answer === "lower")).toHaveLength(5);
      const used = new Set<string>();
      const categories = new Set<string>();
      const metricLocal = new Map<string,number>();
      for (const q of board.questions) {
        expect(q.metricLabel.startsWith("UFC")).toBe(true);
        expect(q.scopeLabel).toContain(UFC_HIGHER_LOWER_SNAPSHOT);
        expect(q.known.value).not.toBe(q.hidden.value);
        expect(q.answer).toBe(q.hidden.value > q.known.value ? "higher" : "lower");
        const key = unkeyedPair(q.known.subjectId,q.hidden.subjectId);
        expect(pairs.has(key)).toBe(false);
        expect(pairMetrics.has(q.metricKey + "|" + key)).toBe(false);
        pairs.add(key);pairMetrics.add(q.metricKey + "|" + key);
        expect(used.has(q.known.subjectId)).toBe(false);
        expect(used.has(q.hidden.subjectId)).toBe(false);
        used.add(q.known.subjectId);used.add(q.hidden.subjectId);
        categories.add(q.metricKey);
        metricCounts.set(q.metricKey,(metricCounts.get(q.metricKey) ?? 0)+1);
        metricLocal.set(q.metricKey,(metricLocal.get(q.metricKey) ?? 0)+1);
        for (const id of [q.known.subjectId,q.hidden.subjectId])
          subjectCounts.set(id,(subjectCounts.get(id) ?? 0)+1);
        expect(existsSync(join(process.cwd(),"public",q.known.photoUrl.replace(/^\//,"")))).toBe(true);
        expect(existsSync(join(process.cwd(),"public",q.hidden.photoUrl.replace(/^\//,"")))).toBe(true);
      }
      expect(categories.size).toBeGreaterThanOrEqual(5);
      expect(Math.max(...metricLocal.values())).toBeLessThanOrEqual(2);
      expect(used.size).toBe(20);
    }
    const result = ufcHigherLowerAuditedInventory();
    console.info("UFC HIGHER OR LOWER SIX-MONTH AUDIT", JSON.stringify(result));
    expect(result.questions).toBe(920);
    expect(result.repeatedMatchups).toBe(0);
    expect(result.distinctMatchups).toBe(920);
    expect(result.distinctFighters).toBeGreaterThanOrEqual(75);
    expect(result.candidateComparisons).toBeGreaterThan(920);
    expect(result.maxFighterAppearances).toBeLessThanOrEqual(45);
    expect(metricCounts.size).toBe(UFC_HIGHER_LOWER_METRIC_KEYS.length);
    expect(Math.max(...metricCounts.values()) / Math.min(...metricCounts.values())).toBeLessThan(4);
  },120000);
  it("rejects unofficial UFC dates outside the future reviewed window and builds fresh Casual", () => {
    expect(() => ufcHigherLowerDailyBoard("2026-11-01")).toThrow();
    expect(() => ufcHigherLowerDailyBoard("2027-05-06")).toThrow();
    const a=createUfcHigherLowerBoard("casual:1");
    const b=createUfcHigherLowerBoard("casual:1");
    expect(a).toEqual(b);
    expect(a.questions).toHaveLength(10);
    expect(new Set(a.questions.flatMap(q => [q.known.subjectId,q.hidden.subjectId])).size).toBe(20);
  });
});
