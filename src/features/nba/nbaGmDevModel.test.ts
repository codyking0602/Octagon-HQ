import { describe, expect, it } from "vitest";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import { nbaGmDevIssues, nbaGmDevLegalSlots, nbaGmDevSpend, nbaGmDevTeamCandidates, type NbaGmDevPlayer, type NbaGmDevRun } from "./nbaGmDevModel";
const row = (id:string, positions:("PG"|"SG"|"SF"|"PF"|"C")[], salary=12e6):NbaGmDevPlayer => ({
 id,name:id,teamCode:"ATL",positions,positionReview:"unverified",overall:80,
 salaries:[salary,salary,salary],skills:{scoring:81,shooting:80,playmaking:79,perimeterDefense:76,interiorDefense:71,rebounding:75}
});
const catalog=[row("pg",["PG"]),row("sg",["SG"]),row("sf",["SF"]),row("pf",["PF"]),row("c",["C"]),row("sixth",["SG"]),row("flex",["PF"]),row("star",["PG"],152e6)];
const complete=NBA_GM_ROSTER_SLOTS.map((slot,i)=>({slot,playerId:catalog[i]!.id}));
describe("NBA GM development legality",()=>{
it("fills each of the seven slots and accounts for three seasons",()=>{
 expect(nbaGmDevIssues(complete,catalog,185e6,true)).toEqual([]);
 expect(nbaGmDevSpend(complete,catalog)).toEqual([84e6,84e6,84e6]);
});
it("rejects missing slots, duplicate athletes and ineligible centers",()=>{
 expect(nbaGmDevIssues(complete.slice(0,6),catalog,185e6,true)).toContain("Roster incomplete");
 expect(nbaGmDevIssues([...complete.slice(0,6),{slot:"FLEX",playerId:"pg"}],catalog)).toContain("Duplicate player");
 expect(nbaGmDevIssues([{slot:"PG",playerId:"c"}],catalog)).toContain("Player is ineligible for PG");
});
it("reserves future roster spending and prevents unaffordable stars",()=>{
 expect(nbaGmDevLegalSlots(catalog[7]!,[],catalog)).toEqual([]);
 expect(nbaGmDevLegalSlots(catalog[4]!,[],catalog)).not.toContain("PG");
 expect(nbaGmDevLegalSlots(catalog[4]!,[],catalog)).toContain("C");
 const run:NbaGmDevRun={version:"nba-gm-dev-v1",seed:"test",phase:"draft",revision:0,picks:[],spinIndex:0,pendingTeam:"ATL",previousTeam:null,devSalaryCap:185e6,salaryType:"FIXTURE",positionType:"PROVISIONAL",results:null};
 expect(nbaGmDevTeamCandidates("ATL",run,catalog).some(p=>p.player.id==="star")).toBe(false);
});
});