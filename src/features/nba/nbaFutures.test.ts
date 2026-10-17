import { describe,expect,it } from "vitest";
import { NBA_TEAMS,NBA_FUTURES_MAX,NBA_FUTURES_SELECTIONS,NBA_CHAMPIONSHIP_WEIGHTS,
  emptyNbaFutures,validateNbaFutures,isNbaFuturesComplete,scoreNbaFutures } from "./nbaFutures";
describe("2026 NBA futures immutable contract",()=>{
  it("has 30 unique teams and authentic half-win lines",()=>{
    expect(NBA_TEAMS).toHaveLength(30);
    expect(new Set(NBA_TEAMS.map(t=>t.id)).size).toBe(30);
    expect(NBA_TEAMS.filter(t=>t.conference==="East")).toHaveLength(15);
    expect(NBA_TEAMS.filter(t=>t.conference==="West")).toHaveLength(15);
    expect(NBA_TEAMS.every(t=>Number.isInteger(t.line-.5))).toBe(true);
  });
  it("has the approved season weights and 100 Futures points",()=>{
    expect(NBA_CHAMPIONSHIP_WEIGHTS).toEqual({futures:15,cup:10,playoffs:55,games:20});
    expect(NBA_FUTURES_MAX).toBe(100);
    expect(NBA_FUTURES_SELECTIONS).toBe(60);
  });
  it("rejects bracket contradictions and cross-conference overflow",()=>{
    const p=emptyNbaFutures();p.conferenceFinalists=["DAL"];
    expect(validateNbaFutures(p)).not.toHaveLength(0);
    p.conferenceFinalists=[];p.playoffTeams=NBA_TEAMS.filter(t=>t.conference==="East").slice(0,9).map(t=>t.id);
    expect(validateNbaFutures(p)).not.toHaveLength(0);
  });
  it("does not award points for unresolved facts",()=>{
    const p=emptyNbaFutures();p.winTotals.OKC="over";
    expect(scoreNbaFutures(p,{})).toMatchObject({earned:0,settledMax:0});
    expect(scoreNbaFutures(p,{regularWins:{OKC:63}})).toMatchObject({earned:1,settledMax:30});
    expect(isNbaFuturesComplete(p)).toBe(false);
  });
});
