from pathlib import Path

# Make manual NFL A/B approval own one actual career identity, not every same-name player.
recognizability = Path("scripts/generate-football-recognizability.mjs")
text = recognizability.read_text()
old_people = 'const nflPeople = aggregate(nfl, "NFL");\nconst nflProjected = nflPeople.map(projectNflPlayer);'
new_people = '''const nflPeople = aggregate(nfl, "NFL");
const manuallyApprovedNflNames = new Set([...approvedAPlayers, ...approvedBPlayers]);
const approvedNflSourceIdByName = new Map(
  [...manuallyApprovedNflNames].flatMap((name) => {
    const matches = nflPeople
      .filter((person) => person.name === name)
      .sort((a, b) => total(b, "games") - total(a, "games") || String(a.sourceId).localeCompare(String(b.sourceId)));
    return matches.length ? [[name, matches[0].sourceId]] : [];
  }),
);
const approvedNflIdentityMatches = (person, position) => (
  approvedNflPlayerPositions.get(person.name)?.includes(position) === true
  && approvedNflSourceIdByName.get(person.name) === person.sourceId
);
const nflProjected = nflPeople.map(projectNflPlayer);'''
if old_people not in text:
    raise SystemExit("NFL people anchor missing")
text = text.replace(old_people, new_people, 1)
text = text.replace(
    'approvedNflIdentityMatches(p.name, position)',
    'approvedNflIdentityMatches(p, position)',
)
# Remove the position-only helper added by the earlier temporary patch; the identity-scoped helper above owns it.
text = text.replace(
    'const approvedNflIdentityMatches = (name, position) => approvedNflPlayerPositions.get(name)?.includes(position) === true;\n',
    '',
)
recognizability.write_text(text)

core = Path("src/features/back-room/footballFactualStatsCore.ts")
text = core.read_text()
ol_anchor = '  ["nfl-ron-yary", 207, 6, 0],\n];'
ol_add = '''  ["nfl-ron-yary", 207, 6, 0],
  ["nfl-walter-jones", 180, 6, 0],
  ["nfl-tyron-smith", 171, 2, 0],
  ["nfl-jason-kelce", 193, 6, 1],
  ["nfl-steve-hutchinson", 169, 5, 0],
  ["nfl-will-shields", 224, 2, 0],
];'''
if '  ["nfl-walter-jones", 180, 6, 0],' not in text:
    if ol_anchor not in text:
        raise SystemExit("OL row anchor missing")
    text = text.replace(ol_anchor, ol_add, 1)

def_anchor = 'const compatibilityFactualRecords: readonly FootballFactualRecord[] = ['
def_rows = '''const reviewedNflDefensiveCareerRecords: readonly FootballFactualRecord[] = [
  { subjectId: "lawrence-taylor", scope: "nfl-player-career", facts: [
    reported("pfr-career-stat-lines", "nfl-career-games", 184),
    reported("pfr-career-stat-lines", "nfl-career-interceptions", 9),
  ] },
  { subjectId: "dick-butkus", scope: "nfl-player-career", facts: [
    reported("pfr-career-stat-lines", "nfl-career-games", 119),
    reported("pfr-career-stat-lines", "nfl-career-sacks", 11),
    reported("pfr-career-stat-lines", "nfl-career-interceptions", 22),
  ] },
  { subjectId: "nfl-sam-huff", scope: "nfl-player-career", facts: [
    reported("pfr-career-stat-lines", "nfl-career-games", 168),
    reported("pfr-career-stat-lines", "nfl-career-sacks", 29),
    reported("pfr-career-stat-lines", "nfl-career-interceptions", 30),
  ] },
  { subjectId: "nfl-sam-mills", scope: "nfl-player-career", facts: [
    reported("pfr-career-stat-lines", "nfl-career-games", 181),
    reported("pfr-career-stat-lines", "nfl-career-sacks", 20.5),
    reported("pfr-career-stat-lines", "nfl-career-interceptions", 11),
  ] },
  { subjectId: "nfl-ray-nitschke", scope: "nfl-player-career", facts: [
    reported("pfr-career-stat-lines", "nfl-career-games", 190),
    reported("pfr-career-stat-lines", "nfl-career-sacks", 16),
    reported("pfr-career-stat-lines", "nfl-career-interceptions", 25),
  ] },
  { subjectId: "nfl-robert-brazile", scope: "nfl-player-career", facts: [
    reported("pfr-career-stat-lines", "nfl-career-games", 147),
    reported("pfr-career-stat-lines", "nfl-career-sacks", 48),
    reported("pfr-career-stat-lines", "nfl-career-interceptions", 13),
  ] },
];

'''
if 'const reviewedNflDefensiveCareerRecords' not in text:
    if def_anchor not in text:
        raise SystemExit("compatibility records anchor missing")
    text = text.replace(def_anchor, def_rows + def_anchor, 1)
text = text.replace(
    'const compatibilityFactualRecords: readonly FootballFactualRecord[] = [\n  ...reviewedOlCareerRows.map',
    'const compatibilityFactualRecords: readonly FootballFactualRecord[] = [\n  ...reviewedNflDefensiveCareerRecords,\n  ...reviewedOlCareerRows.map',
    1,
)
core.write_text(text)

# Use existing fully-covered production with a few natural cut points instead of inventing new facts.
readiness = Path("src/features/games/twentyQuestionsFactualReadiness.audit.test.ts")
text = readiness.read_text()
text = text.replace(
    '[5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000, 55_000, 60_000, 65_000, 70_000, 75_000]',
    '[5_000, 10_000, 15_000, 20_000, 22_000, 23_000, 24_000, 25_000, 27_000, 30_000, 32_500, 35_000, 40_000, 45_000, 50_000, 55_000, 60_000, 65_000, 70_000, 75_000]',
    1,
)
text = text.replace(
    '[50, 100, 150, 200, 250, 300, 350, 400, 450, 500]',
    '[50, 100, 150, 180, 200, 225, 250, 300, 350, 400, 450, 500, 525]',
    1,
)
text = text.replace(
    '[1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 11_000, 12_500, 14_000, 16_000]',
    '[500, 1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 11_000, 12_500, 14_000, 16_000]',
    1,
)
text = text.replace(
    '[100, 200, 300, 400, 500, 600, 750, 900, 1_000, 1_200]',
    '[100, 200, 300, 400, 500, 600, 700, 750, 900, 1_000, 1_200]',
    1,
)
text = text.replace(
    '[100, 250, 500, 750, 1_000]',
    '[100, 250, 500, 750, 1_000, 1_250]',
    1,
)
# Coach-only affiliation questions stay definitive without requiring every player's full affiliation history.
coach_aff_anchor = '''  const affiliationValues = new Set(pool.flatMap((person) => careerAffiliations(person)?.affiliations ?? []));
  for (const affiliation of affiliationValues) {
    add(league === "NFL" ? "franchise" : "program", normalize(affiliation), (person) => affiliationAnswer(person, affiliation, "affiliations"));
  }
'''
coach_aff_add = coach_aff_anchor + '''  const coachAffiliations = new Set(pool.flatMap((person) => person.role === "coach" ? (careerAffiliations(person)?.affiliations ?? []) : []));
  for (const affiliation of coachAffiliations) {
    add(league === "NFL" ? "coach-franchise" : "coach-program", normalize(affiliation), (person) => {
      if (person.role !== "coach") return false;
      return affiliationAnswer(person, affiliation, "affiliations");
    });
  }
'''
if '"coach-franchise" : "coach-program"' not in text:
    if coach_aff_anchor not in text:
        raise SystemExit("coach affiliation predicate anchor missing")
    text = text.replace(coach_aff_anchor, coach_aff_add, 1)
readiness.write_text(text)
