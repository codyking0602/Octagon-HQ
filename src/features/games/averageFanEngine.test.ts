import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_FANS,
  AVERAGE_FAN_FORMATS,
  AVERAGE_FAN_PLAYABLE_GRADES,
  AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_REPORT_GRADE_MODIFIER,
  AVERAGE_FAN_SUBJECTS,
  averageFanAnswersMatch,
  averageFanCenteredSubjectModifier,
  averageFanFanAccuracy,
  averageFanFanAnswer,
  averageFanPublicQuestion,
  averageFanQuestionEligibleForBoard,
  averageFanQuestionEligibleForFinal,
  scoreAverageFanBoard,
  scoreAverageFanFinal,
  validateAverageFanQuestion,
  type AverageFanFan,
  type AverageFanQuestion,
  type AverageFanSport,
} from "./averageFanEngine";
import { isTriviaContentActive } from "./triviaContentExpiry";

function fixture(overrides: Partial<AverageFanQuestion> = {}): AverageFanQuestion {
  return {
    id: "fixture-question",
    sport: "ufc",
    grade: 4,
    subject: "Fighters",
    format: "short-answer",
    prompt: "Name the fixture fighter.",
    answer: "Correct Fighter",
    aliases: ["C. Fighter"],
    explanation: "Fixture explanation.",
    contentType: "evergreen",
    difficultyNudge: 0,
    fanMisses: ["Wrong Fighter", "Other Fighter"],
    protectedFinal: false,
    ...overrides,
  };
}

function findWrongQuestion(
  format: AverageFanQuestion["format"],
  fan: AverageFanFan,
) {
  for (let index = 0; index < 2_000; index += 1) {
    const question = fixture({
      id: `wrong-${format}-${index}`,
      grade: 5,
      difficultyNudge: 3,
      format,
      ...(format === "four-choice"
        ? { answer: "Alpha", aliases: [], choices: ["Alpha", "Beta", "Gamma", "Delta"] as const, fanMisses: undefined }
        : format === "true-false"
          ? { answer: "True", aliases: [], fanMisses: undefined }
          : {}),
    });
    const answer = averageFanFanAnswer(question, fan);
    if (!answer.correct) return { question, answer };
  }
  throw new Error("Expected to find a deterministic wrong-answer fixture.");
}

describe("Average Fan canonical question contract", () => {
  it("accepts the three locked formats and enforces authored short-answer fan misses", () => {
    expect(validateAverageFanQuestion(fixture())).toEqual([]);
    expect(validateAverageFanQuestion(fixture({
      format: "four-choice",
      answer: "Alpha",
      aliases: [],
      choices: ["Alpha", "Beta", "Gamma", "Delta"],
      fanMisses: undefined,
    }))).toEqual([]);
    expect(validateAverageFanQuestion(fixture({
      format: "true-false",
      answer: "False",
      aliases: [],
      fanMisses: undefined,
    }))).toEqual([]);

    expect(validateAverageFanQuestion(fixture({ fanMisses: [] })))
      .toContain("short-answer questions must author 1-3 plausible fan misses");
  });

  it("locks multiple choice to four authored answers and rejects the legacy three-choice contract", () => {
    expect(AVERAGE_FAN_FORMATS).toEqual(["short-answer", "four-choice", "true-false"]);
    expect(AVERAGE_FAN_PLAYABLE_GRADES).toEqual([2, 3, 4, 5]);

    expect(validateAverageFanQuestion(fixture({
      format: "four-choice",
      answer: "Alpha",
      aliases: [],
      choices: ["Alpha", "Beta", "Gamma"] as unknown as [string, string, string, string],
      fanMisses: undefined,
    }))).toContain("four-choice questions must define exactly four choices");

    expect(validateAverageFanQuestion(fixture({
      format: "four-choice",
      answer: "Alpha",
      aliases: [],
      choices: ["Alpha", "Beta", "Gamma", "Gamma"],
      fanMisses: undefined,
    }))).toContain("four-choice choices must be unique");

    expect(validateAverageFanQuestion(fixture({
      format: "three-choice" as AverageFanQuestion["format"],
      answer: "Alpha",
      aliases: [],
      choices: undefined,
      fanMisses: undefined,
    }))).toContain("format is unsupported");
  });

  it("accepts punctuation and small short-answer typos without making choices fuzzy", () => {
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "Georges St-Pierre",
      aliases: [],
    }), "George St-pierre")).toBe(true);
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "Alistair Overeem",
      aliases: [],
    }), "Alister Overeem")).toBe(true);
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "St-Pierre",
      aliases: [],
    }), "St Pierre")).toBe(true);
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "Chris Weidman",
      aliases: ["Weidman"],
    }), "weidmn")).toBe(true);
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "Chris Weidman",
      aliases: ["Weidman"],
    }), "Chris Wiedman")).toBe(true);
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "Nickel",
      aliases: [],
    }), "nickle")).toBe(false);
    expect(averageFanAnswersMatch(fixture({
      format: "short-answer",
      answer: "Art Jimmerson",
      aliases: [],
    }), "Kevin Rosier")).toBe(false);
    expect(averageFanAnswersMatch(fixture({
      format: "four-choice",
      answer: "Georges St-Pierre",
      aliases: [],
      choices: ["Georges St-Pierre", "Matt Hughes", "B.J. Penn", "Carlos Condit"],
      fanMisses: undefined,
    }), "George St-Pierre")).toBe(false);
  });

  it("protects dedicated finals from ordinary board eligibility", () => {
    const board = fixture({ grade: 5, protectedFinal: false });
    const final = fixture({ id: "final", grade: 5, protectedFinal: true });
    expect(averageFanQuestionEligibleForBoard(board)).toBe(true);
    expect(averageFanQuestionEligibleForFinal(board)).toBe(false);
    expect(averageFanQuestionEligibleForBoard(final)).toBe(false);
    expect(averageFanQuestionEligibleForFinal(final)).toBe(true);
    expect(validateAverageFanQuestion(fixture({ protectedFinal: true, grade: 4 })))
      .toContain("protected Final questions must be grade 5");
  });

  it("requires expiration metadata on current-event questions", () => {
    expect(validateAverageFanQuestion(fixture({ contentType: "current-event" })))
      .toContain("current-event questions must include expiresAt");
    expect(validateAverageFanQuestion(fixture({
      contentType: "current-event",
      activeFrom: "2026-09-01T00:00:00Z",
      expiresAt: "2026-10-01T00:00:00Z",
    }))).toEqual([]);
  });

  it("keeps answer authority and fan-miss evidence out of the public question", () => {
    const authored = fixture({
      sourceId: "fixture-source",
      sourceUrl: "https://example.com/source",
      verifiedAt: "2026-09-29",
    });
    const publicQuestion = averageFanPublicQuestion(authored);
    expect(publicQuestion).toEqual({
      id: authored.id,
      sport: authored.sport,
      grade: authored.grade,
      subject: authored.subject,
      format: authored.format,
      prompt: authored.prompt,
    });
    expect("answer" in publicQuestion).toBe(false);
    expect("aliases" in publicQuestion).toBe(false);
    expect("explanation" in publicQuestion).toBe(false);
    expect("fanMisses" in publicQuestion).toBe(false);
    expect("sourceId" in publicQuestion).toBe(false);
  });
});

describe("Average Fan report-card intelligence", () => {
  it("locks the five v1 fans and their authored report cards", () => {
    expect(AVERAGE_FAN_FANS).toEqual(["cody", "shane", "troy", "tyler", "lib"]);
    expect(AVERAGE_FAN_REPORT_CARDS.ufc.shane).toEqual({
      Fighters: "A+",
      Fights: "B+",
      Championships: "A-",
      "Octagon IQ": "C+",
    });
  });

  it("keeps every displayed fan equally strong overall while preserving subject differences", () => {
    for (const sport of Object.keys(AVERAGE_FAN_SUBJECTS) as AverageFanSport[]) {
      const totals = AVERAGE_FAN_FANS.map((fan) => {
        const row = AVERAGE_FAN_REPORT_CARDS[sport][fan] as Record<string, keyof typeof AVERAGE_FAN_REPORT_GRADE_MODIFIER>;
        return AVERAGE_FAN_SUBJECTS[sport]
          .map((subject) => AVERAGE_FAN_REPORT_GRADE_MODIFIER[row[subject]!])
          .reduce<number>((sum, value) => sum + value, 0);
      });
      expect(new Set(totals)).toEqual(new Set([11]));
      const profiles = AVERAGE_FAN_FANS.map((fan) => JSON.stringify(AVERAGE_FAN_REPORT_CARDS[sport][fan]));
      expect(new Set(profiles).size).toBe(AVERAGE_FAN_FANS.length);

      for (const fan of AVERAGE_FAN_FANS) {
        const modifiers = AVERAGE_FAN_SUBJECTS[sport].map((subject) =>
          averageFanCenteredSubjectModifier(sport, fan, subject)
        );
        const mean = modifiers.reduce((sum, value) => sum + value, 0) / modifiers.length;
        expect(mean).toBeCloseTo(0, 10);
      }
    }

    expect(AVERAGE_FAN_SUBJECTS.ufc.map((subject) =>
      averageFanCenteredSubjectModifier("ufc", "shane", subject)
    )).toEqual([7.25, -0.75, 1.25, -7.75]);
  });

  it("applies grade base, centered subject strength, difficulty nudge, and clamp", () => {
    expect(averageFanFanAccuracy(fixture({
      sport: "ufc",
      grade: 4,
      subject: "Fighters",
      difficultyNudge: 0,
    }), "shane")).toBe(89.25);

    expect(averageFanFanAccuracy(fixture({
      sport: "ufc",
      grade: 4,
      subject: "Octagon IQ",
      difficultyNudge: 0,
    }), "shane")).toBe(74.25);

    expect(averageFanFanAccuracy(fixture({
      sport: "ufc",
      grade: 1,
      subject: "Fighters",
      difficultyNudge: -3,
    }), "shane")).toBe(98);
  });

  it("locks each fan answer deterministically to question + fan only", () => {
    const question = fixture({ id: "deterministic-q" });
    expect(averageFanFanAnswer(question, "cody"))
      .toEqual(averageFanFanAnswer(question, "cody"));
  });

  it("uses only authored/plausible wrong answers for every format", () => {
    const short = findWrongQuestion("short-answer", "shane");
    expect(short.question.fanMisses).toContain(short.answer.answer);

    const choice = findWrongQuestion("four-choice", "shane");
    expect(choice.question.choices).toContain(choice.answer.answer);
    expect(choice.answer.answer).not.toBe(choice.question.answer);

    const truth = findWrongQuestion("true-false", "shane");
    expect(truth.answer.answer).toBe("False");
  });
});

describe("Average Fan scoring", () => {
  it("preserves the locked eight-question board calibration", () => {
    expect(scoreAverageFanBoard([])).toBe(90);
    expect(scoreAverageFanBoard([1])).toBe(70);
    expect(scoreAverageFanBoard([2])).toBe(72);
    expect(scoreAverageFanBoard([4])).toBe(76);
    expect(scoreAverageFanBoard([6])).toBe(80);
    expect(scoreAverageFanBoard([8])).toBe(84);
    expect(() => scoreAverageFanBoard([9])).toThrow();
  });

  it("charges five points for every additional unsaved miss", () => {
    expect(scoreAverageFanBoard([6, 8])).toBe(75);
    expect(scoreAverageFanBoard([6, 7, 8])).toBe(70);
  });

  it("scores the final as bank, plus ten, or minus ten", () => {
    expect(scoreAverageFanFinal(90, "walk-away")).toBe(90);
    expect(scoreAverageFanFinal(90, "correct")).toBe(100);
    expect(scoreAverageFanFinal(90, "wrong")).toBe(80);
    expect(scoreAverageFanFinal(74, "correct")).toBe(84);
    expect(scoreAverageFanFinal(74, "wrong")).toBe(64);
  });
});

describe("shared trivia expiration", () => {
  it("keeps evergreen content active and applies inclusive activeFrom/expiresAt windows", () => {
    expect(isTriviaContentActive({ contentType: "evergreen" }, "2030-01-01")).toBe(true);
    const current = {
      contentType: "current-event" as const,
      activeFrom: "2026-09-01T00:00:00Z",
      expiresAt: "2026-09-30T00:00:00Z",
    };
    expect(isTriviaContentActive(current, "2026-08-31T23:59:59Z")).toBe(false);
    expect(isTriviaContentActive(current, "2026-09-01T00:00:00Z")).toBe(true);
    expect(isTriviaContentActive(current, "2026-09-30T00:00:00Z")).toBe(true);
    expect(isTriviaContentActive(current, "2026-09-30T00:00:01Z")).toBe(false);
  });
});
