import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import { queryFootballSubjects } from "./footballSubjectRegistry";
import {
  FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG,
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
  it("keeps approved season/team metrics primary with only recognizable QB career touchdowns as the career special", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_VERSION).toBe("football-hit-the-number-v5");
    expect(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["peak-season"])
      .toBeGreaterThan(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["career-special"]);
    expect(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["team-season"])
      .toBeGreaterThan(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["career-special"]);

    expect(metricById.get("nfl-season-passing-yards")?.contentKind).toBe("peak-season");
    expect(metricById.get("nfl-team-overall-wins")?.contentKind).toBe("team-season");
    expect(metricById.get("cfb-team-point-differential")?.contentKind).toBe("team-season");
    expect(metricById.get("nfl-career-passing-touchdowns")?.contentKind).toBe("career-special");
    expect([...metricById.values()].some((metric) => metric.contentKind === "accomplishment")).toBe(false);

    expect(metricById.has("nfl-career-passing-yards")).toBe(false);
    expect(metricById.has("nfl-career-rushing-yards")).toBe(false);
    expect(metricById.has("nfl-career-receiving-yards")).toBe(false);
    expect(metricById.has("cfb-heisman-awards")).toBe(false);
    expect(metricById.has("cfb-team-postseason-wins")).toBe(false);
    expect(FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.some((theme) => /running back|receiver|heisman/i.test(theme.label))).toBe(false);
  });

  it("exports only unique playable subjects from the canonical registry's casual-recognition population", () => {
    const identityKeys = footballHitTheNumberSubjects.map(footballHitTheNumberSubjectIdentityKey);
    expect(new Set(identityKeys).size).toBe(identityKeys.length);

    const playableIds = new Set(queryFootballSubjects({
      casualEligible: true,
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    }).map((subject) => subject.id));

    for (const subject of footballHitTheNumberSubjects) {
      expect(playableIds.has(subject.id), subject.id).toBe(true);
      const playable = FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.some((metric) =>
        metric.group === subject.group && getFootballFact(subject.id, metric.metricId) != null);
      expect(playable, subject.id).toBe(true);
    }

    for (const subjectId of ["2002-ohio-state", "2003-lsu", "2004-usc"] as const) {
      expect(getFootballHitTheNumberSubject(subjectId)?.nationalChampion, subjectId).toBe(true);
    }
  });

  it("generates source-backed curated boards across peak, team-season, and rare QB career content", () => {
    const contentCounts = new Map<FootballHitTheNumberContentKind, number>([
      ["peak-season", 0],
      ["team-season", 0],
      ["accomplishment", 0],
      ["career-special", 0],
    ]);
    const runs = 420;

    for (let index = 0; index < runs; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-htn-foundation-${index}`);
      const metric = metricById.get(plan.metricId);
      expect(metric, plan.metricId).toBeDefined();
      contentCounts.set(metric!.contentKind, contentCounts.get(metric!.contentKind)! + 1);
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(plan.subjectIds.length).toBeLessThanOrEqual(16);

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
    expect(contentCounts.get("career-special")).toBeGreaterThan(0);
    expect(contentCounts.get("accomplishment")).toBe(0);
    expect(contentCounts.get("career-special")! / runs).toBeLessThan(0.2);
  }, 90_000);
});
