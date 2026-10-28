import { createHash } from "node:crypto";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const corpusPath = "data/generated/football/cfb/player-seasons-2014-2025.json";
const manifestPath = "data/generated/football/cfb/player-seasons-2014-2025.manifest.json";
const coveragePath = "data/generated/football/cfb/player-seasons-2014-2025.coverage.json";

interface Manifest {
  seasonStart: number;
  seasonEnd: number;
  seasonCount: number;
  rowCount: number;
  sourceRowCount: number;
  uniqueSourcePlayerCount: number;
  teamCount: number;
  conferenceCount: number;
  columnCount: number;
  sha256: string;
  source: { provider: string; repository: string; commit: string; license: string };
  sourceVerification: Array<{ season: number; verifiedPinnedBlob: boolean }>;
}

interface Coverage {
  totals: {
    sourceRowCount: number;
    normalizedRowCount: number;
    uniqueSourcePlayerCount: number;
    teamCount: number;
    conferenceCount: number;
  };
  seasons: Array<{
    season: number;
    normalizedRowCount: number;
    passingPlayerCount: number;
    rushingPlayerCount: number;
    receivingPlayerCount: number;
    defensivePlayerCount: number;
  }>;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8")) as Coverage;

describe("generated historical CFB corpus", () => {
  it("locks multi-season depth and exact pinned-source verification", () => {
    expect(manifest).toMatchObject({
      seasonStart: 2014,
      seasonEnd: 2025,
      seasonCount: 12,
      rowCount: 113_224,
      sourceRowCount: 1_637_447,
      uniqueSourcePlayerCount: 40_077,
      teamCount: 332,
      conferenceCount: 51,
      columnCount: 29,
      source: {
        provider: "cfbfastR",
        repository: "sportsdataverse/cfbfastR-data",
        commit: "a0f29f9ec6c04952a720905017e74a7b089dc1eb",
        license: "CC BY 4.0",
      },
    });
    expect(manifest.sourceVerification).toHaveLength(12);
    expect(manifest.sourceVerification.every((asset) => asset.verifiedPinnedBlob)).toBe(true);
    expect(manifest.sourceVerification.map((asset) => asset.season)).toEqual([
      2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
    ]);
  });

  it("keeps the committed corpus byte-for-byte tied to its generated manifest", () => {
    const sha256 = createHash("sha256").update(fs.readFileSync(corpusPath)).digest("hex");
    expect(sha256).toBe(manifest.sha256);
    expect(manifest.sha256).toBe("4581bd4dbaae886e9136e4a81421dc88c6b046dd6ee9a06fd0477dfc133bc71b");
  });

  it("proves useful depth across every covered season and major stat family", () => {
    expect(coverage.totals).toEqual({
      sourceRowCount: manifest.sourceRowCount,
      normalizedRowCount: manifest.rowCount,
      uniqueSourcePlayerCount: manifest.uniqueSourcePlayerCount,
      teamCount: manifest.teamCount,
      conferenceCount: manifest.conferenceCount,
    });
    expect(coverage.seasons).toHaveLength(12);
    for (const season of coverage.seasons) {
      expect(season.normalizedRowCount, `${season.season}:rows`).toBeGreaterThan(4_000);
      expect(season.passingPlayerCount, `${season.season}:passing`).toBeGreaterThan(800);
      expect(season.rushingPlayerCount, `${season.season}:rushing`).toBeGreaterThan(1_400);
      expect(season.receivingPlayerCount, `${season.season}:receiving`).toBeGreaterThan(2_000);
      expect(season.defensivePlayerCount, `${season.season}:defense`).toBeGreaterThan(800);
    }
  });
});
