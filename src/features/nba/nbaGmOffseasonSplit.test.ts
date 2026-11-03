import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
const dev=readFileSync("src/features/nba/NbaGmDevelopmentReport.tsx","utf8");
const off=page.slice(page.indexOf("{run&&<>"),page.indexOf('{run.phase==="final"'));

describe("NBA GM single-screen offseason parity",()=>{
  it("uses the full Year 2 cap first and keeps the compact seven-player roster",()=>{
    expect(off).toContain("nba-gm-dev__caps");
    expect(off).toContain("nba-gm-dev__cap-forecast");
    expect(off.indexOf("nba-gm-dev__caps")).toBeLessThan(off.indexOf("nba-gm-dev__roster-panel"));
    expect(off).toContain('run.phase==="offseason"');
    expect(page).not.toContain("offseasonView");
    expect(page).not.toContain("CONTINUE TO OFFSEASON MOVES");
    expect(page).not.toContain("nba-gm-dev__moves-cap");
    expect(page).not.toContain("<FitReport");
    expect(page).not.toContain("<NbaGmDevelopmentReport");
  });
  it("shows authentic development on each roster player without changing grades or trades",()=>{
    expect(dev).toContain("export function nbaGmDevelopmentOutcome");
    expect(page).toContain("change.year2Grade-change.startingGrade");
    expect(page).toContain("nba-gm-dev__roster-development");
    expect(page).toContain('void act("shop",player.id)');
    expect(page).toContain("const tradeStage=");
    expect(page).toContain("FREE AGENCY · {run.freeAgencyVisits}/3 VISITS");
    expect(page).toContain("nbaGmDevCanAdd(");
    expect(css).toContain("nba-gm-dev__roster-development.is-decline");
  });
  it("keeps collapsed voluntary release before the compact advance card",()=>{
    expect(page).toContain('<details className="nba-gm-dev__release"');
    expect(page).toContain("ONE VOLUNTARY RELEASE");
    expect(page).not.toContain("Cut one player to open free agency.");
    expect(off.indexOf("{releasePanel}")).toBeLessThan(off.indexOf("SIMULATE YEARS 2 & 3"));
    expect(page).toContain('"Roster fits both future salary caps."');
    expect(page).toContain('"READY TO ADVANCE"');
    expect(page).toContain("disabled={busy||capCrisis||heldPlayers.length>0}");
    expect(css).toContain(".nba-gm-dev__window-status.is-ready");
  });
});
