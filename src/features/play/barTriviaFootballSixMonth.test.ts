import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { BAR_TRIVIA_EDITORIAL_RETIREMENTS } from "./barTriviaEditorialCuration";
import { FOOTBALL_BAR_TRIVIA_V2_LAST_CALL, FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS } from "./barTriviaFootballEditorialV2";
import { FOOTBALL_BAR_TRIVIA_V2_REWRITES } from "./barTriviaFootballRewritesV2";
import { FOOTBALL_BAR_TRIVIA_QUALITY_RETIREMENTS, FOOTBALL_BAR_TRIVIA_QUALITY_ROUND_OVERRIDES } from "./barTriviaFootballQuality20261029";
import { FOOTBALL_BAR_TRIVIA_QUALITY_NEW_QUESTIONS, FOOTBALL_BAR_TRIVIA_LAST_CALL_HEADROOM_20261029 } from "./barTriviaFootballNewFacts20261029";
import { footballTriviaConceptKey, footballTriviaFamilyMemberIds } from "./barTriviaFootballConcepts";
import { FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER, footballPublishedBarTriviaIdsBeforeDay } from "./barTriviaFootballPublishedHistory20261029";
import { buildBarTriviaDailySetup } from "./barTriviaDailyRuntime";
import { footballBarTriviaLeagueForDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import type { BarTriviaQuestion } from "../games/barTriviaEngine";

describe("Football Bar Trivia quality-first six-month bank", () => {
  it("requires claim-specific verified sources for all 55 rewrites before the v22 release", () => {
    for (const [id, rewrite] of Object.entries(FOOTBALL_BAR_TRIVIA_V2_REWRITES)) {
      expect(rewrite.sourceId, id).not.toContain("fact-check-pending");
      expect(rewrite.sourceUrl, id).toMatch(/^https:\/\//);
      expect(rewrite.verifiedAt, id).toMatch(/^2026-/);
    }
  });

  it("honors every v2 retirement and preserves correct four-choice grading for replacements", () => {
    const ids = new Set(BAR_TRIVIA_QUESTION_BANK.map((question) => question.id));
    for (const id of FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS) expect(ids.has(id), id).toBe(false);
    for (const id of Object.keys(FOOTBALL_BAR_TRIVIA_QUALITY_RETIREMENTS)) expect(ids.has(id), id).toBe(false);
    for (const id of Object.keys(BAR_TRIVIA_EDITORIAL_RETIREMENTS)) expect(ids.has(id), id).toBe(false);

    expect(FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS.size).toBe(72);
    expect(Object.keys(FOOTBALL_BAR_TRIVIA_V2_REWRITES)).toHaveLength(55);
    expect(FOOTBALL_BAR_TRIVIA_V2_LAST_CALL.filter((q) => q.league === "nfl")).toHaveLength(8);
    expect(FOOTBALL_BAR_TRIVIA_V2_LAST_CALL.filter((q) => q.league === "cfb")).toHaveLength(12);
    for (const question of FOOTBALL_BAR_TRIVIA_V2_LAST_CALL) {
      expect(question.sourceUrl, question.id).toMatch(/^https:\/\//);
      expect(question.verifiedAt, question.id).toBe("2026-10-24");
    }

    for (const league of ["nfl", "cfb"] as const) {
      const bank = BAR_TRIVIA_QUESTION_BANK.filter((question) => question.league === league);
      // Weekly dated news is supplemental; only the certified evergreen inventory is fixed.
      expect(bank.filter((question) => question.contentType === "evergreen"))
        .toHaveLength(league === "nfl" ? 148 : 155);
      const lastCall = bank.filter((question) => question.round === "last-call");
      // Four more source-verified football moments protect the real v22 selection seed.
      expect(lastCall.length).toBeGreaterThanOrEqual(12);
    }

    const requiredRetirements = [
      "nfl-r2-first-game-outside-na", // 2007 London: low-value first
      "nfl-r1-bills-mafia",           // answer telegraphed in stem
      "nfl-easy2-fleur-de-lis",       // stale logo filler
      "nfl-r3-league-founded-city",  // 1920 league organization: administration, not football
      "nfl-final-first-sb-kick-return-td", // dull Last Call first
      "cfb-easy2-spartans",           // nickname decodes the answer
    ];
    for (const id of requiredRetirements) expect(ids.has(id), id).toBe(false);
    for (const [id, round] of Object.entries(FOOTBALL_BAR_TRIVIA_QUALITY_ROUND_OVERRIDES)) {
      const question = BAR_TRIVIA_QUESTION_BANK.find((q) => q.id === id);
      expect(question, id).toBeDefined();
      expect(question?.round, id).toBe(round);
    }
    expect(FOOTBALL_BAR_TRIVIA_QUALITY_NEW_QUESTIONS).toHaveLength(4);
    for (const question of FOOTBALL_BAR_TRIVIA_QUALITY_NEW_QUESTIONS) {
      expect(question.sourceUrl, question.id).toMatch(/^https:\/\//);
      expect(question.verifiedAt, question.id).toBe("2026-10-29");
      expect(question.round, question.id).toBe("round3");
      expect(question.choices, question.id).toHaveLength(4);
      expect(new Set(question.choices).size, question.id).toBe(4);
      expect(question.choices, question.id).toContain(question.answer);
      expect(ids.has(question.id), question.id).toBe(true);
    }
    expect(FOOTBALL_BAR_TRIVIA_LAST_CALL_HEADROOM_20261029).toHaveLength(4);
    for (const question of FOOTBALL_BAR_TRIVIA_LAST_CALL_HEADROOM_20261029) {
      expect(question.round).toBe("last-call");
      expect(question.difficulty).toBe("last-call");
      expect(question.sourceUrl).toMatch(/^https:\/\//);
      expect(question.verifiedAt).toBe("2026-10-29");
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(ids.has(question.id), question.id).toBe(true);
    }
    const allPrompts = new Set<string>();
    for (const question of BAR_TRIVIA_QUESTION_BANK.filter((q) => q.league === "nfl" || q.league === "cfb")) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.factKey).toBe(footballTriviaConceptKey(question.id));
      const prompt = question.prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      expect(allPrompts.has(question.league + ":" + prompt), question.id).toBe(false);
      allPrompts.add(question.league + ":" + prompt);
    }
  });

  it("reconciles actual historical daily snapshots instead of trusting regenerated history", () => {
    expect(FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER).toHaveLength(5);
    for (const saved of FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER) {
      expect(saved.questionIds, saved.day).toHaveLength(10);
    }
    const londonAppearances = FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER.filter((saved) =>
      saved.questionIds.some((id) => id === "nfl-r2-first-game-outside-na"));
    expect(londonAppearances.map((saved) => saved.day)).toEqual(["2026-09-29", "2026-10-29"]);
    expect(footballPublishedBarTriviaIdsBeforeDay("nfl", "2026-10-30", 184))
      .toContain("nfl-r3-first-black-modern-hc");
    expect(footballPublishedBarTriviaIdsBeforeDay("nfl", "2027-05-05", 184))
      .not.toContain("nfl-r3-first-black-modern-hc");
  });

  it("relaunches October 29 with zero superseded published IDs and full difficulty pacing", () => {
    const oldIds = new Set<string>(FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER
      .filter((row) => row.league === "nfl")
      .flatMap((row) => [...row.questionIds]));
    expect(footballPublishedBarTriviaIdsBeforeDay("nfl", "2026-10-29", 184))
      .toContain("nfl-current-2026-w7-first-france-game");
    const fresh = buildBarTriviaDailySetup("nfl", "2026-10-29", "football-daily-v22-higher-lower-oct27");
    const questions = fresh.privateSetupEvidence.questions as BarTriviaQuestion[];
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => !oldIds.has(q.id))).toBe(true);
    expect(questions.map((q) => q.difficulty).sort()).toEqual(
      ["easy", "easy", "easy", "easy", "medium", "medium", "medium", "hard", "hard", "last-call"].sort(),
    );
    expect(new Set(questions.map((q) => q.factKey ?? q.id)).size).toBe(10);
  });

  it("produces unique question IDs AND fact families over the exact 182-day horizon", () => {
    const seen: Record<"nfl" | "cfb", Set<string>> = { nfl: new Set(), cfb: new Set() };
    const counts: Record<"nfl" | "cfb", number> = { nfl: 0, cfb: 0 };
    const seed = "football-bar-trivia-v3-six-month-contract";
    for (let offset = 0; offset < 182; offset++) {
      const date = new Date(Date.UTC(2026, 9, 25 + offset)).toISOString().slice(0, 10);
      if (lockedWeightedGameForDay("football", date) !== "bar_trivia") continue;
      const league = footballBarTriviaLeagueForDay(date);
      const setup = buildBarTriviaDailySetup(league, date, seed);
      const run = setup.privateSetupEvidence.questions as BarTriviaQuestion[];
      expect(run, date).toHaveLength(10);
      expect(new Set(run.map((q) => q.id)).size, date).toBe(10);
      expect(new Set(run.map((q) => q.factKey ?? q.id)).size, date).toBe(10);
      // This is content difficulty, not a change to the point/scoring ladder.
      const mix = {
        easy: run.filter((q) => q.difficulty === "easy").length,
        medium: run.filter((q) => q.difficulty === "medium").length,
        hard: run.filter((q) => q.difficulty === "hard").length,
        lastCall: run.filter((q) => q.difficulty === "last-call").length,
      };
      if (!run[0]?.id.startsWith("theme-cowboys-seahawks-2026-")) {
        expect(mix, date).toEqual({ easy: 4, medium: 3, hard: 2, lastCall: 1 });
        expect(run.filter((q) => /\bfirst\b/i.test(q.prompt)).length, date).toBeLessThanOrEqual(2);
        const isIdentity = (q: BarTriviaQuestion) => /^(fan culture|team names?|team identity|mascots?|nicknames?|school identity|cheers|logos|traditions|stadium culture)$/i.test(q.category);
        expect(run.filter(isIdentity).length, date).toBeLessThanOrEqual(3);
      }
      const actualHistory = new Set(
        footballPublishedBarTriviaIdsBeforeDay(league, date, 184)
          .flatMap(footballTriviaFamilyMemberIds)
      );
      for (const question of run) {
        expect(actualHistory.has(question.id), `${league} ${date}: repeated real published question/fact ${question.id}`).toBe(false);
        const key = question.factKey ?? question.id;
        expect(seen[league].has(key), league + " " + date + " repeated fact " + key).toBe(false);
        seen[league].add(key);
      }
      counts[league]++;
    }
    // The approved v22 28-slot calendar has 19 Football Bar Trivia appearances, alternating 10 NFL / 9 CFB.
    expect(counts).toEqual({ nfl: 10, cfb: 9 });
    expect(seen.nfl.size).toBe(100);
    expect(seen.cfb.size).toBe(90);
  });

  it("covers all 182 days under the actual Football v22 production schedule version", () => {
    const actualVersion = "football-daily-v22-higher-lower-oct27";
    const scheduled = { nfl: 0, cfb: 0 };
    for (let offset = 0; offset < 182; offset++) {
      const day = new Date(Date.UTC(2026, 9, 25 + offset)).toISOString().slice(0, 10);
      if (lockedWeightedGameForDay("football", day) !== "bar_trivia") continue;
      const league = footballBarTriviaLeagueForDay(day);
      const questions = buildBarTriviaDailySetup(league, day, actualVersion).privateSetupEvidence.questions as BarTriviaQuestion[];
      expect(questions, day).toHaveLength(10);
      expect(new Set(questions.map(q => q.factKey ?? q.id)).size, day).toBe(10);
      scheduled[league]++;
    }
    expect(scheduled).toEqual({ nfl: 10, cfb: 9 });
  });

  it("retains a dedicated, non-overlapping December Cowboys-Seahawks board", () => {
    const board = buildBarTriviaDailySetup("nfl", "2026-12-07", "football-bar-trivia-v3-six-month-contract");
    const questions = board.privateSetupEvidence.questions as BarTriviaQuestion[];
    expect(questions).toHaveLength(10);
    expect(questions.every((question) => question.id.startsWith("theme-cowboys-seahawks-2026-"))).toBe(true);
    expect(new Set(questions.map((question) => question.factKey ?? question.id)).size).toBe(10);
    // The themed run is intentionally modern and its late rounds emphasize
    // notable rivalry/game moments rather than pre-2000 specialist trivia.
    expect(questions.filter((question) => /2014|2016|2019|2020|2023/.test(question.prompt)).length)
      .toBeGreaterThanOrEqual(7);
    expect(questions.filter((question) => /Seattle|Seahawks/i.test(question.prompt)).length)
      .toBeGreaterThanOrEqual(3);
  });
});
