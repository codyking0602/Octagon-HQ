import { describe, expect, it } from "vitest";
import { lockedWeightedGameForDay, isUfcPublicationDay } from "./dailyChallengeRotation";
import { nbaRegularSeasonDaily } from "../nba/nbaDailySchedule";
import { buildFootballHigherLowerTwoGameDailyPublication } from "./footballHigherLowerDailyRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "./ufcHigherLowerDailyRuntime";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import {
  footballHigherLowerQuestionEvidence,
  footballHigherLowerSemanticPairKey,
  type FootballHigherLowerQuestion,
} from "../back-room/footballHigherLowerModel";
import { ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";

type Q = {
  id: string; league?: string; metricKey: string; answer: "higher" | "lower";
  known: { subjectId: string; name: string; value: number };
  hidden: { subjectId: string; name: string; value: number };
};
function questions(pub: { privateSetupEvidence: unknown }): Q[][] {
  const row = pub.privateSetupEvidence as {
    rounds: Array<{ private_setup_evidence: { board: { questions: Q[] } } }>;
  };
  expect(row.rounds).toHaveLength(2);
  return row.rounds.map(round => round.private_setup_evidence.board.questions);
}
function dates() {
  const result: Record<"football" | "ufc" | "nba", string[]> = {
    football: [], ufc: [], nba: [],
  };
  for (let offset = 0; offset < 182; offset++) {
    const day = new Date(Date.UTC(2026, 9, 25 + offset)).toISOString().slice(0, 10);
    if (lockedWeightedGameForDay("football", day) === "higher_lower") result.football.push(day);
    if (isUfcPublicationDay(day) && lockedWeightedGameForDay("ufc", day) === "higher_lower") result.ufc.push(day);
    const nba = nbaRegularSeasonDaily(day);
    if (nba?.isPublicationDay && nba.gameType === "higher_lower") result.nba.push(day);
  }
  return result;
}
function proveUfc(q: Q) {
  const metric = q.metricKey;
  const recount = (subjectId: string) => {
    const row = ufcFactualLedgerSubjects.find(x => x.id === subjectId);
    if (!row) throw new Error("No pinned UFC fighter source for " + subjectId);
    const fights = row.fights.filter(x => x.date <= "2026-08-18");
    const wins = fights.filter(x => x.result === "win");
    switch(metric) {
      case "bouts": return fights.length;
      case "wins": return wins.length;
      case "finishes": return wins.filter(x => x.methodCategory === "ko-tko" || x.methodCategory === "submission").length;
      case "ko": return wins.filter(x => x.methodCategory === "ko-tko").length;
      case "submissions": return wins.filter(x => x.methodCategory === "submission").length;
      case "title_wins": return wins.filter(x => x.titleFight && x.championshipEligible !== false && !/ultimate fighter|tournament/i.test(x.division)).length;
      default: throw new Error("Unknown UFC factual stat " + metric);
    }
  };
  expect(q.known.value).toBe(recount(q.known.subjectId));
  expect(q.hidden.value).toBe(recount(q.hidden.subjectId));
}
describe("actual v22 six-month, two-game Higher or Lower source certification", () => {
  it("generates all actual Football, UFC and NBA dates with two separate 10-comparison games, authoritative grading and no reversed matchup repetition", () => {
    const scheduled = dates();
    expect(scheduled.football).toHaveLength(12);
    expect(scheduled.ufc).toHaveLength(6);
    expect(scheduled.nba).toHaveLength(6);
    const prior: FootballHigherLowerQuestion[] = [];
    const seen: Record<"football" | "ufc" | "nba", Set<string>> = {
      football: new Set(), ufc: new Set(), nba: new Set(),
    };
    for (const sport of ["football", "ufc", "nba"] as const) {
      for (const day of scheduled[sport]) {
        const version = sport === "football" ? "football-daily-v22-higher-lower-2x-oct25"
          : sport === "ufc" ? "ufc-daily-v22-higher-lower-2x-oct25"
            : "nba-daily-regular-v2-locked";
        const publication = sport === "football"
          ? buildFootballHigherLowerTwoGameDailyPublication(day, version, prior)
          : sport === "ufc" ? buildUfcHigherLowerTwoGameDailyPublication(day, version)
            : buildNbaServerDailyPublication(day, version, "higher_lower");
        const boards = questions(publication);
        for (const board of boards) {
          expect(board).toHaveLength(10);
          if (sport === "football") {
            expect(board.filter(q => q.league === "NFL")).toHaveLength(5);
            expect(board.filter(q => q.league === "CFB")).toHaveLength(5);
          }
          for (const q of board) {
            expect(q.known.value).not.toBe(q.hidden.value);
            expect(q.answer).toBe(q.hidden.value > q.known.value ? "higher" : "lower");
            const id = sport === "football"
              ? footballHigherLowerSemanticPairKey(q.known.subjectId, q.hidden.subjectId)
              : sport === "ufc" ? [q.known.subjectId, q.hidden.subjectId].sort().join("|")
                : [q.known.name, q.hidden.name].sort().join("|");
            expect(seen[sport].has(id), sport+" reversed repeat "+id+" on "+day).toBe(false);
            seen[sport].add(id);
            if (sport === "football") {
              const evidence = footballHigherLowerQuestionEvidence(q as FootballHigherLowerQuestion);
              expect(evidence.known.sourceIds.length).toBeGreaterThan(0);
              expect(evidence.hidden.sourceIds.length).toBeGreaterThan(0);
            }
            if (sport === "ufc") proveUfc(q);
          }
        }
        if (sport === "football") prior.push(...boards.flat() as FootballHigherLowerQuestion[]);
      }
    }
    expect(seen.football.size).toBe(240);
    expect(seen.ufc.size).toBe(120);
    expect(seen.nba.size).toBe(120);
  }, 180_000);
});
