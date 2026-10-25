import { describe, expect, it } from "vitest";
import {
  FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE,
  UFC_TWO_GAME_HIGHER_LOWER_CYCLE,
  footballBarTriviaLeagueForDay,
  isUfcPublicationDay,
  lockedWeightedGameForDay,
} from "./dailyChallengeRotation";
import { nbaRegularSeasonDaily } from "../nba/nbaDailySchedule";
import { footballTodayScheduleVersionForDay } from "./footballTodayChallengeSession";
const add = (n: number) => new Date(Date.UTC(2026, 9, 25+n)).toISOString().slice(0,10);
const tally = (rows: readonly string[], game: string) => rows.filter(x=>x===game).length;
describe("future v22 two-game Higher or Lower coordinated Daily schedule", () => {
  it("preserves real 4x/3x/2x ratios and two balanced 28-day Football halves", () => {
    expect(FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE).toHaveLength(56);
    expect(UFC_TWO_GAME_HIGHER_LOWER_CYCLE).toHaveLength(30);
    for (const half of [FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE.slice(0,28),FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE.slice(28)]) {
      for (const game of ["average_fan","sports_feud","millionaire"]) expect(tally(half,game)).toBe(4);
      for (const game of ["who_am_i","find_leader","wavelength","bar_trivia"]) expect(tally(half,game)).toBe(3);
      for (const game of ["hit_the_number","higher_lower"]) expect(tally(half,game)).toBe(2);
    }
    for (const game of ["average_fan","sports_feud","millionaire"]) expect(tally(UFC_TWO_GAME_HIGHER_LOWER_CYCLE,game)).toBe(4);
    for (const game of ["who_am_i","find_leader","wavelength","bar_trivia"]) expect(tally(UFC_TWO_GAME_HIGHER_LOWER_CYCLE,game)).toBe(3);
    for (const game of ["hit_the_number","higher_lower","blind_resume"]) expect(tally(UFC_TWO_GAME_HIGHER_LOWER_CYCLE,game)).toBe(2);
  });
  it("preserves previously published boards, league alternation, and promised Football themes", () => {
    expect(lockedWeightedGameForDay("football","2026-10-25")).toBe("hit_the_number");
    expect(lockedWeightedGameForDay("football","2026-10-26")).toBe("millionaire");
    expect(lockedWeightedGameForDay("ufc","2026-10-25")).toBe("millionaire");
    expect(lockedWeightedGameForDay("ufc","2026-10-27")).toBe("sports_feud");
    expect(lockedWeightedGameForDay("football","2026-11-27")).toBe("sports_feud");
    expect(lockedWeightedGameForDay("football","2026-12-07")).toBe("bar_trivia");
    expect(footballBarTriviaLeagueForDay("2026-10-31")).toBe("nfl");
    expect(footballBarTriviaLeagueForDay("2026-11-09")).toBe("cfb");
    expect(footballTodayScheduleVersionForDay("2026-10-26")).toBe("football-daily-v21-locked-oct25");
    expect(footballTodayScheduleVersionForDay("2026-10-27")).toBe("football-daily-v22-higher-lower-2x-oct25");
  });
  it("has exact six-month cadence, no same-game cross-sport collisions, balanced game spacing", () => {
    const dates=Array.from({length:182},(_,i)=>add(i));
    let f=0,u=0,n=0;
    const bySport={football:new Map<string,number[]>(),ufc:new Map<string,number[]>(),nba:new Map<string,number[]>()};
    for(let i=0;i<dates.length;i++) {
      const day=dates[i]!;
      const fg=lockedWeightedGameForDay("football",day);f++;
      const ug=isUfcPublicationDay(day)?lockedWeightedGameForDay("ufc",day):null;if(ug)u++;
      const nb=nbaRegularSeasonDaily(day);const ng=nb?.isPublicationDay?nb.gameType:null;if(ng)n++;
      expect(fg).not.toBe(ug);expect(fg).not.toBe(ng);expect(ug===ng&&ug!==null).toBe(false);
      for(const [sport,game] of [["football",fg],["ufc",ug],["nba",ng]] as const){if(!game)continue;const records=bySport[sport].get(game)??[];records.push(i);bySport[sport].set(game,records);}
    }
    expect([f,u,n]).toEqual([182,91,81]);
    expect(bySport.football.get("higher_lower")?.length).toBe(12);
    expect(bySport.ufc.get("higher_lower")?.length).toBe(6);
    expect(bySport.nba.get("higher_lower")?.length).toBe(6);
    for (const [sport,rows] of Object.entries(bySport)) for(const [game,days] of rows){
      for(let k=1;k<days.length;k++){
        const interval=days[k]!-days[k-1]!;
        expect(interval, sport+":"+game).toBeGreaterThanOrEqual(sport==="football"?4:6);
        expect(interval, sport+":"+game).toBeLessThanOrEqual(sport==="football"?20:38);
      }
    }
  });
});
