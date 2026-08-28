import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import {
  FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_MAX_PICKS,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH,
  FOOTBALL_HIT_THE_NUMBER_MIN_PICKS,
  FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG,
  createFootballHitTheNumberPlan,
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
  "1990s Champion",
  "2000–06 Champion",
  "2007–13 Champion",
  "2014–22 Champion",
  "Wild Card",
];

const BUILD_TEAM_LABELS = [
  "Elite Tier",
  "High Tier",
  "Middle Tier",
  "Value Tier",
  "Wild Card",
];

describe("Football Hit the Number canonical fact integration", () => {
  it("moves beyond the old 75-subject compatibility bottleneck without forcing sparse metrics", () => {
    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(100);
    expect(new Set(footballHitTheNumberSubjects.map((subject) => subject.id)).size).toBe(footballHitTheNumberSubjects.length);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.length).toBeGreaterThanOrEqual(17);

    const groups = new Set(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.map((row) => row.group));
    expect(groups).toContain("nfl-receiving-career");
    expect(groups).toContain("nfl-qb-season");
    expect(groups).toContain("cfb");
    expect(groups).not.toContain("nfl-defense-career");

    const metrics = new Set(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.map((row) => row.metricId));
    expect(metrics).toContain("nfl-career-receiving-yards");
    expect(metrics).toContain("nfl-season-passing-yards");
    expect(metrics).toContain("cfb-team-wins");
    expect(metrics).not.toContain("cfb-team-losses");
    expect(metrics).not.toContain("nfl-defensive-player-of-year-awards");
    expect(metrics).not.toContain("nfl-career-sacks");
  });

  it("keeps every playable value on the provenance-bearing canonical quantitative owner", () => {
    const seenMetrics = new Set<string>();
    const seenNewMetrics = new Set<string>();
    const newMetrics = new Set([
      "nfl-career-receiving-yards",
      "nfl-season-passing-yards",
      "cfb-team-wins",
    ]);

    for (let index = 0; index < 900; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-hit-number-facts-${index}`);
      seenMetrics.add(plan.metricId);
      if (newMetrics.has(plan.metricId)) seenNewMetrics.add(plan.metricId);
      for (const subjectId of plan.subjectIds) {
        const fact = getFootballFact(subjectId, plan.metricId);
        expect(fact, `${plan.metricId}:${subjectId}`).not.toBeNull();
        expect(Number.isFinite(fact!.fact.value)).toBe(true);
        expect(fact!.sources.length).toBeGreaterThan(0);
        expect(fact!.sources.every((source) => source.reviewedOn === "2026-08-22" || source.reviewedOn === "2026-08-25" || source.reviewedOn === "2026-08-27")).toBe(true);
      }
    }

    expect(seenMetrics.size).toBeGreaterThanOrEqual(15);
    expect(seenNewMetrics).toEqual(newMetrics);
  });

  it("keeps themes deep, unique and honest now that non-champion team seasons are eligible elsewhere", () => {
    const catalogIds = FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.map((theme) => theme.id);
    expect(catalogIds).not.toContain("nfl-qbs-top-picks");
    expect(catalogIds).not.toContain("nfl-skill-first-round");
    expect(catalogIds).not.toContain("cfb-sec-era");
    expect(catalogIds).not.toContain("cfb-offensive-era");

    const playable = footballHitTheNumberPlayableThemes();
    expect(playable.filter((theme) => theme.league === "NFL").length).toBeGreaterThanOrEqual(2);
    expect(playable.filter((theme) => theme.league === "CFB").length).toBeGreaterThanOrEqual(8);
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

  it("matches the mature UFC format and 4-7 pick generation profiles", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE).toEqual([
      { value: "classic", weight: 40 },
      { value: "themed-lineup", weight: 25 },
      { value: "one-from-each", weight: 20 },
      { value: "build-the-team", weight: 15 },
    ]);
    expect(FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE).toEqual([
      { value: 4, weight: 15 },
      { value: 5, weight: 35 },
      { value: 6, weight: 35 },
      { value: 7, weight: 15 },
    ]);
  });

  it("builds deterministic, solvable, quality-gated boards with distinct era and tier formats", () => {
    let sawOneFromEach = false;
    let sawBuildTeam = false;
    let sawExpandedNflPlayerFamily = false;

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
        expect(first.subjectIds.length).toBeGreaterThanOrEqual(first.pickCount);
        if (boardType === "random-pool") {
          expect(first.subjectIds.length).toBe(footballHitTheNumberRandomPoolSize(first.pickCount));
        }
        expect(first.solutionSubjectIds).toHaveLength(first.pickCount);
        expect(new Set(first.solutionSubjectIds).size).toBe(first.pickCount);
        expect(first.solutionSubjectIds.every((subjectId) => first.subjectIds.includes(subjectId))).toBe(true);
        expect(footballHitTheNumberSelectionSatisfies(first, first.solutionSubjectIds)).toBe(true);
        expect(footballHitTheNumberPlanQuality(first).passes).toBe(true);

        if (first.formatId === "one-from-each") {
          sawOneFromEach = true;
          expect(first.league).toBe("CFB");
          expect(first.pickCount).toBe(5);
          expect(first.slots.map((slot) => slot.label)).toEqual(ONE_FROM_EACH_LABELS);
          expect(first.configurationLabel).toBe("One champion from each era + wild card");
          expect(first.subjectIds.every((subjectId) => footballHitTheNumberSubjects.find((subject) => subject.id === subjectId)?.nationalChampion === true)).toBe(true);
        }
        if (first.formatId === "build-the-team") {
          sawBuildTeam = true;
          expect(first.pickCount).toBe(5);
          expect(first.slots.map((slot) => slot.label)).toEqual(BUILD_TEAM_LABELS);
          expect(first.configurationLabel).toBe("Four production tiers + wild card");
        }
        if (first.metricId.startsWith("nfl-career-receiv") || first.metricId.startsWith("nfl-season-")) sawExpandedNflPlayerFamily = true;

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
    expect(sawExpandedNflPlayerFamily).toBe(true);
    expect(ONE_FROM_EACH_LABELS).not.toEqual(BUILD_TEAM_LABELS);
  }, 60_000);

  it("keeps CFB at least half of casual exposure while rotating every format and all pick counts", () => {
    const formats = new Map<FootballHitTheNumberFormatId, number>([
      ["classic", 0],
      ["themed-lineup", 0],
      ["one-from-each", 0],
      ["build-the-team", 0],
    ]);
    const picks = new Set<number>();
    let cfb = 0;
    const runs = 1_000;

    for (let index = 0; index < runs; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-hit-number-mix-${index}`);
      formats.set(plan.formatId, formats.get(plan.formatId)! + 1);
      picks.add(plan.pickCount);
      if (plan.league === "CFB") cfb += 1;
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);
    }

    expect(picks).toEqual(new Set([4, 5, 6, 7]));
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
  });
});