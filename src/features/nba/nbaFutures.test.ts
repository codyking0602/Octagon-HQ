import { describe,expect,it } from "vitest";
import { readFileSync } from "node:fs";
import { NBA_TEAMS,NBA_FUTURES_MAX,NBA_FUTURES_POINTS,NBA_FUTURES_SELECTIONS,NBA_CHAMPIONSHIP_WEIGHTS,
  emptyNbaFutures,nbaFuturesProgress,validateNbaFutures,isNbaFuturesComplete,scoreNbaFutures,
  NBA_FUTURES_LOCK_AT } from "./nbaFutures";
describe("2026 NBA futures immutable contract",()=>{
  it("has 30 unique teams and authentic half-win lines",()=>{
    expect(NBA_TEAMS).toHaveLength(30);
    expect(new Set(NBA_TEAMS.map(t=>t.id)).size).toBe(30);
    expect(NBA_TEAMS.filter(t=>t.conference==="East")).toHaveLength(15);
    expect(NBA_TEAMS.filter(t=>t.conference==="West")).toHaveLength(15);
    expect(NBA_TEAMS.every(t=>Number.isInteger(t.line-.5))).toBe(true);
  });
  it("keeps all 30 front-end lines identical to the immutable SQL migration",()=>{
    const sql=readFileSync("supabase/migrations/202612310304_nba_futures_2026.sql","utf8");
    const lines=[...sql.matchAll(/\(2026,'([A-Z]{3})','([^']+)','(East|West)',(\d+\.5),'BetMGM 2026-10-13'\)/g)];
    expect(lines).toHaveLength(30);
    for(const [,id,name,conference,value] of lines){
      expect(NBA_TEAMS.find(t=>t.id===id)).toMatchObject({id,name,conference,line:Number(value)});
    }
  });
  it("displays the scheduled date but never auto-locks the form in the browser",()=>{
    expect(NBA_FUTURES_LOCK_AT).toBe("2026-10-20T19:00:00Z");
    const page=readFileSync("src/features/nba/NbaFuturesPage.tsx","utf8");
    expect(page).toContain("const locked=snapshot?.locked??false;");
    expect(page).not.toContain("Date.now()>=Date.parse(NBA_FUTURES_LOCK_AT)");
    expect(page).toContain("Scheduled lock:");
  });
  it("has the approved season weights and 100 Futures points",()=>{
    expect(NBA_CHAMPIONSHIP_WEIGHTS).toEqual({futures:15,cup:10,playoffs:55,games:20});
    expect(NBA_FUTURES_MAX).toBe(100);
    expect(NBA_FUTURES_SELECTIONS).toBe(55);
  });
  it("weights marquee postseason picks rather than Cup or minor awards",()=>{
    expect(NBA_FUTURES_MAX).toBe(100);
    expect(NBA_FUTURES_POINTS).toMatchObject({winTotals:30,playoffs:16,conferenceFinalists:12,finals:12,champion:20,mvp:7,dpoy:3});
    expect(NBA_FUTURES_POINTS).not.toHaveProperty("cup");
    const p=emptyNbaFutures();
    p.cupChampion="BOS";p.oneSeeds=["BOS"];p.roy="Someone";p.mip="Another";
    expect(nbaFuturesProgress(p)).toBe(0);
    expect(validateNbaFutures(p)).toEqual([]);
  });
  it("rejects bracket contradictions and cross-conference overflow",()=>{
    const p=emptyNbaFutures();p.conferenceFinalists=["DAL"];
    expect(validateNbaFutures(p)).not.toHaveLength(0);
    p.conferenceFinalists=[];p.playoffTeams=NBA_TEAMS.filter(t=>t.conference==="East").slice(0,9).map(t=>t.id);
    expect(validateNbaFutures(p)).not.toHaveLength(0);
  });
  it("scores NBA Finals participants independently from the champion",()=>{
    const p=emptyNbaFutures();
    p.finalsTeams=["BOS","DEN"];p.champion="BOS";
    const result=scoreNbaFutures(p,{finalsTeams:["BOS","DEN"],champion:"DEN"});
    expect(result.scores.finals).toBe(12);
    expect(result.scores.champion).toBe(0);
    expect(result.settledMax).toBe(32);
  });
  it("does not award points for unresolved facts",()=>{
    const p=emptyNbaFutures();p.winTotals.OKC="over";
    expect(scoreNbaFutures(p,{})).toMatchObject({earned:0,settledMax:0});
    expect(scoreNbaFutures(p,{regularWins:{OKC:63}})).toMatchObject({earned:1,settledMax:1});
    expect(isNbaFuturesComplete(p)).toBe(false);
  });
});
