from pathlib import Path

p = Path("src/features/games/twentyQuestionsStrictPool.tmp.audit.test.ts")
s = p.read_text()

modern_only = '    return roleActiveDecades(person)?.some((decade) => decade >= 2000) === true;'
source_backed = '''    const window = roleWindow(person);
    if (window?.end != null) return window.end >= 2000;
    const metrics = roleRecords(person).flatMap((record) =>
      getFootballFactualRecord(record.id)?.facts.map((fact) => fact.metricId) ?? []);
    return league === "CFB" && metrics.includes("cfb-career-games");'''
if modern_only not in s:
    raise SystemExit("OL selector marker not found")
s = s.replace(modern_only, source_backed, 1)

marker = "  return rows;\n}\n\nfunction percentile"
extra = '''  for (const position of playerPositions) {
    const fineGameThresholds = league === "NFL"
      ? Array.from({ length: 350 }, (_value, index) => 1 + index)
      : Array.from({ length: 60 }, (_value, index) => 1 + index);
    for (const threshold of fineGameThresholds) {
      add(`production:${position}:games-fine`, String(threshold), (person) => metricThreshold(
        person,
        "player",
        league === "NFL" ? "nfl-career-games" : "cfb-career-games",
        threshold,
        [position],
      ));
    }
  }

  if (league === "NFL") {
    for (const cutoff of Array.from({ length: 15 }, (_value, index) => 1955 + index * 5)) {
      add("coach:era-fine", `started-before-${cutoff}`, (person) => {
        if (person.role !== "coach") return false;
        const window = roleWindow(person);
        return window == null ? null : window.start < cutoff;
      });
      add("coach:era-fine", `ended-before-${cutoff}`, (person) => {
        if (person.role !== "coach") return false;
        const window = roleWindow(person);
        return window == null ? null : window.end < cutoff;
      });
    }
    for (const years of Array.from({ length: 15 }, (_value, index) => 2 + index * 2)) {
      add("coach:longevity-fine", `${years}-plus-seasons`, (person) => {
        if (person.role !== "coach") return false;
        const window = roleWindow(person);
        return window == null ? null : window.end - window.start + 1 >= years;
      });
    }
  } else {
    for (const threshold of Array.from({ length: 57 }, (_value, index) => 20 + index * 5)) {
      add("coach:wins-fine", String(threshold), (person) => metricThreshold(person, "coach", "cfb-coach-career-wins", threshold));
    }
    for (const threshold of Array.from({ length: 39 }, (_value, index) => 10 + index * 5)) {
      add("coach:losses-fine", String(threshold), (person) => metricThreshold(person, "coach", "cfb-coach-career-losses", threshold));
    }
    for (const threshold of Array.from({ length: 21 }, (_value, index) => 40 + index * 2.5)) {
      add("coach:career-win-pct-fine", String(threshold), (person) => winPercentageThreshold(
        person,
        "coach",
        "cfb-coach-career-wins",
        "cfb-coach-career-losses",
        threshold,
      ));
    }
  }

  return rows;
}

function percentile'''
if marker not in s:
    raise SystemExit("buildPredicates return marker not found")
s = s.replace(marker, extra, 1)

coverage_old = '      totalUnknownAnswers: evaluated.reduce((sum, row) => sum + row.unknown, 0),\n'
coverage_new = coverage_old + '      liveUnknownAnswers: live.reduce((sum, row) => sum + row.unknown, 0),\n'
if coverage_old not in s:
    raise SystemExit("coverage marker not found")
s = s.replace(coverage_old, coverage_new, 1)

assert_old = '''      expect(pool.every((person) => roleRecords(person).some(isEligibleTier))).toBe(true);
      expect(result.predicateCoverage.fullyCovered).toBeGreaterThan(0);'''
assert_new = '''      expect(pool.every((person) => roleRecords(person).some(isEligibleTier))).toBe(true);
      expect(result.predicateCoverage.fullyCovered).toBeGreaterThan(0);
      expect(result.predicateCoverage.live).toBeGreaterThan(0);
      expect(result.predicateCoverage.liveUnknownAnswers).toBe(0);
      expect(result.duplicateAnswerFingerprints).toBe(0);
      expect(result.impossibleToDistinguish).toBe(0);
      expect(result.optimalIsolation.p95).not.toBeNull();
      expect(result.optimalIsolation.p95!).toBeLessThanOrEqual(20);
      expect(result.subgroupFairness.coaches).toMatchObject({ count: COACH_TARGET, unresolved: 0 });
      expect(result.subgroupFairness.offensiveLine).toMatchObject({ count: 2, unresolved: 0 });'''
if assert_old not in s:
    raise SystemExit("assertion marker not found")
s = s.replace(assert_old, assert_new, 1)

p.write_text(s)
