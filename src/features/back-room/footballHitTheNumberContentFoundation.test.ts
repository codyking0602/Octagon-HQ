import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import {
  FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  FOOTBALL_HIT_THE_NUMBER_VERSION,
  createFootballHitTheNumberPlan,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberSubjectIdentityKey,
  footballHitTheNumberSubjects,
  getFootballHitTheNumberSubject,
  type FootballHitTheNumberContentKind,
} from "./footballHitTheNumberModel";

const metricById = new Map(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.map((metric) => [metric.metricId, metric]));

describe("Football Hit the Number content foundation", () => {
  it("makes peak seasons and team seasons core while keeping raw career totals special", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_VERSION).toBe("football-hit-the-number-v3");
    expect(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["peak-season"])
      .toBeGreaterThan(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["career-special"]);
    expect(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["team-season"])
      .toBeGreaterThan(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["career-special"]);

    expect(metricById.get("nfl-season-passing-yards")?.contentKind).toBe("peak-season");
    expect(metricById.get("cfb-best-season-rushing-yards")?.contentKind).toBe("peak-season");
    expect(metricById.get("cfb-best-season-receiving-yards")?.contentKind).toBe("peak-season");
    expect(metricById.get("nfl-team-overall-wins")?.contentKind).toBe("team-season");
    expect(metricById.get("nfl-team-postseason-wins")?.contentKind).toBe("accomplishment");
    expect(metricById.get("cfb-team-postseason-wins")?.contentKind).toBe("accomplishment");
    expect(metricById.get("cfb-heisman-awards")?.contentKind).toBe("accomplishment");
    expect(metricById.get("nfl-career-passing-yards")?.contentKind).toBe("career-special");

    expect(metricById.has("cfb-team-srs")).toBe(false);
    expect(metricById.has("cfb-team-sos")).toBe(false);
  });

  it("dedupes compatibility and projected identities for the same real season", () => {
    const identityKeys = footballHitTheNumberSubjects.map(footballHitTheNumberSubjectIdentityKey);
    expect(new Set(identityKeys).size).toBe(identityKeys.length);
  });

  it("generates source-backed boards with peak/team/accomplishment variety and rare career trivia", () => {
    const contentCounts = new Map<FootballHitTheNumberContentKind, number>([
      ["peak-season", 0],
      ["team-season", 0],
      ["accomplishment", 0],
      ["career-special", 0],
    ]);
    const runs = 360;

    for (let index = 0; index < runs; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-htn-foundation-${index}`, "random-pool");
      const metric = metricById.get(plan.metricId);
      expect(metric, plan.metricId).toBeDefined();
      contentCounts.set(metric!.contentKind, contentCounts.get(metric!.contentKind)! + 1);
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);

      const identities = plan.subjectIds.map((subjectId) => {
        const subject = getFootballHitTheNumberSubject(subjectId);
        expect(subject, subjectId).not.toBeNull();
        const fact = getFootballFact(subjectId, plan.metricId);
        expect(fact, `${plan.metricId}:${subjectId}`).not.toBeNull();
        expect(fact!.sources.length).toBeGreaterThan(0);
        return footballHitTheNumberSubjectIdentityKey(subject!);
      });
      expect(new Set(identities).size).toBe(identities.length);
    }

    expect(contentCounts.get("peak-season")).toBeGreaterThan(0);
    expect(contentCounts.get("team-season")).toBeGreaterThan(0);
    expect(contentCounts.get("accomplishment")).toBeGreaterThan(0);
    expect(contentCounts.get("career-special")).toBeGreaterThan(0);
    expect(contentCounts.get("career-special")! / runs).toBeLessThan(0.2);
    expect(contentCounts.get("peak-season")!).toBeGreaterThan(contentCounts.get("career-special")! * 2);
  }, 90_000);
});
