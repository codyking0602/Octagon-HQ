import { describe, expect, it } from "vitest";
import { DAILY_TWO_GAME_FORMAT_VERSION, dailyUsesTwoGameAverage } from "./dailyTwoGameContract";
import { buildFootballHigherLowerTwoGameDailyPublication, buildFootballHigherLowerDailyPublication } from "./footballHigherLowerDailyRuntime";
import { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";
import { buildOfficialDailySetup, advanceOfficialDailyRuntime } from "./todaysChallengeRuntime";
import { buildNbaHigherLowerTwoGameDailyPublication } from "../nba/nbaHigherLowerDailyPublication";
import { advanceNbaOfficialDailyRuntime } from "../nba/nbaDailyServerAdvance";
import { createNbaHigherLowerBoard, nbaHigherLowerMatchupKey } from "../nba/nbaHigherLowerModel";
import type { OfficialDailyRuntimeContext, OfficialDailySetupPublication, OfficialDailyAdvanceResult } from "./todaysChallengeRuntime";

type RecordValue = Record<string, unknown>;
function obj(value: unknown): RecordValue { return value as RecordValue; }
function list(value: unknown): RecordValue[] { return value as RecordValue[]; }
function context(setup: OfficialDailySetupPublication): OfficialDailyRuntimeContext {
  return { gameType:"higher_lower", setupKey:setup.setupKey, publicSetup:setup.publicSetup,
    revealSetup:setup.revealSetup, privateSetupEvidence:setup.privateSetupEvidence,
    privateGradingEvidence:setup.privateGradingEvidence, submissionState:{},
    publicState:obj(setup.publicSetup.initial_state) };
}
function boards(setup: OfficialDailySetupPublication) {
  const rounds = list(setup.privateSetupEvidence.rounds);
  return rounds.map(round => obj(obj(round.private_setup_evidence).board));
}
function play(setup: OfficialDailySetupPublication,
  advance:(context:OfficialDailyRuntimeContext,action:unknown)=>OfficialDailyAdvanceResult) {
  let current=context(setup);
  const games=boards(setup);
  const firstQuestions=list(games[0]!.questions);
  const secondQuestions=list(games[1]!.questions);
  for(const [gameIndex,questions] of [firstQuestions,secondQuestions].entries()) {
    for(const [position,q] of questions.entries()) {
      const next=advance(current,{choice:q.answer});
      if(gameIndex===0 && position===9) {
        expect(next.complete).toBe(false);
        expect(next.finalSubmission).toBeNull();
        expect(next.publicState.round_index).toBe(1);
        expect(next.publicState.round_scores).toEqual([100]);
        expect(obj(next.publicState.active_round).index).toBe(0);
      }
      if(gameIndex===1 && position===9) {
        expect(next.complete).toBe(true);
        expect(next.publicState.round_scores).toEqual([100,100]);
        expect(next.publicState.score).toBe(100);
        expect(list(obj(next.finalSubmission).rounds)).toHaveLength(2);
      } else expect(next.complete).toBe(false);
      current={...current,submissionState:next.submissionState,publicState:next.publicState};
    }
  }
  expect(() => advance(current,{choice:"higher"})).toThrow();
}
describe("Official Higher or Lower two-game shared standard",()=>{
  it("preserves historical singles, cuts over future only, and isolates Casual",()=>{
    expect(dailyUsesTwoGameAverage("higher_lower","2026-10-25")).toBe(false);
    expect(dailyUsesTwoGameAverage("higher_lower","2026-10-26")).toBe(true);
    expect(dailyUsesTwoGameAverage("millionaire","2026-11-11")).toBe(false);
    expect(buildFootballHigherLowerDailyPublication("2026-10-25","legacy").publicSetup.format_version).toBeUndefined();
    expect(createNbaHigherLowerBoard("casual-isolation")).toEqual(createNbaHigherLowerBoard("casual-isolation",new Set()));
  });
  it("Football: two 5-NFL/5-CFB boards, zero pair reversals, locked only after 20 answers",()=>{
    const setup=buildFootballHigherLowerTwoGameDailyPublication("2026-11-11","football-two-game-test");
    expect(setup.publicSetup.format_version).toBe(DAILY_TWO_GAME_FORMAT_VERSION);
    const [one,two]=boards(setup);
    expect([one,two].every(board=>list(board.questions).length===10)).toBe(true);
    for(const board of [one,two]) {
      expect(list(board.questions).filter(q=>q.league==="NFL")).toHaveLength(5);
      expect(list(board.questions).filter(q=>q.league==="CFB")).toHaveLength(5);
    }
    const first=new Set(list(one.questions).map(q=>[...[
      obj(q.known).subjectId,obj(q.hidden).subjectId].map(String).sort()].join("|")));
    expect(list(two.questions).every(q=>!first.has([obj(q.known).subjectId,obj(q.hidden).subjectId].map(String).sort().join("|")))).toBe(true);
    play(setup,advanceFootballOfficialDailyRuntime);
  },120_000);
  it("UFC: factual pinned ledger builds distinct pairs and server advances both games",()=>{
    const setup=buildOfficialDailySetup("higher_lower","2026-11-02","ufc-two-game-test");
    expect(setup.publicSetup.format_version).toBe(DAILY_TWO_GAME_FORMAT_VERSION);
    const [one,two]=boards(setup);
    const ids=new Set<string>();
    for(const board of [one,two]) for(const question of list(board.questions)){
      const key=[obj(question.known).subjectId,obj(question.hidden).subjectId].map(String).sort().join("|");
      expect(ids.has(key)).toBe(false);
      ids.add(key);
      expect(question.answer).toBe(Number(obj(question.hidden).value)>Number(obj(question.known).value)?"higher":"lower");
    }
    play(setup,advanceOfficialDailyRuntime);
  },180_000);
  it("NBA: canonical appearance produces two different server-owned games",()=>{
    const setup=buildNbaHigherLowerTwoGameDailyPublication("2026-11-19","nba-daily-regular-v1",0);
    expect(setup.publicSetup.format_version).toBe(DAILY_TWO_GAME_FORMAT_VERSION);
    const [one,two]=boards(setup);
    const keys=[...list(one.questions),...list(two.questions)].map(q=>nbaHigherLowerMatchupKey(q as never));
    expect(new Set(keys).size).toBe(20);
    play(setup,advanceNbaOfficialDailyRuntime);
  },180_000);
});
