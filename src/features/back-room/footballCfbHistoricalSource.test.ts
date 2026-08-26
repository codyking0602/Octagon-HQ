import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const sourceManifestPath = "public/data/football/cfb/historical-player-seasons.source-manifest.json";

interface SourceAsset {
  season: number;
  path: string;
  gitBlobSha: string;
  bytes: number;
}

interface SourceManifest {
  schemaVersion: number;
  provider: string;
  repository: string;
  commit: string;
  license: string;
  seasonStart: number;
  seasonEnd: number;
  seasonCount: number;
  totalSourceBytes: number;
  assets: SourceAsset[];
}

const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8")) as SourceManifest;

const columns = [
  "game_id", "season", "team", "conference",
  "completion_player_id", "completion_player", "completion_yds",
  "rush_player_id", "rush_player", "rush_yds",
  "reception_player_id", "reception_player", "reception_yds",
  "touchdown_player_id", "touchdown_player", "touchdown_stat",
  "incompletion_player_id", "incompletion_player", "incompletion_stat",
  "interception_thrown_player_id", "interception_thrown_player", "interception_thrown_stat",
  "target_player_id", "target_player", "target_stat",
  "interception_player_id", "interception_player", "interception_stat",
  "sack_player_id", "sack_player", "sack_stat",
  "pass_breakup_player_id", "pass_breakup_player", "pass_breakup_stat",
  "fumble_forced_player_id", "fumble_forced_player", "fumble_forced_stat",
  "fumble_recovered_player_id", "fumble_recovered_player", "fumble_recovered_stat",
  "fumble_player_id", "fumble_player", "fumble_stat",
  "field_goal_attempt_player_id", "field_goal_attempt_player", "field_goal_attempt_stat",
  "field_goal_made_player_id", "field_goal_made_player", "field_goal_made_stat",
  "field_goal_missed_player_id", "field_goal_missed_player", "field_goal_missed_stat",
  "field_goal_blocked_player_id", "field_goal_blocked_player", "field_goal_blocked_stat"
];

function csvValue(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function fixtureCsv(season: number, rows: Array<Record<string, string | number | null>>) {
  const body = rows.map((row) => columns.map((column) => csvValue(row[column])).join(","));
  return `${columns.join(",")}\n${body.join("\n")}\n`;
}

describe("historical CFB player-season source adapter", () => {
  it("pins every 2014-2025 cfbfastR source asset without making those rows casual-game identities", () => {
    expect(sourceManifest).toMatchObject({
      schemaVersion: 1,
      provider: "cfbfastR",
      repository: "sportsdataverse/cfbfastR-data",
      commit: "a0f29f9ec6c04952a720905017e74a7b089dc1eb",
      license: "CC BY 4.0",
      seasonStart: 2014,
      seasonEnd: 2025,
      seasonCount: 12,
      totalSourceBytes: 459_746_124
    });
    expect(sourceManifest.assets.map((asset) => asset.season)).toEqual([
      2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025
    ]);
    for (const asset of sourceManifest.assets) {
      expect(asset.path).toBe(`player_stats/csv/player_stats_${asset.season}.csv`);
      expect(asset.gitBlobSha).toMatch(/^[a-f0-9]{40}$/);
      expect(asset.bytes).toBeGreaterThan(20_000_000);
    }

    expect(queryFootballSubjects({ sourceProvider: "cfbfastR" })).toHaveLength(0);
  });

  it("collapses play-level source rows into team-scoped player seasons and a coverage report", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-cfb-history-"));
    const sourceDir = path.join(tempRoot, "source");
    fs.mkdirSync(sourceDir, { recursive: true });

    fs.writeFileSync(path.join(sourceDir, "player_stats_2014.csv"), fixtureCsv(2014, [
      {
        game_id: 1, season: 2014, team: "Louisville", conference: "ACC",
        completion_player_id: 1, completion_player: "Lamar Jackson", completion_yds: 30,
        reception_player_id: 2, reception_player: "Receiver One", reception_yds: 30,
        target_player_id: 2, target_player: "Receiver One", target_stat: 1,
        touchdown_player_id: 2, touchdown_player: "Receiver One", touchdown_stat: 1
      },
      {
        game_id: 2, season: 2014, team: "Louisville", conference: "ACC",
        rush_player_id: 1, rush_player: "Lamar Jackson", rush_yds: 20,
        touchdown_player_id: 1, touchdown_player: "Lamar Jackson", touchdown_stat: 1
      },
      {
        game_id: 3, season: 2014, team: "Louisville", conference: "ACC",
        incompletion_player_id: 1, incompletion_player: "Lamar Jackson", incompletion_stat: 1,
        target_player_id: 2, target_player: "Receiver One", target_stat: 1
      },
      {
        game_id: 4, season: 2014, team: "Louisville", conference: "ACC",
        interception_thrown_player_id: 1, interception_thrown_player: "Lamar Jackson", interception_thrown_stat: 1,
        interception_player_id: 3, interception_player: "DB One", interception_stat: 1
      },
      {
        game_id: 5, season: 2014, team: "Louisville", conference: "ACC",
        sack_player_id: "4, 5", sack_player: "Edge One, Edge Two", sack_stat: 0.5
      }
    ]));

    fs.writeFileSync(path.join(sourceDir, "player_stats_2015.csv"), fixtureCsv(2015, [
      {
        game_id: 6, season: 2015, team: "Louisville", conference: "ACC",
        rush_player_id: 1, rush_player: "Lamar Jackson", rush_yds: 15
      }
    ]));

    const output = path.join(tempRoot, "corpus.json");
    const manifest = path.join(tempRoot, "manifest.json");
    const coverage = path.join(tempRoot, "coverage.json");

    try {
      execFileSync(process.execPath, [
        "scripts/import-football-cfb-historical-player-stats.mjs",
        "--source-dir", sourceDir,
        "--seasons", "2014,2015",
        "--output", output,
        "--manifest", manifest,
        "--coverage", coverage
      ], { cwd: process.cwd(), stdio: "pipe" });

      const corpus = JSON.parse(fs.readFileSync(output, "utf8")) as {
        recordKind: string;
        seasons: number[];
        columns: string[];
        rows: Array<Array<string | number | null>>;
        source: { provider: string; commit: string; license: string };
      };
      const generatedManifest = JSON.parse(fs.readFileSync(manifest, "utf8")) as {
        rowCount: number;
        sourceVerification: Array<{ verifiedPinnedBlob: boolean }>;
      };
      const generatedCoverage = JSON.parse(fs.readFileSync(coverage, "utf8")) as {
        totals: { sourceRowCount: number; normalizedRowCount: number; uniqueSourcePlayerCount: number };
        seasons: Array<{ season: number; normalizedRowCount: number }>;
      };

      expect(corpus.recordKind).toBe("player-season-team");
      expect(corpus.seasons).toEqual([2014, 2015]);
      expect(corpus.source).toMatchObject({
        provider: "cfbfastR",
        commit: "a0f29f9ec6c04952a720905017e74a7b089dc1eb",
        license: "CC BY 4.0"
      });

      const index = Object.fromEntries(corpus.columns.map((column, columnIndex) => [column, columnIndex]));
      const findRow = (season: number, sourcePlayerId: string) => corpus.rows.find((row) =>
        row[index.season] === season && row[index.sourcePlayerId] === sourcePlayerId
      );

      const lamar2014 = findRow(2014, "1");
      expect(lamar2014).toBeDefined();
      expect(lamar2014?.[index.playerName]).toBe("Lamar Jackson");
      expect(lamar2014?.[index.team]).toBe("Louisville");
      expect(lamar2014?.[index.gamesPlayed]).toBe(4);
      expect(lamar2014?.[index.passCompletions]).toBe(1);
      expect(lamar2014?.[index.passAttempts]).toBe(3);
      expect(lamar2014?.[index.passYards]).toBe(30);
      expect(lamar2014?.[index.passTouchdowns]).toBe(1);
      expect(lamar2014?.[index.interceptionsThrown]).toBe(1);
      expect(lamar2014?.[index.rushAttempts]).toBe(1);
      expect(lamar2014?.[index.rushYards]).toBe(20);
      expect(lamar2014?.[index.rushTouchdowns]).toBe(1);

      const receiver2014 = findRow(2014, "2");
      expect(receiver2014?.[index.receptions]).toBe(1);
      expect(receiver2014?.[index.targets]).toBe(2);
      expect(receiver2014?.[index.receivingYards]).toBe(30);
      expect(receiver2014?.[index.receivingTouchdowns]).toBe(1);
      expect(receiver2014?.[index.totalTouchdowns]).toBe(1);

      expect(findRow(2014, "3")?.[index.defensiveInterceptions]).toBe(1);
      expect(findRow(2014, "4")?.[index.sacks]).toBe(0.5);
      expect(findRow(2014, "5")?.[index.sacks]).toBe(0.5);
      expect(findRow(2015, "1")?.[index.rushYards]).toBe(15);

      expect(generatedManifest.rowCount).toBe(corpus.rows.length);
      expect(generatedManifest.sourceVerification.every((asset) => asset.verifiedPinnedBlob === false)).toBe(true);
      expect(generatedCoverage.totals).toMatchObject({
        sourceRowCount: 6,
        normalizedRowCount: corpus.rows.length,
        uniqueSourcePlayerCount: 5
      });
      expect(generatedCoverage.seasons.map((season) => season.season)).toEqual([2014, 2015]);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
