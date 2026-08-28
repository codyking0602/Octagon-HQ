import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { footballFactualCoverageMatrix } from "./footballFactualCoverageMatrix";
import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { footballFactualUniverseProjectedRecords } from "./footballFactualUniverseProjection";
import { getFootballSubject, queryFootballSubjects } from "./footballSubjectRegistry";

const tiers = ["A", "B", "C"] as const;

describe("Football Knowledge Ledger Stage 13 factual universe", () => {
  it("materially hydrates the post-gate A/B/C universe instead of raw database rows", () => {
    const actualUniverse = queryFootballSubjects({ recognizabilityTiers: [...tiers], includeProjectedCanonicalRecognition: true, includeProjectedSourceSubjects: true });
    const uniqueUniverse = new Set(actualUniverse.map((subject) => subject.id));
    expect(footballFactualCoverageMatrix.universeSubjects).toBe(uniqueUniverse.size);
    expect(footballFactualCoverageMatrix.universeSubjects).toBeGreaterThan(1_000);
    expect(footballFactualCoverageMatrix.factualRecordCount).toBeGreaterThan(500);
    expect(footballFactualCoverageMatrix.denominator).toContain("Tier D excluded");
  });

  it("keeps every permanent player pool visible with position-appropriate factual families", () => {
    const pools = ["QB", "RB", "WR", "TE", "OL", "DL / EDGE", "LB", "Secondary", "K / P"];
    for (const league of ["NFL", "CFB"] as const) {
      for (const pool of pools) {
        const row = footballFactualCoverageMatrix.rows.find((candidate) => candidate.league === league && candidate.pool === pool);
        expect(row, `${league} ${pool}`).toBeTruthy();
        expect(row!.universeSubjects, `${league} ${pool}`).toBeGreaterThan(0);
        expect(row!.readinessPct, `${league} ${pool}`).toBeGreaterThan(0);
        expect(row!.metricFamilySubjectCounts.relationship ?? 0, `${league} ${pool} relationships`).toBeGreaterThan(0);
      }
    }
    for (const league of ["NFL", "CFB"] as const) {
      for (const pool of ["DL / EDGE", "LB", "Secondary"]) {
        const row = footballFactualCoverageMatrix.rows.find((candidate) => candidate.league === league && candidate.pool === pool)!;
        expect((row.metricFamilySubjectCounts.defense ?? 0) + (row.metricFamilySubjectCounts.honors ?? 0), `${league} ${pool} defense/honors`).toBeGreaterThan(0);
      }
      const specialist = footballFactualCoverageMatrix.rows.find((candidate) => candidate.league === league && candidate.pool === "K / P")!;
      expect((specialist.metricFamilySubjectCounts.specialist ?? 0) + (specialist.metricFamilySubjectCounts.honors ?? 0), `${league} K/P specialist/honors`).toBeGreaterThan(0);
    }
  });

  it("does not turn structural player unknowns into zero facts", () => {
    for (const record of footballFactualUniverseProjectedRecords.filter((candidate) => candidate.scope.endsWith("player-career"))) {
      for (const fact of record.facts) {
        if (fact.value !== 0) continue;
        expect(fact.metricId.endsWith("field-goals-made"), `${record.subjectId}:${fact.metricId}`).toBe(true);
        const attempts = record.facts.find((candidate) => candidate.metricId.endsWith("field-goals-attempted"));
        expect(attempts?.value ?? 0).toBeGreaterThan(0);
      }
    }
    expect(getFootballFactualRecord("cfb-michael-dickson")?.facts.some((fact) => fact.metricId === "football-game-overtime")).not.toBe(true);
  });

  it("preserves separate NFL and CFB career identities for the same person", () => {
    const nfl = getFootballSubject("nfl-aaron-donald");
    const cfb = getFootballSubject("cfb-aaron-donald");
    expect(nfl?.league).toBe("NFL");
    expect(cfb?.league).toBe("CFB");
    expect(nfl?.id).not.toBe(cfb?.id);
    expect(getFootballFactualRecord(nfl!.id)?.subjectId).not.toBe(getFootballFactualRecord(cfb!.id)?.subjectId);
  });

  it("reconciles generated facts deterministically", () => {
    const projectionPath = path.resolve("data/generated/football/factual-universe-projection.json");
    const matrixPath = path.resolve("data/generated/football/factual-coverage-matrix.json");
    const beforeProjection = fs.readFileSync(projectionPath, "utf8");
    const beforeMatrix = fs.readFileSync(matrixPath, "utf8");
    execFileSync(process.execPath, ["scripts/generate-football-factual-universe.mjs"], { stdio: "pipe" });
    expect(fs.readFileSync(projectionPath, "utf8")).toBe(beforeProjection);
    expect(fs.readFileSync(matrixPath, "utf8")).toBe(beforeMatrix);
    const ids = footballFactualUniverseProjectedRecords.map((record) => record.subjectId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps generated factual data behind the canonical owner", () => {
    const root = path.resolve("src/features");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const target = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(target);
        else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".test.tsx")) {
          const text = fs.readFileSync(target, "utf8");
          if (text.includes("factual-universe-projection.json") && !target.endsWith("footballFactualUniverseProjection.ts")) offenders.push(path.relative(root, target));
        }
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });
});
