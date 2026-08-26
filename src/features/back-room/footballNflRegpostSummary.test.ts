import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

function csv(columns: string[], rows: Array<Record<string, string | number>>) {
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => row[column] ?? "").join(",")).join("\n")}\n`;
}

describe("nflverse REG+POST summary filtering", () => {
  it("ignores REG and POST component rows and keeps only the combined season summary", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-nfl-regpost-"));
    const sourceDir = path.join(tempRoot, "source");
    fs.mkdirSync(sourceDir, { recursive: true });

    const playerColumns = [
      "player_id", "player_name", "player_display_name", "position", "position_group",
      "season", "season_type", "recent_team", "games", "passing_yards"
    ];
    const teamColumns = ["season", "team", "season_type", "games", "passing_yards"];

    fs.writeFileSync(path.join(sourceDir, "stats_player_regpost_1999.csv"), csv(playerColumns, [
      { player_id: "qb-1", player_name: "Q Back", player_display_name: "Quarter Back", position: "QB", position_group: "QB", season: 1999, season_type: "REG", recent_team: "DAL", games: 16, passing_yards: 9999 },
      { player_id: "qb-1", player_name: "Q Back", player_display_name: "Quarter Back", position: "QB", position_group: "QB", season: 1999, season_type: "POST", recent_team: "DAL", games: 2, passing_yards: 8888 },
      { player_id: "qb-1", player_name: "Q Back", player_display_name: "Quarter Back", position: "QB", position_group: "QB", season: 1999, season_type: "REG+POST", recent_team: "DAL", games: 18, passing_yards: 4321 }
    ]));

    fs.writeFileSync(path.join(sourceDir, "stats_team_regpost_1999.csv"), csv(teamColumns, [
      { season: 1999, team: "DAL", season_type: "REG", games: 16, passing_yards: 9999 },
      { season: 1999, team: "DAL", season_type: "POST", games: 2, passing_yards: 8888 },
      { season: 1999, team: "DAL", season_type: "REG+POST", games: 18, passing_yards: 4321 }
    ]));

    const playerOutput = path.join(tempRoot, "players.json");
    const teamOutput = path.join(tempRoot, "teams.json");

    try {
      execFileSync(process.execPath, [
        "scripts/import-football-nfl-historical-stats.mjs",
        "--source-dir", sourceDir,
        "--seasons", "1999",
        "--player-output", playerOutput,
        "--team-output", teamOutput,
        "--manifest", path.join(tempRoot, "manifest.json"),
        "--coverage", path.join(tempRoot, "coverage.json")
      ], { cwd: process.cwd(), stdio: "pipe" });

      const players = JSON.parse(fs.readFileSync(playerOutput, "utf8")) as { columns: string[]; rows: Array<Array<string | number | null>> };
      const teams = JSON.parse(fs.readFileSync(teamOutput, "utf8")) as { columns: string[]; rows: Array<Array<string | number | null>> };
      const playerIndex = Object.fromEntries(players.columns.map((column, index) => [column, index]));
      const teamIndex = Object.fromEntries(teams.columns.map((column, index) => [column, index]));

      expect(players.rows).toHaveLength(1);
      expect(players.rows[0][playerIndex.games]).toBe(18);
      expect(players.rows[0][playerIndex.passingYards]).toBe(4321);
      expect(teams.rows).toHaveLength(1);
      expect(teams.rows[0][teamIndex.games]).toBe(18);
      expect(teams.rows[0][teamIndex.passingYards]).toBe(4321);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
