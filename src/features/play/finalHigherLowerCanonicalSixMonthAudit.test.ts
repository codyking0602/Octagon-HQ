import { describe, expect, it } from "vitest";
import { lockedWeightedGameForDay, isUfcPublicationDay } from "./dailyChallengeRotation";
import { nbaRegularSeasonDaily } from "../nba/nbaDailySchedule";
import { buildFootballHigherLowerTwoGameDailyPublication } from "./footballHigherLowerDailyRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "./ufcHigherLowerDailyRuntime";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import { footballHigherLowerQuestionEvidence, footballHigherLowerSemanticPairKey, type FootballHigherLowerQuestion } from "../back-room/footballHigherLowerModel";
import { nbaHigherLowerSemanticPairKey } from "../nba/nbaHigherLowerModel";
import { ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";
import type { OfficialDailySetupPublication } from "./todaysChallengeRuntime";

type Sport = "football" | "ufc" | "nba";
type Question = {
  id: string;
  league?: string;
  metricKey: string;
  answer: "higher" | "lower";
  known: { subjectId: string; name: string; value: number; context: string };
  hidden: { subjectId: string; name: string; value: number; context: string };
};
type Publication = OfficialDailySetupPublication;
const day = (index: number) => new Date(Date.UTC(2026, 9, 25 + index)).toISOString().slice(0, 10);
const footVersion = "football-daily-v22-higher-lower-2x-oct25";
const ufcVersion = "ufc-daily-v22-higher-lower-2x-oct25";
const nbaVersion = "nba-daily-regular-v2-locked";

function actualHigherLowerDates(): Record<Sport, string[]> {
  const dates: Record<Sport, string[]> = { football: [], ufc: [], nba: [] };
  for (let i = 0; i < 182; i++) {
    const date = day(i);
    if (lockedWeightedGameForDay("football", date) === "higher_lower") dates.football.push(date);
    if (isUfcPublicationDay(date) && lockedWeightedGameForDay("ufc", date) === "higher_lower") dates.ufc.push(date);
    const nba = nbaRegularSeasonDaily(date);
    if (nba?.isPublicationDay && nba.gameType === "higher_lower") dates.nba.push(date);
  }
  return dates;
}

function boards(publication: Publication): Question[][] {
  const rounds = (publication.privateSetupEvidence as {
    rounds: { private_setup_evidence: { board: { questions: Question[] } } }[];
  }).rounds;
  expect(rounds).toHaveLength(2);
  return rounds.map(r => r.private_setup_evidence.board.questions);
}
function matchup(sport: Sport, q: Question) {
  return sport === "football"
    ? footballHigherLowerSemanticPairKey(q.known.subjectId, q.hidden.subjectId)
    : sport === "nba"
      ? nbaHigherLowerSemanticPairKey(q.known.name, q.hidden.name)
      : [q.known.subjectId, q.hidden.subjectId].sort().join("|");
}
function validate(sport: Sport, publication: Publication, date: string, seen: Set<string>) {
  expect(publication.scoringVersion, sport + " " + date).toBe("daily-two-game-average-score-v1");
  expect((publication.publicSetup.rounds as unknown[])).toHaveLength(2);
  const all = boards(publication);
  for (const [game, questions] of all.entries()) {
    expect(questions, sport + " " + date + " game " + (game + 1)).toHaveLength(10);
    expect(new Set(questions.map(q => q.id)).size).toBe(10);
    if (sport === "football") {
      expect(questions.filter(q => q.league === "NFL")).toHaveLength(5);
      expect(questions.filter(q => q.league === "CFB")).toHaveLength(5);
    }
    for (const q of questions) {
      const key = matchup(sport, q);
      expect(seen.has(key), sport + " " + date + ": repeated/reversed matchup " + key).toBe(false);
      seen.add(key);
      expect(q.known.value).not.toBe(q.hidden.value);
      expect(q.answer).toBe(q.hidden.value > q.known.value ? "higher" : "lower");
      expect(q.known.context.length).toBeGreaterThan(0);
      expect(q.hidden.context.length).toBeGreaterThan(0);
      if (sport === "football") {
        const evidence = footballHigherLowerQuestionEvidence(q as FootballHigherLowerQuestion);
        expect(evidence.known.sourceIds.length).toBeGreaterThan(0);
        expect(evidence.hidden.sourceIds.length).toBeGreaterThan(0);
      } else if (sport === "ufc") {
        for (const entity of [q.known, q.hidden]) {
          const subject = ufcFactualLedgerSubjects.find(s => s.id === entity.subjectId);
          expect(subject, "Missing pinned UFC subject " + entity.subjectId).toBeDefined();
          const fights = subject!.fights.filter(f => f.date <= "2026-08-18");
          const wins = fights.filter(f => f.result === "win");
          const value = q.metricKey === "bouts" ? fights.length
            : q.metricKey === "wins" ? wins.length
            : q.metricKey === "finishes" ? wins.filter(f => ["ko-tko", "submission"].includes(f.methodCategory)).length
            : q.metricKey === "ko" ? wins.filter(f => f.methodCategory === "ko-tko").length
            : q.metricKey === "submissions" ? wins.filter(f => f.methodCategory === "submission").length
            : q.metricKey === "title_wins" ? wins.filter(f =>
              f.titleFight && f.championshipEligible !== false && !/ultimate fighter|tournament/i.test(f.division)).length
            : Number.NaN;
          expect(value, "Source recount for " + entity.subjectId + " " + q.metricKey).toBe(entity.value);
        }
      }
    }
  }
  const initial = (publication.publicSetup.initial_state as Record<string, unknown>);
  const live = ((initial.active_round as Record<string, unknown>).current_question as Record<string, unknown>);
  expect(live).not.toHaveProperty("answer");
  expect((live.hidden as Record<string, unknown>)).not.toHaveProperty("value");
  return all;
}

describe("Actual future v22 Higher or Lower calendar -- fail-closed release gate", () => {
  it("uses final canonical schedule dates rather than v21 CSV or arbitrary capacity dates", () => {
    const dates = actualHigherLowerDates();
    expect(dates.football).toHaveLength(12);
    expect(dates.ufc).toHaveLength(6);
    expect(dates.nba).toEqual([
      "2026-11-19", "2026-12-17", "2027-01-14",
      "2027-02-11", "2027-03-11", "2027-04-08",
    ]);
    expect(dates.football.every(d => d >= "2026-10-27")).toBe(true);
    expect(dates.ufc.every(d => d >= "2026-10-29")).toBe(true);
  });

  it("actually generates and verifies every future comparison and source binding without reverse pairs", () => {
    const dates = actualHigherLowerDates();
    const previousFootball: FootballHigherLowerQuestion[] = [];
    const totals: Record<Sport, number> = { football: 0, ufc: 0, nba: 0 };
    for (const sport of ["football", "ufc", "nba"] as const) {
      const seen = new Set<string>();
      for (const date of dates[sport]) {
        const publication = sport === "football"
          ? buildFootballHigherLowerTwoGameDailyPublication(date, footVersion, previousFootball)
          : sport === "ufc"
            ? buildUfcHigherLowerTwoGameDailyPublication(date, ufcVersion)
            : buildNbaServerDailyPublication(date, nbaVersion, "higher_lower");
        const current = validate(sport, publication, date, seen);
        totals[sport] += current.flat().length;
        if (sport === "football") previousFootball.push(...current.flat() as FootballHigherLowerQuestion[]);
      }
      expect(seen.size).toBe(dates[sport].length * 20);
    }
    expect(totals).toEqual({ football: 240, ufc: 120, nba: 120 });
  }, 180_000);
});
