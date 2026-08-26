import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceManifestPath = "public/data/football/football-game-relationships.source-manifest.json";

interface SourceManifest {
  cfb: {
    provider: string;
    repository: string;
    commit: string;
    license: string;
    seasonStart: number;
    seasonEnd: number;
    seasonCount: number;
    totalSourceBytes: number;
    assets: Array<{ season: number; path: string; gitBlobSha: string; bytes: number }>;
  };
  nfl: {
    provider: string;
    repository: string;
    commit: string;
    license: string;
    nflreadrCommit: string;
    seasonStart: number;
    seasonEnd: number;
    asset: { name: string; path: string; gitBlobSha: string; bytes: number };
  };
}

const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8")) as SourceManifest;

function csv(rows: Array<Array<string | number | boolean | null>>) {
  return `${rows.map((row) => row.map((value) => {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function readCorpus(outputDir: string, name: string) {
  return JSON.parse(fs.readFileSync(path.join(outputDir, name), "utf8")) as {
    columns: string[];
    rows: Array<Array<string | number | boolean | string[] | null>>;
    rowCount: number;
  };
}

function rowObject(corpus: ReturnType<typeof readCorpus>, row: ReturnType<typeof readCorpus>["rows"][number]) {
  return Object.fromEntries(corpus.columns.map((column, index) => [column, row[index]]));
}

describe("Football game relationship source adapter", () => {
  it("pins licensed historical CFB and NFL schedule owners by immutable source identity", () => {
    expect(sourceManifest.cfb).toMatchObject({
      provider: "cfbfastR",
      repository: "sportsdataverse/cfbfastR-data",
      commit: "a0f29f9ec6c04952a720905017e74a7b089dc1eb",
      license: "CC BY 4.0",
      seasonStart: 2002,
      seasonEnd: 2025,
      seasonCount: 24,
      totalSourceBytes: 8_376_486,
    });
    expect(sourceManifest.cfb.assets).toHaveLength(24);
    expect(sourceManifest.cfb.assets.map((asset) => asset.season)).toEqual(Array.from({ length: 24 }, (_, index) => 2002 + index));
    for (const asset of sourceManifest.cfb.assets) {
      expect(asset.path).toBe(`schedules/csv/cfb_schedules_${asset.season}.csv`);
      expect(asset.gitBlobSha).toMatch(/^[a-f0-9]{40}$/);
      expect(asset.bytes).toBeGreaterThan(100_000);
    }

    expect(sourceManifest.nfl).toMatchObject({
      provider: "nflverse",
      repository: "nflverse/nfldata",
      commit: "13e5420b10ca4e9dca03a3dcb7148f873ab3a301",
      license: "CC BY 4.0",
      nflreadrCommit: "d072c08492067b578f27e562b6cc9c9e3b8589c3",
      seasonStart: 1999,
      seasonEnd: 2025,
      asset: {
        name: "games.csv",
        path: "data/games.csv",
        gitBlobSha: "9d74dcb6a326ad57e6e98f15cfee8142fbadcfed",
        bytes: 2_177_174,
      },
    });
  });

  it("builds programs, franchises, team results, games and explicit championship relationships without game-specific facts", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-football-relations-"));
    const sourceDir = path.join(tempRoot, "source");
    const cfbDir = path.join(sourceDir, "cfb");
    const nflDir = path.join(sourceDir, "nfl");
    const outputDir = path.join(tempRoot, "output");
    fs.mkdirSync(cfbDir, { recursive: true });
    fs.mkdirSync(nflDir, { recursive: true });

    const cfbHeader = [
      "game_id", "season", "week", "season_type", "start_date", "completed", "neutral_site", "conference_game",
      "home_id", "home_team", "home_division", "home_conference", "home_points",
      "away_id", "away_team", "away_division", "away_conference", "away_points", "notes",
    ];
    fs.writeFileSync(path.join(cfbDir, "cfb_schedules_2024.csv"), csv([
      cfbHeader,
      ["cfb-1", 2024, 1, "regular", "2024-09-07", true, false, false, 130, "Michigan", "fbs", "Big Ten", 12, 251, "Texas", "fbs", "SEC", 31, null],
      ["cfb-2", 2024, 8, "regular", "2024-10-19", true, true, true, 251, "Texas", "fbs", "SEC", 15, 61, "Georgia", "fbs", "SEC", 30, null],
      ["cfb-3", 2024, 1, "postseason", "2025-01-20", true, true, false, 194, "Ohio State", "fbs", "Big Ten", 31, 251, "Texas", "fbs", "SEC", 34, "College Football Playoff National Championship"],
    ]));

    const nflHeader = ["game_id", "season", "game_type", "week", "gameday", "away_team", "away_score", "home_team", "home_score", "overtime"];
    fs.writeFileSync(path.join(nflDir, "games.csv"), csv([
      nflHeader,
      ["2024_01_NYG_DAL", 2024, "REG", 1, "2024-09-08", "NYG", 20, "DAL", 30, false],
      ["2024_19_GB_DAL", 2024, "WC", 19, "2025-01-12", "GB", 21, "DAL", 24, false],
      ["2024_21_DAL_PHI", 2024, "CON", 21, "2025-01-26", "DAL", 27, "PHI", 24, false],
      ["2024_22_DAL_KC", 2024, "SB", 22, "2025-02-09", "DAL", 31, "KC", 28, false],
    ]));

    try {
      execFileSync(process.execPath, [
        "scripts/import-football-game-relationships.mjs",
        "--source-dir", sourceDir,
        "--cfb-seasons", "2024",
        "--nfl-seasons", "2024",
        "--output-dir", outputDir,
      ], { cwd: process.cwd(), stdio: "pipe" });

      const programs = readCorpus(outputDir, "cfb-programs-2002-2025.json");
      const cfbTeamSeasons = readCorpus(outputDir, "cfb-team-season-results-2002-2025.json");
      const cfbGames = readCorpus(outputDir, "cfb-games-2002-2025.json");
      const franchises = readCorpus(outputDir, "nfl-franchises-1999-2025.json");
      const nflTeamSeasons = readCorpus(outputDir, "nfl-team-season-results-1999-2025.json");
      const nflGames = readCorpus(outputDir, "nfl-games-1999-2025.json");

      expect(programs.rowCount).toBe(4);
      const texasProgram = programs.rows.map((row) => rowObject(programs, row)).find((row) => row.sourceProgramId === "251");
      expect(texasProgram).toMatchObject({ programName: "Texas", firstSeason: 2024, lastSeason: 2024, seasonCount: 1, latestDivision: "fbs", latestConference: "SEC" });

      const texasSeason = cfbTeamSeasons.rows.map((row) => rowObject(cfbTeamSeasons, row)).find((row) => row.sourceProgramId === "251");
      expect(texasSeason).toMatchObject({
        regularSeasonGames: 2, regularSeasonWins: 1, regularSeasonLosses: 1,
        postseasonGames: 1, postseasonWins: 1,
        overallGames: 3, overallWins: 2, overallLosses: 1,
        conferenceGames: 1, conferenceLosses: 1,
        nationalChampionshipGame: true, nationalChampion: true,
      });
      expect(cfbGames.rows.map((row) => rowObject(cfbGames, row)).find((row) => row.sourceGameId === "cfb-3")).toMatchObject({
        winnerProgramId: "251", loserProgramId: "194", nationalChampionshipGame: true,
      });

      expect(franchises.rowCount).toBe(5);
      const dallasSeason = nflTeamSeasons.rows.map((row) => rowObject(nflTeamSeasons, row)).find((row) => row.franchiseId === "DAL");
      expect(dallasSeason).toMatchObject({
        regularSeasonGames: 1, regularSeasonWins: 1,
        postseasonGames: 3, postseasonWins: 3,
        overallGames: 4, overallWins: 4,
        playoffBerth: true, conferenceChampionshipGame: true, superBowlAppearance: true, superBowlChampion: true,
      });
      expect(nflGames.rows.map((row) => rowObject(nflGames, row)).find((row) => row.gameType === "SB")).toMatchObject({
        winnerFranchiseId: "DAL", loserFranchiseId: "KC", superBowl: true,
      });

      const coverage = JSON.parse(fs.readFileSync(path.join(outputDir, "football-game-relationships.coverage.json"), "utf8")) as {
        cfb: { nationalChampionshipGameCount: number };
        nfl: { playoffGameCount: number; superBowlCount: number };
      };
      expect(coverage.cfb.nationalChampionshipGameCount).toBe(1);
      expect(coverage.nfl).toMatchObject({ playoffGameCount: 3, superBowlCount: 1 });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
