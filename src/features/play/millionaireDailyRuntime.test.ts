import { describe, expect, it } from "vitest";
import type { MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import { millionaireDailyRun } from "./millionaireDailyQuestionBank";
import {
  advanceMillionaireDailyRuntime,
  buildMillionaireDailySetup,
  millionaireDailyHostNumber,
  millionaireDailyLeague,
  millionaireDailyRunIndex,
  millionaireFootballDailyLeague,
} from "./millionaireDailyRuntime";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";
import { isUfcPublicationDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { nbaRegularSeasonDaily } from "../nba/nbaDailySchedule";

function contextFor(sport: "ufc" | "football", day = "2026-09-19"): OfficialDailyRuntimeContext {
  const publication = buildMillionaireDailySetup(
    sport,
    day,
    sport === "ufc" ? "play-rotation-v8-millionaire" : "football-daily-v11-millionaire-no-double",
  );
  return {
    gameType: "millionaire",
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {},
    publicState: publication.publicSetup.initial_state as Record<string, unknown>,
  };
}

function privateRun(context: OfficialDailyRuntimeContext) {
  return context.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
}

function advance(context: OfficialDailyRuntimeContext, action: Record<string, unknown>) {
  const result = advanceMillionaireDailyRuntime(context, {
    ...action,
    time_remaining_ms: 120_000,
  });
  return {
    result,
    context: {
      ...context,
      submissionState: result.submissionState,
      publicState: result.publicState,
    } satisfies OfficialDailyRuntimeContext,
  };
}

describe("Millionaire official Daily runtime", () => {
  it("preserves archived NFL proof and applies sourced future-only editorial corrections", () => {
    const past = buildMillionaireDailySetup("football", "2026-09-24", "archive");
    const pastQuestion = (past.privateSetupEvidence.run as MillionaireRuntimeQuestion[])[5]!;
    expect(pastQuestion.prompt).toContain("never been named first-team All-Pro");
    expect(pastQuestion.id).toBe("millionaire-nfl-run-1-q6");

    const days = Array.from({ length: 182 }, (_, offset) =>
      new Date(Date.parse("2026-10-25T00:00:00Z") + offset * 86400000).toISOString().slice(0, 10));
    const target = days.find(day => day >= "2026-10-27"
      && lockedWeightedGameForDay("football", day) === "millionaire"
      && millionaireDailyLeague("football", day) === "nfl"
      && millionaireDailyRunIndex("football", day) === 0);
    expect(target).toBeDefined();
    const future = buildMillionaireDailySetup("football", target!, "future");
    const updated = (future.privateSetupEvidence.run as MillionaireRuntimeQuestion[])[5]!;
    expect(updated.id).toBe("millionaire-nfl-2025-ap-all-pro-q6-future");
    expect(updated.prompt).toContain("2025 NFL season");
    expect(updated.choices.find(c => c.id === updated.correctChoiceId)?.text).toBe("Matthew Stafford");
    expect(updated.statSheet).not.toMatch(/Stafford/i);
    expect(future.privateGradingEvidence.proof).toContain(updated.id);
    expect(past.privateGradingEvidence.proof).not.toContain(updated.id);
  });

  it("disambiguates the 2025 CFB season and removes the UFC answer-leaking clue only in future runs", () => {
    const days = Array.from({ length: 182 }, (_, offset) =>
      new Date(Date.parse("2026-10-25T00:00:00Z") + offset * 86400000).toISOString().slice(0, 10));
    const cfbDay = days.find(day => day >= "2026-10-27"
      && lockedWeightedGameForDay("football", day) === "millionaire"
      && millionaireDailyLeague("football", day) === "cfb"
      && millionaireDailyRunIndex("football", day) === 9);
    const ufcDay = days.find(day => day >= "2026-10-27"
      && isUfcPublicationDay(day)
      && lockedWeightedGameForDay("ufc", day) === "millionaire"
      && millionaireDailyRunIndex("ufc", day) === 9);
    expect(cfbDay).toBeDefined();
    expect(ufcDay).toBeDefined();
    const cfb = buildMillionaireDailySetup("football", cfbDay!, "future");
    const ufc = buildMillionaireDailySetup("ufc", ufcDay!, "future");
    const championship = (cfb.privateSetupEvidence.run as MillionaireRuntimeQuestion[])[0]!;
    const clue = (ufc.privateSetupEvidence.run as MillionaireRuntimeQuestion[])[6]!;
    expect(championship.prompt).toContain("2025 college football season");
    expect(championship.explanation).toContain("January 2026");
    expect(championship.choices.find(c => c.id === championship.correctChoiceId)?.text).toBe("Indiana");
    expect(clue.statSheet).not.toMatch(/Grasso/i);
    expect(clue.statSheet).toContain("fourth-round");
  });


  it("features one accurate Ditka question in Oct 10 CFB Millionaire only", () => {
    const previous = buildMillionaireDailySetup("football", "2026-10-07", "football-daily-v20-resume-v18-oct3");
    const memorial = buildMillionaireDailySetup("football", "2026-10-10", "football-daily-v20-resume-v18-oct3");
    const next = buildMillionaireDailySetup("football", "2026-10-26", "football-daily-v20-resume-v18-oct3");
    expect(memorial.publicSetup.league).toBe("cfb");
    expect(memorial.publicSetup.question_count).toBe(8);
    const run = memorial.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
    expect(run.filter((question) => question.id.includes("ditka-memorial"))).toHaveLength(1);
    const question = run[2]!;
    expect(question.prompt).toContain("Mike Ditka");
    expect(question.prompt).toBe("In which NFL season did Mike Ditka lead the Chicago Bears to their only Super Bowl championship?");
    expect(question.choices.map((choice) => choice.text).sort()).toEqual(["1984", "1985", "1986", "1987"]);
    expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.text).toBe("1985");
    expect((previous.privateSetupEvidence.run as MillionaireRuntimeQuestion[]).some((item) => item.id.includes("ditka-memorial"))).toBe(false);
    expect((next.privateSetupEvidence.run as MillionaireRuntimeQuestion[]).some((item) => item.id.includes("ditka-memorial"))).toBe(false);
  });

  it("never prints the correct fighter's surname in a future UFC Millionaire Stat Sheet", () => {
    const inspected = new Set<number>();
    for (let offset = 0; offset < 182; offset += 1) {
      const day = new Date(Date.parse("2026-10-25T00:00:00Z") + offset * 86400000)
        .toISOString().slice(0, 10);
      if (day < "2026-10-27" || !isUfcPublicationDay(day)
        || lockedWeightedGameForDay("ufc", day) !== "millionaire") continue;
      inspected.add(millionaireDailyRunIndex("ufc", day));
      const publication = buildMillionaireDailySetup("ufc", day, "future-test");
      const run = publication.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
      expect(run).toHaveLength(8);
      for (const question of run.slice(0, 7)) {
        const correctText = question.choices.find(choice => choice.id === question.correctChoiceId)!.text;
        // Only apply the surname check to multiword fighter identities, not
        // events, chronology, numeric answers, or short/common last tokens.
        const surname = correctText.split(/\s+/).at(-1)!;
        if (correctText.split(/\s+/).length < 2 || surname.length < 5 || !/^[A-Za-z]+$/.test(surname)) continue;
        expect(question.statSheet?.toLowerCase().split(/[^a-z]+/)).not.toContain(surname.toLowerCase());
      }
      expect(run[7]!.statSheet).toBeNull();
    }
    expect(inspected).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  it("debuts CFB for Football and UFC for UFC on September 19", () => {
    expect(millionaireDailyLeague("football", "2026-09-19")).toBe("cfb");
    expect(millionaireDailyLeague("ufc", "2026-09-19")).toBe("ufc");
    expect(millionaireFootballDailyLeague("2026-09-24")).toBe("nfl");
    expect(() => millionaireFootballDailyLeague("2026-09-29")).toThrow("not scheduled");
    expect(millionaireFootballDailyLeague("2026-10-03")).toBe("cfb");
  });

  it("rotates ten league-specific runs before repeating and advances hosts 1-2-3 by appearance", () => {
    const from = Date.parse("2026-10-25T00:00:00Z");
    const futureDates = Array.from({ length: 182 }, (_, index) =>
      new Date(from + index * 86_400_000).toISOString().slice(0, 10));
    const ufcDays = [
      "2026-09-19", "2026-09-26", "2026-10-11", "2026-10-15", "2026-10-21",
      "2026-10-25",
      ...futureDates.filter(day => day > "2026-10-25" && isUfcPublicationDay(day)
        && lockedWeightedGameForDay("ufc", day) === "millionaire").slice(0, 4),
    ];
    const futureFootball = futureDates.filter(day =>
      lockedWeightedGameForDay("football", day) === "millionaire");
    const cfbDays = [
      "2026-09-19", "2026-10-03", "2026-10-10",
      ...futureFootball.filter(day => millionaireDailyLeague("football", day) === "cfb").slice(0, 7),
    ];
    const nflDays = [
      "2026-09-24", "2026-10-07",
      ...futureFootball.filter(day => millionaireDailyLeague("football", day) === "nfl").slice(0, 8),
    ];

    expect(ufcDays.map((day) => millionaireDailyRunIndex("ufc", day))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(cfbDays.map((day) => millionaireDailyRunIndex("football", day))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(nflDays.map((day) => millionaireDailyRunIndex("football", day))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(ufcDays.slice(0, 6).map((day) => millionaireDailyHostNumber("ufc", day))).toEqual([1, 2, 3, 1, 2, 3]);
    expect(cfbDays.slice(0, 6).map((day) => millionaireDailyHostNumber("football", day))).toEqual([1, 2, 3, 1, 2, 3]);
    expect(nflDays.slice(0, 6).map((day) => millionaireDailyHostNumber("football", day))).toEqual([1, 2, 3, 1, 2, 3]);

    const debut = buildMillionaireDailySetup("football", cfbDays[0]!, "football-daily-v11-millionaire-no-double");
    const tenth = buildMillionaireDailySetup("football", cfbDays[9]!, "football-daily-v11-millionaire-no-double");
    expect(debut.publicSetup).toMatchObject({ league: "cfb", run_number: 1, host_number: 1 });
    expect(tenth.publicSetup).toMatchObject({ league: "cfb", run_number: 10, host_number: 1 });
    expect((debut.publicSetup.questions as Record<string, unknown>[])[0]!.id)
      .not.toBe((tenth.publicSetup.questions as Record<string, unknown>[])[0]!.id);
  });

  it("builds every approved future Millionaire date, with no historical reseeding", () => {
    const first = Date.parse("2026-10-25T00:00:00Z");
    const appearance = { football: [] as number[], ufc: [] as number[] };
    for (let index = 0; index < 182; index++) {
      const day = new Date(first + index * 86_400_000).toISOString().slice(0, 10);
      for (const sport of ["football", "ufc"] as const) {
        if (sport === "ufc" && !isUfcPublicationDay(day)) continue;
        if (lockedWeightedGameForDay(sport, day) !== "millionaire") continue;
        const version = sport === "ufc"
          ? day === "2026-10-25" ? "play-rotation-v20-resume-v18-oct3"
            : day < "2026-10-29" ? "ufc-daily-v21-48h-oct25" : "ufc-daily-v22-higher-lower-oct29"
          : day === "2026-10-26" ? "football-daily-v21-locked-oct25"
            : "football-daily-v22-higher-lower-oct27";
        const publication = buildMillionaireDailySetup(sport, day, version);
        expect(publication.publicSetup.question_count, sport + ":" + day).toBe(8);
        expect(publication.privateSetupEvidence.run, sport + ":" + day).toHaveLength(8);
        appearance[sport].push(millionaireDailyRunIndex(sport, day));
      }
    }
    expect(millionaireDailyRunIndex("ufc", "2026-10-25")).toBe(5);
    expect(millionaireDailyRunIndex("ufc", "2026-11-06")).toBe(6);
    expect(appearance.football).toHaveLength(27);
    expect(appearance.ufc).toHaveLength(13);
    expect(() => millionaireDailyRunIndex("football", "2026-10-25")).toThrow("not scheduled");
    expect(() => millionaireDailyRunIndex("ufc", "2026-10-30")).toThrow("not scheduled");
    expect(nbaRegularSeasonDaily("2027-04-12")).toBeNull();
  });

  it("accepts the historical weighted slots and the October 1 Average Fan rotation slots", () => {
    expect(() => buildMillionaireDailySetup(
      "football",
      "2026-09-24",
      "football-daily-v15-weighted-sep24",
    )).not.toThrow();
    expect(() => buildMillionaireDailySetup(
      "ufc",
      "2026-09-26",
      "play-rotation-v15-weighted-sep25",
    )).not.toThrow();
    expect(() => buildMillionaireDailySetup(
      "football",
      "2026-10-03",
      "football-daily-v18-average-fan-oct1",
    )).not.toThrow();
    expect(() => buildMillionaireDailySetup(
      "ufc",
      "2026-10-11",
      "play-rotation-v18-average-fan-oct1",
    )).not.toThrow();
  });

  it("keeps chronology questions from printing the sortable year into every answer choice", () => {
    for (let runIndex = 0; runIndex < 10; runIndex += 1) {
      for (const question of millionaireDailyRun("cfb", runIndex)) {
        if (!/most recently|earliest|latest/i.test(question.prompt)) continue;
        const everyChoicePrintsAYear = question.choices.every((choice) => /\b(?:19|20)\d{2}\b/.test(choice.text));
        expect(everyChoicePrintsAYear, question.prompt).toBe(false);
      }
    }
  });

  it("uses a real football-knowledge question for the October 3 Q4 slot", () => {
    const publication = buildMillionaireDailySetup(
      "football",
      "2026-10-03",
      "football-daily-v18-average-fan-oct1",
    );
    const run = publication.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
    expect(run[3]?.prompt).toBe(
      "Which program did Urban Meyer coach immediately before he became Florida's head coach?",
    );
    expect(run[3]?.choices.map((choice) => choice.text)).toEqual([
      "Utah",
      "Bowling Green",
      "Notre Dame",
      "Cincinnati",
    ]);
  });

  it("publishes two answers in each A/B/C/D slot", () => {
    for (const sport of ["ufc", "football"] as const) {
      const publication = buildMillionaireDailySetup(
        sport,
        "2026-09-19",
        sport === "ufc" ? "play-rotation-v9-millionaire-no-double" : "football-daily-v11-millionaire-no-double",
      );
      const run = publication.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
      expect(["A", "B", "C", "D"].map((id) => run.filter((question) => question.correctChoiceId === id).length))
        .toEqual([2, 2, 2, 2]);
    }
  });

  it("publishes a two-minute bank and caps legacy 2:30 launch state to two minutes", () => {
    const publication = buildMillionaireDailySetup(
      "ufc",
      "2026-09-19",
      "play-rotation-v9-millionaire-no-double",
    );
    expect(publication.publicSetup.time_bank_ms).toBe(120_000);
    expect((publication.publicSetup.initial_state as Record<string, unknown>).time_remaining_ms).toBe(120_000);

    const legacyContext = {
      ...contextFor("ufc"),
      publicState: {
        ...contextFor("ufc").publicState,
        time_remaining_ms: 150_000,
      },
    };
    const result = advanceMillionaireDailyRuntime(legacyContext, {
      type: "use_lifeline",
      lifeline: "stat-sheet",
      time_remaining_ms: 150_000,
    });
    expect(result.publicState.time_remaining_ms).toBe(120_000);
  });

  it("publishes eight public questions without leaking the answer key", () => {
    const publication = buildMillionaireDailySetup(
      "football",
      "2026-09-19",
      "football-daily-v11-millionaire-no-double",
    );
    const questions = publication.publicSetup.questions as Record<string, unknown>[];
    expect(questions).toHaveLength(8);
    expect(questions.map((question) => question.level)).toEqual([
      "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
    ]);
    expect(questions.every((question) => !("correctChoiceId" in question))).toBe(true);
    expect(publication.privateSetupEvidence.proof).toBeTruthy();
    expect(publication.privateGradingEvidence.proof).toBe(publication.privateSetupEvidence.proof);
  });

  it("banks 90 before Q8 and drops a clean Q8 miss to 85 while locking checkpoint money", () => {
    let walkContext = contextFor("football");
    for (let index = 0; index < 7; index += 1) {
      const question = privateRun(walkContext)[index]!;
      walkContext = advance(walkContext, {
        type: "answer",
        choice_id: question.correctChoiceId,
      }).context;
    }
    expect(walkContext.publicState.completed_questions).toBe(7);
    expect(walkContext.publicState.base_score).toBe(90);
    const walked = advance(walkContext, { type: "walk_away" }).result;
    expect(walked.complete).toBe(true);
    expect(walked.finalSubmission).toMatchObject({
      outcome: "walked-away",
      completed_questions: 7,
      first_miss_question: null,
      final_money: 500_000,
      base_score: 90,
    });

    let riskContext = contextFor("football");
    for (let index = 0; index < 7; index += 1) {
      const question = privateRun(riskContext)[index]!;
      riskContext = advance(riskContext, {
        type: "answer",
        choice_id: question.correctChoiceId,
      }).context;
    }
    const q8 = privateRun(riskContext)[7]!;
    const miss = q8.choices.find((choice) => choice.id !== q8.correctChoiceId)!;
    const lost = advance(riskContext, { type: "answer", choice_id: miss.id }).result;
    expect(lost.complete).toBe(true);
    expect(lost.finalSubmission).toMatchObject({
      outcome: "lost",
      completed_questions: 7,
      first_miss_question: 8,
      final_money: 100_000,
      base_score: 85,
    });
  });

  it("keeps an early bust playable, preserves lifelines, and scores the full board", () => {
    let context = contextFor("ufc");
    const q1 = privateRun(context)[0]!;
    const q1Miss = q1.choices.find((choice) => choice.id !== q1.correctChoiceId)!;
    const busted = advance(context, { type: "answer", choice_id: q1Miss.id });
    expect(busted.result.complete).toBe(false);
    expect(busted.result.publicState).toMatchObject({
      status: "playing",
      current_question_index: 1,
      completed_questions: 0,
      first_miss_question_index: 0,
      final_money: 0,
      base_score: 20,
      score: 20,
    });
    context = busted.context;

    const lifeline = advance(context, { type: "use_lifeline", lifeline: "stat-sheet" });
    expect(lifeline.result.complete).toBe(false);
    expect(lifeline.result.publicState.score).toBe(18);
    context = lifeline.context;

    for (let index = 1; index < 8; index += 1) {
      const question = privateRun(context)[index]!;
      const next = advance(context, {
        type: "answer",
        choice_id: question.correctChoiceId,
      });
      context = next.context;
      if (index < 7) expect(next.result.complete).toBe(false);
      else {
        expect(next.result.complete).toBe(true);
        expect(next.result.finalSubmission).toMatchObject({
          outcome: "lost",
          completed_questions: 7,
          first_miss_question: 1,
          final_money: 0,
          base_score: 55,
          lifelines_used: 1,
        });
      }
    }
  });

  it("keeps Stat Sheet private until the lifeline is used", () => {
    const context = contextFor("ufc");
    expect(JSON.stringify(context.publicSetup)).not.toContain("statSheet");
    const revealed = advance(context, {
      type: "use_lifeline",
      lifeline: "stat-sheet",
    }).result;
    expect((revealed.publicState.last_lifeline_reveal as Record<string, unknown>).type).toBe("stat-sheet");
    expect((revealed.publicState.last_lifeline_reveal as Record<string, unknown>).text).toBeTruthy();
  });
});
