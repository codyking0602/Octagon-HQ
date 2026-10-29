import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
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
const careerSpecialGroups = new Set(["nfl-qb-career","nfl-rb-career","nfl-receiving-career"]);

describe("Football Hit the Number content foundation", () => {
  it("keeps exact player-season context and curated NFL and CFB categories", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_VERSION).toBe("football-hit-the-number-v6");
    expect(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["peak-season"])
      .toBeGreaterThan(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["career-special"]);
    expect(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["team-season"])
      .toBeGreaterThan(FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS["career-special"]);

    expect(metricById.get("nfl-season-passing-yards")?.contentKind).toBe("peak-season");
    expect(metricById.has("nfl-team-overall-wins")).toBe(false);
    expect(metricById.get("nfl-career-rushing-yards")?.contentKind).toBe("career-special");
    expect(metricById.get("cfb-team-point-differential")?.contentKind).toBe("team-season");
    expect(metricById.get("nfl-career-passing-touchdowns")?.contentKind).toBe("career-special");
    for (const rejected of [
      "nfl-career-passing-yards",
      "nfl-team-defensive-sacks",
      "nfl-team-defensive-interceptions",
      "nfl-team-postseason-wins",
      "cfb-heisman-awards",
      "cfb-team-postseason-wins",
    ]) {
      expect(metricById.has(rejected as never), rejected).toBe(false);
    }

    expect(metricById.has("cfb-best-season-passing-touchdowns")).toBe(true);
    expect(metricById.has("cfb-best-season-rushing-yards")).toBe(true);
    expect(metricById.has("cfb-best-season-receiving-yards")).toBe(true);
    expect(FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.some((theme) => theme.id === "cfb-player-peaks")).toBe(false);
    expect(FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.some((theme) => theme.id==="cfb-qb-peak-seasons")).toBe(true);
    expect(FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.some((theme) => theme.id === "cfb-players")).toBe(false);

    expect(metricById.has("cfb-team-srs")).toBe(false);
    expect(metricById.has("cfb-team-sos")).toBe(false);
    expect(metricById.has("cfb-best-season-tackles-for-loss")).toBe(false);

    for (const subjectId of ["2002-ohio-state", "2003-lsu", "2004-usc"] as const) {
      expect(getFootballHitTheNumberSubject(subjectId)?.nationalChampion, subjectId).toBe(true);
    }
  });

  it("exports only unique playable subjects and keeps career specials recognizable", () => {
    const identityKeys = footballHitTheNumberSubjects.map(footballHitTheNumberSubjectIdentityKey);
    expect(new Set(identityKeys).size).toBe(identityKeys.length);

    for (const subject of footballHitTheNumberSubjects) {
      const playable = FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.some((metric) =>
        metric.group === subject.group && getFootballFact(subject.id, metric.metricId) != null);
      expect(playable, subject.id).toBe(true);

      if (careerSpecialGroups.has(subject.group)) {
        expect(subject.casualEligible, subject.id).toBe(true);
        expect(["A", "B"], subject.id).toContain(subject.recognizabilityTier);
      }
      if (subject.group === "cfb-player-peak") {
        expect(subject.subtitle.toLowerCase()).toContain("peak");
      }
    }
  });

  it("generates only approved source-backed NFL and CFB stat families", () => {
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
      if(plan.metricId.startsWith("cfb-best-season-")) expect(plan.league).toBe("CFB");
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
    expect(contentCounts.get("accomplishment")).toBe(0);
    expect(contentCounts.get("career-special")).toBeGreaterThan(0);
    expect(contentCounts.get("career-special")! / runs).toBeLessThan(0.6);
    expect(contentCounts.get("peak-season")!).toBeGreaterThan(0);
  }, 90_000);
});
