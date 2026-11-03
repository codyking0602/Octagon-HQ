import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { nbaGmDevFitSignals, type NbaGmDevPlayer, type NbaGmDevRun } from "./nbaGmDevModel";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import { NbaGmDevelopmentReport } from "./NbaGmDevelopmentReport";

const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
const model=readFileSync("src/features/nba/nbaGmDevModel.ts","utf8");

const fixtures=NBA_GM_ROSTER_SLOTS.map((slot,index):NbaGmDevPlayer=>({
  id:"offseason-test-"+slot,name:"Test "+slot,teamCode:"SAS",
  positions: [slot==="GUARD"?"SG":slot==="BIG"?"PF":slot],
  currentGrade:slot==="C"?99:80,
  skills:{
    scoring:80,shooting:80,playmaking:80,perimeterDefense:78,
    interiorDefense:slot==="C"?99:slot==="PF"||slot==="BIG"?50:70,
    rebounding:slot==="C"?90:75,
  },
  salaries:[10_000_000,12_000_000,13_000_000],
  gameContract:index%2===0?"3YR":"1YR",
  pricingKind:"GAME_FIXTURE_NOT_REAL_CONTRACT",eligibilityKind:"PROVISIONAL_EDITORIAL",
  officialNbaPlayerId:null,officialRosterPosition:"F",positionReview:"unverified",
  reviewFlags:["test fixture"],
}));
const picks=NBA_GM_ROSTER_SLOTS.map((slot,index)=>({slot,playerId:fixtures[index]!.id}));
const run:NbaGmDevRun={
  version:"nba-gm-dev-v2",seed:"nba-gm-offseason-ui-locked",
  phase:"offseason",picks,yearOnePicks:picks,pendingTeam:null,pendingSlot:null,
  spinIndex:7,caps:[155_000_000,155_000_000,155_000_000],results:[],
  shopPlayerId:null,tradeTeam:null,tradeAttempts:0,tradesUsed:0,
  freeAgencyTeam:null,freeAgencyVisits:0,releasedIds:[],
  development:Object.fromEntries(fixtures.map(p=>[p.id,{
    startingGrade:p.currentGrade,year2Grade:p.currentGrade+2,
    year3Grade:p.currentGrade+3,year2Salary:p.salaries[1],year3Salary:p.salaries[2],
  }])),
};

describe("NBA GM public offseason compact parity",()=>{
  it("keeps the full cap, and moves development into the interactive roster",()=>{
    expect(page).not.toContain('<NbaGmDevelopmentReport run={run} catalog={catalog}/>');
    expect(page).not.toContain("<FitReport");
    expect(page).toContain("nba-gm-dev__caps");
    expect(page).toContain("nba-gm-dev__roster-development");
    expect(page).toContain("change.year2Grade-change.startingGrade");
    expect(page).not.toContain("CONTINUE TO OFFSEASON MOVES");
    expect(page).not.toContain("retainedCount/7*100");
    expect(page).not.toContain("nba-gm-dev__continuity-track");
  });
  it("keeps SHOP in the right-hand salary stack, not a second roster grid row",()=>{
    expect(page).toContain("nba-gm-dev__inline-shop");
    expect(page).not.toContain('className="nba-gm-dev__row-actions"');
    expect(css).toContain(".nba-gm-dev__roster-panel .nba-gm-dev__inline-shop");
    expect(page).toContain('aria-label={(run.shoppedPlayerIds?.includes(player.id)?"Already shopped ":"Shop ")+player.name}');
  });
  it("places the collapsed release before advance while preserving cap and confirmation",()=>{
    const screen=page.slice(page.indexOf('{run&&<>'),page.indexOf('{run.phase==="final"'));
    const release=screen.indexOf("{releasePanel}");
    const advance=screen.indexOf("SIMULATE YEARS 2 & 3");
    expect(release).toBeGreaterThan(0);
    expect(advance).toBeGreaterThan(release);
    expect(page).toContain('<details className="nba-gm-dev__release"');
    expect(page).toContain('run.caps[1]-spend[1]+nbaGmDevSalary(player,1)');
    expect(page).toContain('run.caps[2]-spend[2]+nbaGmDevSalary(player,2)');
    expect(page).toContain('window.confirm("Release "+player.name+');
    expect(css).toContain('nba-gm-dev__release[open]');
    expect(page).toContain("Roster fits both future salary caps.");
  });
  it("uses the actual starting center for rim protection, not a blended average",()=>{
    const fit=nbaGmDevFitSignals(picks,fixtures);
    expect(fit.find(entry=>entry.label==="Rim protection")?.status).toBe("STRONG");
    expect(fit.find(entry=>entry.label==="Rim protection")?.detail).toContain("starting center");
    expect(model).not.toContain('label:"Interior presence"');
  });
  it("differentiates past development from scouting outlook and protects 3YR terms",()=>{
    const report=renderToStaticMarkup(<NbaGmDevelopmentReport run={run} catalog={fixtures}/>);
    expect(report).toContain("OFFSEASON DEVELOPMENT");
    expect(report).toContain("Development shows past change");
    expect(report).toContain("roster badges show outlook");
    expect(report).toContain("Three-year deals stay locked");
    expect(report).toContain("3YR LOCKED");
    expect(report).toContain("1YR REPRICE");
    expect(page).not.toContain('OWNER ONLY · NOT PUBLIC');
    expect(page).toContain("SIGN IN TO PLAY");
  });
});
