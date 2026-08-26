import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

function writeCorpus(filePath: string, corpus: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(corpus)}\n`);
}

const cfbColumns = [
  "season", "sourceProgramId", "programName", "division", "conference",
  "regularSeasonGames", "regularSeasonWins", "regularSeasonLosses", "regularSeasonTies",
  "postseasonGames", "postseasonWins", "postseasonLosses", "postseasonTies",
  "overallGames", "overallWins", "overallLosses", "overallTies", "pointsFor", "pointsAgainst",
  "conferenceGames", "conferenceWins", "conferenceLosses", "conferenceTies",
  "explicitNationalChampionshipGame", "explicitNationalChampion"
];

const cfbChampionshipColumns = [
  "season", "sourceProgramId", "programName", "sourceChampionName",
  "sourceSeasonSelectingOrganizations", "splitTitle", "sourceAsterisked"
];

const nflColumns = [
  "season", "franchiseId", "sourceTeamCode",
  "regularSeasonGames", "regularSeasonWins", "regularSeasonLosses", "regularSeasonTies",
  "postseasonGames", "postseasonWins", "postseasonLosses", "postseasonTies",
  "overallGames", "overallWins", "overallLosses", "overallTies", "pointsFor", "pointsAgainst",
  "playoffBerth", "conferenceChampionshipGame", "superBowlAppearance", "superBowlChampion"
];

const coachColumns = [
  "sourceCoachStintKey", "sourceCoachStopKey", "sourceCoachNameKey", "coachName", "identityScope", "franchiseId", "sourceTeamCodes",
  "startSeason", "endSeason", "seasonCount",
  "regularSeasonGames", "regularSeasonWins", "regularSeasonLosses", "regularSeasonTies",
  "postseasonGames", "postseasonWins", "postseasonLosses", "postseasonTies",
  "overallGames", "overallWins", "overallLosses", "overallTies", "pointsFor", "pointsAgainst",
  "playoffSeasons", "conferenceChampionshipGameSeasons", "superBowlAppearances", "superBowlChampionships"
];

function cfbRow(season: number, wins: number) {
  const losses = 12 - wins;
  return [
    season, "251", "Texas", "fbs", "Big 12",
    12, wins, losses, 0,
    0, 0, 0, 0,
    12, wins, losses, 0,
    400 + wins, 200 + losses,
    9, Math.min(wins, 9), Math.max(0, 9 - wins), 0,
    false, false
  ];
}

function nflRow(season: number, wins: number, champion = false) {
  const losses = 16 - wins;
  return [
    season, "NE", "NE",
    16, wins, losses, 0,
    champion ? 3 : 0, champion ? 3 : 0, 0, 0,
    16 + (champion ? 3 : 0), wins + (champion ? 3 : 0), losses, 0,
    450 + wins, 280 + losses,
    true, champion, champion, champion
  ];
}

describe("Football era relationship builder", () => {
  it("creates objective contiguous era windows without assigning dynasty eligibility", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-football-era-"));
    const inputDir = path.join(root, "input");
    const outputDir = path.join(root, "output");

    try {
      writeCorpus(path.join(inputDir, "cfb-team-season-results-2002-2025.json"), {
        schemaVersion: 1,
        league: "CFB",
        recordKind: "team-season-results",
        columns: cfbColumns,
        rows: [cfbRow(2001, 10), cfbRow(2002, 11), cfbRow(2003, 12), cfbRow(2004, 9)]
      });
      writeCorpus(path.join(inputDir, "cfb-national-championships-2002-2025.json"), {
        schemaVersion: 1,
        league: "CFB",
        recordKind: "national-championship-selection",
        columns: cfbChampionshipColumns,
        rows: [[2003, "251", "Texas", "Texas", "BCS", false, false]]
      });
      writeCorpus(path.join(inputDir, "nfl-team-season-results-1999-2025.json"), {
        schemaVersion: 1,
        league: "NFL",
        recordKind: "team-season-results",
        columns: nflColumns,
        rows: [nflRow(2001, 11, true), nflRow(2002, 9), nflRow(2003, 14, true), nflRow(2004, 14, true)]
      });
      writeCorpus(path.join(inputDir, "nfl-coach-stints-1999-2025.json"), {
        schemaVersion: 1,
        league: "NFL",
        recordKind: "coach-stint",
        columns: coachColumns,
        rows: [[
          "bill-belichick@NE:2000-2023", "bill-belichick@NE", "bill-belichick", "Bill Belichick", "source-name-within-franchise", "NE", ["NE"],
          2000, 2023, 24,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0
        ]]
      });

      execFileSync(process.execPath, [
        "scripts/build-football-era-relationships.mjs",
        "--input-dir", inputDir,
        "--output-dir", outputDir,
        "--min-window", "3",
        "--max-window", "4"
      ], { cwd: process.cwd(), stdio: "pipe" });

      const cfb = JSON.parse(fs.readFileSync(path.join(outputDir, "cfb-era-windows-2002-2025.json"), "utf8")) as {
        columns: string[];
        rows: Array<Array<unknown>>;
      };
      const nfl = JSON.parse(fs.readFileSync(path.join(outputDir, "nfl-era-windows-1999-2025.json"), "utf8")) as {
        columns: string[];
        rows: Array<Array<unknown>>;
      };
      const coverage = JSON.parse(fs.readFileSync(path.join(outputDir, "football-era-relationships.coverage.json"), "utf8")) as {
        rule: string;
        cfb: { rowCount: number; championshipSourceCompleteness: string };
        nfl: { rowCount: number; singleCoachWindowCount: number };
      };

      expect(cfb.rows).toHaveLength(3);
      expect(nfl.rows).toHaveLength(3);
      const cfbIndex = Object.fromEntries(cfb.columns.map((column, index) => [column, index]));
      const nflIndex = Object.fromEntries(nfl.columns.map((column, index) => [column, index]));

      const texasFourYear = cfb.rows.find((row) => row[cfbIndex.startSeason] === 2001 && row[cfbIndex.endSeason] === 2004);
      expect(texasFourYear?.[cfbIndex.seasons]).toEqual([2001, 2002, 2003, 2004]);
      expect(texasFourYear?.[cfbIndex.regularSeasonWins]).toBe(42);
      expect(texasFourYear?.[cfbIndex.nationalChampionshipSelections]).toBe(1);
      expect(texasFourYear?.[cfbIndex.nationalChampionshipSeasons]).toBe(1);
      expect(texasFourYear?.[cfbIndex.championshipSourceCompleteness]).toBe("complete-2002-2025-fbs");
      expect(cfb.columns).not.toContain("recognizabilityTier");
      expect(cfb.columns).not.toContain("casualEligible");

      const patriotsFourYear = nfl.rows.find((row) => row[nflIndex.startSeason] === 2001 && row[nflIndex.endSeason] === 2004);
      expect(patriotsFourYear?.[nflIndex.superBowlChampionships]).toBe(3);
      expect(patriotsFourYear?.[nflIndex.sourceCoachNameKey]).toBe("bill-belichick");
      expect(patriotsFourYear?.[nflIndex.coachName]).toBe("Bill Belichick");
      expect(nfl.columns).not.toContain("recognizabilityTier");
      expect(nfl.columns).not.toContain("casualEligible");

      expect(coverage.rule).toContain("dynasty/game eligibility is deliberately not assigned");
      expect(coverage.cfb).toMatchObject({ rowCount: 3, championshipSourceCompleteness: "complete-2002-2025-fbs" });
      expect(coverage.nfl).toMatchObject({ rowCount: 3, singleCoachWindowCount: 3 });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
