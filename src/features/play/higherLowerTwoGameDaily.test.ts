import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFootballHigherLowerTwoGameDailyPublication, buildFootballHigherLowerDailyPublication } from "./footballHigherLowerDailyRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "./ufcHigherLowerDailyRuntime";
import { buildNbaHigherLowerTwoGameDailyPublication, buildNbaHigherLowerDailyPublication } from "../nba/nbaHigherLowerDailyPublication";
import { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";
import { advanceOfficialDailyRuntime, type OfficialDailyRuntimeContext, type OfficialDailySetupPublication } from "./todaysChallengeRuntime";
import { advanceNbaOfficialDailyRuntime } from "../nba/nbaDailyServerAdvance";
import { dailyUsesTwoGameAverage } from "./dailyTwoGameContract";

type Question = { answer: "higher" | "lower"; league?: string; known: { subjectId: string }; hidden: { subjectId: string }; metricKey: string };
const record = (raw: unknown) => raw as Record<string, unknown>;
const questions = (raw: Record<string, unknown>) =>
  (record(raw.board).questions as Question[]);
const children = (setup: OfficialDailySetupPublication) =>
  (setup.privateSetupEvidence.rounds as Array<Record<string, unknown>>)
    .map(child => questions(record(child.private_setup_evidence)));
const pair = (q: Question) => [q.known.subjectId, q.hidden.subjectId].sort().join("|");

function contextFor(setup: OfficialDailySetupPublication): OfficialDailyRuntimeContext {
  return {
    gameType: "higher_lower",
    setupKey: setup.setupKey, publicSetup: setup.publicSetup, revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence, privateGradingEvidence: setup.privateGradingEvidence,
    publicState: record(setup.publicSetup.initial_state), submissionState: {},
  };
}

function play(
  setup: OfficialDailySetupPublication,
  advance: (context: OfficialDailyRuntimeContext, action: {choice: string}) => {
    complete: boolean; finalSubmission: Record<string, unknown> | null;
    publicState: Record<string, unknown>; submissionState: Record<string, unknown>;
  },
) {
  const boards = children(setup);
  let context = contextFor(setup);
  for (let game = 0; game < 2; game++) {
    for (let index = 0; index < 10; index++) {
      const correct = boards[game]![index]!.answer;
      const miss = index < (game === 0 ? 2 : 4);
      const choice = miss ? correct === "higher" ? "lower" : "higher" : correct;
      const update = advance(context, { choice });
      context = { ...context, submissionState: update.submissionState, publicState: update.publicState };
      if (game === 0) {
        expect(update.complete).toBe(false);
        expect(update.finalSubmission).toBeNull();
      } else if (index < 9) expect(update.complete).toBe(false);
    }
    // Simulate refresh/server reload between games; saved progress must survive.
    context = JSON.parse(JSON.stringify(context)) as OfficialDailyRuntimeContext;
    if (game === 0) {
      expect(context.publicState.round_index).toBe(1);
      expect(context.publicState.round_scores).toEqual([80]);
      expect(context.publicState.complete).toBe(false);
      expect(record(context.submissionState).final_submission).toBeNull();
    }
  }
  expect(context.publicState.round_scores).toEqual([80, 60]);
  expect(context.publicState.score).toBe(70);
  expect(context.publicState.complete).toBe(true);
  expect(record(context.submissionState.final_submission).rounds).toHaveLength(2);
}

describe("future Official Daily Higher or Lower two-game standard", () => {
  it("keeps historical single-board identities and Casual isolated", () => {
    expect(dailyUsesTwoGameAverage("higher_lower", "2026-10-25")).toBe(false);
    expect(dailyUsesTwoGameAverage("higher_lower", "2026-10-26")).toBe(true);
    const legacy = buildFootballHigherLowerDailyPublication("2026-10-25", "legacy-hl");
    expect(legacy.publicSetup.format_version).toBeUndefined();
    expect(legacy.publicSetup.question_count).toBe(10);
    const nbaLegacy = buildNbaHigherLowerDailyPublication("2026-10-25", "legacy-nba", 0);
    expect(nbaLegacy.publicSetup.format_version).toBeUndefined();
  });

  it("publishes two different Football 5-NFL/5-CFB boards and completes only after game two", () => {
    const setup = buildFootballHigherLowerTwoGameDailyPublication("2026-11-11", "football-hl-two-game-audit");
    const boards = children(setup);
    expect(boards.map(board => board.length)).toEqual([10,10]);
    for (const board of boards) {
      expect(board.filter(q => q.league === "NFL")).toHaveLength(5);
      expect(board.filter(q => q.league === "CFB")).toHaveLength(5);
    }
    const matchups = boards.flat().map(pair);
    expect(new Set(matchups).size).toBe(20);
    expect(buildFootballHigherLowerTwoGameDailyPublication("2026-11-11", "football-hl-two-game-audit")).toEqual(setup);
    play(setup, advanceFootballOfficialDailyRuntime);
  }, 180_000);

  it("publishes two UFC pinned-ledger boards without reversed fighter pair repetition", () => {
    const setup = buildUfcHigherLowerTwoGameDailyPublication("2026-11-02", "ufc-hl-two-game-audit");
    const boards = children(setup);
    expect(boards.map(board => board.length)).toEqual([10, 10]);
    expect(new Set(boards.flat().map(pair)).size).toBe(20);
    play(setup, advanceOfficialDailyRuntime);
  }, 180_000);

  it("publishes two NBA boards with distinct matchups and one averaged score", () => {
    const setup = buildNbaHigherLowerTwoGameDailyPublication("2026-11-19", "nba-hl-two-game-audit", 1);
    const boards = children(setup);
    expect(boards.map(board => board.length)).toEqual([10,10]);
    expect(new Set(boards.flat().map(pair)).size).toBe(20);
    play(setup, advanceNbaOfficialDailyRuntime);
  }, 180_000);

  it("retains protected authoritative SQL grader and spoiler-gated two-board drilldowns", () => {
    const sql = readFileSync("supabase/migrations/202612310407_higher_lower_two_game_official.sql", "utf8");
    expect(sql).toContain("private.grade_nba_higher_lower_daily(");
    expect(sql).toContain("'higher_lower'");
    expect(sql).toContain("'reveal_rounds'");
    expect(sql).toContain("v_average := round(");
    expect(sql).toContain("jsonb_array_length(v_submissions) <> 2");
  });
});
