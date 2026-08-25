import { describe, expect, it } from "vitest";
import {
  footballFindLeaderMetricDefinitions,
  footballFindLeaderSubjects,
  getFootballFindLeaderFact,
  type FootballFindLeaderMetricId,
} from "./footballFactualStatsCatalog";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStatsCore";

const canonicalMetricByLegacyMetric: Readonly<Record<FootballFindLeaderMetricId, FootballFactMetricId>> = {
  "qb-games": "nfl-career-games",
  "qb-completions": "nfl-career-passing-completions",
  "qb-attempts": "nfl-career-passing-attempts",
  "qb-passing-yards": "nfl-career-passing-yards",
  "qb-passing-touchdowns": "nfl-career-passing-touchdowns",
  "qb-interceptions": "nfl-career-interceptions-thrown",
  "qb-passer-rating": "nfl-career-passer-rating",
  "qb-completion-pct": "nfl-career-completion-percentage",
  "qb-yards-per-attempt": "nfl-career-passing-yards-per-attempt",
  "qb-touchdown-pct": "nfl-career-passing-touchdown-percentage",
  "qb-passing-yards-per-game": "nfl-career-passing-yards-per-game",
  "qb-passing-touchdowns-per-game": "nfl-career-passing-touchdowns-per-game",
  "qb-completions-per-game": "nfl-career-passing-completions-per-game",
  "qb-attempts-per-game": "nfl-career-passing-attempts-per-game",
  "qb-td-int-ratio": "nfl-career-passing-touchdown-interception-ratio",
  "rb-games": "nfl-career-games",
  "rb-rushing-attempts": "nfl-career-rushing-attempts",
  "rb-rushing-yards": "nfl-career-rushing-yards",
  "rb-rushing-touchdowns": "nfl-career-rushing-touchdowns",
  "rb-receptions": "nfl-career-receptions",
  "rb-receiving-yards": "nfl-career-receiving-yards",
  "rb-receiving-touchdowns": "nfl-career-receiving-touchdowns",
  "rb-rush-yards-per-attempt": "nfl-career-rushing-yards-per-attempt",
  "rb-rushing-yards-per-game": "nfl-career-rushing-yards-per-game",
  "rb-rushing-touchdowns-per-game": "nfl-career-rushing-touchdowns-per-game",
  "rb-receptions-per-game": "nfl-career-receptions-per-game",
  "rb-receiving-yards-per-game": "nfl-career-receiving-yards-per-game",
  "rb-scrimmage-yards": "nfl-career-scrimmage-yards",
  "rb-scrimmage-yards-per-game": "nfl-career-scrimmage-yards-per-game",
  "rb-scrimmage-touchdowns": "nfl-career-scrimmage-touchdowns",
  "cfb-points-for": "cfb-team-points-for",
  "cfb-points-against": "cfb-team-points-against",
  "cfb-points-per-game": "cfb-team-points-per-game",
  "cfb-opponent-points-per-game": "cfb-team-opponent-points-per-game",
  "cfb-point-differential": "cfb-team-point-differential",
  "cfb-scoring-margin-per-game": "cfb-team-scoring-margin-per-game",
  "cfb-points-ratio": "cfb-team-points-for-against-ratio",
  "cfb-differential-rate-pct": "cfb-team-differential-rate-percentage",
  "cfb-total-points": "cfb-team-total-points",
  "cfb-srs": "cfb-team-srs",
  "cfb-sos": "cfb-team-sos",
};

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
    expect(footballFindLeaderMetricDefinitions).toHaveLength(41);

    for (const subject of footballFindLeaderSubjects) {
      const definitions = footballFindLeaderMetricDefinitions.filter(({ domainId }) => domainId === subject.domainId);
      for (const definition of definitions) {
        const legacy = getFootballFindLeaderFact(subject.id, definition.id);
        const canonical = getFootballFact(subject.id, canonicalMetricByLegacyMetric[definition.id]);
        expect(legacy, `${subject.id}:${definition.id} legacy`).not.toBeNull();
        expect(canonical, `${subject.id}:${definition.id} canonical`).not.toBeNull();
        expect(canonical?.fact.value, `${subject.id}:${definition.id}`).toBe(legacy?.value);
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
