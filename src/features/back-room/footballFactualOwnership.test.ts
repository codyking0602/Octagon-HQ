import { describe, expect, it } from "vitest";
import {
  footballFindLeaderMetricDefinitions as canonicalMetrics,
  footballFindLeaderSubjects as canonicalSubjects,
  getFootballFindLeaderFact as canonicalGetFact,
} from "./footballFactualStatsCatalog";
import {
  footballFindLeaderMetricDefinitions as compatibilityMetrics,
  footballFindLeaderSubjects as compatibilitySubjects,
  getFootballFindLeaderFact as compatibilityGetFact,
} from "./footballFindLeaderStats";
import {
  footballFindLeaderSubjects as barrelSubjects,
  getFootballFindLeaderFact as barrelGetFact,
} from "./footballFactualStats";

describe("Football factual ownership", () => {
  it("keeps the factual catalog as the single runtime owner of shared stat data", () => {
    expect(compatibilitySubjects).toBe(canonicalSubjects);
    expect(compatibilityMetrics).toBe(canonicalMetrics);
    expect(compatibilityGetFact).toBe(canonicalGetFact);
    expect(barrelSubjects).toBe(canonicalSubjects);
    expect(barrelGetFact).toBe(canonicalGetFact);
  });

  it("preserves Find the Leader fact behavior through the compatibility surface", () => {
    expect(compatibilityGetFact("peyton-manning", "qb-passing-yards")?.value).toBe(71940);
    expect(compatibilityGetFact("2005-texas", "cfb-points-for")?.value).toBe(652);
  });
});
