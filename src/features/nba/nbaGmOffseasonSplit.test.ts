import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
const development=readFileSync("src/features/nba/NbaGmDevelopmentReport.tsx","utf8");

describe("NBA GM clean offseason report and moves separation",()=>{
  it("keeps six scouting signals, development and full cap in the Team Report",()=>{
    expect(page).toContain('const [offseasonView,setOffseasonView]=useState<"report"|"moves">("report")');
    expect(page).toContain('aria-label="Offseason screens"');
    expect(page).toContain("TEAM REPORT");
    expect(page).toContain("OFFSEASON MOVES");
    expect(page).toContain('aria-pressed={offseasonView==="report"}');
    expect(page).toContain('aria-pressed={offseasonView==="moves"}');
    expect(page).toContain('showOffseasonReport&&<>');
    expect(page).toContain("<NbaGmDevelopmentReport run={run} catalog={catalog}/>");
    expect(page).toContain("<FitReport picks={run.yearOnePicks} catalog={catalog}/>");
    expect(page).toContain("nba-gm-dev__fit-grid");
    expect(page).toContain("showOffseasonReport)&&<section className={\`football-gm__cap");
    expect(page).toContain('showOffseasonReport&&<section className="nba-gm-dev__continuity');
    expect(page).toContain("No extra continuity bonus");
    expect(development).toContain("Three-year deals stay locked.");
    expect(development).toContain("Exact ratings stay hidden.");
  });
  it("groups SHOP, roster, free agency, and simulation in the Moves screen",()=>{
    expect(page).toContain("showOffseasonMoves");
    expect(page).toContain('showOffseasonMoves)&&<section className="football-gm__roster');
    expect(page).toContain('showOffseasonMoves&&<section className="nba-gm-dev__panel nba-gm-dev__offseason"');
    expect(page).toContain('const releasePanel=run?.phase==="offseason"');
    expect(page).toContain("FREE AGENCY · {run.freeAgencyVisits}/3 VISITS");
    expect(page).toContain("FREE AGENCY · OPTIONAL");
    expect(page).toContain('void act("shop",player.id)');
    expect(page).toContain('void act("advance")');
    expect(page).toContain('run.picks.length<7&&!run.shopPlayerId');


    expect(page).toContain("YEAR {year+1} CAP");
    expect(page).toContain('remaining<0?"OVER":"LEFT"');
    expect(page).toContain("CONTINUE TO OFFSEASON MOVES");
    expect(page).toContain('setOffseasonView("moves")');
  });
  it("keeps trade wheel separate, owner-only and mobile navigation compact",()=>{
    expect(page).toContain("{tradeStage}");
    expect(page).toContain('!isTradeStage&&<nav className="nba-gm-dev__offseason-nav"');
    expect(page).toContain('setOffseasonView("report")');
    expect(page).toContain('window.scrollTo({top:0,behavior:"instant"})');
    expect(page).toContain("OWNER ONLY · NOT PUBLIC");
    expect(css).toContain(".nba-gm-dev .nba-gm-dev__offseason-nav");
    expect(css).toContain("grid-template-columns:repeat(2,minmax(0,1fr))");
  });
});
