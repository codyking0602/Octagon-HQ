import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import { queryFootballSubjects } from "./footballSubjectRegistry";
import {
  FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_MAX_PICKS,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  FOOTBALL_HIT_THE_NUMBER_MIN_PICKS,
  FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH,
  FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY,
  FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE,
  FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH,
  FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG,
  createFootballHitTheNumberPlan,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberPlayableThemes,
  footballHitTheNumberRandomPoolSize,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberThemeSubjects,
  footballHitTheNumberValue,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberFormatId,
} from "./footballHitTheNumberModel";

const APPROVED_NFL_METRICS = [
  "nfl-season-passing-yards",
  "nfl-team-overall-wins",
  "nfl-team-points-for",
  "nfl-season-passer-rating",
  "nfl-team-points-per-game",
  "nfl-season-passing-touchdowns",
  "nfl-season-interceptions",
  "nfl-career-passing-touchdowns",
] as const;

const APPROVED_CFB_METRICS = [
  "cfb-team-points-for",
  "cfb-team-points-against",
  "cfb-team-wins",
  "cfb-team-points-per-game",
  "cfb-team-point-differential",
] as const;

const REJECTED_METRICS = [
  "nfl-career-passing-yards",
  "nfl-career-rushing-yards",
  "nfl-career-receiving-yards",
  "nfl-team-defensive-sacks",
  "nfl-team-defensive-interceptions",
  "nfl-team-postseason-wins",
  "nfl-career-rushing-touchdowns",
  "nfl-career-receiving-touchdowns",
  "cfb-heisman-awards",
  "cfb-team-postseason-wins",
] as const;

const ONE_FROM_EACH_LABELS = [
  "1995–2002 Champion",
  "2003–08 Champion",
  "2009–14 Champion",
  "2015–22 Champion",
  "Wild Card",
];

const BUILD_TEAM_LABELS = [
  "Tier 1",
  "Tier 2",
  "Tier 3",
  "Tier 4",
  "Wild Card",
];

describe("Football Hit the Number curated generation", () => {
  it("keeps exactly the approved 13-metric catalog with the locked 8 NFL / 5 CFB split", () => {
    const metricIds = FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.map((row) => row.metricId);
    expect(metricIds).toHaveLength(13);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.filter((row) => row.league === "NFL")).toHaveLength(8);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.filter((row) => row.league === "CFB")).toHaveLength(5);
    expect(new Set(metricIds)).toEqual(new Set([...APPROVED_NFL_METRICS, ...APPROVED_CFB_METRICS]));
    for (const metricId of REJECTED_METRICS) expect(metricIds).not.toContain(metricId);
  });

  it("keeps one declarative theme owner with the simplified recognizable theme families", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.map((theme) => theme.id)).toEqual([
      "nfl-qb-seasons",
      "nfl-qb-modern",
      "nfl-qb-old-school",
      "nfl-qbs-first-round",
      "nfl-team-seasons",
      "cfb-champions",
      "cfb-bcs-champions",
      "cfb-cfp-champions",
      "cfb-modern-champions",
    ]);

    const labels = FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.map((theme) => theme.label);
    expect(labels).toContain("Notable NFL QB Seasons");
    expect(labels).toContain("Modern Era QBs");
    expect(labels).toContain("Old School QBs");
    expect(labels).toContain("First-Round QBs");
    expect(labels).toContain("NFL Team Seasons");
    expect(labels).toContain("National Champions");
    expect(labels).toContain("BCS Era Champions");
    expect(labels).toContain("CFP Era Champions");
    expect(labels).toContain("Modern Champions");

    const playable = footballHitTheNumberPlayableThemes();
    for (const theme of playable) {
      const subjects = footballHitTheNumberThemeSubjects(theme);
      expect(subjects.length, theme.id).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH);
      expect(new Set(subjects.map((subject) => subject.id)).size).toBe(subjects.length);
      if (theme.label.includes("Champion")) {
        expect(subjects.every((subject) => subject.nationalChampion === true), theme.id).toBe(true);
      }
    }
    const signatures = playable.map((theme) =>
      footballHitTheNumberThemeSubjects(theme).map((subject) => subject.id).sort().join(","));
    expect(new Set(signatures).size).toBe(playable.length);
  });

  it("uses Football-only 4/5/6 picks with exact 12/14/16 choice pools and never supports 7", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_MIN_PICKS).toBe(4);
    expect(FOOTBALL_HIT_THE_NUMBER_MAX_PICKS).toBe(6);
    expect(FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE).toEqual([
      { value: 4, weight: 20 },
      { value: 5, weight: 40 },
      { value: 6, weight: 40 },
    ]);
    expect([4, 5, 6].map(footballHitTheNumberRandomPoolSize)).toEqual([12, 14, 16]);
    expect(() => footballHitTheNumberRandomPoolSize(7)).toThrow(/4-6/);
    expect(FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE).toBe(14);
    expect(FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH).toBe(3);
  });

  it("builds deterministic capped boards with recognizability, value spread, provenance, and every valid format", () => {
    const formats = new Map<FootballHitTheNumberFormatId, number>(
      FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE.map((row) => [row.value, 0]),
    );
    const picks = new Set<number>();
    const seenMetrics = new Set<string>();
    const playableIds = new Set(queryFootballSubjects({
      casualEligible: true,
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    }).map((subject) => subject.id));

    for (let index = 0; index < 600; index += 1) {
      const seed = `football-curated-hit-number-${index}`;
      const plan = createFootballHitTheNumberPlan(seed);
      if (index < 60) expect(createFootballHitTheNumberPlan(seed)).toEqual(plan);

      formats.set(plan.formatId, formats.get(plan.formatId)! + 1);
      picks.add(plan.pickCount);
      seenMetrics.add(plan.metricId);

      expect(plan.boardType).toBe("random-pool");
      expect([4, 5, 6]).toContain(plan.pickCount);
      expect(plan.subjectIds).toHaveLength(footballHitTheNumberRandomPoolSize(plan.pickCount));
      expect(plan.subjectIds.length).toBeLessThanOrEqual(16);
      expect(new Set(plan.subjectIds).size).toBe(plan.subjectIds.length);
      expect(plan.subjectIds.every((subjectId) => playableIds.has(subjectId))).toBe(true);
      expect(plan.solutionSubjectIds).toHaveLength(plan.pickCount);
      expect(plan.solutionSubjectIds.every((subjectId) => plan.subjectIds.includes(subjectId))).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);

      const quality = footballHitTheNumberPlanQuality(plan);
      expect(quality.passes, `${plan.formatId}:${plan.metricId}`).toBe(true);
      expect(quality.legalSelectionCount).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.minimumLegalSelections);
      expect(quality.hasGoodUnder).toBe(true);
      expect(quality.hasMiddlingOutcome).toBe(true);
      expect(quality.hasBadUnder).toBe(true);
      expect(quality.hasMeaningfulBust).toBe(true);

      if (plan.formatId === "one-from-each") {
        expect(plan.pickCount).toBe(5);
        expect(plan.league).toBe("CFB");
        expect(plan.slots.map((slot) => slot.label)).toEqual(ONE_FROM_EACH_LABELS);
        expect(plan.configurationLabel).toBe("One champion from each era + wild card");
      }
      if (plan.formatId === "build-the-team") {
        expect(plan.pickCount).toBe(5);
        expect(plan.slots.map((slot) => slot.label)).toEqual(BUILD_TEAM_LABELS);
        expect(plan.configurationLabel).toBe("4 stat tiers + wild card");
      }
      if (plan.formatId === "one-from-each" || plan.formatId === "build-the-team") {
        for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) {
          const previous = plan.solutionSubjectIds.slice(0, slotIndex);
          expect(
            footballHitTheNumberAvailableProgressionSubjectIds(plan, previous).length,
            `${plan.metricId}:${plan.formatId}:${slotIndex}`,
          ).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH);
        }
      }

      const expectedTarget = plan.solutionSubjectIds.reduce(
        (sum, subjectId) => sum + footballHitTheNumberValue(subjectId, plan.metricId),
        0,
      );
      expect(plan.target).toBeCloseTo(expectedTarget, 8);
      expect(gradeFootballHitTheNumberSelection(plan, plan.solutionSubjectIds)).toMatchObject({
        status: "perfect",
        score: 100,
        total: expectedTarget,
        target: expectedTarget,
      });

      for (const subjectId of plan.subjectIds) {
        const fact = getFootballFact(subjectId, plan.metricId);
        expect(fact, `${plan.metricId}:${subjectId}`).not.toBeNull();
        expect(Number.isFinite(fact!.fact.value)).toBe(true);
        expect(fact!.sources.length).toBeGreaterThan(0);
      }
    }

    expect(picks).toEqual(new Set([4, 5, 6]));
    expect([...formats.values()].every((count) => count > 0)).toBe(true);
    expect(seenMetrics.size).toBeGreaterThanOrEqual(10);
    for (const metricId of seenMetrics) {
      expect([...APPROVED_NFL_METRICS, ...APPROVED_CFB_METRICS]).toContain(metricId);
      expect(REJECTED_METRICS).not.toContain(metricId as never);
    }
  }, 90_000);
});
