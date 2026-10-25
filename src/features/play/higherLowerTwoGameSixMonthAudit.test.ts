import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { OfficialDailyRuntimeContext, OfficialDailySetupPublication } from "./todaysChallengeRuntime";
import { advanceOfficialDailyRuntime } from "./todaysChallengeRuntime";
import { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";
import { advanceNbaOfficialDailyRuntime } from "../nba/nbaDailyServerAdvance";
import { buildFootballHigherLowerTwoGameDailyPublication } from "./footballHigherLowerDailyRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "./ufcHigherLowerDailyRuntime";
import { buildNbaServerDailyPublication, nbaDailyGameAppearance } from "../nba/nbaDailyServerPublication";
import { footballHigherLowerQuestionEvidence, footballHigherLowerSemanticPairKey, type FootballHigherLowerQuestion } from "../back-room/footballHigherLowerModel";
import { nbaHigherLowerSemanticPairKey } from "../nba/nbaHigherLowerModel";
import { createUfcHigherLowerOfficialBoard, UFC_HIGHER_LOWER_FIRST_SLOT, UFC_HIGHER_LOWER_RESERVED_SLOTS } from "./ufcHigherLowerModel";
import { dailyUsesTwoGameAverage } from "./dailyTwoGameContract";

type Comparison = {
  id: string; answer: "higher" | "lower"; metricKey: string; difficulty: string;
  league?: string; category: string;
  known: { subjectId: string; name: string; context: string; value: number; season?: number };
  hidden: { subjectId: string; name: string; context: string; value: number; season?: number };
};
type AuditSport = "football" | "ufc" | "nba";
const finalSchedule = "docs/audits/locked-three-sport-daily-calendar-20261025-20270424.csv";

function rows(publication: OfficialDailySetupPublication): Comparison[][] {
  const rounds = publication.privateSetupEvidence.rounds as Array<{
    private_setup_evidence: { board: { questions: Comparison[] } };
  }>;
  if (!Array.isArray(rounds) || rounds.length !== 2) throw new Error("Expected two private Daily boards.");
  return rounds.map(round => round.private_setup_evidence.board.questions);
}
function dayAt(index: number) {
  return new Date(Date.parse(UFC_HIGHER_LOWER_FIRST_SLOT + "T00:00:00Z") + 2 * index * 86_400_000)
    .toISOString().slice(0, 10);
}
function actualDates() {
  const lines = readFileSync(finalSchedule, "utf8").trim().split(/\r?\n/);
  const columns = lines[0]!.split(",");
  const dateIndex = columns.indexOf("central_day");
  const indexes = Object.fromEntries((["football", "ufc", "nba"] as const)
    .map(sport => [sport, columns.indexOf(sport + "_after")]));
  if (dateIndex < 0 || Object.values(indexes).some(n => n < 0)) throw new Error("Coordinated schedule CSV schema changed.");
  const results: Record<AuditSport, string[]> = { football: [], ufc: [], nba: [] };
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    for (const sport of ["football", "ufc", "nba"] as const) {
      if (cells[indexes[sport]] === "higher_lower") results[sport].push(cells[dateIndex]!);
    }
  }
  return results;
}
function validateBoard(sport: AuditSport, questions: Comparison[]) {
  expect(questions).toHaveLength(10);
  expect(new Set(questions.map(q => q.id)).size).toBe(10);
  for (const q of questions) {
    expect(q.known.value).not.toBe(q.hidden.value);
    expect(q.answer).toBe(q.hidden.value > q.known.value ? "higher" : "lower");
    expect(q.known.context.length).toBeGreaterThan(0);
    expect(q.hidden.context.length).toBeGreaterThan(0);
    expect(q.metricKey.length).toBeGreaterThan(0);
  }
  if (sport === "football") {
    expect(questions.filter(q => q.league === "NFL")).toHaveLength(5);
    expect(questions.filter(q => q.league === "CFB")).toHaveLength(5);
  }
}
function pairKey(sport: AuditSport, q: Comparison) {
  return sport === "football"
    ? footballHigherLowerSemanticPairKey(q.known.subjectId, q.hidden.subjectId)
    : sport === "nba"
      ? nbaHigherLowerSemanticPairKey(q.known.name, q.hidden.name)
      : [q.known.subjectId, q.hidden.subjectId].sort().join("|");
}
function assertUnique(sport: AuditSport, boards: Comparison[][], seen: Set<string>) {
  for (const board of boards) {
    validateBoard(sport, board);
    for (const q of board) {
      const key = pairKey(sport, q);
      expect(seen.has(key), sport + " repeated/reversed matchup: " + key).toBe(false);
      seen.add(key);
    }
  }
}
function context(publication: OfficialDailySetupPublication): OfficialDailyRuntimeContext {
  return {
    gameType: "higher_lower", setupKey: publication.setupKey,
    publicSetup: publication.publicSetup, revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {}, publicState: publication.publicSetup.initial_state as Record<string, unknown>,
  };
}
function runBothGames(
  publication: OfficialDailySetupPublication,
  advance: (ctx: OfficialDailyRuntimeContext, action: { choice: string }) => {
    submissionState: Record<string, unknown>;
    publicState: Record<string, unknown>;
    complete: boolean;
    finalSubmission: Record<string, unknown> | null;
  },
) {
  const boards = rows(publication);
  let state = context(publication);
  expect(state.publicState.round_index).toBe(0);
  const initial = ((state.publicState.active_round as Record<string, unknown>).current_question as Record<string, unknown>);
  expect(initial).not.toHaveProperty("answer");
  expect(initial.hidden).not.toHaveProperty("value");
  for (let i = 0; i < 20; i++) {
    const game = Math.floor(i / 10);
    const q = boards[game]![i % 10]!;
    // 8 correct in Game 1; six in Game 2.
    const shouldMiss = i % 10 >= (game === 0 ? 8 : 6);
    const choice = shouldMiss ? (q.answer === "higher" ? "lower" : "higher") : q.answer;
    const next = advance(state, { choice });
    expect(next.complete).toBe(i === 19);
    expect(next.finalSubmission === null).toBe(i !== 19);
    state = { ...state, submissionState: next.submissionState, publicState: next.publicState };
    // The authenticated backend can reload this exact JSON after a refresh.
    if (i === 4 || i === 11) state = JSON.parse(JSON.stringify(state)) as OfficialDailyRuntimeContext;
    if (i === 9) {
      expect(next.publicState.round_index).toBe(1);
      expect(next.publicState.round_scores).toEqual([80]);
      expect(next.publicState.complete).toBe(false);
      expect((next.publicState.active_round as Record<string, unknown>).index).toBe(0);
    }
  }
  expect(state.publicState.round_scores).toEqual([80, 60]);
  expect(state.publicState.score).toBe(70);
  expect((state.submissionState.final_submission as { rounds: unknown[] }).rounds).toHaveLength(2);
  expect(() => advance(state, { choice: "higher" })).toThrow();
}
const artifact: {
  lockedCalendar: string;
  scheduleVersion: string;
  activeDates: Record<AuditSport, string[]>;
  caveats: string[];
  records: Array<Record<string, unknown>>;
} = {
  lockedCalendar: finalSchedule, scheduleVersion: "nba-daily-regular-v2-locked",
  activeDates: { football: [], ufc: [], nba: [] },
  caveats: [
    "Football/UFC Higher or Lower are not scheduled in the currently merged canonical calendar.",
    "Football 14-date and UFC 7-date capacity probes are provisional, NOT a six-month calendar certification.",
    "NBA source identities reflect pinned app catalogs; independent external stat verification remains a release gate.",
  ],
  records: [],
};
function capture(sport: AuditSport, day: string, boards: Comparison[][], status: string) {
  for (const [game, board] of boards.entries()) {
    for (const [index, q] of board.entries()) {
      const evidence = sport === "football" ? footballHigherLowerQuestionEvidence(q as FootballHigherLowerQuestion) : null;
      artifact.records.push({
        sport, day, status, game: game + 1, comparison: index + 1,
        questionId: q.id, matchupKey: pairKey(sport, q), metricKey: q.metricKey,
        category: q.category, difficulty: q.difficulty, league: q.league ?? sport,
        known: q.known, hidden: q.hidden, answer: q.answer,
        sourceBinding: evidence ?? (sport === "nba"
          ? "nbaFindLeaderSubjects / nbaHigherLowerSupplement pinned app catalogs"
          : "ufcFactualLedgerSubjects; UFC-only fights through 2026-08-18"),
        gradingCorrect: q.answer === (q.hidden.value > q.known.value ? "higher" : "lower"),
      });
    }
  }
}

describe("Official Daily Higher or Lower two-game contract and content capacity", () => {
  it("activates only for future higher_lower dates, leaving historical and other types intact", () => {
    expect(dailyUsesTwoGameAverage("higher_lower", "2026-10-25")).toBe(false);
    expect(dailyUsesTwoGameAverage("higher_lower", "2026-10-26")).toBe(true);
    expect(dailyUsesTwoGameAverage("who_am_i", "2026-11-01")).toBe(false);
  });
  it("publishes two distinct, secure ten-comparison games and averages once", () => {
    const versions = [
      ["football", buildFootballHigherLowerTwoGameDailyPublication("2026-11-11", "hl-proof-v1"), advanceFootballOfficialDailyRuntime],
      ["ufc", buildUfcHigherLowerTwoGameDailyPublication("2026-11-02", "hl-proof-v1"), advanceOfficialDailyRuntime],
      ["nba", buildNbaServerDailyPublication("2026-11-19", "nba-daily-regular-v2-locked", "higher_lower"), advanceNbaOfficialDailyRuntime],
    ] as const;
    for (const [sport, publication, advance] of versions) {
      expect(publication.scoringVersion).toBe("daily-two-game-average-score-v1");
      expect((publication.publicSetup.rounds as unknown[])).toHaveLength(2);
      expect((publication.privateGradingEvidence.rounds as unknown[])).toHaveLength(2);
      assertUnique(sport, rows(publication), new Set());
      runBothGames(publication, advance);
    }
  }, 90_000);
  it("audits all actual NBA appearances in the merged 182-day coordinated calendar", () => {
    const dates = actualDates();
    artifact.activeDates = dates;
    expect(dates.nba).toEqual(["2026-11-19", "2026-12-17", "2027-01-14", "2027-02-11", "2027-03-11", "2027-04-08"]);
    expect(dates.football).toHaveLength(0);
    expect(dates.ufc).toHaveLength(0);
    const seen = new Set<string>();
    for (const day of dates.nba) {
      const publication = buildNbaServerDailyPublication(day, "nba-daily-regular-v2-locked", "higher_lower");
      expect(nbaDailyGameAppearance(day, "higher_lower")).toBeGreaterThanOrEqual(0);
      const boards = rows(publication);
      assertUnique("nba", boards, seen);
      capture("nba", day, boards, "actual canonical calendar");
      expect(buildNbaServerDailyPublication(day, "nba-daily-regular-v2-locked", "higher_lower")).toEqual(publication);
    }
    expect(seen.size).toBe(120);
  }, 180_000);
  it("probes fourteen Football two-game appearances without changing the rotation", () => {
    const first = Date.parse("2026-10-26T00:00:00Z");
    const dates = Array.from({ length: 14 }, (_, i) =>
      new Date(first + i * 13 * 86_400_000).toISOString().slice(0, 10));
    const prior: FootballHigherLowerQuestion[] = [];
    const seen = new Set<string>();
    for (const day of dates) {
      const pub = buildFootballHigherLowerTwoGameDailyPublication(day, "football-hl-two-game-provisional-v1", prior);
      const boards = rows(pub);
      assertUnique("football", boards, seen);
      for (const board of boards) {
        for (const q of board) {
          const evidence = footballHigherLowerQuestionEvidence(q as FootballHigherLowerQuestion);
          expect(evidence.known.sourceIds.length).toBeGreaterThan(0);
          expect(evidence.hidden.sourceIds.length).toBeGreaterThan(0);
        }
      }
      capture("football", day, boards, "provisional capacity probe; no actual scheduled slot");
      prior.push(...boards.flat() as FootballHigherLowerQuestion[]);
    }
    expect(seen.size).toBe(280);
  }, 180_000);
  it("probes UFC dual-board global reservations and validates zero reversed pairs", () => {
    const seen = new Set<string>();
    // All 100 published-date candidates consume two reserved boards each.
    for (let i = 0; i < UFC_HIGHER_LOWER_RESERVED_SLOTS; i++) {
      const boards = [createUfcHigherLowerOfficialBoard(dayAt(i), 0).questions,
        createUfcHigherLowerOfficialBoard(dayAt(i), 1).questions];
      assertUnique("ufc", boards, seen);
      if ([0, 13, 26, 39, 52, 65, 78].includes(i)) {
        capture("ufc", dayAt(i), boards, "provisional capacity probe; no actual scheduled slot");
      }
    }
    expect(seen.size).toBe(UFC_HIGHER_LOWER_RESERVED_SLOTS * 20);
  }, 180_000);
  it("writes a reproducible question-level report without implying a calendar activation", () => {
    if (process.env.OCTAGON_WRITE_HL_AUDIT === "1") {
      mkdirSync("artifacts", { recursive: true });
      writeFileSync("artifacts/higher-lower-two-game-six-month-audit.json", JSON.stringify({
        ...artifact, summary: {
          actualAppearances: Object.fromEntries(Object.entries(artifact.activeDates)
            .map(([sport, dates]) => [sport, dates.length])),
          actualRequiredBoards: Object.fromEntries(Object.entries(artifact.activeDates)
            .map(([sport, dates]) => [sport, dates.length * 2])),
          capturedComparisons: artifact.records.length,
          canonicalRotationReadyForAllSports: false,
        },
      }, null, 2) + "\n");
    }
    expect(artifact.records.length).toBeGreaterThanOrEqual(120);
  });
});
