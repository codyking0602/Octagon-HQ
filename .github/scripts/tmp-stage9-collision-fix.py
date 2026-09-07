from pathlib import Path

core = Path("src/features/back-room/footballFactualStatsCore.ts")
text = core.read_text()

compat_anchor = 'const compatibilityFactualRecords: readonly FootballFactualRecord[] = ['
dl_records = '''const reviewedStage9NflDlGameRecords: readonly FootballFactualRecord[] = [
  ["nfl-deacon-jones", 191],
  ["nfl-reggie-white", 232],
  ["nfl-joe-greene", 181],
  ["nfl-alan-page", 218],
  ["nfl-john-randle", 219],
  ["nfl-randy-white", 209],
].map(([subjectId, games]) => ({
  subjectId: subjectId as string,
  scope: "nfl-player-career" as const,
  facts: [reported("pfr-career-stat-lines", "nfl-career-games", games as number)],
}));

'''
if "reviewedStage9NflDlGameRecords" not in text:
    if compat_anchor not in text:
        raise SystemExit("compatibility factual records anchor missing")
    text = text.replace(compat_anchor, dl_records + compat_anchor, 1)
text = text.replace(
    'const compatibilityFactualRecords: readonly FootballFactualRecord[] = [\n  ...reviewedNflDefensiveCareerRecords,',
    'const compatibilityFactualRecords: readonly FootballFactualRecord[] = [\n  ...reviewedStage9NflDlGameRecords,\n  ...reviewedNflDefensiveCareerRecords,',
    1,
)
core.write_text(text)

readiness = Path("src/features/games/twentyQuestionsFactualReadiness.audit.test.ts")
text = readiness.read_text()

# Natural collision-breaking cutoffs on production families that are already deterministic.
text = text.replace(
    '["production:rush-td", "nfl-career-rushing-touchdowns", [10, 20, 30, 40, 50, 60, 75, 100, 125], ["RB"]],',
    '["production:rush-td", "nfl-career-rushing-touchdowns", [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 95, 100, 105, 110, 115, 125, 150], ["RB"]],',
    1,
)
text = text.replace(
    '["production:sacks", "nfl-career-sacks", [10, 25, 40, 50, 60, 75, 90, 100, 110, 125, 140, 160], ["DL", "LB"]],',
    '["production:sacks", "nfl-career-sacks", [10, 25, 40, 50, 60, 75, 90, 100, 110, 112, 125, 130, 140, 160, 180, 200], ["DL", "LB"]],',
    1,
)
text = text.replace(
    '["production:interceptions", "nfl-career-interceptions", [5, 10, 15, 20, 25, 30, 35, 40, 50, 60], ["DB", "LB"]],',
    '["production:interceptions", "nfl-career-interceptions", [5, 10, 15, 20, 25, 30, 35, 38, 39, 40, 45, 50, 55, 60, 61, 64, 65, 69], ["DB", "LB"]],',
    1,
)
text = text.replace(
    '["production:field-goals", "nfl-career-field-goals-made", [50, 100, 150, 200, 250, 300, 400, 500], ["K"]],',
    '["production:field-goals", "nfl-career-field-goals-made", [50, 100, 150, 200, 250, 300, 350, 400, 500], ["K"]],',
    1,
)
text = text.replace(
    '["production:rush-yards", "cfb-career-rushing-yards", [500, 1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000, 5_000, 6_000], ["RB"]],',
    '["production:rush-yards", "cfb-career-rushing-yards", [500, 1_000, 1_500, 2_000, 2_500, 3_000, 3_150, 3_500, 4_000, 5_000, 6_000], ["RB"]],',
    1,
)

# Precision historical boundaries distinguish famous coach pairs without pretending pre-1999 summary stats are modern stats.
coach_boundary_anchor = '''  if (league === "CFB") {
    const playerSchools = new Set(pool.flatMap((person) => person.role === "player" ? (roleSchool(person) ? [roleSchool(person)!] : []) : []));
'''
coach_boundary_add = '''  if (league === "NFL") {
    add("coach:era", "started-before-1982", (person) => {
      if (person.role !== "coach") return false;
      const window = roleWindow(person);
      return window == null ? null : window.start < 1982;
    });
    add("coach:era", "ended-before-1992", (person) => {
      if (person.role !== "coach") return false;
      const window = roleWindow(person);
      return window == null ? null : window.end < 1992;
    });
  }

'''
if '"started-before-1982"' not in text:
    if coach_boundary_anchor not in text:
        raise SystemExit("coach precision boundary anchor missing")
    text = text.replace(coach_boundary_anchor, coach_boundary_add + coach_boundary_anchor, 1)

coach_loop_anchor = '''  for (const [family, metricId, thresholds] of coachSpecs) {
    for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "coach", metricId, threshold));
  }
'''
coach_loop_add = coach_loop_anchor + '''  if (league === "CFB") {
    add("coach:wins", "125", (person) => metricThreshold(person, "coach", "cfb-coach-career-wins", 125));
  }
'''
if 'add("coach:wins", "125"' not in text:
    if coach_loop_anchor not in text:
        raise SystemExit("coach numeric loop anchor missing")
    text = text.replace(coach_loop_anchor, coach_loop_add, 1)

readiness.write_text(text)

# Finish the one remaining NFL OL collision with current PFR career totals.
core = Path("src/features/back-room/footballFactualStatsCore.ts")
text = core.read_text()
ol_anchor = '  ["nfl-will-shields", 224, 2, 0],\n];'
ol_add = '''  ["nfl-will-shields", 224, 2, 0],
  ["nfl-trent-williams", 204, 3, 0],
  ["nfl-zack-martin", 162, 7, 0],
];'''
if '  ["nfl-trent-williams", 204, 3, 0],' not in text:
    if ol_anchor not in text:
        raise SystemExit("final OL factual row anchor missing")
    text = text.replace(ol_anchor, ol_add, 1)

# OU's official career table owns the historical Selmon/Harris sack totals.
ou_source_anchor = '  { id: "nflverse-find-leader-projection",'
if 'id: "ou-lombardi-career-stat-lines"' not in text:
    if ou_source_anchor not in text:
        raise SystemExit("football source anchor missing")
    text = text.replace(
        ou_source_anchor,
        '  { id: "ou-lombardi-career-stat-lines", publisher: "University of Oklahoma Athletics", title: "Lombardi Award winners career statistics", url: "https://soonersports.com/news/2013/5/20/208798458", reviewedOn: "2026-09-07", coverage: "Lee Roy Selmon and Tommie Harris Oklahoma career defensive statistics" },\n' + ou_source_anchor,
        1,
    )
core.write_text(text)

# Add only the collision-subject career facts that were still absent or partial.
cfb = Path("src/features/back-room/footballStage16CfbQbCareerFacts.ts")
text = cfb.read_text()
reported_anchor = '''const reported = (metricId: FootballFactMetricId, value: number): FootballFactValue => ({
  metricId,
  value,
  evidence: { sourceIds: [SOURCE_ID], kind: "reported" },
});
'''
if 'const reportedFrom =' not in text:
    if reported_anchor not in text:
        raise SystemExit("CFB reported helper anchor missing")
    text = text.replace(reported_anchor, reported_anchor + '''
const reportedFrom = (sourceId: string, metricId: FootballFactMetricId, value: number): FootballFactValue => ({
  metricId,
  value,
  evidence: { sourceIds: [sourceId], kind: "reported" },
});
''', 1)
facts_anchor = '''const facts = (
  subjectId: string,
  values: readonly (readonly [FootballFactMetricId, number])[],
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-player-career",
  facts: values.map(([metricId, value]) => reported(metricId, value)),
});
'''
if 'const factsFrom =' not in text:
    if facts_anchor not in text:
        raise SystemExit("CFB facts helper anchor missing")
    text = text.replace(facts_anchor, facts_anchor + '''
const factsFrom = (
  subjectId: string,
  sourceId: string,
  values: readonly (readonly [FootballFactMetricId, number])[],
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-player-career",
  facts: values.map(([metricId, value]) => reportedFrom(sourceId, metricId, value)),
});
''', 1)
records_anchor = 'export const footballStage16CfbQbCareerFactualRecords: readonly FootballFactualRecord[] = [\n'
collision_rows = '''export const footballStage16CfbQbCareerFactualRecords: readonly FootballFactualRecord[] = [
  facts("cfb-cedric-benson", [
    ["cfb-career-games", 49], ["cfb-career-rushing-yards", 5540], ["cfb-career-rushing-touchdowns", 64],
    ["cfb-career-receptions", 69], ["cfb-career-receiving-yards", 621],
  ]),
  facts("cfb-morris-claiborne", [
    ["cfb-career-games", 33], ["cfb-career-sacks", 0], ["cfb-career-defensive-interceptions", 11],
  ]),
  facts("cfb-manti-teo", [
    ["cfb-career-games", 51], ["cfb-career-sacks", 8.5], ["cfb-career-defensive-interceptions", 7],
  ]),
  facts("cfb-jaylon-smith", [
    ["cfb-career-games", 38], ["cfb-career-sacks", 4.5], ["cfb-career-defensive-interceptions", 1],
  ]),
  factsFrom("cfb-lee-roy-selmon", "ou-lombardi-career-stat-lines", [
    ["cfb-career-sacks", 40],
  ]),
  factsFrom("cfb-tommie-harris", "ou-lombardi-career-stat-lines", [
    ["cfb-career-sacks", 9],
  ]),
  facts("cfb-chase-young", [
    ["cfb-career-games", 36], ["cfb-career-sacks", 30.5], ["cfb-career-defensive-interceptions", 0],
  ]),
  facts("cfb-joey-bosa", [
    ["cfb-career-games", 38], ["cfb-career-sacks", 26], ["cfb-career-defensive-interceptions", 1],
  ]),
  facts("cfb-tyler-eifert", [
    ["cfb-career-games", 37], ["cfb-career-receptions", 140], ["cfb-career-receiving-yards", 1840],
    ["cfb-career-receiving-touchdowns", 11],
  ]),
'''
if 'facts("cfb-cedric-benson"' not in text:
    if records_anchor not in text:
        raise SystemExit("CFB factual records anchor missing")
    text = text.replace(records_anchor, collision_rows, 1)
cfb.write_text(text)

# CFB production is asked within a known program/position context when global source coverage is incomplete.
# This keeps every live predicate deterministic without turning unrelated missing careers into No answers.
readiness = Path("src/features/games/twentyQuestionsFactualReadiness.audit.test.ts")
text = readiness.read_text()
program_metric_anchor = '''  for (const [family, metricId, thresholds, positions] of playerSpecs) {
    for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "player", metricId, threshold, positions));
  }

  if (league === "NFL") {
'''
program_metric_add = '''  for (const [family, metricId, thresholds, positions] of playerSpecs) {
    for (const threshold of thresholds) add(family, String(threshold), (person) => metricThreshold(person, "player", metricId, threshold, positions));
  }

  if (league === "CFB") {
    const programPositions = new Map<string, { school: string; position: string; count: number }>();
    for (const person of pool) {
      if (person.role !== "player") continue;
      const school = roleSchool(person);
      const position = rolePosition(person);
      if (school == null || position == null || position === "Coach") continue;
      const key = `${school}:${position}`;
      const current = programPositions.get(key);
      programPositions.set(key, { school, position, count: (current?.count ?? 0) + 1 });
    }
    for (const { school, position, count } of programPositions.values()) {
      if (count < 2) continue;
      for (const [family, metricId, thresholds, positions] of playerSpecs) {
        if (!positions?.includes(position)) continue;
        for (const threshold of thresholds) {
          add(`program-production:${normalize(school)}:${position}:${family}`, String(threshold), (person) => {
            if (person.role !== "player") return false;
            const knownSchool = roleSchool(person);
            if (knownSchool == null) return null;
            if (knownSchool !== school) return false;
            const knownPosition = rolePosition(person);
            if (knownPosition == null) return null;
            if (knownPosition !== position) return false;
            const value = numericFact(person, metricId);
            return value == null ? null : value >= threshold;
          });
        }
      }
    }
  }

  if (league === "NFL") {
'''
if 'program-production:${normalize(school)}' not in text:
    if program_metric_anchor not in text:
        raise SystemExit("player production loop anchor missing")
    text = text.replace(program_metric_anchor, program_metric_add, 1)
readiness.write_text(text)
