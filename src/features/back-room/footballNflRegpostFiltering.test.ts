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

describe("nflverse dedicated regular-season authority", () => {
  it("rejects postseason rows instead of silently filtering a mixed source", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-nfl-regular-"));
    const sourceDir = path.join(tempRoot, "source");
    fs.mkdirSync(sourceDir, { recursive: true });

    writeCsv(
      path.join(sourceDir, "stats_player_reg_1999.csv"),
      ["player_id", "season", "season_type", "recent_team", "games", "passing_yards"],
      [
        { player_id: "qb-1", season: 1999, season_type: "REG", recent_team: "DAL", games: 16, passing_yards: 3000 },
        { player_id: "qb-2", season: 1999, season_type: "POST", recent_team: "DAL", games: 2, passing_yards: 500 },
      ],
    );
    writeCsv(
      path.join(sourceDir, "stats_team_reg_1999.csv"),
      ["season", "team", "season_type", "games", "passing_yards"],
      [{ season: 1999, team: "DAL", season_type: "REG", games: 16, passing_yards: 3000 }],
    );

    const playerOutput = path.join(tempRoot, "players.json");
    const teamOutput = path.join(tempRoot, "teams.json");
    const manifest = path.join(tempRoot, "manifest.json");
    const coverage = path.join(tempRoot, "coverage.json");

    try {
      expect(() => execFileSync(process.execPath, [
        "scripts/import-football-nfl-historical-stats.mjs",
        "--source-dir", sourceDir,
        "--seasons", "1999",
        "--player-output", playerOutput,
        "--team-output", teamOutput,
        "--manifest", manifest,
        "--coverage", coverage,
      ], { cwd: process.cwd(), stdio: "pipe" })).toThrow();
      expect(fs.existsSync(playerOutput)).toBe(false);
      expect(fs.existsSync(teamOutput)).toBe(false);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
