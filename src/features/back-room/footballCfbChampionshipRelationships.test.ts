import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourcePath = "public/data/football/cfb/fbs-championship-history.source.json";
const programsPath = "data/generated/football/relationships/cfb-programs-2002-2025.json";
const selectionsPath = "data/generated/football/relationships/cfb-national-championships-2002-2025.json";
const summaryPath = "data/generated/football/relationships/cfb-program-championship-summary-2002-2025.json";
const manifestPath = "data/generated/football/relationships/cfb-championship-relationships.manifest.json";

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

describe("CFB national championship relationships", () => {
  it("covers every 2002-2025 FBS championship season from the vendored NCAA snapshot", () => {
    const source = readJson(sourcePath);
    expect(source).toMatchObject({
      schemaVersion: 1,
      league: "CFB",
      seasonStart: 2002,
      seasonEnd: 2025,
      seasonCount: 24,
      selectionCount: 25,
      source: {
        provider: "NCAA",
        url: "https://www.ncaa.com/history/football/fbs",
        verifiedAt: "2026-08-26",
      },
    });

    const bySeason = new Map<number, unknown[]>();
    for (const record of source.records) {
      const rows = bySeason.get(record.season) ?? [];
      rows.push(record);
      bySeason.set(record.season, rows);
    }
    expect([...bySeason.keys()].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 24 }, (_, index) => 2002 + index),
    );
    expect(bySeason.get(2003)).toHaveLength(2);
    expect(source.records.find((record: { season: number; programName: string }) =>
      record.season === 2004 && record.programName === "USC"
    )).toMatchObject({ sourceChampionName: "Southern California*", sourceAsterisked: true });
  });

  it("reconciles every champion selection to an existing CFB program identity", () => {
    const source = readJson(sourcePath);
    const programs = readJson(programsPath);
    const idIndex = programs.columns.indexOf("sourceProgramId");
    const nameIndex = programs.columns.indexOf("programName");
    const programNameById = new Map<string, string>(
      programs.rows.map((row: unknown[]) => [String(row[idIndex]), String(row[nameIndex])]),
    );

    for (const record of source.records) {
      expect(programNameById.get(String(record.sourceProgramId)), `${record.season}:${record.programName}`)
        .toBe(record.programName);
    }
  });

  it("materializes stable selection and program-summary outputs", () => {
    const selections = readJson(selectionsPath);
    const summary = readJson(summaryPath);
    const manifest = readJson(manifestPath);

    expect(selections).toMatchObject({ seasonCount: 24, selectionCount: 25 });
    expect(summary.programCount).toBe(12);
    expect(manifest.splitTitleSeasons).toEqual([2003]);

    const selectionIndex = Object.fromEntries(
      selections.columns.map((column: string, index: number) => [column, index]),
    );
    const season2003 = selections.rows.filter((row: unknown[]) => row[selectionIndex.season] === 2003);
    expect(season2003).toHaveLength(2);
    expect(season2003.every((row: unknown[]) => row[selectionIndex.splitTitle] === true)).toBe(true);

    const summaryIndex = Object.fromEntries(
      summary.columns.map((column: string, index: number) => [column, index]),
    );
    const findProgram = (name: string) => summary.rows.find((row: unknown[]) => row[summaryIndex.programName] === name);
    expect(findProgram("Alabama")?.[summaryIndex.championshipSelectionCount]).toBe(6);
    expect(findProgram("Ohio State")?.[summaryIndex.championshipSelectionCount]).toBe(3);
    expect(findProgram("Texas")?.[summaryIndex.seasons]).toEqual([2005]);
    expect(findProgram("Indiana")?.[summaryIndex.seasons]).toEqual([2025]);
  });

  it("rebuilds byte-identical generated outputs from the tracked source snapshot", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "octagon-cfb-championships-"));
    const output = path.join(tempRoot, "selections.json");
    const summary = path.join(tempRoot, "summary.json");
    const manifest = path.join(tempRoot, "manifest.json");

    try {
      execFileSync(process.execPath, [
        "scripts/import-football-cfb-championship-relationships.mjs",
        "--output", output,
        "--summary", summary,
        "--manifest", manifest,
      ], { cwd: process.cwd(), stdio: "pipe" });

      expect(fs.readFileSync(output, "utf8")).toBe(fs.readFileSync(selectionsPath, "utf8"));
      expect(fs.readFileSync(summary, "utf8")).toBe(fs.readFileSync(summaryPath, "utf8"));
      expect(fs.readFileSync(manifest, "utf8")).toBe(fs.readFileSync(manifestPath, "utf8"));

      const trackedManifest = readJson(manifestPath);
      expect(trackedManifest.outputs.selections.sha256).toBe(sha256(fs.readFileSync(selectionsPath, "utf8")));
      expect(trackedManifest.outputs.programSummary.sha256).toBe(sha256(fs.readFileSync(summaryPath, "utf8")));
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
