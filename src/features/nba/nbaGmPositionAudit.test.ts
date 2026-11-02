import { describe, expect, it } from "vitest";
import positionAudit from "../../../docs/nba-gm-330-position-audit-2026-11-02.json";
import { nbaGmDevAssignRoster, type NbaGmDevPlayer } from "./nbaGmDevModel";
const mk=(p:typeof positionAudit.players[number])=>({
 id:p.id,currentGrade:p.overall,positions:p.after
}) as NbaGmDevPlayer;
const catalog=positionAudit.players.map(mk);
const names=(list:string[])=>list.map(name=>positionAudit.players.find(p=>p.name===name)!).map(mk);
describe("NBA GM two-role editorial cohort and deterministic legal lineup",()=>{
 it("covers 330 distinct players with exactly two valid distinct positions",()=>{
   expect(positionAudit.players).toHaveLength(330);
   expect(new Set(positionAudit.players.map(p=>p.id)).size).toBe(330);
   for(const p of positionAudit.players){
     expect(p.after).toHaveLength(2);
     expect(p.after[0]).not.toBe(p.after[1]);
     expect(p.after.every(role=>(["PG","SG","SF","PF","C"] as string[]).includes(role))).toBe(true);
     expect(p.officialRosterSource).toMatch(/^https:\/\/www\.nba\.com\//);
   }
 });
 it("starts Deni ahead of Ace while keeping a guard and a big on the bench",()=>{
   const seven=names(["Victor Wembanyama","Luka Dončić","LeBron James",
     "Deni Avdija","Kon Knueppel","Ace Bailey","Jamal Shead"]);
   const assigned=nbaGmDevAssignRoster(seven.map(p=>p.id),catalog)!;
   expect(assigned.map(x=>x.slot)).toEqual(["PG","SG","SF","PF","C","GUARD","BIG"]);
   const playerBySlot=Object.fromEntries(assigned.map(p=>[
      p.slot,seven.find(x=>x.id===p.playerId)!.id
   ]));
   const named=(name:string)=>seven.find(x=>x.id===positionAudit.players.find(p=>p.name===name)?.id)!.id;
   expect(playerBySlot).toEqual({PG:named("Luka Dončić"),SG:named("Kon Knueppel"),
      SF:named("Deni Avdija"),PF:named("LeBron James"),C:named("Victor Wembanyama"),
      GUARD:named("Jamal Shead"),BIG:named("Ace Bailey")});
   expect(nbaGmDevAssignRoster([...seven].reverse().map(p=>p.id),catalog)).toEqual(assigned);
 });
 it("preserves roster construction: seven guards or seven centers are impossible",()=>{
   for(const primary of ["PG","C"]){
     const seven=catalog.filter(p=>p.positions[0]===primary).slice(0,7);
     expect(seven).toHaveLength(7);
     expect(nbaGmDevAssignRoster(seven.map(p=>p.id),catalog)).toBeNull();
   }
 });
 it("does not let the order of free agent/trade inserts choose starters",()=>{
   const seven=names(["Stephen Curry","Jalen Green","Ace Bailey","Giannis Antetokounmpo",
     "Nikola Jokić","Jamal Shead","Victor Wembanyama"]);
   const base=nbaGmDevAssignRoster(seven.map(p=>p.id),catalog);
   expect(base).not.toBeNull();
   const rotated=[...seven.slice(3),...seven.slice(0,3)];
   expect(nbaGmDevAssignRoster(rotated.map(p=>p.id),catalog)).toEqual(base);
 });
});
