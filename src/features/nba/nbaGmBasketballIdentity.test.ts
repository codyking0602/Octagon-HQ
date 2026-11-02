import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const theme = readFileSync("src/styles/nba-gm-dev.css", "utf8");
const nflTheme = readFileSync("src/styles/football-gm-mode.css", "utf8");
const nflWheel = readFileSync("src/styles/football-wheel.css", "utf8");

describe("NBA GM orange basketball identity across every phase", () => {
  it("keeps all basketball theme overrides scoped to the NBA GM root", () => {
    const scoped = theme.slice(theme.indexOf("/* NBA-only basketball identity."));
    expect(scoped).toContain("--nba-gm-accent: #f3a449");
    expect(scoped).toContain("--nba-gm-surface: #191a1c");
    expect(scoped).not.toMatch(/^\s*\.football-gm-page/m);
    expect(scoped).not.toMatch(/^\s*\.football-wheel__/m);
    expect(nflTheme).toContain(".football-gm__header");
    expect(nflWheel).toContain(".football-wheel__center");
    expect(page).toContain("OWNER ONLY · NOT PUBLIC");
  });

  it("brands the wheel, candidate selection, cap, scouting, roster and final recap", () => {
    for (const selector of [
      ".nba-gm-dev .football-wheel__center",
      ".nba-gm-dev .football-wheel__pointer",
      ".nba-gm-dev .football-wheel-picker__slots button.is-active",
      ".nba-gm-dev .nba-gm-dev__player",
      ".nba-gm-dev .nba-gm-dev__primary",
      ".nba-gm-dev .nba-gm-dev__secondary",
      ".nba-gm-dev .nba-gm-dev__caps",
      ".nba-gm-dev .nba-gm-dev__continuity-track > em",
      ".nba-gm-dev .nba-gm-dev__fit-grid > div",
      ".nba-gm-dev .football-gm__roster",
      ".nba-gm-dev .nba-gm-final .gm-final__math i > b",
      ".nba-gm-dev .nba-gm-final .gm-final__season",
    ]) {
      expect(theme).toContain(selector);
    }
    expect(page).toContain("borderLeftColor:nbaTeamColor(player.teamCode)");
    expect(page).toContain("primaryColor:nbaTeamColor(team.id)");
  });

  it("preserves visible six-part scouting and a compact, cap-gated offseason advance", () => {
    expect(page).toContain("<FitReport picks={run.yearOnePicks} catalog={catalog}/>");
    expect(page).toContain("{signals.map(signal=><div");
    expect(page).toContain('run.phase==="offseason"&&!isTradeStage&&<section className="nba-gm-dev__panel nba-gm-dev__offseason"');
    expect(page).toContain("YOU CAN MOVE FORWARD");
    expect(page).toContain("SIMULATE YEARS 2 & 3");
    expect(page).toContain('disabled={busy||capCrisis||heldPlayers.length>0} onClick={()=>void act("advance")}');
    expect(page).toContain('<details className="nba-gm-dev__release"');
    expect(page).not.toContain("LOCK ROSTER · SIMULATE SEASONS 2 & 3");
    expect(page).toContain("The meter measures retention, not an extra hidden team bonus");
    expect(page).toContain("completed Year 1 stays unchanged");
  });
});
