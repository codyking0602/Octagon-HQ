import { describe, expect, it } from "vitest";
import type { FootballFuturesPicks } from "./footballPicksScoring";
import {
  EMPTY_FOOTBALL_FUTURES_PICKS,
  validateFootballFuturesPicks,
} from "./footballFuturesDraft";

const validPicks: FootballFuturesPicks = {
  cfbPower4Champions: [
    "Clemson Tigers",
    "Ohio State Buckeyes",
    "Kansas State Wildcats",
    "Texas Longhorns",
  ],
  cfbPlayoffTeams: [
    "Clemson Tigers",
    "Ohio State Buckeyes",
    "Kansas State Wildcats",
    "Texas Longhorns",
    "Georgia Bulldogs",
    "Oregon Ducks",
    "Penn State Nittany Lions",
    "Alabama Crimson Tide",
    "Miami Hurricanes",
    "LSU Tigers",
    "Notre Dame Fighting Irish",
    "Boise State Broncos",
  ],
  cfbSemifinalists: ["Texas Longhorns", "Ohio State Buckeyes", "Georgia Bulldogs", "Oregon Ducks"],
  cfbHeisman: "Arch Manning",
  cfbNationalChampion: "Texas Longhorns",
  nflDivisionChampions: [
    "Buffalo Bills",
    "Baltimore Ravens",
    "Houston Texans",
    "Kansas City Chiefs",
    "Dallas Cowboys",
    "Detroit Lions",
    "Tampa Bay Buccaneers",
    "San Francisco 49ers",
  ],
  nflPlayoffTeams: [
    "Buffalo Bills",
    "Baltimore Ravens",
    "Houston Texans",
    "Kansas City Chiefs",
    "Cincinnati Bengals",
    "Los Angeles Chargers",
    "Miami Dolphins",
    "Dallas Cowboys",
    "Detroit Lions",
    "Tampa Bay Buccaneers",
    "San Francisco 49ers",
    "Philadelphia Eagles",
    "Green Bay Packers",
    "Los Angeles Rams",
  ],
  nflConferenceChampionshipTeams: ["Kansas City Chiefs", "Baltimore Ravens", "Dallas Cowboys", "Detroit Lions"],
  nflMvp: "Dak Prescott",
  nflSuperBowlChampion: "Dallas Cowboys",
};

function errorsFor(patch: Partial<FootballFuturesPicks>) {
  return validateFootballFuturesPicks({ ...validPicks, ...patch }).errors;
}

describe("Football Futures structure", () => {
  it("accepts a conference- and division-consistent full card", () => {
    expect(validateFootballFuturesPicks(validPicks).errors).toEqual([]);
  });

  it("keeps incomplete Power 4 entries valid so partial drafts can autosave", () => {
    expect(validateFootballFuturesPicks({
      ...EMPTY_FOOTBALL_FUTURES_PICKS,
      cfbPower4Champions: ["Clemson Tigers"],
    }).errors).toEqual([]);
  });

  it("requires exactly one champion from each Power 4 conference", () => {
    expect(errorsFor({
      cfbPower4Champions: ["Georgia Bulldogs", "Ohio State Buckeyes", "Kansas State Wildcats", "Texas Longhorns"],
    })).toContain("Power 4 champions must include exactly one ACC, Big Ten, Big 12, and SEC team.");
  });

  it("requires the 12-team CFP to carry the P4 champions and a non-P4 team", () => {
    const allPower4 = validPicks.cfbPlayoffTeams.map((team) => team === "Boise State Broncos" ? "Auburn Tigers" : team === "Notre Dame Fighting Irish" ? "Florida Gators" : team);
    expect(errorsFor({ cfbPlayoffTeams: allPower4 })).toContain("The 12-team CFP must include at least one non-Power 4 team.");

    const missingChampion = validPicks.cfbPlayoffTeams.map((team) => team === "Texas Longhorns" ? "Boise State Broncos" : team);
    expect(errorsFor({ cfbPlayoffTeams: missingChampion })).toContain("The 12-team CFP must include every Power 4 champion you picked.");
  });

  it("requires one NFL champion per division", () => {
    expect(errorsFor({
      nflDivisionChampions: [
        "Buffalo Bills", "Miami Dolphins", "Houston Texans", "Kansas City Chiefs",
        "Dallas Cowboys", "Detroit Lions", "Tampa Bay Buccaneers", "San Francisco 49ers",
      ],
    })).toContain("NFL division champions must include exactly one team from each division.");
  });

  it("requires 7 AFC and 7 NFC playoff teams and all selected division champions", () => {
    expect(errorsFor({
      nflPlayoffTeams: [
        "Buffalo Bills", "Baltimore Ravens", "Houston Texans", "Kansas City Chiefs",
        "Cincinnati Bengals", "Los Angeles Chargers", "Miami Dolphins", "Pittsburgh Steelers",
        "Dallas Cowboys", "Detroit Lions", "Tampa Bay Buccaneers", "San Francisco 49ers",
        "Philadelphia Eagles", "Green Bay Packers",
      ],
    })).toContain("NFL playoffs must include exactly 7 AFC and 7 NFC teams.");

    const missingChampion = validPicks.nflPlayoffTeams.map((team) => team === "Buffalo Bills" ? "Pittsburgh Steelers" : team);
    expect(errorsFor({ nflPlayoffTeams: missingChampion })).toContain("NFL playoffs must include every division champion you picked.");
  });

  it("requires the four conference-title participants to be 2 AFC and 2 NFC", () => {
    expect(errorsFor({
      nflConferenceChampionshipTeams: ["Kansas City Chiefs", "Baltimore Ravens", "Buffalo Bills", "Dallas Cowboys"],
    })).toContain("Conference title teams must include exactly 2 AFC and 2 NFC teams.");
  });
});
