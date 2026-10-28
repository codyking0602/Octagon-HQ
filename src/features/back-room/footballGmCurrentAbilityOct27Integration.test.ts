import { describe, expect, it } from "vitest";
import stroud from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-26.json";
import qbs from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json";
import skills from "../../../data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json";
import oct28 from "../../../data/curated/football/nfl/wheel-nfl-madden-editorial-revisions-2026-10-28.json";
import contracts from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import profiles from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_CURRENT_PLAYER_POOL,
  footballGmPlayerById, footballGmCandidatesForTeam, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL } from "./footballGmLongCatalog";
import { WHEEL_NFL_GM_AUTHORITY, qbGradesArtifact, rbGradesArtifact, wrGradesArtifact } from "./wheelFootballNflCurrentAuthority";

const changes=[...stroud.changes,...qbs.changes,...skills.changes];
const artifacts={QB:qbGradesArtifact,RB:rbGradesArtifact,WR:wrGradesArtifact};
function gmPlayer(team: string,family: string,player: string){
 const match=FOOTBALL_GM_PLAYER_POOL.filter(row=>row.team===team&&row.family===family&&row.name===player);
 expect(match).toHaveLength(1);
 return match[0]!;
}
describe("current NFL Oct 27 ability reaches new Short and Long GM games",()=>{
 it("reconciles 12 approved Week 7 revisions plus earlier Stroud without creating another rating source",()=>{
   expect(qbs.changes).toHaveLength(5);
   expect(skills.changes).toHaveLength(7);
   expect(stroud.changes).toHaveLength(1);
   expect(changes).toHaveLength(13);
   expect(new Set(changes.map(c=>c.team+"|"+c.family+"|"+c.player)).size).toBe(13);
   for(const family of ["QB","RB","WR"] as const){
     expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles[family]).toBe(`wheel-nfl-${family.toLowerCase()}-grades-2026-10-27.json`);
     const artifact=artifacts[family];
     for(const change of changes.filter(c=>c.family===family)){
       const matches=artifact.grades.filter(g=>g.team===change.team&&g.player===change.player);
       expect(matches,change.player).toHaveLength(1);
       expect(matches[0]!.grade,change.player).toBe(change.newGrade);
     }
   }
 });
 it("updates new candidate strength in both GM modes without changing 594 IDs, 591 eligible or player contracts",()=>{
   expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
   expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(591);
   expect(contracts.players).toHaveLength(594);
   expect(profiles.profiles).toHaveLength(594);
   expect(NFL_GM_LONG_PLAYER_POOL).toHaveLength(FOOTBALL_GM_PLAYER_POOL.length+179);
   for(const change of changes){
     const row=gmPlayer(change.team,change.family,change.player);
     const contract=contracts.players.find(c=>c.team===change.team&&c.family===change.family&&c.player===change.player)!;
     const profile=profiles.profiles.find(p=>p.id===row.id)!;
     expect(row.currentGrade,change.player).toBe(change.newGrade);
     expect(footballGmPlayerById(row.id)?.currentGrade).toBe(change.newGrade);
     expect(NFL_GM_LONG_BY_ID.get(row.id)?.currentGrade).toBe(change.newGrade);
     expect(row.salaryApy).toBe(contract.salaryApy);
     expect(row.gameContract).toBe(contract.gameContract);
     expect(profile.gradeAtCalibration).toBe(change.oldGrade);
     expect(footballGmProjectedGradeForPlayer(row,1)).toBe(change.newGrade);
     if(row.currentRosterEligible){
       expect(footballGmCandidatesForTeam({team:row.team,roster:[]})
         .some(candidate=>candidate.player.id===row.id)).toBe(true);
     }
   }
 });
 it("leaves historical research grades intact while respecting October 28 current-ability changes",()=>{
   const changed=new Set([
     ...changes.map(c=>c.team+"|"+c.family+"|"+c.player),
     ...oct28.changes.filter(c=>c.family!=="Head Coach").map(c=>c.team+"|"+c.family+"|"+c.subject),
   ]);
   for(const player of FOOTBALL_GM_PLAYER_POOL){
     const original=profiles.profiles.find(p=>p.id===player.id)!;
     if(!changed.has(player.team+"|"+player.family+"|"+player.name)){
       expect(player.currentGrade,player.id).toBe(original.gradeAtCalibration);
     }
   }
 });
});
