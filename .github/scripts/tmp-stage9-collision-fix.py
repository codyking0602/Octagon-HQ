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
