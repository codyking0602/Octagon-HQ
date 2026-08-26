import { describe, expect, it } from "vitest";
import {
  CFB_COACH_SEASON_COLUMNS,
  CFB_COACH_STINT_COLUMNS,
  loadCfbCoachRelationships,
  normalizeFootballSourceNameKey,
} from "./lib/cfbCoachRelationships.mjs";

function records(corpus) {
  return corpus.rows.map((row) => Object.fromEntries(corpus.columns.map((column, index) => [column, row[index]])));
}

describe("CFB primary head-coach relationships", () => {
  it("materializes the pinned 2002-2025 source snapshot with the former-FBS Idaho exception", () => {
    const result = loadCfbCoachRelationships();
    expect(result.coachSeasons.columns).toEqual(CFB_COACH_SEASON_COLUMNS);
    expect(result.coachStints.columns).toEqual(CFB_COACH_STINT_COLUMNS);
    expect(result.coverage).toMatchObject({
      seasonStart: 2002,
      seasonEnd: 2025,
      programCount: 137,
      coachSeasonStopCount: 3109,
      coachStintCount: 686,
      sourceProgramCount: 136,
      sourceSeasonAssignmentCount: 3093,
      sourceStintCount: 681,
      exceptionProgramCount: 1,
      coachIdentityScope: "source-name-within-program",
    });

    const idahoStints = records(result.coachStints).filter((record) => record.programName === "Idaho");
    expect(idahoStints.map((record) => [record.coachName, record.startSeason, record.endSeason])).toEqual([
      ["Tom Cable", 2002, 2003],
      ["Nick Holt", 2004, 2005],
      ["Dennis Erickson", 2006, 2006],
      ["Robb Akey", 2007, 2012],
      ["Paul Petrino", 2013, 2017],
    ]);

    const idahoSeasons = records(result.coachSeasons).filter((record) => record.programName === "Idaho");
    expect(idahoSeasons).toHaveLength(16);
    expect(idahoSeasons[0]).toMatchObject({ season: 2002, coachName: "Tom Cable" });
    expect(idahoSeasons.at(-1)).toMatchObject({ season: 2017, coachName: "Paul Petrino" });
  });

  it("keeps one primary head coach per program-season and stable source-name identities across stops", () => {
    const result = loadCfbCoachRelationships();
    const seasons = records(result.coachSeasons);
    expect(new Set(seasons.map((record) => `${record.programName}:${record.season}`)).size).toBe(seasons.length);

    const nickSaban = seasons.filter((record) => record.coachName === "Nick Saban");
    expect(new Set(nickSaban.map((record) => record.sourceCoachNameKey))).toEqual(new Set(["nick-saban"]));
    expect(new Set(nickSaban.map((record) => record.sourceCoachStopKey))).toEqual(new Set([
      "nick-saban@alabama",
      "nick-saban@lsu",
    ]));

    const alabama = seasons.filter((record) => record.programName === "Alabama");
    expect(alabama.find((record) => record.season === 2023)?.coachName).toBe("Nick Saban");
    expect(alabama.find((record) => record.season === 2024)?.coachName).toBe("Kalen DeBoer");
  });

  it("normalizes punctuation and whitespace without changing the source display name", () => {
    expect(normalizeFootballSourceNameKey("  P. J. Fleck ")).toBe("p-j-fleck");
    expect(normalizeFootballSourceNameKey("Bill O'Brien")).toBe("bill-o-brien");
  });
});
