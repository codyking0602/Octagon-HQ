import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

function writeCsv(filePath: string, columns: string[], rows: Array<Record<string, string | number>>) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => String(row[column] ?? "")).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

describe("nflverse full-season summary selection", () => {
  it("prefers REG+POST for postseason entities and falls back to REG for everyone else", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-nfl-regpost-"));
    const sourceDir = path.join(tempRoot, "source");
    fs.mkdirSync(sourceDir, { recursive: true });

    writeCsv(
      path.join(sourceDir, "stats_player_regpost_1999.csv"),
      ["player_id", "season", "season_type", "recent_team", "games", "passing_yards"],
      [
        { player_id: "qb-playoff", season: 1999, season_type: "REG", recent_team: "DAL", games: 16, passing_yards: 3000 },
        { player_id: "qb-playoff", season: 1999, season_type: "POST", recent_team: "DAL", games: 2, passing_yards: 500 },
        { player_id: "qb-playoff", season: 1999, season_type: "REG+POST", recent_team: "DAL", games: 18, passing_yards: 3500 },
        { player_id: "qb-regular", season: 1999, season_type: "REG", recent_team: "DET", games: 16, passing_yards: 2800 },
      ],
    );
    writeCsv(
      path.join(sourceDir, "stats_team_regpost_1999.csv"),
      ["season", "team", "season_type", "games", "passing_yards"],
      [
        { season: 1999, team: "DAL", season_type: "REG", games: 16, passing_yards: 3000 },
        { season: 1999, team: "DAL", season_type: "POST", games: 2, passing_yards: 500 },
        { season: 1999, team: "DAL", season_type: "REG+POST", games: 18, passing_yards: 3500 },
        { season: 1999, team: "DET", season_type: "REG", games: 16, passing_yards: 2800 },
      ],
    );

    const playerOutput = path.join(tempRoot, "players.json");
    const teamOutput = path.join(tempRoot, "teams.json");
    const manifest = path.join(tempRoot, "manifest.json");
    const coverage = path.join(tempRoot, "coverage.json");

    try {
      execFileSync(process.execPath, [
        "scripts/import-football-nfl-historical-stats.mjs",
        "--source-dir", sourceDir,
        "--seasons", "1999",
        "--player-output", playerOutput,
        "--team-output", teamOutput,
        "--manifest", manifest,
        "--coverage", coverage,
      ], { cwd: process.cwd(), stdio: "pipe" });

      const players = JSON.parse(fs.readFileSync(playerOutput, "utf8")) as {
        columns: string[];
        rows: Array<Array<string | number | null>>;
        source: { summarySelection: string };
      };
      const teams = JSON.parse(fs.readFileSync(teamOutput, "utf8")) as {
        columns: string[];
        rows: Array<Array<string | number | null>>;
      };
      const generatedManifest = JSON.parse(fs.readFileSync(manifest, "utf8")) as {
        playerRowCount: number;
        teamRowCount: number;
        source: { summarySelection: string };
      };

      const playerIndex = Object.fromEntries(players.columns.map((column, index) => [column, index]));
      const teamIndex = Object.fromEntries(teams.columns.map((column, index) => [column, index]));
      const playoffPlayer = players.rows.find((row) => row[playerIndex.sourcePlayerId] === "qb-playoff");
      const regularPlayer = players.rows.find((row) => row[playerIndex.sourcePlayerId] === "qb-regular");
      const playoffTeam = teams.rows.find((row) => row[teamIndex.team] === "DAL");
      const regularTeam = teams.rows.find((row) => row[teamIndex.team] === "DET");

      expect(players.rows).toHaveLength(2);
      expect(playoffPlayer?.[playerIndex.games]).toBe(18);
      expect(playoffPlayer?.[playerIndex.passingYards]).toBe(3500);
      expect(regularPlayer?.[playerIndex.games]).toBe(16);
      expect(regularPlayer?.[playerIndex.passingYards]).toBe(2800);

      expect(teams.rows).toHaveLength(2);
      expect(playoffTeam?.[teamIndex.games]).toBe(18);
      expect(playoffTeam?.[teamIndex.passingYards]).toBe(3500);
      expect(regularTeam?.[teamIndex.games]).toBe(16);
      expect(regularTeam?.[teamIndex.passingYards]).toBe(2800);

      expect(players.source.summarySelection).toBe("prefer REG+POST, otherwise REG");
      expect(generatedManifest).toMatchObject({
        playerRowCount: 2,
        teamRowCount: 2,
        source: { summarySelection: "prefer REG+POST, otherwise REG" },
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
