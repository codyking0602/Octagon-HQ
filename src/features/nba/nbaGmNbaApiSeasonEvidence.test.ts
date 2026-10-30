import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

/** Editorial-only NBA Stats API 2025–26 historical facts: not live team/role or grade certification. */
const path = "docs/nba-gm-2025-26-nba-api-301-player-stat-evidence-2026-10-29.json";
const sourcePath = "docs/nba-gm-sourced-2025-26-facts-2026-10-29.json";
const catalogPath = "docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json";
const officialPath = "docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json";
type NumericStat = { points: number; totalRebounds: number; assists: number; steals: number; blocks: number; [key:string]:number };
type Evidence = {
 editorialName:string; nbaSeasonPlayerName:string; nbaPlayerId:string; season:string; seasonType:string;
 gamesPlayed:number; totalMinutes:number; minutesPerGame:number;
 totals: {threePointAttempted:number;points:number;[key:string]:number};
 perGame:NumericStat;
 shooting:{threePointPercentage:number|null;trueShootingPercentage:number|null};
};
type ExistingRow = {name:string;observations:Array<{metric:string;value:number}>};
const data = JSON.parse(readFileSync(path,"utf8")) as {published:boolean;certifiedCount:number;editorialPopulation:number;withSourceSeason:number;withoutSourceSeason:number;crossCheckedPublishedLeaderboardObservations:number;crossCheckErrors:number;players:Evidence[];noSeasonRowCandidates:Array<{name:string;teamCode:string}>;upstream:{commitSha:string;rawCsvUrl:string;sourceTotalPlayerRows:number}};
const catalog=JSON.parse(readFileSync(catalogPath,"utf8")) as {published:boolean;certifiedCount:number;players:Array<{name:string;teamCode:string;overall:number;skills:Record<string,number>}>};
const previous=JSON.parse(readFileSync(sourcePath,"utf8")) as {players:ExistingRow[]};
const official=JSON.parse(readFileSync(officialPath,"utf8")) as {crosswalk:Array<{name:string;teamCode:string;officialNBAPlayerId:string|null}>};
const norm=(s:string)=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|jr|sr)$/,"");

describe("NBA GM historical 2025–26 NBA API identity and per-player statistics",()=>{
 it("joins all 330 editorial candidates into 301 real season rows and 29 explicit no-data exceptions",()=>{
   expect(data.published).toBe(false);
   expect(data.certifiedCount).toBe(0);
   expect(catalog.published).toBe(false);
   expect(catalog.certifiedCount).toBe(0);
   expect(data.editorialPopulation).toBe(330);
   expect(data.players).toHaveLength(301);
   expect(data.noSeasonRowCandidates).toHaveLength(29);
   expect(data.withSourceSeason).toBe(301);
   expect(data.withoutSourceSeason).toBe(29);
   const names=[...data.players.map(x=>norm(x.editorialName)),...data.noSeasonRowCandidates.map(x=>norm(x.name))];
   expect(new Set(names).size).toBe(330);
   expect(new Set(names)).toEqual(new Set(catalog.players.map(x=>norm(x.name))));
   expect(new Set(catalog.players.map(x=>x.teamCode))).toEqual(new Set(NBA_GM_TEAM_CODES));
   expect(data.upstream.commitSha).toMatch(/^[a-f0-9]{40}$/);
   expect(data.upstream.rawCsvUrl).toContain(data.upstream.commitSha);
   expect(data.upstream.sourceTotalPlayerRows).toBe(582);
 });
 it("preserves unique historical NBA player IDs and realistic complete season stat records",()=>{
   expect(new Set(data.players.map(p=>p.nbaPlayerId)).size).toBe(301);
   for(const p of data.players){
     expect(p.nbaPlayerId,p.editorialName).toMatch(/^\d+$/);
     expect(p.season).toBe("2025-26");
     expect(p.seasonType).toBe("Regular Season");
     expect(p.gamesPlayed).toBeGreaterThan(0);
     expect(p.gamesPlayed).toBeLessThanOrEqual(82);
     expect(p.totalMinutes).toBeGreaterThanOrEqual(0);
     expect(p.minutesPerGame).toBeGreaterThanOrEqual(0);
     expect(p.minutesPerGame).toBeLessThanOrEqual(50);
     expect(Math.abs(p.totalMinutes/p.gamesPlayed-p.minutesPerGame)).toBeLessThan(0.02);
     const expectedPpg=p.totals.points/p.gamesPlayed;
     expect(Math.abs(expectedPpg-p.perGame.points),p.editorialName).toBeLessThan(0.02);
     for(const v of [...Object.values(p.perGame),...Object.values(p.totals)]){
       expect(Number.isFinite(v),p.editorialName).toBe(true);
       expect(v).toBeGreaterThanOrEqual(0);
     }
     if(p.shooting.threePointPercentage!==null){
       expect(p.shooting.threePointPercentage).toBeGreaterThanOrEqual(0);
       expect(p.shooting.threePointPercentage).toBeLessThanOrEqual(100);
     }
   }
 });
 it("cross-checks league season evidence against independent 2025–26 leaderboards",()=>{
   const byName=new Map(data.players.map(p=>[norm(p.editorialName),p]));
   let checked=0;
   for(const row of previous.players){
     const p=byName.get(norm(row.name));
     if(!p)continue;
     const values:Record<string,number|null>={
       pointsPerGame:p.perGame.points,
       assistsPerGame:p.perGame.assists,
       reboundsPerGame:p.perGame.totalRebounds,
       stealsPerGame:p.perGame.steals,
       blocksPerGame:p.perGame.blocks,
       threePointPercentage:p.shooting.threePointPercentage,
       threePointAttempts:p.totals.threePointAttempted,
     };
     for(const o of row.observations){
       // Archived NBA-API-derived rows are not independent cross-source checks.
       if ((o as {sourceKind?:string}).sourceKind === "archived-third-party-nba-api-player-row") continue;
       const n=values[o.metric];
       if(n==null)continue;
       checked++;
       const tolerance=o.metric==="threePointAttempts"?1.1:0.21;
       expect(Math.abs(n-o.value),row.name+" "+o.metric+" cross-source mismatch").toBeLessThan(tolerance);
     }
   }
   expect(checked).toBe(429);
   expect(data.crossCheckedPublishedLeaderboardObservations).toBe(429);
   expect(data.crossCheckErrors).toBe(0);
 });
 it("matches all newly linked archival facts to exact 2025-26 player rows while retaining incomplete certification",()=>{
   const additions=previous.players.filter(r=>r.observations.some(x=>(x as {sourceKind?:string}).sourceKind==="archived-third-party-nba-api-player-row"));
   expect(additions).toHaveLength(19);
   const seasons=new Map(data.players.map(p=>[norm(p.editorialName),p]));
   for(const row of additions){
     const season=seasons.get(norm(row.name));
     expect(season,row.name).toBeDefined();
     const actual:Record<string,number|null>={pointsPerGame:season!.perGame.points,assistsPerGame:season!.perGame.assists,reboundsPerGame:season!.perGame.totalRebounds,stealsPerGame:season!.perGame.steals,blocksPerGame:season!.perGame.blocks,threePointAttempts:season!.totals.threePointAttempted,threePointPercentage:season!.shooting.threePointPercentage};
     for(const o of row.observations){
       expect((o as {sourceKind?:string}).sourceKind).toBe("archived-third-party-nba-api-player-row");
       expect(o.value,row.name+" "+o.metric).toBe(actual[o.metric]);
     }
   }
   expect(catalog.certifiedCount).toBe(0);
 });
 it("does not rewrite current teams or mistake broad official positions for roster-slot certification",()=>{
   const byName=new Map(data.players.map(p=>[norm(p.editorialName),p]));
   const teams=new Map(catalog.players.map(p=>[norm(p.name),p.teamCode]));
   let idMatches=0;
   for(const row of official.crosswalk){
     expect(teams.get(norm(row.name)),row.name).toBe(row.teamCode);
     const historical=byName.get(norm(row.name));
     if(row.officialNBAPlayerId && historical){
       expect(row.officialNBAPlayerId,row.name).toBe(historical.nbaPlayerId);
       idMatches++;
     }
   }
   expect(idMatches).toBeGreaterThanOrEqual(10);
   const publicFoundation=readFileSync("src/features/nba/nbaGmFoundation.ts","utf8");
   expect(publicFoundation).not.toContain("nba-gm-2025-26-nba-api-301-player-stat-evidence");
 });
});
