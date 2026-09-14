import { describe, expect, it } from "vitest";
import {
  NFL_DIVISION_TEAM_SEASONS,
  nflDivisionTeamSeasonPresentation,
} from "./nflDivisionTeamSeasonPresentation";

describe("NFL Divisions team-season presentation metadata", () => {
  it("covers four seasons for every NFL franchise and sixteen subjects per division", () => {
    const rows = Object.values(NFL_DIVISION_TEAM_SEASONS);
    expect(rows).toHaveLength(128);

    const teamCounts = new Map<string, number>();
    const divisionCounts = new Map<string, number>();
    for (const row of rows) {
      teamCounts.set(row.teamCode, (teamCounts.get(row.teamCode) ?? 0) + 1);
      divisionCounts.set(row.divisionLabel, (divisionCounts.get(row.divisionLabel) ?? 0) + 1);
    }

    expect(teamCounts.size).toBe(32);
    expect([...teamCounts.values()].every((count) => count === 4)).toBe(true);
    expect(divisionCounts.size).toBe(8);
    expect([...divisionCounts.values()].every((count) => count === 16)).toBe(true);
  });

  it("keeps the approved high-signal NFL season descriptors factual and concise", () => {
    expect(nflDivisionTeamSeasonPresentation("nfl-division-dal-2016")?.summary).toBe("13-3 · NFC East Champion");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-sf-2023")?.summary).toBe("12-5 · NFC Champion");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-phi-2022")?.summary).toBe("14-3 · NFC Champion");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-tb-2020")?.summary).toBe("11-5 · Super Bowl Champion");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-sea-2013")?.summary).toBe("13-3 · Super Bowl Champion");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-bal-2019")?.summary).toBe("14-2 · AFC North Champion");
  });

  it("preserves historical franchise names for historical seasons", () => {
    expect(nflDivisionTeamSeasonPresentation("nfl-division-lv-2002")?.teamName).toBe("Oakland Raiders");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-lar-1999")?.teamName).toBe("St. Louis Rams");
    expect(nflDivisionTeamSeasonPresentation("nfl-division-lac-2006")?.teamName).toBe("San Diego Chargers");
  });
});
