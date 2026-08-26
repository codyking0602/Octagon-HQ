import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getFootballSubject } from "./footballFactualStats";

const corpusDir = path.resolve(process.cwd(), "public/data/football/cfb/historical-player-seasons");
const manifest = JSON.parse(fs.readFileSync(path.join(corpusDir, "manifest.json"), "utf8")) as {
  coverage: { startSeason: number; endSeason: number };
  seasonCount: number;
  rowCount: number;
  uniqueAthleteCount: number;
  uniqueTeamIdCount: number;
  columnCount: number;
  columns: string[];
  source: {
    repository: string;
    releaseId: number;
    releaseTag: string;
    license: string;
    lockFile: string;
  };
  seasons: Array<{ season: number; rowCount: number; output: string; sourceSha256: string; outputSha256: string }>;
};

function loadSeason(season: number) {
  return JSON.parse(fs.readFileSync(path.join(corpusDir, `player-season-${season}.json`), "utf8")) as {
    schemaVersion: number;
    league: string;
    season: number;
    columns: string[];
    rowCount: number;
    rows: Array<Array<string | number>>;
  };
}

describe("historical CFB player-season corpus", () => {
  it("covers every season from 2004 through 2025 at real historical depth", () => {
    expect(manifest.coverage).toEqual({ startSeason: 2004, endSeason: 2025 });
    expect(manifest.seasonCount).toBe(22);
    expect(manifest.seasons.map((entry) => entry.season)).toEqual(
      Array.from({ length: 22 }, (_, index) => 2004 + index),
    );
    expect(manifest.rowCount).toBeGreaterThanOrEqual(140_000);
    expect(manifest.uniqueAthleteCount).toBeGreaterThanOrEqual(65_000);
    expect(manifest.uniqueTeamIdCount).toBeGreaterThanOrEqual(250);
    expect(manifest.seasons.every((entry) => entry.rowCount >= 3_500)).toBe(true);
  });

  it("locks the exact SportsDataverse release and every generated season hash", () => {
    expect(manifest.source).toMatchObject({
      repository: "sportsdataverse/sportsdataverse-data",
      releaseId: 334089407,
      releaseTag: "espn_cfb_player_box",
      license: "CC BY 4.0",
      lockFile: "scripts/football-cfb-historical-source-lock.json",
    });
    expect(manifest.seasons).toHaveLength(22);
    for (const entry of manifest.seasons) {
      expect(entry.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.outputSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(fs.existsSync(path.join(corpusDir, entry.output))).toBe(true);
    }
  });

  it("normalizes identity plus passing, rushing, receiving, defense, kicking and return facts", () => {
    expect(manifest.columnCount).toBe(37);
    expect(manifest.columns).toEqual(
      expect.arrayContaining([
        "id",
        "athlete_id",
        "athlete_name",
        "team_id",
        "season",
        "games",
        "pass_yds",
        "pass_td",
        "rush_yds",
        "rush_td",
        "rec",
        "rec_yds",
        "rec_td",
        "tackles_tot",
        "sacks",
        "def_int",
        "kick_ret_yds",
        "punt_ret_yds",
        "fgm",
        "fga",
        "punts",
      ]),
    );
  });

  it("keeps raw historical source depth out of casual game eligibility until reconciliation", () => {
    for (const season of [2004, 2015, 2025]) {
      const corpus = loadSeason(season);
      expect(corpus.season).toBe(season);
      expect(corpus.rowCount).toBe(manifest.seasons.find((entry) => entry.season === season)?.rowCount);
      expect(corpus.rows.length).toBe(corpus.rowCount);

      for (const row of corpus.rows.slice(0, 25)) {
        const sourceId = String(row[0]);
        expect(sourceId).toMatch(/^cfb-espn-/);
        expect(getFootballSubject(sourceId)).toBeNull();
      }
    }
  });
});
