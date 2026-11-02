import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const nfl = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const nba = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const nflCss = readFileSync("src/styles/football-gm-mode.css", "utf8");
const nbaCss = readFileSync("src/styles/nba-gm-dev.css", "utf8");

describe("NFL and private NBA GM opening-screen parity", () => {
  it("puts the first wheel and its player picker ahead of the empty seven-slot roster", () => {
    expect(nfl).toContain("run.roster.length === 0 ? draftWheelStage : null");
    expect(nfl).toContain("run.roster.length > 0 ? draftWheelStage : null");
    expect(nfl).toMatch(/run\.roster\.length === 0 \? draftWheelStage : null[\s\S]*?<RosterGrid roster=\{run\.roster\}[\s\S]*?run\.roster\.length > 0 \? draftWheelStage : null/);
    expect(nba).toContain('run.phase==="draft"&&run.picks.length===0&&draftStage');
    expect(nba).toContain('run.phase==="draft"&&run.picks.length>0&&draftStage');
    expect(nba.indexOf('run.phase==="draft"&&run.picks.length===0&&draftStage'))
      .toBeLessThan(nba.indexOf('<section className="football-gm__roster surface-card nba-gm-dev__roster-panel">'));
    expect(nba).toContain('run.pendingTeam&&!wheelSpinning&&<PlayerPicker');
  });

  it("uses a compact Football-style NBA front-office heading while retaining private-only status", () => {
    expect(nba).toContain('className="football-gm__header nba-gm-dev__header"');
    expect(nba).toContain("NBA FRONT OFFICE");
    expect(nba).toContain("OWNER ONLY · NOT PUBLIC");
    expect(nba).not.toContain("Spin a team. Draft your seven-player rotation.");
    expect(nbaCss).toContain("/* Shared GM opening presentation");
    expect(nbaCss).toContain("background: none;");
  });

  it("shows three cap years without modifying contract calculations or saved rosters", () => {
    expect(nfl).toContain("forecastYears = false");
    expect(nfl).toContain("footballGmRosterCap(yearOneRoster ?? roster, 1)");
    expect(nfl).toContain("footballGmAdjustedHoldingsCap(roster, tradeChipPlayerIds, targetYear, seed, consequences)");
    expect(nfl).toContain('className="football-gm__cap-forecast"');
    expect(nfl).toContain("yearOneRoster={run.roster} forecastYears");
    expect(nba).toContain('className="nba-gm-dev__cap-forecast"');
    expect(nflCss).toContain(".football-gm__cap > .football-gm__cap-forecast");
    expect(nbaCss).toContain(".nba-gm-dev__cap-forecast>span");
  });
});
