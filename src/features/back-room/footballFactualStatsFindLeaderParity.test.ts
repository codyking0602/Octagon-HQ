import { describe, expect, it } from "vitest";
import {
  footballFindLeaderMetricDefinitions,
  footballFindLeaderSubjects,
  type FootballFindLeaderMetricId,
} from "./footballFactualStatsCatalog";
import { getFootballFact } from "./footballFactualStatsCore";
import { footballFindLeaderCanonicalMetricByMetric, footballFindLeaderMetricRows } from "./footballFindLeaderModel";

const derivedLegacyMetrics = new Set<FootballFindLeaderMetricId>([
  "qb-passer-rating", "qb-completion-pct", "qb-yards-per-attempt", "qb-touchdown-pct",
  "qb-passing-yards-per-game", "qb-passing-touchdowns-per-game", "qb-completions-per-game",
  "qb-attempts-per-game", "qb-td-int-ratio", "rb-rush-yards-per-attempt",
  "rb-rushing-yards-per-game", "rb-rushing-touchdowns-per-game", "rb-receptions-per-game",
  "rb-receiving-yards-per-game", "rb-scrimmage-yards", "rb-scrimmage-yards-per-game",
  "rb-scrimmage-touchdowns", "cfb-point-differential", "cfb-scoring-margin-per-game",
  "cfb-points-ratio", "cfb-differential-rate-pct", "cfb-total-points",
]);

describe("Football Find the Leader canonical factual parity", () => {
  it("reproduces every current subject and applicable metric with traceable canonical evidence", () => {
    expect(footballFindLeaderSubjects).toHaveLength(75);
    expect(footballFindLeaderMetricDefinitions).toHaveLength(48);

    for (const subject of footballFindLeaderSubjects) {
      const definitions = footballFindLeaderMetricDefinitions.filter(({ domainId }) => domainId === subject.domainId);
      for (const definition of definitions) {
        const canonical = getFootballFact(subject.id, footballFindLeaderCanonicalMetricByMetric[definition.id]);
        expect(canonical, `${subject.id}:${definition.id} canonical`).not.toBeNull();
        expect(footballFindLeaderMetricRows(definition.id).find(({ id }) => id === subject.id)?.value).toBe(canonical?.fact.value);
        expect(canonical?.sources.length, `${subject.id}:${definition.id} sources`).toBeGreaterThan(0);
        expect(canonical?.sources.every(({ reviewedOn }) => reviewedOn.length > 0)).toBe(true);
        if (derivedLegacyMetrics.has(definition.id)) {
          expect(canonical?.fact.evidence.kind, `${subject.id}:${definition.id} derivation`).toBe("derived");
          expect(canonical?.fact.evidence.formula?.trim().length, `${subject.id}:${definition.id} formula`).toBeGreaterThan(0);
        }
      }
    }
  });
});
