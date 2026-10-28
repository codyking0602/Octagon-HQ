// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FOOTBALL_GM_TEAMS } from "./footballGmEngine";
import { NFL_GM_LONG_DIVISIONS, NFL_GM_LONG_ALL_TEAMS, nflGmLongTeamGeography } from "./footballGmLongConference";
import { NFL_GM_LONG_BY_ID, NFL_GM_LONG_PLAYER_POOL } from "./footballGmLongCatalog";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, nflGmLongValidRoster, type NflGmLongPick } from "./footballGmLongFoundation";
import { nflGmLongCalibratedOlDevelopment, nflGmLongOlRegressionMagnitude } from "./footballGmLongOlCalibration";
import { nflGmLongCreateMidseason } from "./footballGmLongMidseason";
import { nflGmLongCreateYearOne, nflGmLongValidYearOne } from "./footballGmLongYearOne";
import { nflGmLongInitialSave, nflGmLongParseSave } from "./footballGmLongPersistence";

const player = (name: string) => {
  const p = NFL_GM_LONG_PLAYER_POOL.find(row => row.name === name);
  if (!p) throw Error("Missing audited player: " + name);
  return p;
};
const picks: NflGmLongPick[] = [
  ["QB", "Patrick Mahomes"], ["RB", "Bijan Robinson"],
  ["WR", "Amon-Ra St. Brown"], ["FLEX", "Emeka Egbuka"],
  ["OL", "Penei Sewell"], ["DL", "Dexter Lawrence II"],
  ["LB", "Kobie Turner"], ["DB", "Evan Williams"],
  ["DB2", "Antonio Johnson"],
].map(([slot, name]) => ({ slot: slot as NflGmLongPick["slot"], playerId: player(name!).id }));
const coachName = "Dan Campbell";

describe("NFL GM Long Phase 3.1 finish audit", () => {
  it("owns all 32 official NFL identities in correct conferences and divisions", () => {
    expect(NFL_GM_LONG_ALL_TEAMS).toHaveLength(32);
    expect(new Set(NFL_GM_LONG_ALL_TEAMS)).toEqual(new Set(FOOTBALL_GM_TEAMS));
    expect(NFL_GM_LONG_DIVISIONS).toHaveLength(8);
    expect(NFL_GM_LONG_DIVISIONS.every(d => d.length === 4)).toBe(true);
    expect(nflGmLongTeamGeography("KC")).toEqual({ conference: 0, division: 3 });
    expect(nflGmLongTeamGeography("NO")).toEqual({ conference: 1, division: 2 });
    expect(nflGmLongTeamGeography("nonexistent")).toBeNull();
  });

  it("simulates future Long playoffs against real same-conference clubs until the Super Bowl", () => {
    expect(nflGmLongValidRoster(picks, NFL_GM_LONG_BY_ID)).toBe(true);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    let made = 0;
    for (let i = 0; i < 48; i++) {
      const seed = "phase-31-geography-" + i;
      const mid = { ...nflGmLongCreateMidseason(seed, picks, coachName), stage: "complete" as const };
      const season = nflGmLongCreateYearOne(seed, picks, coachName, mid);
      expect(nflGmLongValidYearOne(season, picks, mid)).toBe(true);
      expect(season.games.slice(0, 8)).toEqual(mid.games);
      expect(new Set(season.games.map(g => g.opponent)).size).toBe(17);
      if (season.playoffSeed !== null) made++;
      for (const playoff of season.postseason) {
        const geography = nflGmLongTeamGeography(playoff.opponent)!;
        expect(geography).not.toBeNull();
        if (playoff.round === "Super Bowl") expect(geography.conference).toBe(1);
        else expect(geography.conference).toBe(0);
      }
    }
    expect(made).toBeGreaterThan(0);
  });

  it("makes elite OL collapse rare rather than every ordinary decline", () => {
    const sewell = player("Penei Sewell");
    expect(sewell.currentGrade).toBeGreaterThanOrEqual(92);
    expect(sewell.development!.declinePct).toBeGreaterThan(20);
    const adjusted = nflGmLongCalibratedOlDevelopment(sewell)!;
    expect(adjusted.declinePct).toBeLessThanOrEqual(12);
    expect(adjusted.breakoutPct + adjusted.improvePct + adjusted.steadyPct + adjusted.declinePct).toBeCloseTo(100);
    expect(nflGmLongOlRegressionMagnitude(sewell, false)).toBeLessThan(3);
    expect(nflGmLongOlRegressionMagnitude(sewell, true)).toBeGreaterThanOrEqual(3);
    expect(sewell.development!.declinePct).toBe(27); // source evidence remains unmodified
    let severe = 0;
    for (let i = 0; i < 100; i++) {
      const seed = "phase-31-sewell-" + i;
      const mid = { ...nflGmLongCreateMidseason(seed, picks, coachName), stage: "complete" as const };
      const year = nflGmLongCreateYearOne(seed, picks, coachName, mid);
      if ((year.development.find(d => d.playerId === sewell.id)?.delta ?? 0) <= -3) severe++;
    }
    expect(severe).toBeLessThan(8);
  });

  it("keeps completed existing 11-6 seasons valid and unchanged across reloads", () => {
    const runId = "phase-31-saved-before-upgrade";
    const mid = { ...nflGmLongCreateMidseason(runId, picks, coachName), stage: "complete" as const };
    const savedYear = nflGmLongCreateYearOne(runId, picks, coachName, mid);
    const complete = { ...savedYear, revealedGames: 9, revealedRounds: savedYear.postseason.length, stage: "results" as const };
    const profile = "34e819e0-2d27-4d6d-af1c-250b4a0e721a";
    const base = nflGmLongInitialSave(profile, runId);
    const saved = { ...base, picks, phase: "year1" as const,
      selectedCoachBucket: "culture" as const, selectedCoach: coachName, coachWheelDraw: .5,
      midseason: mid, yearOne: complete };
    const restored = nflGmLongParseSave(JSON.parse(JSON.stringify(saved)), profile, NFL_GM_LONG_BY_ID);
    expect(restored?.yearOne).toEqual(complete);
    expect(restored?.midseason?.games).toEqual(mid.games);
    // Old saved postseason opponents are authoritative; never re-simulate the completed run.
  });

  it("renders championship identity, collapsible schedule, concise rows, and honest cap projection", () => {
    const ui = readFileSync("src/features/back-room/FootballGmLongYearOnePage.tsx", "utf8");
    const styles = readFileSync("src/styles/football-gm-long.css", "utf8");
    expect(ui).toContain("SUPER BOWL CHAMPIONS");
    expect(ui).toContain('aria-label="Super Bowl championship celebration"');
    expect(ui).toContain('<details className="gm-long-y1__schedule-collapse">');
    expect(ui).toContain("THE STRETCH RUN");
    expect(ui).toContain("estimated repricing of 1YR contracts");
    expect(ui).toContain("3YR salaries stay locked");
    expect(ui).toContain("<LongPlayerTags player={player} />");
    expect(ui).toContain("nflGmLongDevelopmentOutcome(delta)");
    expect(ui).toContain('"is-pending"');
    expect(styles).toContain(".gm-long-y1__championship");
    expect(styles).toContain(".gm-long-y1__player-bottom");
    expect(styles).toContain("@media(max-width:430px)");
  });
});
