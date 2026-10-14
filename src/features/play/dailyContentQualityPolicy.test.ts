import { describe, expect, it } from "vitest";
import {
  APPROVED_DAILY_ROTATION_WEIGHTS,
  findDailyContentOverlaps,
  normalizeDailyQuestionText,
  type DailyContentAuditEntry,
} from "./dailyContentQualityPolicy";
import {
  FOOTBALL_LOCKED_WEIGHTED_CYCLE,
  UFC_LOCKED_WEIGHTED_CYCLE,
} from "./dailyChallengeRotation";

function counts(cycle: readonly string[]): Record<string, number> {
  return cycle.reduce<Record<string, number>>((totals, game) => {
    totals[game] = (totals[game] ?? 0) + 1;
    return totals;
  }, {});
}

describe("Daily quality and rollout contract (Stage 1)", () => {
  it("locks the approved 4x Average Fan and 2x Higher or Lower targets", () => {
    const football = APPROVED_DAILY_ROTATION_WEIGHTS.football;
    const ufc = APPROVED_DAILY_ROTATION_WEIGHTS.ufc;

    expect(Object.values(football).reduce<number>((a, b) => a + b, 0)).toBe(28);
    expect(Object.values(ufc).reduce<number>((a, b) => a + b, 0)).toBe(30);

    for (const sport of [football, ufc]) {
      expect(sport.average_fan).toBe(4);
      expect(sport.higher_or_lower).toBe(2);
      expect(sport.sports_feud).toBe(4);
      expect(sport.millionaire).toBe(4);
    }
    expect(football.blind_resume).toBe(0);
    expect(ufc.blind_resume).toBe(2);
  });

  it("does not silently change existing Daily cycles before new game support is ready", () => {
    const existing = {
      football: counts(FOOTBALL_LOCKED_WEIGHTED_CYCLE),
      ufc: counts(UFC_LOCKED_WEIGHTED_CYCLE),
    };
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).toHaveLength(27);
    expect(UFC_LOCKED_WEIGHTED_CYCLE).toHaveLength(29);
    for (const sport of ["football", "ufc"] as const) {
      const target = APPROVED_DAILY_ROTATION_WEIGHTS[sport];
      for (const [game, weight] of Object.entries(target)) {
        const previous = existing[sport][game] ?? 0;
        if (game === "average_fan") expect(previous).toBe(weight + 1);
        else if (game === "higher_or_lower") expect(previous).toBe(0);
        else expect(previous).toBe(weight);
      }
    }
  });

  it("normalizes case, punctuation, and whitespace without losing numbers", () => {
    expect(normalizeDailyQuestionText("  UFC  100 — Who won?  "))
      .toBe("ufc 100 who won");
  });

  it("catches the published-style exact cross-game repetition", () => {
    const question = "Florida won its first national championship by beating which rival in the Sugar Bowl?";
    const entries: DailyContentAuditEntry[] = [
      { sport: "cfb", game: "bar_trivia", questionId: "cfb-r2-1996-florida-title", prompt: question, answer: "Florida State" },
      { sport: "cfb", game: "average_fan", questionId: "average-fan:cfb:authored:cfb-r2-1996-florida-title", prompt: question, answer: "Florida State" },
    ];
    expect(findDailyContentOverlaps(entries).map((overlap) => [overlap.reason, overlap.scope]))
      .toEqual([["identical_prompt", "across_games"]]);
  });

  it("flags editorial fact keys even when the question wording differs", () => {
    const entries: DailyContentAuditEntry[] = [
      { sport: "ufc", game: "average_fan", questionId: "a", prompt: "Who won the first BMF title?", answer: "Jorge Masvidal", factKey: "ufc:inaugural-bmf" },
      { sport: "ufc", game: "bar_trivia", questionId: "b", prompt: "At UFC 244, which fighter received the inaugural BMF belt?", answer: "Jorge Masvidal", factKey: "ufc:inaugural-bmf" },
    ];
    expect(findDailyContentOverlaps(entries)[0]?.reason).toBe("same_fact");
  });

  it("catches close rewrites sharing the same answer", () => {
    const entries: DailyContentAuditEntry[] = [
      { sport: "nfl", game: "millionaire", questionId: "a", prompt: "Which quarterback won the Super Bowl MVP award in the 2017 season final?", answer: "Nick Foles" },
      { sport: "nfl", game: "average_fan", questionId: "b", prompt: "Which quarterback won the Super Bowl MVP award in the 2017 season final game?", answer: "Nick Foles" },
    ];
    expect(findDailyContentOverlaps(entries)[0]?.reason).toBe("near_duplicate");
  });

  it("does not mistake distinct programs with identical conference answers for one fact", () => {
    const rows: DailyContentAuditEntry[] = [
      {sport:"cfb",game:"average_fan",questionId:"asu",factKey:"cfb:program:program-arizona-state:conference",prompt:"For the 2025 season, which conference was Arizona State in?",answer:"Big 12"},
      {sport:"cfb",game:"average_fan",questionId:"arizona",factKey:"cfb:program:program-arizona:conference",prompt:"For the 2025 season, which conference was Arizona in?",answer:"Big 12"},
    ];
    expect(findDailyContentOverlaps(rows)).toEqual([]);
    const genuinelySame = [{ ...rows[0]!, prompt: rows[1]!.prompt }, rows[1]!];
    expect(findDailyContentOverlaps(genuinelySame)[0]?.reason).toBe("identical_prompt");
  });

  it("does not confuse separate facts about the same person", () => {
    const entries: DailyContentAuditEntry[] = [
      { sport: "nfl", game: "millionaire", questionId: "a", prompt: "Which college did Tom Brady attend?", answer: "Michigan" },
      { sport: "nfl", game: "average_fan", questionId: "b", prompt: "Which quarterback won six Super Bowls with New England?", answer: "Tom Brady" },
    ];
    expect(findDailyContentOverlaps(entries)).toEqual([]);
  });
});
