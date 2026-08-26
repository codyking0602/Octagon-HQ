import { createHash } from "node:crypto";
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const playerCorpusPath = "data/generated/football/nfl/player-seasons-1999-2025.json";
const teamCorpusPath = "data/generated/football/nfl/team-seasons-1999-2025.json";
const manifestPath = "data/generated/football/nfl/historical-stats-1999-2025.manifest.json";
const coveragePath = "data/generated/football/nfl/historical-stats-1999-2025.coverage.json";

interface Manifest {
  seasonStart: number;
  seasonEnd: number;
  seasonCount: number;
  playerRowCount: number;
  teamRowCount: number;
  uniqueSourcePlayerCount: number;
  uniqueTeamCount: number;
  playerColumnCount: number;
  teamColumnCount: number;
  playerSha256: string;
  teamSha256: string;
  source: {
    provider: string;
    repository: string;
    dataRepositoryCommit: string;
    nflreadrCommit: string;
    license: string;
    assetFamily: string;
    summaryLevel: string;
  };
  sourceVerification: Array<{
    season: number;
    playerVerifiedPinnedAsset: boolean;
    teamVerifiedPinnedAsset: boolean;
  }>;
}

interface Coverage {
  totals: {
    playerRowCount: number;
    teamRowCount: number;
    uniqueSourcePlayerCount: number;
    uniqueTeamCount: number;
  };
  seasons: Array<{
    season: number;
    playerRowCount: number;
    teamRowCount: number;
    playerSourceColumnCount: number;
    teamSourceColumnCount: number;
  }>;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8")) as Coverage;

describe("generated historical NFL corpus", () => {
  it("locks complete regular-season depth to the pinned nflverse source", () => {
    expect(manifest).toMatchObject({
      seasonStart: 1999,
      seasonEnd: 2025,
      seasonCount: 27,
      playerRowCount: 49_514,
      teamRowCount: 862,
      uniqueSourcePlayerCount: 11_353,
      uniqueTeamCount: 33,
      playerColumnCount: 30,
      teamColumnCount: 21,
      source: {
        provider: "nflverse",
        repository: "nflverse/nflverse-data",
        dataRepositoryCommit: "9037aa840b8ff96ab3340d4c8a6daa403eed65f4",
        nflreadrCommit: "d072c08492067b578f27e562b6cc9c9e3b8589c3",
        license: "CC BY 4.0",
        assetFamily: "reg",
        summaryLevel: "regular",
      },
    });
    expect(manifest.sourceVerification).toHaveLength(27);
    expect(manifest.sourceVerification.every((asset) =>
      asset.playerVerifiedPinnedAsset && asset.teamVerifiedPinnedAsset
    )).toBe(true);
    expect(manifest.sourceVerification.map((asset) => asset.season)).toEqual(
      Array.from({ length: 27 }, (_, index) => 1999 + index),
    );
  });

  it("keeps both committed corpora byte-for-byte tied to their generated manifest", () => {
    const playerSha256 = createHash("sha256").update(fs.readFileSync(playerCorpusPath)).digest("hex");
    const teamSha256 = createHash("sha256").update(fs.readFileSync(teamCorpusPath)).digest("hex");
    expect(playerSha256).toBe(manifest.playerSha256);
    expect(teamSha256).toBe(manifest.teamSha256);
    expect(manifest.playerSha256).toBe("2b45f76f6ee14b2bb9e8de5a33d7b9270d6747cbbc63e1e1700bccf01497a2b5");
    expect(manifest.teamSha256).toBe("911b59c3abdcf2f06c040a61fee1f4ba65aeab3cc72f2afee6c9b42196fec85d");
  });

  it("proves league-complete team-season coverage across every covered season", () => {
    expect(coverage.totals).toEqual({
      playerRowCount: manifest.playerRowCount,
      teamRowCount: manifest.teamRowCount,
      uniqueSourcePlayerCount: manifest.uniqueSourcePlayerCount,
      uniqueTeamCount: manifest.uniqueTeamCount,
    });
    expect(coverage.seasons).toHaveLength(27);
    for (const season of coverage.seasons) {
      expect(season.playerRowCount, `${season.season}:players`).toBeGreaterThan(1_600);
      expect(season.playerSourceColumnCount, `${season.season}:player-columns`).toBe(148);
      expect(season.teamSourceColumnCount, `${season.season}:team-columns`).toBe(136);
      const expectedTeams = season.season === 2000 || season.season === 2001 ? 31 : 32;
      expect(season.teamRowCount, `${season.season}:teams`).toBe(expectedTeams);
    }
  });

  it("does not promote the deep nflverse warehouse directly into casual gameplay", () => {
    expect(queryFootballSubjects({ sourceProvider: "nflverse" })).toHaveLength(0);
  });
});
