import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { getFootballSubject } from "./footballSubjectRegistry";
import { footballFindLeaderMetricRows } from "./footballFindLeaderModel";

const corpusPath = "public/data/football/cfb/player-season-2025.json";
const manifestPath = "public/data/football/cfb/player-season-2025.manifest.json";

interface BulkCorpus {
  schemaVersion: number;
  league: string;
  athleticYear: string;
  statSeason: number;
  columns: string[];
  rowCount: number;
  rows: Array<Array<string | number | null>>;
}

interface BulkManifest {
  rowCount: number;
  uniqueAthleteCount: number;
  columnCount: number;
  sha256: string;
  source: { commit: string; license: string };
}

const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8")) as BulkCorpus;
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as BulkManifest;

describe("Football CFB bulk factual corpus", () => {
  it("vendors tens of thousands of real player-season stat rows from one pinned source", () => {
    expect(corpus.schemaVersion).toBe(1);
    expect(corpus.league).toBe("CFB");
    expect(corpus.athleticYear).toBe("2025-26");
    expect(corpus.statSeason).toBe(2025);
    expect(corpus.rowCount).toBe(34_982);
    expect(corpus.rows).toHaveLength(34_982);
    expect(manifest.rowCount).toBe(corpus.rowCount);
    expect(manifest.uniqueAthleteCount).toBe(corpus.rowCount);
    expect(manifest.columnCount).toBe(corpus.columns.length);
    expect(manifest.source.commit).toBe("9789928e911091186bab979cc772e874c47a83f1");
    expect(manifest.source.license).toBe("CC0-1.0");
    expect(manifest.sha256).toMatch(/^[a-f0-9]{64}$/);

    expect(corpus.columns).toEqual(expect.arrayContaining([
      "athlete_id",
      "first_name",
      "last_name",
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
    ]));

    const athleteIndex = corpus.columns.indexOf("athlete_id");
    const ids = corpus.rows.map((row) => row[athleteIndex]);
    expect(new Set(ids).size).toBe(corpus.rowCount);
  });

  it("keeps bulk depth separate from casual-game recognizability eligibility", () => {
    const athleteIndex = corpus.columns.indexOf("athlete_id");
    const bulkOnlySample = corpus.rows.slice(0, 250).filter((row) => {
      const athleteId = row[athleteIndex];
      return typeof athleteId === "string" && getFootballSubject(athleteId) == null;
    });
    expect(bulkOnlySample.length).toBeGreaterThan(200);

    for (const metricId of [
      "cfb-player-rushing-yards",
      "cfb-player-rushing-touchdowns",
      "cfb-player-receptions",
      "cfb-player-receiving-yards",
      "cfb-player-receiving-touchdowns",
    ] as const) {
      const rows = footballFindLeaderMetricRows(metricId);
      expect(rows.length, metricId).toBeGreaterThanOrEqual(11);
      for (const row of rows) {
        expect(getFootballSubject(row.id), `${metricId}:${row.id}`).not.toBeNull();
      }
    }
  });
});
