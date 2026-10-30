import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_SKILL_KEYS, NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

type Player = { editorialId:string;name:string;teamCode:string|null;candidatePositions:string[];positionReview:string;overall:number;skills:Record<string,number>;evidence:{editorialFile:string;editorialRationale:string;leagueSeasonStatsUrl:string;openingRosterUrl:string;provisionalRosterUrl:string|null;checkedFactUrl?:string|null};confidence:string;reviewStatus:string;reviewFlags:string[] };
const draft = JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {lockedSkillKeys:string[];published:boolean;certifiedCount:number;reviewProvenance:{evidenceBasedProvisionalCorrections:number};players:Player[]};
const allowedPositions=new Set(["PG","SG","SF","PF","C"]);
const normalize=(s:string)=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|jr|sr)$/,"");

describe("NBA GM isolated provisional six-skill editorial board",()=>{
 it("matches every one of the 330 source identities and team crosswalk with no duplicates",()=>{
   expect(draft.players).toHaveLength(330);
   const names=draft.players.map(p=>normalize(p.name));
   expect(new Set(names).size).toBe(330);
   expect(new Set(draft.players.map(p=>p.editorialId)).size).toBe(330);
   const teams=new Set(draft.players.map(p=>p.teamCode));
   expect(teams).toEqual(new Set(NBA_GM_TEAM_CODES));
   const files=["first-100-overall-proposals","rotation-specialist-first-pass","lower-rookie-overall-anchors","east-depth-proposals","west-depth-proposals"];
   const known=new Map<string,number>();
   files.forEach((file,index)=>{
     const text=readFileSync(`docs/nba-gm-${file}-2026-10-29.md`,"utf8");
     for(const line of text.split("\n")){ const c=line.split("|").map(x=>x.trim());let name:string|undefined,overall:number|undefined;
       if(index===0&&/^\d+$/.test(c[1]??"")&&/^\*\*\d+\*\*$/.test(c[3]??"")){name=c[2];overall=Number(c[3]!.replace(/\*/g,""))}
       else if((index===1||index===2)&&/^\*\*\d+\*\*$/.test(c[2]??"")){name=c[1];overall=Number(c[2]!.replace(/\*/g,""))}
       else if(index>=3&&/^[A-Z]{3}$/.test(c[1]??"")&&/^\*\*\d+\*\*$/.test(c[3]??"")){name=c[2];overall=Number(c[3]!.replace(/\*/g,""))}
       if(name&&overall!==undefined){expect(known.has(normalize(name))).toBe(false);known.set(normalize(name),overall)}
     }
   });
   expect(known.size).toBe(330);
   for(const p of draft.players){expect(known.get(normalize(p.name)),p.name).toBe(p.overall)}
 });
 it("has exactly six integer 0-99 values, zero missing grades, and no artificial 70 floor",()=>{
   expect(draft.lockedSkillKeys).toEqual(["scoring","shooting","playmaking","perimeterDefense","interiorDefense","rebounding"]);
   expect(new Set(NBA_GM_SKILL_KEYS)).toEqual(new Set(draft.lockedSkillKeys));
   for(const p of draft.players){
     expect(Object.keys(p.skills).sort(),p.name).toEqual([...draft.lockedSkillKeys].sort());
     for(const k of draft.lockedSkillKeys){expect(Number.isInteger(p.skills[k]),p.name+" "+k).toBe(true);expect(p.skills[k]).toBeGreaterThanOrEqual(0);expect(p.skills[k]).toBeLessThanOrEqual(99)}
     expect(p.candidatePositions.length,p.name).toBeGreaterThan(0);
     expect(p.candidatePositions.every(x=>allowedPositions.has(x)),p.name).toBe(true);
   }
   expect(draft.players.some(p=>Object.values(p.skills).some(x=>x<70))).toBe(true);
   expect(draft.players.find(p=>p.name==="Luke Kennard")?.skills.shooting).toBe(95);
   expect(draft.players.find(p=>p.name==="Nikola Jokić")?.skills.playmaking).toBe(99);
   expect(draft.players.find(p=>p.name==="Victor Wembanyama")?.skills.interiorDefense).toBe(99);
 });
 it("retains individual source dossier, genuine research uncertainty, and hard isolation from gameplay",()=>{
   expect(draft.published).toBe(false);expect(draft.certifiedCount).toBe(0);
   for(const p of draft.players){
     expect(p.reviewStatus,p.name).toBe("PROVISIONAL_NOT_CERTIFIED");
     expect(p.evidence.editorialFile,p.name).toMatch(/^docs\/nba-gm-/);
     expect(p.evidence.editorialRationale.length,p.name).toBeGreaterThan(12);
     expect(p.evidence.leagueSeasonStatsUrl).toMatch(/^https:\/\//);
     expect(p.evidence.openingRosterUrl).toMatch(/^https:\/\//);
     expect(p.evidence.provisionalRosterUrl,p.name).toMatch(/^https:\/\//);
     expect(p.reviewFlags.length,p.name).toBeGreaterThan(0);
     expect(["low-inference","medium-editorial"]).toContain(p.confidence);
   }
   const clusters=new Map<string,Player[]>();
   for(const p of draft.players){const k=Object.values(p.skills).join("/"); clusters.set(k,[...(clusters.get(k)??[]),p]);}
   for(const group of clusters.values())if(group.length>=4){
     expect(group.every(p=>p.reviewFlags.includes("rating-cluster-peer-review")),group.map(p=>p.name).join(",")).toBe(true);
   }
   const production=readFileSync("src/features/nba/nbaGmFoundation.ts","utf8");
   expect(production).not.toContain("nba-gm-330-six-skills-PROVISIONAL");
 });
 it("locks practical close evidence-led grades and keeps eligibility explicitly provisional",()=>{
   const person=(name:string)=>draft.players.find(p=>p.name===name)!;
   expect(person("Michael Porter Jr.").skills.scoring).toBe(86);
   expect(person("Michael Porter Jr.").overall).toBe(83);
   expect(person("Jrue Holiday").skills.playmaking).toBe(81);
   expect(person("Jrue Holiday").overall).toBe(80);
   expect(person("Keegan Murray").skills.shooting).toBe(81);
   expect(person("Keegan Murray").overall).toBe(81);
   expect(person("Keegan Murray").candidatePositions).toEqual(["SF","PF"]);
   expect(person("DeMar DeRozan").skills.shooting).toBe(80);
   expect(person("DeMar DeRozan").overall).toBe(80);
   expect(draft.reviewProvenance.evidenceBasedProvisionalCorrections).toBe(23);
   expect(person("Keegan Murray").positionReview).toBe("unverified");
   expect(person("Keegan Murray").reviewFlags).toContain("historical-sf-pf-eligibility-lead-not-certified");
   for(const name of ["Michael Porter Jr.","Jrue Holiday","Keegan Murray"]){
     const row=person(name);
     expect(row.reviewFlags).toContain("evidence-led-oct30-practical-close-skill-regrade-not-certified");
     expect(row.evidence.checkedFactUrl?.startsWith("https://www.nba.com/")).toBe(true);
     expect(row.reviewStatus).toBe("PROVISIONAL_NOT_CERTIFIED");
   }
   expect(draft.published).toBe(false);
   expect(draft.certifiedCount).toBe(0);
 });
 it("reports variance without forcing skill distributions or averaging into overall",()=>{
   const keys=draft.lockedSkillKeys;
   for(const key of keys){
     const scores=draft.players.map(p=>p.skills[key]);
     expect(new Set(scores).size,key).toBeGreaterThan(10);
     expect(Math.min(...scores),key).toBeLessThan(70);
   }
   const group=draft.players.filter(p=>p.overall>=75&&p.overall<=79);
   expect(group).toHaveLength(149);
   expect(group.every(p=>p.reviewFlags.includes("75-79-compression-review"))).toBe(true);
   expect(draft.players.find(p=>p.name==="Luke Kennard")?.overall).toBe(78);
 });
});
