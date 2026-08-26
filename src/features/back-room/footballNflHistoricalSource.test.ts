import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const sourceManifestPath = "public/data/football/nfl/historical-player-team-seasons.source-manifest.json";

interface SourceAsset {
  season: number;
  assetId: number;
  name: string;
  bytes: number;
  sha256: string;
  url: string;
}

interface ReleaseSnapshot {
  releaseId: number;
  seasonStart: number;
  seasonEnd: number;
  seasonCount: number;
  latestSchemaColumns: string[];
  assets: SourceAsset[];
}

interface SourceManifest {
  schemaVersion: number;
  provider: string;
  repository: string;
  dataRepositoryCommit: string;
  nflreadrCommit: string;
  license: string;
  seasonStart: number;
  seasonEnd: number;
  seasonCount: number;
  players: ReleaseSnapshot;
  teams: ReleaseSnapshot;
}

const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8")) as SourceManifest;

function csvValue(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(columns: string[], rows: Array<Record<string, string | number | null | undefined>>) {
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csvValue(row[column])).join(",")).join("\n")}\n`;
}

const playerColumns = [
  "player_id", "player_name", "player_display_name", "position", "position_group", "season", "season_type", "recent_team", "games",
  "completions", "attempts", "passing_yards", "passing_tds", "passing_interceptions",
  "carries", "rushing_yards", "rushing_tds", "receptions", "targets", "receiving_yards", "receiving_tds",
  "def_tackles_solo", "def_tackles_for_loss", "def_fumbles_forced", "def_sacks", "def_interceptions", "def_pass_defended",
  "fg_made", "fg_att", "pt_att", "pt_yards"
];

const teamColumns = [
  "season", "team", "season_type", "games", "completions", "attempts", "passing_yards", "passing_tds", "passing_interceptions",
  "carries", "rushing_yards", "rushing_tds", "receptions", "targets", "receiving_yards", "receiving_tds",
  "def_sacks", "def_interceptions", "fg_made", "fg_att", "pt_att", "pt_yards"
];

describe("historical NFL player/team source adapter", () => {
  it("pins complete closed-season nflverse coverage without promoting source rows into casual eligibility", () => {
    expect(sourceManifest).toMatchObject({
      schemaVersion: 1,
      provider: "nflverse",
      repository: "nflverse/nflverse-data",
      dataRepositoryCommit: "9037aa840b8ff96ab3340d4c8a6daa403eed65f4",
      nflreadrCommit: "d072c08492067b578f27e562b6cc9c9e3b8589c3",
      license: "CC BY 4.0",
      seasonStart: 1999,
      seasonEnd: 2025,
      seasonCount: 27
    });
    expect(sourceManifest.players.releaseId).toBe(236670328);
    expect(sourceManifest.teams.releaseId).toBe(236670540);

    for (const release of [sourceManifest.players, sourceManifest.teams]) {
      expect(release.assets).toHaveLength(27);
      expect(release.assets.map((asset) => asset.season)).toEqual(Array.from({ length: 27 }, (_, index) => 1999 + index));
      expect(release.assets.some((asset) => asset.season === 2026)).toBe(false);
      for (const asset of release.assets) {
        expect(asset.assetId).toBeGreaterThan(0);
        expect(asset.bytes).toBeGreaterThan(0);
        expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
        expect(asset.url).toContain(`/stats_${release === sourceManifest.players ? "player" : "team"}/`);
      }
    }

    expect(sourceManifest.players.latestSchemaColumns).toEqual(expect.arrayContaining([
      "player_id", "recent_team", "passing_yards", "rushing_yards", "receiving_yards", "def_sacks", "def_interceptions"
    ]));
    expect(sourceManifest.teams.latestSchemaColumns).toEqual(expect.arrayContaining([
      "season", "team", "passing_yards", "rushing_yards", "receiving_yards"
    ]));
    expect(queryFootballSubjects({ sourceProvider: "nflverse" })).toHaveLength(0);
  });

  it("normalizes player and team season summaries while preserving source identity and team labels as source data", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-nfl-history-"));
    const sourceDir = path.join(tempRoot, "source");
    fs.mkdirSync(sourceDir, { recursive: true });

    const player1999 = [
      {
        player_id: "qb-1", player_name: "Q. Back", player_display_name: "Quarter Back", position: "QB", position_group: "QB",
        season: 1999, season_type: "REG+POST", recent_team: "DAL", games: 16,
        completions: 300, attempts: 500, passing_yards: 4000, passing_tds: 30, passing_interceptions: 10,
        carries: 40, rushing_yards: 250, rushing_tds: 3
      },
      {
        player_id: "wr-1", player_name: "W. Receiver", player_display_name: "Wide Receiver", position: "WR", position_group: "WR",
        season: 1999, season_type: "REG+POST", recent_team: "DAL", games: 16,
        receptions: 90, targets: 130, receiving_yards: 1300, receiving_tds: 12
      }
    ];
    const player2000 = [
      {
        player_id: "qb-1", player_name: "Q. Back", player_display_name: "Quarter Back", position: "QB", position_group: "QB",
        season: 2000, season_type: "REG+POST", recent_team: "NE", games: 12,
        completions: 200, attempts: 320, passing_yards: 2500, passing_tds: 18, passing_interceptions: 8
      },
      {
        player_id: "edge-1", player_name: "E. Rusher", player_display_name: "Edge Rusher", position: "DE", position_group: "DL",
        season: 2000, season_type: "REG+POST", recent_team: "NE", games: 16,
        def_tackles_solo: 45, def_tackles_for_loss: 15, def_fumbles_forced: 4, def_sacks: 12.5, def_interceptions: 1, def_pass_defended: 5
      }
    ];

    fs.writeFileSync(path.join(sourceDir, "stats_player_regpost_1999.csv"), csv(playerColumns, player1999));
    fs.writeFileSync(path.join(sourceDir, "stats_player_regpost_2000.csv"), csv(playerColumns, player2000));
    fs.writeFileSync(path.join(sourceDir, "stats_team_regpost_1999.csv"), csv(teamColumns, [
      {
        season: 1999, team: "DAL", season_type: "REG+POST", games: 16,
        completions: 310, attempts: 520, passing_yards: 4200, passing_tds: 32, passing_interceptions: 12,
        carries: 450, rushing_yards: 1900, rushing_tds: 16, receptions: 310, targets: 520, receiving_yards: 4200, receiving_tds: 32,
        def_sacks: 42, def_interceptions: 18, fg_made: 24, fg_att: 30, pt_att: 70, pt_yards: 3200
      }
    ]));
    fs.writeFileSync(path.join(sourceDir, "stats_team_regpost_2000.csv"), csv(teamColumns, [
      {
        season: 2000, team: "NE", season_type: "REG+POST", games: 16,
        completions: 280, attempts: 470, passing_yards: 3500, passing_tds: 22, passing_interceptions: 14,
        carries: 430, rushing_yards: 1700, rushing_tds: 14, receptions: 280, targets: 470, receiving_yards: 3500, receiving_tds: 22,
        def_sacks: 48, def_interceptions: 20, fg_made: 25, fg_att: 31, pt_att: 65, pt_yards: 3000
      }
    ]));

    const playerOutput = path.join(tempRoot, "players.json");
    const teamOutput = path.join(tempRoot, "teams.json");
    const manifest = path.join(tempRoot, "manifest.json");
    const coverage = path.join(tempRoot, "coverage.json");

    try {
      execFileSync(process.execPath, [
        "scripts/import-football-nfl-historical-stats.mjs",
        "--source-dir", sourceDir,
        "--seasons", "1999,2000",
        "--player-output", playerOutput,
        "--team-output", teamOutput,
        "--manifest", manifest,
        "--coverage", coverage
      ], { cwd: process.cwd(), stdio: "pipe" });

      const players = JSON.parse(fs.readFileSync(playerOutput, "utf8")) as {
        columns: string[];
        rows: Array<Array<string | number | null>>;
        source: { provider: string; license: string; summaryLevel: string };
      };
      const teams = JSON.parse(fs.readFileSync(teamOutput, "utf8")) as {
        columns: string[];
        rows: Array<Array<string | number | null>>;
      };
      const generatedManifest = JSON.parse(fs.readFileSync(manifest, "utf8")) as {
        seasonCount: number;
        playerRowCount: number;
        teamRowCount: number;
        uniqueSourcePlayerCount: number;
        uniqueTeamCount: number;
        sourceVerification: Array<{ playerVerifiedPinnedAsset: boolean; teamVerifiedPinnedAsset: boolean }>;
      };
      const generatedCoverage = JSON.parse(fs.readFileSync(coverage, "utf8")) as {
        totals: { playerRowCount: number; teamRowCount: number };
        seasons: Array<{ season: number; playerRowCount: number; teamRowCount: number }>;
      };

      expect(players.source).toMatchObject({ provider: "nflverse", license: "CC BY 4.0", summaryLevel: "regpost" });
      const playerIndex = Object.fromEntries(players.columns.map((column, index) => [column, index]));
      const qb1999 = players.rows.find((row) => row[playerIndex.season] === 1999 && row[playerIndex.sourcePlayerId] === "qb-1");
      const qb2000 = players.rows.find((row) => row[playerIndex.season] === 2000 && row[playerIndex.sourcePlayerId] === "qb-1");
      expect(qb1999?.[playerIndex.playerDisplayName]).toBe("Quarter Back");
      expect(qb1999?.[playerIndex.recentTeam]).toBe("DAL");
      expect(qb1999?.[playerIndex.passingYards]).toBe(4000);
      expect(qb1999?.[playerIndex.rushingYards]).toBe(250);
      expect(qb2000?.[playerIndex.recentTeam]).toBe("NE");
      expect(players.rows.find((row) => row[playerIndex.sourcePlayerId] === "edge-1")?.[playerIndex.defensiveSacks]).toBe(12.5);

      const teamIndex = Object.fromEntries(teams.columns.map((column, index) => [column, index]));
      const dal = teams.rows.find((row) => row[teamIndex.season] === 1999 && row[teamIndex.team] === "DAL");
      expect(dal?.[teamIndex.passingYards]).toBe(4200);
      expect(dal?.[teamIndex.rushingYards]).toBe(1900);
      expect(dal?.[teamIndex.receivingYards]).toBe(4200);
      expect(dal?.[teamIndex.defensiveSacks]).toBe(42);

      expect(generatedManifest).toMatchObject({
        seasonCount: 2,
        playerRowCount: 4,
        teamRowCount: 2,
        uniqueSourcePlayerCount: 3,
        uniqueTeamCount: 2
      });
      expect(generatedManifest.sourceVerification.every((item) => !item.playerVerifiedPinnedAsset && !item.teamVerifiedPinnedAsset)).toBe(true);
      expect(generatedCoverage.totals).toEqual({ playerRowCount: 4, teamRowCount: 2, uniqueSourcePlayerCount: 3, uniqueTeamCount: 2 });
      expect(generatedCoverage.seasons.map((season) => season.season)).toEqual([1999, 2000]);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
