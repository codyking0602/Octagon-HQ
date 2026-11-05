import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaGmPlayoffFinishText } from "../nba/nbaGmPlayoffFinishText";

const football = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const nflFinal = readFileSync("src/features/back-room/FootballGmFinalExperience.tsx", "utf8");
const nba = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const nbaFinal = readFileSync("src/features/nba/NbaGmFinalExperience.tsx", "utf8");
const nflCss = readFileSync("src/styles/football-gm-mode.css", "utf8");
const nbaCss = readFileSync("src/styles/nba-gm-dev.css", "utf8");

describe("NFL and NBA GM endgame parity", () => {
  it("reveals Years 2 and 3 before the final GM score without modifying the outcome", () => {
    const window = football.slice(football.indexOf('{run.phase === "years23" ? ('),football.indexOf('{run.phase === "final" && finalResult'));
    expect(window).toContain("REVEAL GM SCORE");
    expect(window).not.toContain("<ContinuityMeter");
    expect(window).not.toContain("No second offseason.");
    expect(football).toContain('className="football-gm__reveal-overall"');
    expect(nflCss).toContain(".football-gm__reveal-overall");
    expect(nba).toContain('function NbaGmSeasonReveal');
    expect(nba).toContain('run.results.filter(season=>season.season>=2)');
    expect(nba).toContain('action==="advance"&&state?.phase==="final"');
    expect(nba).toContain('showSeasonReveal');
    expect(nbaCss).toContain(".nba-gm-dev__season-reveal");
  });
  it("labels playoff exits explicitly", () => {
    expect(nbaGmPlayoffFinishText("First Round")).toBe("Lost First Round");
    expect(nbaGmPlayoffFinishText("Conference Semifinals")).toBe("Lost Conference Semifinals");
    expect(nbaGmPlayoffFinishText("Finals")).toBe("Lost NBA Finals");
    expect(nbaGmPlayoffFinishText("Champion")).toBe("Champion");
    expect(nbaFinal).toContain("nbaGmPlayoffFinishText(season.finish)");
    expect(nba).toContain("nbaGmPlayoffFinishText(season.finish)");
  });
  it("retains legacy SIM display while treating V7 as current", () => {
    expect(nba).toContain('(run.simulationModelVersion===7||run.simulationModelVersion===8||run.simulationModelVersion===9||run.simulationModelVersion===10||run.simulationModelVersion===11)?"OVR"');
    expect(nbaFinal).not.toContain("Legacy SIM grade; new franchises use the updated team OVR model.");
    expect(nbaFinal).toContain("nba-gm-final__score-components");
    expect(nbaFinal).toContain("<small>ROSTER</small><span>90%</span>");
    expect(nflFinal).toContain("nfl-gm-final__score-components");
    expect(nflFinal).toContain("<small>ROSTER</small>");
    expect(nflFinal).toContain("<small>RECORD</small>");
    expect(nflFinal).toContain("<small>PLAYOFFS</small>");
    expect(nflFinal).toContain("Core retained");
    expect(nflFinal).toContain("Offseason changes");
    expect(nflFinal).not.toContain("GM SCORE BREAKDOWN");
  });
  it("keeps one expandable roster evolution action per sport", () => {
    expect(football).not.toContain("VIEW FULL ROSTER</button>");
    expect(nflFinal).toContain('changes.length > 0 ? (');
    expect(nflFinal).toContain('id="gm-full-roster"');
    expect(nflFinal).toContain('gm-final__evolution-panel surface-card');
    expect(nbaFinal).toContain('gm-final__evolution-panel surface-card');
    expect(nbaFinal).toContain('arrivals.length>0&&<section');
    expect(nba).toContain("NEW GM RUN");
    expect(nflFinal).toContain("BEST ROSTER MOVE");
    expect(nflFinal).toContain("BIGGEST REGRESSION");
    expect(nbaFinal).toContain("KEY ROSTER MOVE");
  });
});
