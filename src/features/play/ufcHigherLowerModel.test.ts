import { describe, expect, it } from "vitest";
import {
  createUfcHigherLowerBoard, createUfcHigherLowerOfficialBoard,
  UFC_HIGHER_LOWER_FIGHTERS, UFC_HIGHER_LOWER_QUESTION_COUNT,
  UFC_HIGHER_LOWER_RESERVED_SLOTS, UFC_HIGHER_LOWER_FIRST_SLOT,
  ufcHigherLowerCandidateCounts,
} from "./ufcHigherLowerModel";
import {
  advanceUfcHigherLowerDailyRuntime, buildUfcHigherLowerDailyPublication,
} from "./ufcHigherLowerDailyRuntime";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";
import { UFC_LOCKED_WEIGHTED_CYCLE } from "./dailyChallengeRotation";
import { buildOfficialDailySetup } from "./todaysChallengeRuntime";

function dayAt(index: number) {
  const date = new Date(Date.parse(UFC_HIGHER_LOWER_FIRST_SLOT + "T00:00:00Z") + index * 172_800_000);
  return date.toISOString().slice(0, 10);
}
function pairKey(a: string, b: string) { return [a, b].sort().join("|"); }
function initialContext(): OfficialDailyRuntimeContext {
  const pub = buildUfcHigherLowerDailyPublication(dayAt(0), "ufc-hl-regression-v1");
  return {
    gameType: "higher_lower", setupKey: pub.setupKey,
    publicSetup: pub.publicSetup, revealSetup: pub.revealSetup,
    privateSetupEvidence: pub.privateSetupEvidence,
    privateGradingEvidence: pub.privateGradingEvidence,
    submissionState: {},
    publicState: pub.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("UFC Higher or Lower — six-month content readiness", () => {
  it("has six pinned UFC-only statistical categories and independently source-backed coverage", () => {
    const specs = ufcHigherLowerCandidateCounts();
    expect(specs).toHaveLength(10);
    expect(new Set(specs.map(spec => spec.metric))).toEqual(
      new Set(["bouts", "wins", "finishes", "ko", "submissions", "title_wins"]),
    );
    expect(specs.every(spec => spec.count > 0)).toBe(true);
    expect(UFC_HIGHER_LOWER_FIGHTERS.length).toBeGreaterThanOrEqual(70);
  });

  it("supplies at least 200 days of deterministic 48-hour boards with zero reversed/semantic pair repeats", () => {
    const pairKeys = new Set<string>();
    const subjectCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    const metricCounts = new Map<string, number>();
    const modern = new Set<string>();
    for (const fighter of UFC_HIGHER_LOWER_FIGHTERS) modern.add(fighter.id);
    for (let day = 0; day < UFC_HIGHER_LOWER_RESERVED_SLOTS; day++) {
      const board = createUfcHigherLowerOfficialBoard(dayAt(day));
      expect(createUfcHigherLowerOfficialBoard(dayAt(day))).toEqual(board);
      expect(board.questions).toHaveLength(UFC_HIGHER_LOWER_QUESTION_COUNT);
      expect(board.questions.map(q => q.difficulty)).toEqual([
        "approachable", "approachable", "approachable",
        "competitive", "competitive", "competitive", "competitive", "competitive",
        "tough", "tough",
      ]);
      const perDaySubjects = new Set<string>();
      const dailyMetrics = new Set<string>();
      for (const q of board.questions) {
        const key = pairKey(q.known.subjectId, q.hidden.subjectId);
        expect(pairKeys.has(key), "Repeated/reversed matchup: " + key).toBe(false);
        pairKeys.add(key);
        for (const person of [q.known, q.hidden]) {
          expect(modern.has(person.subjectId)).toBe(true);
          expect(perDaySubjects.has(person.subjectId)).toBe(false);
          perDaySubjects.add(person.subjectId);
          subjectCounts.set(person.subjectId, (subjectCounts.get(person.subjectId) ?? 0) + 1);
        }
        expect(q.known.value).not.toBe(q.hidden.value);
        expect(q.answer).toBe(q.hidden.value > q.known.value ? "higher" : "lower");
        expect(q.note).toContain("UFC bouts only");
        dailyMetrics.add(q.metricKey);
        metricCounts.set(q.metricKey, (metricCounts.get(q.metricKey) ?? 0) + 1);
        categoryCounts.set(q.category, (categoryCounts.get(q.category) ?? 0) + 1);
      }
      expect(perDaySubjects.size).toBe(20);
      expect(dailyMetrics.size).toBe(6);
    }
    expect(pairKeys.size).toBe(UFC_HIGHER_LOWER_RESERVED_SLOTS * 10);
    expect(subjectCounts.size).toBeGreaterThanOrEqual(70);
    expect(categoryCounts.size).toBe(3);
    expect(metricCounts.size).toBe(6);
    // Fighter concentration regression: any one athlete should not dominate.
    expect(Math.max(...subjectCounts.values())).toBeLessThanOrEqual(65);
  });

  it("keeps every hidden answer/number private and the canonical grader authoritative", () => {
    const pub = buildUfcHigherLowerDailyPublication(dayAt(0), "ufc-hl-regression-v1");
    expect(buildOfficialDailySetup("higher_lower", dayAt(0), "ufc-hl-regression-v1")).toEqual(pub);
    const before = (pub.publicSetup.initial_state as Record<string, unknown>).current_question as Record<string, unknown>;
    expect(before).not.toHaveProperty("answer");
    expect(String(before.id)).toBe("ufc-daily-comparison-1");
    expect(before.hidden).not.toHaveProperty("value");
    expect(before.hidden).not.toHaveProperty("formattedValue");
    expect(pub.privateGradingEvidence.question_ids).toHaveLength(10);
    expect(pub.privateGradingEvidence.correct_choices).toHaveLength(10);
    let ctx = initialContext();
    expect(() => advanceUfcHigherLowerDailyRuntime(ctx, { choice: "tie" })).toThrow();
    const questions = createUfcHigherLowerOfficialBoard(dayAt(0)).questions;
    for (let i = 0; i < 10; i++) {
      const choice = i === 0 ? (questions[i]!.answer === "higher" ? "lower" : "higher") : questions[i]!.answer;
      const next = advanceUfcHigherLowerDailyRuntime(ctx, { choice });
      expect(next.publicState.correct_count).toBe(i);
      if (i < 9) {
        const upcoming = next.publicState.current_question as Record<string, unknown>;
        expect(upcoming).not.toHaveProperty("answer");
        expect(upcoming.hidden).not.toHaveProperty("value");
        expect(upcoming.hidden).not.toHaveProperty("formattedValue");
        expect(upcoming.id).toBe("ufc-daily-comparison-" + (i + 2));
      } else {
        expect(next.complete).toBe(true);
        expect(next.finalSubmission).toMatchObject({ native_score: 9, normalized_score: 90 });
      }
      ctx = { ...ctx, submissionState: next.submissionState, publicState: next.publicState };
    }
    expect(() => advanceUfcHigherLowerDailyRuntime(ctx, { choice: "higher" })).toThrow();
    expect(createUfcHigherLowerBoard("casual-1")).toEqual(createUfcHigherLowerBoard("casual-1"));
    expect(createUfcHigherLowerBoard("casual-1")).not.toEqual(createUfcHigherLowerBoard("casual-2"));
  });

  it("preserves the active UFC rotation, which has not yet activated Higher or Lower", () => {
    expect(UFC_LOCKED_WEIGHTED_CYCLE).not.toContain("higher_lower");
    expect(UFC_HIGHER_LOWER_RESERVED_SLOTS).toBeGreaterThanOrEqual(92);
  });
});
