import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  NBA_GM_DEV_CAPS, nbaGmDevCanAdd, nbaGmDevCandidates,
  type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";

const make = (
  id:string,positions:NbaGmDevPlayer["positions"],
  salaries:readonly [number,number,number],contract:"1YR"|"3YR"="1YR",
):NbaGmDevPlayer=>({
  id,name:id,teamCode:"GSW",positions,currentGrade:85,
  salaries,gameContract:contract,
  skills:{scoring:80,shooting:80,playmaking:80,
    perimeterDefense:80,interiorDefense:80,rebounding:80},
  pricingKind:"SIGNED_REAL_SALARY_WINDOW",
  eligibilityKind:"PROVISIONAL_EDITORIAL",
  officialNbaPlayerId:null,officialRosterPosition:"G",
  positionReview:"unverified",reviewFlags:[],
});

const tyson=make("tyson",["SF","SG"],[4_650_030,18_500_000,18_500_000]);
const keegan=make("keegan",["SF","PF"],[26_068_967,26_068_967,26_068_967],"3YR");
const deni=make("deni",["SF","PF"],[12_500_000,45_000_000,45_000_000]);
const steph=make("steph",["PG","SG"],[59_481_053,59_481_053,59_481_053],"3YR");
const center=make("center",["C"],[2_231_454,2_231_454,2_231_454],"3YR");
const guard=make("guard",["PG","SG"],[2_115_499,2_115_499,2_115_499],"3YR");
const big=make("big",["PF","C"],[1_819_437,1_819_437,1_819_437],"3YR");
const catalog=[tyson,keegan,deni,steph,center,guard,big];
const three=[
  {slot:"SG" as const,playerId:tyson.id},
  {slot:"SF" as const,playerId:keegan.id},
  {slot:"PF" as const,playerId:deni.id},
];
const six=[
  {slot:"PG" as const,playerId:steph.id},...three,
  {slot:"C" as const,playerId:center.id},
  {slot:"GUARD" as const,playerId:guard.id},
];

describe("NBA GM draft matches NFL Year 1 cap eligibility",()=>{
  it("allows Steph in the live-equivalent three-player draft despite future repricing",()=>{
    expect(nbaGmDevCanAdd(three,steph,catalog,NBA_GM_DEV_CAPS,"draft")).toBe(true);
    expect(nbaGmDevCanAdd(three,steph,catalog,
      [100_000_000,155_000_000,155_000_000],"draft")).toBe(false);
    const run={
      version:"nba-gm-dev-v2",seed:"nba-draft-cap-regression",phase:"draft",
      picks:three,yearOnePicks:[],pendingTeam:"GSW",pendingSlot:null,
      spinIndex:4,caps:NBA_GM_DEV_CAPS,results:[],shopPlayerId:null,
      tradeTeam:null,tradeAttempts:0,tradesUsed:0,freeAgencyTeam:null,
      freeAgencyVisits:0,releasedIds:[],
    } satisfies NbaGmDevRun;
    expect(nbaGmDevCandidates(run,catalog).map(p=>p.id)).toContain("steph");
  });

  it("allows an affordable Year 1 roster but rejects its Year 2/3 cap crisis in offseason",()=>{
    expect(nbaGmDevCanAdd(six,big,catalog,NBA_GM_DEV_CAPS,"draft")).toBe(true);
    expect(nbaGmDevCanAdd(six,big,catalog,NBA_GM_DEV_CAPS,"offseason")).toBe(false);
    const y1=catalog.reduce((sum,p)=>sum+p.salaries[0],0);
    const y2=catalog.reduce((sum,p)=>sum+p.salaries[1],0);
    expect(y1).toBeLessThan(NBA_GM_DEV_CAPS[0]);
    expect(y2).toBeGreaterThan(NBA_GM_DEV_CAPS[1]);
  });

  it("guards the server contract: reserved fillers and draft cap use Year 1 only",()=>{
    const migration=readFileSync(
      "supabase/migrations/202612310928_nba_gm_nfl_year_one_draft_cap.sql","utf8");
    const sql=readFileSync(
      "supabase/tests/nba_gm_nfl_year_one_draft_cap.sql","utf8");
    expect(migration).toContain("private.nba_gm_v3_salary(p_state,p.id,1)");
    expect(migration).toContain("v_phase='draft' and v_year<>1");
    expect(migration).toContain("v_phase='offseason' and v_year=1");
    expect(sql).toContain("nba-gm-draft-stephencurry");
    expect(sql).toContain("Over-cap Season 1 player became draftable");
  });
});
