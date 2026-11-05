import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const football = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const nba = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const footballCss = readFileSync("src/styles/football-gm-mode.css", "utf8");
const nbaCss = readFileSync("src/styles/nba-gm-dev.css", "utf8");

describe("Football and private NBA GM Year 1 parity", () => {
  it("matches the NFL roster's salary, deal and repricing stack on NBA without duplicating terms in scouting", () => {
    expect(nba).toContain("showContract=true");
    expect(nba).toContain("<ScoutBadges player={player} run={run} showContract={false}/>");
    expect(nba).toContain('className="football-gm__roster-contract nba-gm-dev__roster-contract"');
    expect(nba).toContain("<span>{player.gameContract}</span>");
    expect(nba).toContain("nbaGmRepriceLabel(player.repriceRisk,player.gameContract).label");
    expect(nbaCss).toContain(".nba-gm-dev .nba-gm-dev__roster-contract > small");
    expect(nbaCss).toContain("grid-template-columns: 35px minmax(0, 1fr) minmax(83px, auto)");
    expect(nba).toContain("style={player?{borderLeftColor:nbaTeamColor(player.teamCode)}:undefined}");
    expect(nba).toContain("<PlayerPortrait key={player.id} player={player}/>");
  });

  it("leads each Year 1 result with the record and finish, retaining sport-specific metrics", () => {
    expect(football).toContain('yearOneRecap = false');
    expect(football).toContain('yearOneRecap ? (');
    expect(football).toContain("footballGmSeasonRecordLabel(result) ??");
    expect(football).toContain("footballGmPlayoffFinishLabel(result.finish)");
    expect(football).toContain("result.titleOdds.toFixed(1)");
    expect(football).toContain("roster={run.roster} yearOneRecap");
    expect(football).not.toContain("The finish is no longer tied to a fixed grade threshold.");
    expect(nba).toContain('football-gm__season-card nba-gm-dev__year-one-card is-year-one');
    expect(nba).toContain("<strong>{season.wins}–{season.losses}</strong>");
    expect(nba).toContain("<b>{season.finish}</b>");
    expect(nba).toContain("OFFENSE GRADE");
    expect(nba).toContain("DEFENSE GRADE");
    expect(nba).toContain("graded={run.simulationModelVersion===6||run.simulationModelVersion===7||run.simulationModelVersion===8||run.simulationModelVersion===9||run.simulationModelVersion===10||run.simulationModelVersion===11||run.simulationModelVersion===12}");
    expect(nba).toContain("season.offense.toFixed(1)");
    expect(footballCss).toContain(".football-gm__season-card.is-year-one");
    expect(nbaCss).toContain(".nba-gm-dev .nba-gm-dev__year-one-card");
  });

  it("shows one Year 1 label per recap and tightens spacing without changing later-year cards", () => {
    expect(football).toContain('<p className="eyebrow">YEAR 1 COMPLETE</p>');
    expect(nba).toContain('<p className="eyebrow">YEAR 1 COMPLETE</p>');
    expect(football).toContain('!yearOneRecap ? <small>YEAR {year}</small> : null');
    expect(nba).not.toContain('<small>YEAR {season.season}</small>');
    expect(football).toContain("yearOneRecap = false");
    expect(footballCss).toContain(".football-gm__year-reveal { display: grid; gap: 12px; padding: 14px 16px; }");
    expect(footballCss).toContain("margin: 0 auto;\n  padding: 15px 12px;");
    expect(nbaCss).toContain("padding: 14px 16px;");
    expect(nbaCss).toContain(".nba-gm-dev .nba-gm-dev__year-reveal");
  });

  it("starts the NBA offseason with its full cap and actionable roster, not a duplicate fit report", () => {
    expect(nba).not.toContain("showOffseasonReport");
    expect(nba).not.toContain("<FitReport");
    const cap = nba.indexOf('nba-gm-dev__caps');
    const roster = nba.indexOf('nba-gm-dev__roster-panel');
    expect(cap).toBeGreaterThan(0);
    expect(roster).toBeGreaterThan(cap);
    expect(nba).toContain('nba-gm-dev__roster-development');
    expect(nba).toContain('run.development?.[player.id]');
    expect(nba).not.toContain('nba-gm-dev__fit-disclosure');
    expect(nba).toContain("ENTER THE OFFSEASON");
  });});
