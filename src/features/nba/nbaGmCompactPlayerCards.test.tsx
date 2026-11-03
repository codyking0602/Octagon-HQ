import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PlayerCard } from "./NbaGmDevPage";
import type { NbaGmDevPlayer } from "./nbaGmDevModel";

const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const base:NbaGmDevPlayer={
  id:"nba-gm-compact-scouter",name:"Anthony Davis",teamCode:"LAC",
  positions:["C","PF"],currentGrade:90,ageAtStart:33,
  skills:{scoring:87,shooting:65,playmaking:65,perimeterDefense:82,interiorDefense:96,rebounding:89},
  salaries:[60_600_000,62_000_000,64_000_000],
  gameContract:"1YR",repriceRisk:"HIGH",developmentOdds:null,
  pricingKind:"SIGNED_REAL_SALARY_WINDOW",eligibilityKind:"PROVISIONAL_EDITORIAL",
  officialNbaPlayerId:null,officialRosterPosition:"C",positionReview:"verified",
  reviewFlags:[],
};

describe("NBA GM approved compact NFL-style scouting cards",()=>{
  it("shows salary + one small SELECT next to name while retaining all six letters",()=>{
    const html=renderToStaticMarkup(<PlayerCard player={base} onPick={()=>{}} action="DRAFT"/>);
    expect(html).toContain("nba-gm-dev__scout-card");
    expect(html).toContain("nba-gm-dev__card-action");
    expect(html).toContain("nba-gm-dev__select-inline");
    expect(html).toContain("SELECT");
    expect(html).toContain("$60.6M");
    expect(html).not.toContain("DRAFT Anthony Davis</button>");
    expect(html).toContain("HIGH REPRICE");
    expect(html).toContain("BOOM/BUST");
    expect(html).toContain("nba-gm-dev__quick-skills");
    for(const short of ["SCOR","SHOOT","PLAY","PER D","INT D","REB"]) {
      expect(html).toContain(short);
    }
    expect((html.match(/nba-gm-dev__quick-skills/g)||[]).length).toBe(1);
    expect((html.match(/<small aria-label=/g)||[]).length).toBe(6);
  });

  it("combines 3YR plus SALARY LOCKED in a single pill: no duplicate or wrapping",()=>{
    const player={...base,gameContract:"3YR" as const,repriceRisk:"LOCKED" as const};
    const html=renderToStaticMarkup(<PlayerCard player={player} onPick={()=>{}} action="DRAFT"/>);
    expect(html).toContain("3YR · LOCKED");
    expect(html).toContain('aria-label="Three-year contract, salary locked"');
    expect(html).not.toContain(">SALARY LOCKED<");
    expect(html).not.toContain(">3YR</span>");
    expect(html).not.toContain("REPRICE RISK");
    expect(css).toContain("flex-wrap: nowrap;");
    expect(css).toContain(".nba-gm-dev__scout-card .nba-gm-dev__scout-pills");
    expect(css).toContain("grid-column: 2 / -1");
    expect(css).toContain("@media (max-width: 355px)");
  });

  it("applies the same compact card to signed free agents and keeps actual contract outlook",()=>{
    const html=renderToStaticMarkup(<PlayerCard player={base} onPick={()=>{}} action="SIGN" salaryYear={1}/>);
    expect(html).toContain("SIGN");
    expect(html).toContain("YEAR 2");
    expect(html).toContain("$62.0M");
    expect(html).toContain("HIGH REPRICE");
    expect(page).toContain('action="SIGN" salaryYear={1}');
    expect(page).toContain('action="SIGN DEPTH"');
    expect(css).toContain("grid-template-columns: repeat(6,minmax(0,1fr))");
    expect(css).toContain("grid-template-columns: repeat(3,minmax(0,1fr))");
  });
});
