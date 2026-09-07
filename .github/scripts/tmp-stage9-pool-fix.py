from pathlib import Path

recognizability = Path("scripts/generate-football-recognizability.mjs")
text = recognizability.read_text()
position_guard_anchor = '''const approvedBPlayers = new Set([
  "Matt Ryan", "Jamaal Charles", "Dez Bryant", "Luke Kuechly", "Calvin Johnson", "Andrew Luck",
  "Colt McCoy", "Michael Crabtree", "Darren McFadden", "Justin Blackmon", "Baker Mayfield", "Lamar Jackson",
  "Derrick Henry", "Saquon Barkley", "Christian McCaffrey", "Joe Burrow", "Trevor Lawrence", "Bijan Robinson",
  "Ashton Jeanty", "Caleb Williams", "Jayden Daniels", "Travis Hunter", "Bo Nix", "A.J. Brown",
]);
'''
position_guards = '''const approvedNflPlayerPositions = new Map([
  ["Tom Brady", ["QB"]], ["Peyton Manning", ["QB"]], ["Patrick Mahomes", ["QB"]], ["Aaron Rodgers", ["QB"]],
  ["Brett Favre", ["QB"]], ["Drew Brees", ["QB"]], ["Randy Moss", ["WR"]], ["Terrell Owens", ["WR"]],
  ["Adrian Peterson", ["RB"]], ["LaDainian Tomlinson", ["RB"]], ["Ray Lewis", ["LB"]], ["Aaron Donald", ["DL"]],
  ["J.J. Watt", ["DL"]], ["Cam Newton", ["QB"]], ["Tim Tebow", ["QB"]], ["Reggie Bush", ["RB"]],
  ["Vince Young", ["QB"]], ["Johnny Manziel", ["QB"]], ["Matt Ryan", ["QB"]], ["Jamaal Charles", ["RB"]],
  ["Dez Bryant", ["WR"]], ["Luke Kuechly", ["LB"]], ["Calvin Johnson", ["WR"]], ["Andrew Luck", ["QB"]],
  ["Colt McCoy", ["QB"]], ["Michael Crabtree", ["WR"]], ["Darren McFadden", ["RB"]], ["Justin Blackmon", ["WR"]],
  ["Baker Mayfield", ["QB"]], ["Lamar Jackson", ["QB"]], ["Derrick Henry", ["RB"]], ["Saquon Barkley", ["RB"]],
  ["Christian McCaffrey", ["RB"]], ["Joe Burrow", ["QB"]], ["Trevor Lawrence", ["QB"]], ["Bijan Robinson", ["RB"]],
  ["Ashton Jeanty", ["RB"]], ["Caleb Williams", ["QB"]], ["Jayden Daniels", ["QB"]],
  ["Travis Hunter", ["WR", "DB"]], ["Bo Nix", ["QB"]], ["A.J. Brown", ["WR"]],
]);
const approvedNflIdentityMatches = (name, position) => approvedNflPlayerPositions.get(name)?.includes(position) === true;
'''
if "approvedNflPlayerPositions" not in text:
    if position_guard_anchor not in text:
        raise SystemExit("recognizability approval anchor missing")
    text = text.replace(position_guard_anchor, position_guard_anchor + position_guards, 1)
text = text.replace(
    'if (approvedBPlayers.has(p.name) && tier !== "A") { tier = "B"; evidence.push("explicit football-culture B approval"); }',
    'if (approvedBPlayers.has(p.name) && approvedNflIdentityMatches(p.name, position) && tier !== "A") { tier = "B"; evidence.push("explicit football-culture B approval"); }',
)
text = text.replace(
    'if (approvedAPlayers.has(p.name)) { tier = "A"; evidence.push("explicit iconic-player approval"); }',
    'if (approvedAPlayers.has(p.name) && approvedNflIdentityMatches(p.name, position)) { tier = "A"; evidence.push("explicit iconic-player approval"); }',
)
recognizability.write_text(text)

readiness = Path("src/features/games/twentyQuestionsFactualReadiness.audit.test.ts")
text = readiness.read_text()
old = '''function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachNames = new Set(coaches.map((person) => person.nameKey));
  const players = sortRoleCandidates(people.filter((person) => !coachNames.has(person.nameKey)), "player").slice(0, PLAYER_TARGET);
  return [
    ...players.map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}
'''
new = '''const PLAYER_POSITION_CAPS: Readonly<Record<League, Readonly<Record<string, number>>>> = {
  NFL: { QB: 20, RB: 16, WR: 16, TE: 8, OL: 2, DL: 12, LB: 10, DB: 14, K: 4, P: 3 },
  CFB: { QB: 20, RB: 18, WR: 16, TE: 8, OL: 2, DL: 14, LB: 12, DB: 14, K: 3, P: 3 },
};

const REVEALED_OL_EXCLUSIONS = new Set([
  "Orlando Pace",
  "Michael Oher",
  "Penei Sewell",
  "Quenton Nelson",
].map(normalize));

function selectPlayerCensus(league: League, candidates: readonly PersonCandidate[]) {
  const selected: PersonCandidate[] = [];
  const selectedKeys = new Set<string>();
  const counts = new Map<string, number>();
  const caps = PLAYER_POSITION_CAPS[league];
  for (const candidate of sortRoleCandidates(candidates, "player")) {
    const person: Person = { ...candidate, role: "player" };
    const position = rolePosition(person);
    if (!position || caps[position] == null) continue;
    if (position === "OL") {
      const window = roleWindow(person);
      if (!window || window.start < 2000 || REVEALED_OL_EXCLUSIONS.has(candidate.nameKey)) continue;
    }
    const count = counts.get(position) ?? 0;
    if (count >= caps[position]!) continue;
    selected.push(candidate);
    selectedKeys.add(candidate.key);
    counts.set(position, count + 1);
    if (selected.length === PLAYER_TARGET) break;
  }
  if (selected.length !== PLAYER_TARGET) {
    throw new Error(`${league} A/B launch census has only ${selected.length}/${PLAYER_TARGET} players inside the position caps`);
  }
  return selected;
}

function selectLaunchPool(league: League) {
  const people = rawPeople(league);
  const coaches = sortRoleCandidates(people, "coach").slice(0, COACH_TARGET);
  const coachNames = new Set(coaches.map((person) => person.nameKey));
  const players = selectPlayerCensus(league, people.filter((person) => !coachNames.has(person.nameKey)));
  return [
    ...players.map((person): Person => ({ ...person, role: "player" })),
    ...coaches.map((person): Person => ({ ...person, role: "coach" })),
  ];
}
'''
if old not in text:
    raise SystemExit("launch-pool selection anchor missing")
text = text.replace(old, new, 1)
readiness.write_text(text)
