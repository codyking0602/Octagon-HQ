import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  footballFindLeaderMetricDefinitions as canonicalMetrics,
  footballFindLeaderSubjects as canonicalSubjects,
} from "./footballFactualStatsCatalog";
import {
  footballFindLeaderMetricDefinitions as compatibilityMetrics,
  footballFindLeaderSubjects as compatibilitySubjects,
} from "./footballFindLeaderStats";
import {
  footballFindLeaderSubjects as barrelSubjects,
} from "./footballFactualStats";

describe("Football factual ownership", () => {
  it("keeps the factual catalog as the single runtime owner of shared stat data", () => {
    expect(compatibilitySubjects).toBe(canonicalSubjects);
    expect(compatibilityMetrics).toBe(canonicalMetrics);
    expect(barrelSubjects).toBe(canonicalSubjects);
  });

  it("makes the Find the Leader model consume the canonical ledger directly", () => {
    const source = readFileSync("src/features/back-room/footballFindLeaderModel.ts", "utf8");
    expect(source).toContain("getFootballFact");
    expect(source).toContain("formatFootballFact");
    expect(source).not.toContain("getFootballFindLeaderFact");
    expect(source).not.toContain("formatFootballFindLeaderFact");
  });
});
