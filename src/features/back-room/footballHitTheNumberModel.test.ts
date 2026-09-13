import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import {
  FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_MAX_PICKS,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH,
  FOOTBALL_HIT_THE_NUMBER_MIN_PICKS,
  FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE,
  FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH,
  FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG,
  createFootballHitTheNumberPlan,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberPlayableThemes,
  footballHitTheNumberRandomPoolSize,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberSubjects,
  footballHitTheNumberThemeSubjects,
  footballHitTheNumberValue,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberFormatId,
} from "./footballHitTheNumberModel";

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

describe("Football Hit the Number canonical fact integration", () => {
  it("uses exactly the approved 13-metric Football catalog and canonical recognizable subjects", () => {
    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(50);
    expect(new Set(footballHitTheNumberSubjects.map((subject) => subject.id)).size).toBe(footballHitTheNumberSubjects.length);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG).toHaveLength(13);

    const groups = new Set(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.map((row) => row.group));
    expect(groups).toEqual(new Set(["nfl-qb-career", "nfl-qb-season", "nfl-team-season", "cfb"]));

    const nflMetrics = FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG
      .filter((row) => row.league === "NFL")
      .map((row) => row.metricId);
    const cfbMetrics = FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG
      .filter((row) => row.league === "CFB")
      .map((row) => row.metricId);
    expect(nflMetrics).toHaveLength(8);
    expect(cfbMetrics).toHaveLength(5);
    expect(new Set([...nflMetrics, ...cfbMetrics])).toEqual(new Set([
      "nfl-season-passing-yards",
      "nfl-team-overall-wins",
      "nfl-team-points-for",
      "nfl-season-passer-rating",
      "nfl-team-points-per-game",
      "nfl-season-passing-touchdowns",
      "nfl-season-interceptions",
      "nfl-career-passing-touchdowns",
      "cfb-team-points-for",
      "cfb-team-points-against",
      "cfb-team-wins",
      "cfb-team-points-per-game",
      "cfb-team-point-differential",
    ]));
    for (const subject of footballHitTheNumberSubjects) {
      expect(subject.casualEligible, subject.id).toBe(true);
      expect(subject.recognizabilityTier, subject.id).not.toBe("D");
    }
  });

  it("keeps themes deep, unique and honest now that non-champion team seasons are eligible elsewhere", () => {
    const catalogIds = FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.map((theme) => theme.id);
    expect(catalogIds).not.toContain("nfl-qbs-top-picks");
    expect(catalogIds).not.toContain("nfl-skill-first-round");
    expect(catalogIds).not.toContain("cfb-sec-era");
    expect(catalogIds).not.toContain("cfb-offensive-era");

    const playable = footballHitTheNumberPlayableThemes();
    expect(playable.filter((theme) => theme.league === "NFL").length).toBeGreaterThanOrEqual(2);
    expect(playable.filter((theme) => theme.league === "CFB").length).toBeGreaterThanOrEqual(1);
    expect(FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.map((theme) => theme.label)).toEqual([
      "Notable NFL QB Seasons",
      "Modern Era QBs",
      "Old School QBs",
      "First-Round QBs",
      "NFL Team Seasons",
      "National Champions",
      "BCS Era Champions",
      "CFP Era Champions",
      "Modern Champions",
    ]);
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

  it("keeps the four formats while enforcing Football-only 4-6 pick generation", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE).toEqual([
      { value: "classic", weight: 40 },
      { value: "themed-lineup", weight: 25 },
      { value: "one-from-each", weight: 20 },
      { value: "build-the-team", weight: 15 },
    ]);
    expect(FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE).toEqual([
      { value: 4, weight: 20 },
      { value: 5, weight: 40 },
      { value: 6, weight: 40 },
    ]);
    expect(FOOTBALL_HIT_THE_NUMBER_MIN_PICKS).toBe(4);
    expect(FOOTBALL_HIT_THE_NUMBER_MAX_PICKS).toBe(6);
    expect([4, 5, 6].map(footballHitTheNumberRandomPoolSize)).toEqual([12, 14, 16]);
    expect(() => footballHitTheNumberRandomPoolSize(7)).toThrow(/4-6/);
  });

  it("builds deterministic, solvable, quality-gated boards with deep era and stat-tier choices", () => {
    let sawOneFromEach = false;
    let sawBuildTeam = false;
    let sawCareerPassingTouchdowns = false;

    for (const boardType of ["open-roster", "random-pool"] as const) {
      for (let index = 0; index < 220; index += 1) {
        const seed = `football-hit-number-${boardType}-${index}`;
        const first = createFootballHitTheNumberPlan(seed, boardType);
        const second = createFootballHitTheNumberPlan(seed, boardType);

        expect(second).toEqual(first);
        expect(first.boardType).toBe(boardType);
        expect(first.pickCount).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_MIN_PICKS);
        expect(first.pickCount).toBeLessThanOrEqual(FOOTBALL_HIT_THE_NUMBER_MAX_PICKS);
        expect(new Set(first.subjectIds).size).toBe(first.subjectIds.length);
        expect(first.subjectIds).toHaveLength(footballHitTheNumberRandomPoolSize(first.pickCount));
        if (first.formatId === "one-from-each" || first.formatId === "build-the-team") {
          expect(first.subjectIds).toHaveLength(FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE);
        }
        expect(first.solutionSubjectIds).toHaveLength(first.pickCount);
        expect(new Set(first.solutionSubjectIds).size).toBe(first.pickCount);
        expect(first.solutionSubjectIds.every((subjectId) => first.subjectIds.includes(subjectId))).toBe(true);
        expect(footballHitTheNumberSelectionSatisfies(first, first.solutionSubjectIds)).toBe(true);
        const quality = footballHitTheNumberPlanQuality(first);
        expect(quality.passes).toBe(true);
        expect(quality.hasGoodUnder).toBe(true);
        expect(quality.hasMiddlingOutcome).toBe(true);
        expect(quality.hasMeaningfulBust).toBe(true);
        if (first.formatId === "classic" || first.formatId === "themed-lineup") {
          expect(quality.hasBadUnder).toBe(true);
        }

        if (first.formatId === "one-from-each") {
          sawOneFromEach = true;
          expect(first.league).toBe("CFB");
          expect(first.pickCount).toBe(5);
          expect(first.slots.map((slot) => slot.label)).toEqual(ONE_FROM_EACH_LABELS);
          expect(first.configurationLabel).toBe("One champion from each era + wild card");
          expect(first.subjectIds.every((subjectId) => footballHitTheNumberSubjects.find((subject) => subject.id === subjectId)?.nationalChampion === true)).toBe(true);
          for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) {
            const previousPicks = first.solutionSubjectIds.slice(0, slotIndex);
            expect(
              footballHitTheNumberAvailableProgressionSubjectIds(first, previousPicks).length,
              `${first.metricId}:${boardType}:era-${slotIndex + 1}`,
            ).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH);
          }
        }
        if (first.formatId === "build-the-team") {
          sawBuildTeam = true;
          expect(first.pickCount).toBe(5);
          expect(first.slots.map((slot) => slot.label)).toEqual(BUILD_TEAM_LABELS);
          expect(first.configurationLabel).toBe("4 stat tiers + wild card");
          for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) {
            const previousPicks = first.solutionSubjectIds.slice(0, slotIndex);
            expect(
              footballHitTheNumberAvailableProgressionSubjectIds(first, previousPicks).length,
              `${first.metricId}:${boardType}:tier-${slotIndex + 1}`,
            ).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH);
          }
        }
        if (first.metricId === "nfl-career-passing-touchdowns") sawCareerPassingTouchdowns = true;

        const expectedTarget = first.solutionSubjectIds.reduce(
          (sum, subjectId) => sum + footballHitTheNumberValue(subjectId, first.metricId),
          0,
        );
        expect(first.target).toBeCloseTo(expectedTarget, 8);
        expect(gradeFootballHitTheNumberSelection(first, first.solutionSubjectIds)).toMatchObject({
          status: "perfect",
          score: 100,
          total: expectedTarget,
          target: expectedTarget,
        });
      }
    }
    expect(sawOneFromEach).toBe(true);
    expect(sawBuildTeam).toBe(true);
    expect(sawCareerPassingTouchdowns).toBe(true);
    expect(ONE_FROM_EACH_LABELS).not.toEqual(BUILD_TEAM_LABELS);
  }, 60_000);

  it("keeps canonical provenance while rotating every format, all pick counts, and CFB casual exposure", () => {
    const formats = new Map<FootballHitTheNumberFormatId, number>([
      ["classic", 0],
      ["themed-lineup", 0],
      ["one-from-each", 0],
      ["build-the-team", 0],
    ]);
    const picks = new Set<number>();
    const seenMetrics = new Set<string>();
    const seenNewMetrics = new Set<string>();
    const newMetrics = new Set([
      "nfl-career-passing-touchdowns",
      "nfl-season-passing-yards",
      "cfb-team-wins",
    ]);
    let cfb = 0;
    const runs = 1_000;

    for (let index = 0; index < runs; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-hit-number-mix-${index}`);
      formats.set(plan.formatId, formats.get(plan.formatId)! + 1);
      picks.add(plan.pickCount);
      seenMetrics.add(plan.metricId);
      if (newMetrics.has(plan.metricId)) seenNewMetrics.add(plan.metricId);
      if (plan.league === "CFB") cfb += 1;
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);

      for (const subjectId of plan.subjectIds) {
        const fact = getFootballFact(subjectId, plan.metricId);
        expect(fact, `${plan.metricId}:${subjectId}`).not.toBeNull();
        expect(Number.isFinite(fact!.fact.value)).toBe(true);
        expect(fact!.sources.length).toBeGreaterThan(0);
        expect(fact!.sources.every((source) => ["2026-08-22", "2026-08-25", "2026-08-26", "2026-08-27"].includes(source.reviewedOn))).toBe(true);
      }
    }

    expect(seenMetrics.size).toBe(13);
    expect(seenNewMetrics).toEqual(newMetrics);
    expect(picks).toEqual(new Set([4, 5, 6]));
    expect(cfb / runs).toBeGreaterThanOrEqual(0.52);
    expect(cfb / runs).toBeLessThanOrEqual(0.68);
    expect([...formats.values()].every((count) => count > 0)).toBe(true);
    expect(formats.get("classic")! / runs).toBeGreaterThanOrEqual(0.32);
    expect(formats.get("classic")! / runs).toBeLessThanOrEqual(0.48);
    expect(formats.get("themed-lineup")! / runs).toBeGreaterThanOrEqual(0.17);
    expect(formats.get("themed-lineup")! / runs).toBeLessThanOrEqual(0.33);
    expect(formats.get("one-from-each")! / runs).toBeGreaterThanOrEqual(0.12);
    expect(formats.get("one-from-each")! / runs).toBeLessThanOrEqual(0.28);
    expect(formats.get("build-the-team")! / runs).toBeGreaterThanOrEqual(0.07);
    expect(formats.get("build-the-team")! / runs).toBeLessThanOrEqual(0.23);
  }, 90_000);
});
