import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const root = "data/generated/football/relationships";

interface Corpus {
  columns: string[];
  rowCount: number;
  rows: Array<Array<string | number | boolean | string[] | null>>;
  source?: { championshipSignal?: ChampionshipSignal };
}

interface ChampionshipSignal {
  status: string;
  method: string;
  historicalCompleteness: string;
  knownExplicitSignalSeasons: number[];
}

function readJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8")) as T;
}

function rowObject(corpus: Corpus, row: Corpus["rows"][number]) {
  return Object.fromEntries(corpus.columns.map((column, index) => [column, row[index]]));
}

function sha256(name: string) {
  return createHash("sha256").update(fs.readFileSync(path.join(root, name), "utf8")).digest("hex");
}

describe("materialized Football game relationship corpus", () => {
  it("materializes deep CFB and NFL non-player relationship coverage with verified output hashes", () => {
    const manifest = readJson<{
      outputs: Array<{ file: string; sha256: string; rowCount: number }>;
      cfbSourceVerification: Array<{ verifiedPinnedBlob: boolean }>;
      nflSourceVerification: { verifiedPinnedBlob: boolean };
    }>("football-game-relationships.manifest.json");
    const expectedCounts = new Map([
      ["cfb-programs-2002-2025.json", 769],
      ["cfb-team-season-results-2002-2025.json", 7_468],
      ["cfb-games-2002-2025.json", 36_217],
      ["nfl-franchises-1999-2025.json", 32],
      ["nfl-team-season-results-1999-2025.json", 861],
      ["nfl-games-1999-2025.json", 7_276],
    ]);

    expect(manifest.outputs).toHaveLength(expectedCounts.size);
    for (const output of manifest.outputs) {
      expect(output.rowCount, output.file).toBe(expectedCounts.get(output.file));
      expect(output.sha256, output.file).toBe(sha256(output.file));
    }
    expect(manifest.cfbSourceVerification).toHaveLength(24);
    expect(manifest.cfbSourceVerification.every((asset) => asset.verifiedPinnedBlob)).toBe(true);
    expect(manifest.nflSourceVerification.verifiedPinnedBlob).toBe(true);
  });

  it("labels CFB championship evidence as an explicit partial source signal instead of complete title history", () => {
    const teams = readJson<Corpus>("cfb-team-season-results-2002-2025.json");
    const games = readJson<Corpus>("cfb-games-2002-2025.json");
    const coverage = readJson<{
      cfb: { explicitNationalChampionshipGameCount: number; championshipSignal: ChampionshipSignal };
    }>("football-game-relationships.coverage.json");

    expect(teams.columns).toContain("explicitNationalChampionshipGame");
    expect(teams.columns).toContain("explicitNationalChampion");
    expect(teams.columns).not.toContain("nationalChampion");
    expect(games.columns).toContain("explicitNationalChampionshipGame");
    expect(coverage.cfb.championshipSignal).toMatchObject({
      status: "explicit-source-note-only",
      historicalCompleteness: "partial",
      knownExplicitSignalSeasons: [2023, 2024, 2025],
    });
    expect(coverage.cfb.explicitNationalChampionshipGameCount).toBe(3);

    const ohioState2002 = teams.rows
      .map((row) => rowObject(teams, row))
      .find((row) => row.season === 2002 && row.sourceProgramId === "194");
    expect(ohioState2002).toMatchObject({
      programName: "Ohio State",
      explicitNationalChampionshipGame: false,
      explicitNationalChampion: false,
    });
  });

  it("reconciles historical NFL relocation codes into stable franchise identities", () => {
    const teams = readJson<Corpus>("nfl-team-season-results-1999-2025.json");
    const rams1999 = teams.rows
      .map((row) => rowObject(teams, row))
      .find((row) => row.season === 1999 && row.franchiseId === "LAR");

    expect(rams1999).toMatchObject({
      sourceTeamCode: "STL",
      regularSeasonWins: 13,
      regularSeasonLosses: 3,
      superBowlAppearance: true,
      superBowlChampion: true,
    });
  });

  it("keeps raw database depth separate from casual Football subject eligibility", () => {
    expect(queryFootballSubjects({ sourceProvider: "cfbfastR" })).toHaveLength(0);
    expect(queryFootballSubjects({ sourceProvider: "nflverse" })).toHaveLength(0);
  });
});
