import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const relationshipsDir = "data/generated/football/relationships";
const cfbEraPath = `${relationshipsDir}/cfb-championship-eras-2002-2025.json`;
const manifestPath = `${relationshipsDir}/football-era-relationships.manifest.json`;
const coveragePath = `${relationshipsDir}/football-era-relationships.coverage.json`;
const nflCoachStintsPath = `${relationshipsDir}/nfl-coach-stints-1999-2025.json`;

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

describe("Football objective era relationship sources", () => {
  it("derives only multi-title CFB clusters and never promotes them to dynasties or casual eligibility", () => {
    const cfb = readJson(cfbEraPath);
    expect(cfb).toMatchObject({
      schemaVersion: 1,
      league: "CFB",
      recordKind: "championship-era",
      eraBasis: {
        type: "multi-title-championship-cluster",
        maxAdjacentTitleGap: 4,
        minimumChampionshipSelections: 2,
      },
      resultSemantics: {
        metricBasis: "source-observed-team-season-results",
        postseasonCompleteness: "not-guaranteed",
      },
      seasonStart: 2002,
      seasonEnd: 2025,
      rowCount: 6,
    });

    expect(cfb.columns).not.toEqual(expect.arrayContaining([
      "dynasty",
      "recognizabilityTier",
      "casualEligible",
      "postseasonWins",
      "overallWins",
    ]));
    expect(cfb.columns).toEqual(expect.arrayContaining([
      "sourceObservedGames",
      "sourceObservedWins",
      "sourceObservedLosses",
    ]));

    const index = Object.fromEntries(cfb.columns.map((column: string, columnIndex: number) => [column, columnIndex]));
    const byProgram = new Map<string, unknown[]>(cfb.rows.map((row: unknown[]) => [String(row[index.programName]), row]));
    expect([...byProgram.keys()].sort()).toEqual([
      "Alabama",
      "Clemson",
      "Florida",
      "Georgia",
      "LSU",
      "USC",
    ]);

    expect(byProgram.get("Alabama")?.[index.startSeason]).toBe(2009);
    expect(byProgram.get("Alabama")?.[index.endSeason]).toBe(2020);
    expect(byProgram.get("Alabama")?.[index.championshipSelectionSeasons]).toEqual([2009, 2011, 2012, 2015, 2017, 2020]);
    expect(byProgram.get("Alabama")?.[index.championshipSelectionCount]).toBe(6);
    expect(byProgram.get("Georgia")?.[index.championshipSelectionSeasons]).toEqual([2021, 2022]);
    expect(byProgram.get("LSU")?.[index.championshipSelectionSeasons]).toEqual([2003, 2007]);
    expect(byProgram.get("USC")?.[index.splitTitleSelectionCount]).toBe(1);
    expect(byProgram.get("USC")?.[index.sourceAsteriskedSelectionCount]).toBe(1);

    expect(byProgram.has("Texas")).toBe(false);
    expect(byProgram.has("Ohio State")).toBe(false);
  });

  it("uses the complete NCAA championship owner instead of the partial schedule championship flags", () => {
    const cfb = readJson(cfbEraPath);
    expect(cfb.source.championshipRelationships.path).toBe("cfb-national-championships-2002-2025.json");
    expect(cfb.source.championshipRelationships.source.provider).toBe("NCAA");
    expect(cfb.source.teamSeasonRelationships.source.championshipSignal).toMatchObject({
      historicalCompleteness: "partial",
    });
  });

  it("references existing NFL coach stints as natural contiguous eras instead of duplicating them", () => {
    const manifest = readJson(manifestPath);
    const coverage = readJson(coveragePath);
    const coachStintsText = fs.readFileSync(nflCoachStintsPath, "utf8");
    const coachStints = JSON.parse(coachStintsText);

    expect(manifest.nfl).toMatchObject({
      relationshipOwner: "existing-coach-stint-corpus",
      recordKind: "coach-stint",
      path: "nfl-coach-stints-1999-2025.json",
      rowCount: 246,
    });
    expect(manifest.nfl.sha256).toBe(sha256(coachStintsText));
    expect(manifest.nfl.rowCount).toBe(coachStints.rows.length);
    expect(coverage.nfl.stintCount).toBe(246);
    expect(coverage.cfb.clusterCount).toBe(6);
    expect(coverage.cfb.resultSemantics.postseasonCompleteness).toBe("not-guaranteed");
  });

  it("rebuilds byte-identical CFB era, manifest, and coverage outputs", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-football-eras-"));
    try {
      execFileSync(process.execPath, [
        "scripts/build-football-era-relationships.mjs",
        "--input-dir", relationshipsDir,
        "--output-dir", tempRoot,
      ], { cwd: process.cwd(), stdio: "pipe" });

      for (const fileName of [
        "cfb-championship-eras-2002-2025.json",
        "football-era-relationships.manifest.json",
        "football-era-relationships.coverage.json",
      ]) {
        expect(fs.readFileSync(path.join(tempRoot, fileName), "utf8"))
          .toBe(fs.readFileSync(path.join(relationshipsDir, fileName), "utf8"));
      }
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
