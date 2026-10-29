import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { buildBarTriviaDailySetup } from "./barTriviaDailyRuntime";
import { isUfcPublicationDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { expandUfcBarTriviaRecentFactIds } from "./ufcBarTriviaV3Editorial";
import {
  UFC_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER,
  ufcPublishedBarTriviaIdsBeforeDay,
} from "./ufcBarTriviaPublishedHistory20261029";
import {
  UFC_BAR_TRIVIA_FOCUSED_RETIREMENTS,
  UFC_BAR_TRIVIA_FOCUSED_SOURCE_OVERRIDES,
} from "./ufcBarTriviaFocusedQuality20261029";
import type { BarTriviaQuestion } from "../games/barTriviaEngine";

const VERSION = "ufc-daily-v22-higher-lower-oct29";
const HORIZON = 182;
function dateAt(offset: number) {
  return new Date(Date.UTC(2026, 9, 29 + offset)).toISOString().slice(0, 10);
}
const history = UFC_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER;

describe("UFC Bar Trivia focused quality / actual published history", () => {
  it("preserves 4 genuinely published boards, including the proven 6-day repeat", () => {
    expect(history.map((x) => x.day)).toEqual([
      "2026-09-29", "2026-10-05", "2026-10-07", "2026-10-24",
    ]);
    for (const publication of history) {
      expect(publication.questionIds, publication.day).toHaveLength(10);
    }
    for (const repeatedId of [
      "ufc-current-2026-09-19-joshua-van-pantoja",
      "ufc-easy2-youngest-champ",
    ]) {
      expect(history.filter((x) => x.questionIds.includes(repeatedId)).map((x) => x.day))
        .toEqual(["2026-09-29", "2026-10-05"]);
      expect(ufcPublishedBarTriviaIdsBeforeDay("2026-11-02", 184)).toContain(repeatedId);
    }
    expect(ufcPublishedBarTriviaIdsBeforeDay("2026-09-29", 184)).toEqual([]);
    expect(ufcPublishedBarTriviaIdsBeforeDay("2027-05-05", 184))
      .not.toContain("ufc-r1-thug-rose");
  });

  it("retires only the reviewed weak questions and corrects an answer-mismatched prompt", () => {
    const ufc = BAR_TRIVIA_QUESTION_BANK.filter((x) => x.league === "ufc");
    const ids = new Set(ufc.map((x) => x.id));
    expect(Object.keys(UFC_BAR_TRIVIA_FOCUSED_RETIREMENTS)).toHaveLength(14);
    for (const [id, reason] of Object.entries(UFC_BAR_TRIVIA_FOCUSED_RETIREMENTS)) {
      expect(reason.length, id).toBeGreaterThan(18);
      expect(ids.has(id), id).toBe(false);
    }
    const hof = ufc.find((q) => q.id === "ufc-r2-first-womens-hof-fight");
    expect(hof?.prompt).toMatch(/Which famous 2020 UFC title fight/);
    expect(hof?.answer).toBe("Zhang Weili vs. Joanna Jedrzejczyk");
    expect(hof?.sourceUrl).toMatch(/ufc-248-fight-between-zhang-weili/);
    const cejudo = ufc.find((q) => q.id === "ufc-bt-v3-e-001");
    expect(cejudo?.sourceUrl).toBe(UFC_BAR_TRIVIA_FOCUSED_SOURCE_OVERRIDES[cejudo!.id]);
    expect(cejudo?.answer).toBe("Wrestling");
    expect(ufc.filter((q) => q.round === "last-call" && q.contentType === "evergreen").length)
      .toBeGreaterThanOrEqual(20);
  });

  it("certifies all 182 calendar days at the actual production UFC v22 seed", () => {
    const days: string[] = [];
    const usedIds = new Set<string>();
    const usedFacts = new Set<string>();
    for (let offset = 0; offset < HORIZON; offset++) {
      const day = dateAt(offset);
      if (!isUfcPublicationDay(day) || lockedWeightedGameForDay("ufc", day) !== "bar_trivia") continue;
      days.push(day);
      const setup = buildBarTriviaDailySetup("ufc", day, VERSION);
      const board = setup.privateSetupEvidence.questions as BarTriviaQuestion[];
      expect(board, day).toHaveLength(10);
      expect(board.map((q) => q.difficulty).sort(), day).toEqual(
        ["easy", "easy", "easy", "easy", "medium", "medium", "medium", "hard", "hard", "last-call"].sort(),
      );
      expect(board[3]?.round, day).toBe("round2");
      expect(board[3]?.difficulty, day).toBe("easy");
      expect(board[6]?.round, day).toBe("round3");
      expect(board[6]?.difficulty, day).toBe("medium");
      const pastPublished = new Set(expandUfcBarTriviaRecentFactIds(
        ufcPublishedBarTriviaIdsBeforeDay(day, 184),
      ));
      for (const q of board) {
        expect(usedIds.has(q.id), `${day}: repeated question ID ${q.id}`).toBe(false);
        expect(pastPublished.has(q.id), `${day}: previously published fact ${q.id}`).toBe(false);
        usedIds.add(q.id);
        const family = expandUfcBarTriviaRecentFactIds([q.id]).sort().join("|");
        expect(usedFacts.has(family), `${day}: repeated fact family ${family}`).toBe(false);
        usedFacts.add(family);
        if (q.contentType === "current-event") {
          const timestamp = Date.parse(day + "T12:00:00.000Z");
          if (q.activeFrom) expect(timestamp).toBeGreaterThanOrEqual(Date.parse(q.activeFrom));
          if (q.expiresAt) expect(timestamp).toBeLessThanOrEqual(Date.parse(q.expiresAt));
        }
      }
    }
    expect(days).toEqual([
      "2026-11-02", "2026-11-24", "2026-12-14",
      "2027-01-01", "2027-01-23", "2027-02-12",
      "2027-03-02", "2027-03-24", "2027-04-13",
    ]);
    expect(usedIds.size).toBe(90);
    expect(usedFacts.size).toBe(90);
  });
});
