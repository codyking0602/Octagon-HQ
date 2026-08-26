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

describe("nflverse regular-season authority", () => {
  it("selects REG summaries from mixed REG/POST/REG+POST assets", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-nfl-regular-"));
    const sourceDir = path.join(tempRoot, "source");
    fs.mkdirSync(sourceDir, { recursive: true });

    writeCsv(
      path.join(sourceDir, "stats_player_regpost_1999.csv"),
      ["player_id", "season", "season_type", "recent_team", "games", "passing_yards"],
      [
        { player_id: "qb-1", season: 1999, season_type: "REG", recent_team: "DAL", games: 16, passing_yards: 3000 },
        { player_id: "qb-1", season: 1999, season_type: "POST", recent_team: "DAL", games: 2, passing_yards: 500 },
        { player_id: "qb-1", season: 1999, season_type: "REG+POST", recent_team: "DAL", games: 18, passing_yards: 3500 },
        { player_id: "qb-2", season: 1999, season_type: "REG", recent_team: "CLE", games: 16, passing_yards: 2500 },
      ],
    );
    writeCsv(
      path.join(sourceDir, "stats_team_regpost_1999.csv"),
      ["season", "team", "season_type", "games", "passing_yards"],
      [
        { season: 1999, team: "DAL", season_type: "REG", games: 16, passing_yards: 3000 },
        { season: 1999, team: "DAL", season_type: "REG+POST", games: 18, passing_yards: 3500 },
        { season: 1999, team: "CLE", season_type: "REG", games: 16, passing_yards: 2500 },
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
        source: { summaryLevel: string };
      };
      const teams = JSON.parse(fs.readFileSync(teamOutput, "utf8")) as {
        columns: string[];
        rows: Array<Array<string | number | null>>;
      };
      const generatedManifest = JSON.parse(fs.readFileSync(manifest, "utf8")) as {
        playerRowCount: number;
        teamRowCount: number;
      };

      const playerIndex = Object.fromEntries(players.columns.map((column, index) => [column, index]));
      const teamIndex = Object.fromEntries(teams.columns.map((column, index) => [column, index]));
      const dalPlayer = players.rows.find((row) => row[playerIndex.sourcePlayerId] === "qb-1");
      const dalTeam = teams.rows.find((row) => row[teamIndex.team] === "DAL");

      expect(players.source.summaryLevel).toBe("regular");
      expect(players.rows).toHaveLength(2);
      expect(dalPlayer?.[playerIndex.games]).toBe(16);
      expect(dalPlayer?.[playerIndex.passingYards]).toBe(3000);
      expect(teams.rows).toHaveLength(2);
      expect(dalTeam?.[teamIndex.games]).toBe(16);
      expect(dalTeam?.[teamIndex.passingYards]).toBe(3000);
      expect(generatedManifest).toMatchObject({ playerRowCount: 2, teamRowCount: 2 });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
