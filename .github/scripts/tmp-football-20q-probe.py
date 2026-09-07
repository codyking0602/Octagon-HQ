from pathlib import Path

p = Path("src/features/games/twentyQuestionsStrictPool.tmp.audit.test.ts")
s = p.read_text()

sort_old = '''function sortRoleCandidates(candidates: readonly PersonCandidate[], role: Role) {
  return [...candidates]
    .filter((person) => strongestRoleTier(person.records, role) > 0)
    .sort((a, b) => strongestRoleTier(b.records, role) - strongestRoleTier(a.records, role) || stableHash(a.key) - stableHash(b.key));
}'''
sort_new = '''function factualDepthForCandidate(candidate: PersonCandidate, role: Role) {
  const person: Person = { ...candidate, role };
  const metrics = new Set(roleRecords(person).flatMap((record) =>
    getFootballFactualRecord(record.id)?.facts.map((fact) => fact.metricId) ?? []));
  let score = metrics.size * 100 + strongestRoleTier(candidate.records, role) * 250;
  if (roleWindow(person)) score += 30;
  if (role === "player" && rolePosition(person)) score += 20;
  if (role === "player" && roleSchool(person)) score += 20;
  const affiliations = careerAffiliations(person);
  if (affiliations?.affiliations.length) score += 10;
  if (affiliations?.complete) score += 20;
  return score;
}

function sortRoleCandidates(candidates: readonly PersonCandidate[], role: Role) {
  return [...candidates]
    .filter((person) => strongestRoleTier(person.records, role) > 0)
    .sort((a, b) => factualDepthForCandidate(b, role) - factualDepthForCandidate(a, role)
      || stableHash(a.key) - stableHash(b.key));
}'''
if sort_old not in s:
    raise SystemExit("sort block not found")
s = s.replace(sort_old, sort_new)

select_old = '''function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachNames = new Set(coaches.map((person) => person.nameKey));
  const players = sortRoleCandidates(people.filter((person) => !coachNames.has(person.nameKey)), "player").slice(0, PLAYER_TARGET);
  return [
    ...players.map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}'''
select_new = '''function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachNames = new Set(coaches.map((person) => person.nameKey));
  const playerCandidates = sortRoleCandidates(people.filter((person) => !coachNames.has(person.nameKey)), "player");
  const offensiveLine = playerCandidates.filter((candidate) => {
    const person: Person = { ...candidate, role: "player" };
    if (rolePosition(person) !== "OL") return false;
    const window = roleWindow(person);
    if (window?.end != null) return window.end >= 2000;
    const metrics = roleRecords(person).flatMap((record) =>
      getFootballFactualRecord(record.id)?.facts.map((fact) => fact.metricId) ?? []);
    return league === "CFB" && metrics.includes("cfb-career-games");
  }).slice(0, 2);
  const caps: Record<string, number> = { QB: 30, RB: 25, WR: 15, TE: 10, DL: 12, LB: 10, DB: 15, K: 3, P: 3 };
  const counts = new Map<string, number>();
  const nonOl: PersonCandidate[] = [];
  for (const candidate of playerCandidates) {
    if (nonOl.length >= PLAYER_TARGET - offensiveLine.length) break;
    const person: Person = { ...candidate, role: "player" };
    const position = rolePosition(person);
    if (!position || position === "OL") continue;
    const count = counts.get(position) ?? 0;
    if (count >= (caps[position] ?? 10)) continue;
    counts.set(position, count + 1);
    nonOl.push(candidate);
  }
  if (nonOl.length < PLAYER_TARGET - offensiveLine.length) {
    const selected = new Set(nonOl.map((candidate) => candidate.key));
    for (const candidate of playerCandidates) {
      if (nonOl.length >= PLAYER_TARGET - offensiveLine.length) break;
      const person: Person = { ...candidate, role: "player" };
      if (rolePosition(person) === "OL" || selected.has(candidate.key)) continue;
      selected.add(candidate.key);
      nonOl.push(candidate);
    }
  }
  const players = [...nonOl, ...offensiveLine];
  return [
    ...players.map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}'''
if select_old not in s:
    raise SystemExit("selector block not found")
s = s.replace(select_old, select_new)

affiliation_marker = '  const affiliationValues = new Set(pool.flatMap((person) => careerAffiliations(person)?.affiliations ?? []));'
nfl_school = '''  if (league === "NFL") {
    const playerSchools = new Set(pool.flatMap((person) => person.role === "player" ? (roleSchool(person) ? [roleSchool(person)!] : []) : []));
    for (const school of playerSchools) {
      add("player-college", normalize(school), (person) => {
        if (person.role !== "player") return false;
        const known = roleSchool(person);
        return known == null ? null : known === school;
      });
    }
  }

'''
if affiliation_marker not in s:
    raise SystemExit("affiliation marker not found")
s = s.replace(affiliation_marker, nfl_school + affiliation_marker, 1)

replacements = {
    'const thresholds = league === "NFL" ? [25, 50, 75, 100, 125, 150, 175, 200, 225, 250] : [10, 20, 30, 40, 50, 60];':
        'const thresholds = league === "NFL" ? Array.from({ length: 25 }, (_value, index) => 10 + index * 10) : Array.from({ length: 12 }, (_value, index) => 5 + index * 5);',
    '["production:pass-yards", "nfl-career-passing-yards", [5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000, 55_000, 60_000, 65_000, 70_000, 75_000], ["QB"]],':
        '["production:pass-yards", "nfl-career-passing-yards", Array.from({ length: 31 }, (_value, index) => 2_500 + index * 2_500), ["QB"]],',
    '["production:pass-td", "nfl-career-passing-touchdowns", [50, 100, 150, 200, 250, 300, 350, 400, 450, 500], ["QB"]],':
        '["production:pass-td", "nfl-career-passing-touchdowns", Array.from({ length: 20 }, (_value, index) => 25 + index * 25), ["QB"]],',
    '["production:rush-yards", "nfl-career-rushing-yards", [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 11_000, 12_500, 14_000, 16_000], ["RB"]],':
        '["production:rush-yards", "nfl-career-rushing-yards", Array.from({ length: 32 }, (_value, index) => 500 + index * 500), ["RB"]],',
    '["production:rush-td", "nfl-career-rushing-touchdowns", [10, 20, 30, 40, 50, 60, 75, 100, 125], ["RB"]],':
        '["production:rush-td", "nfl-career-rushing-touchdowns", Array.from({ length: 25 }, (_value, index) => 5 + index * 5), ["RB"]],',
    '["production:rec-yards", "nfl-career-receiving-yards", [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 11_000, 12_500, 14_000, 16_000], ["WR", "TE"]],':
        '["production:rec-yards", "nfl-career-receiving-yards", Array.from({ length: 32 }, (_value, index) => 500 + index * 500), ["WR", "TE"]],',
    '["production:receptions", "nfl-career-receptions", [100, 200, 300, 400, 500, 600, 750, 900, 1_000, 1_200], ["WR", "TE"]],':
        '["production:receptions", "nfl-career-receptions", Array.from({ length: 24 }, (_value, index) => 50 + index * 50), ["WR", "TE"]],',
    '["production:rec-td", "nfl-career-receiving-touchdowns", [10, 20, 30, 40, 50, 60, 75, 100, 125], ["WR", "TE"]],':
        '["production:rec-td", "nfl-career-receiving-touchdowns", Array.from({ length: 25 }, (_value, index) => 5 + index * 5), ["WR", "TE"]],',
    '["production:sacks", "nfl-career-sacks", [10, 25, 40, 50, 60, 75, 90, 100, 110, 125, 140, 160], ["DL", "LB"]],':
        '["production:sacks", "nfl-career-sacks", Array.from({ length: 32 }, (_value, index) => 5 + index * 5), ["DL", "LB"]],',
    '["production:pass-yards", "cfb-career-passing-yards", [2_000, 3_000, 4_000, 5_000, 6_000, 7_500, 9_000, 10_000, 12_000, 14_000], ["QB"]],':
        '["production:pass-yards", "cfb-career-passing-yards", Array.from({ length: 14 }, (_value, index) => 1_000 + index * 1_000), ["QB"]],',
    '["production:pass-td", "cfb-career-passing-touchdowns", [20, 30, 40, 50, 60, 75, 100, 125], ["QB"]],':
        '["production:pass-td", "cfb-career-passing-touchdowns", Array.from({ length: 13 }, (_value, index) => 10 + index * 10), ["QB"]],',
    '["production:rush-yards", "cfb-career-rushing-yards", [500, 1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000, 5_000, 6_000], ["RB"]],':
        '["production:rush-yards", "cfb-career-rushing-yards", Array.from({ length: 12 }, (_value, index) => 500 + index * 500), ["RB"]],',
    '["production:rush-td", "cfb-career-rushing-touchdowns", [10, 20, 30, 40, 50, 60, 75], ["RB"]],':
        '["production:rush-td", "cfb-career-rushing-touchdowns", Array.from({ length: 15 }, (_value, index) => 5 + index * 5), ["RB"]],',
    '["production:rec-yards", "cfb-career-receiving-yards", [500, 1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000], ["WR", "TE"]],':
        '["production:rec-yards", "cfb-career-receiving-yards", Array.from({ length: 8 }, (_value, index) => 500 + index * 500), ["WR", "TE"]],',
}
for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f"threshold block not found: {old[:55]}")
    s = s.replace(old, new)

p.write_text(s)
