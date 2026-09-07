from pathlib import Path

path = Path("src/features/games/twentyQuestionsFactualReadiness.audit.test.ts")
text = path.read_text()
anchor = '''    collisionSubjects: duplicateGroups.map((group) => group.map((index) => ({
      name: pool[index]!.records[0]!.name,
      role: pool[index]!.role,
      position: rolePosition(pool[index]!),
      records: roleRecords(pool[index]!).map((record) => ({
        id: record.id,
        name: record.name,
        position: record.position ?? null,
        canonicalId: getFootballSubject(record.id)?.id ?? null,
        canonicalPosition: getFootballSubject(record.id)?.position ?? null,
      })),
    }))),
'''
addition = anchor + '''    collisionValues: duplicateGroups.map((group) => group.map((index) => {
      const person = pool[index]!;
      const metricIds = league === "NFL" ? [
        "nfl-career-games", "nfl-career-rushing-yards", "nfl-career-rushing-touchdowns",
        "nfl-career-receiving-yards", "nfl-career-receptions", "nfl-career-receiving-touchdowns",
        "nfl-career-sacks", "nfl-career-interceptions", "nfl-career-field-goals-made", "nfl-career-punts",
        "nfl-first-team-all-pros", "nfl-super-bowl-titles",
      ] : [
        "cfb-career-games", "cfb-career-passing-yards", "cfb-career-passing-touchdowns",
        "cfb-career-rushing-yards", "cfb-career-rushing-touchdowns", "cfb-career-receiving-yards",
        "cfb-career-receptions", "cfb-career-sacks", "cfb-career-defensive-interceptions", "cfb-heisman-awards",
        "cfb-coach-career-wins", "cfb-coach-career-losses", "cfb-coach-national-titles", "cfb-coach-career-win-percentage",
      ];
      return {
        name: person.records[0]!.name,
        role: person.role,
        position: rolePosition(person),
        window: roleWindow(person),
        values: Object.fromEntries(metricIds.map((metricId) => [metricId, numericFact(person, metricId)])),
      };
    })),
'''
if "collisionValues:" not in text:
    if anchor not in text:
        raise SystemExit("collisionSubjects anchor missing")
    text = text.replace(anchor, addition, 1)
missing_anchor = '''      coachStats: pool.filter((person) => person.role === "coach" && numericFact(person, "nfl-coach-seasons-since-1999") == null).map((person) => person.records[0]!.name),
'''
if 'rbRushYards:' not in text:
    text = text.replace(missing_anchor, missing_anchor + '''      rbRushYards: pool.filter((person) => person.role === "player" && rolePosition(person) === "RB" && numericFact(person, "nfl-career-rushing-yards") == null).map((person) => person.records[0]!.name),
      dlGames: pool.filter((person) => person.role === "player" && rolePosition(person) === "DL" && numericFact(person, "nfl-career-games") == null).map((person) => person.records[0]!.name),
      dbGames: pool.filter((person) => person.role === "player" && rolePosition(person) === "DB" && numericFact(person, "nfl-career-games") == null).map((person) => person.records[0]!.name),
''', 1)
cfb_anchor = '''      defensiveInterceptions: pool.filter((person) => person.role === "player" && ["DB", "LB"].includes(rolePosition(person) ?? "") && numericFact(person, "cfb-career-defensive-interceptions") == null).map((person) => person.records[0]!.name),
'''
if 'missingGamesByPosition:' not in text:
    text = text.replace(cfb_anchor, cfb_anchor + '''      missingGamesByPosition: Object.fromEntries(["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"].map((position) => [position, pool.filter((person) => person.role === "player" && rolePosition(person) === position && numericFact(person, "cfb-career-games") == null).map((person) => person.records[0]!.name)])),
''', 1)
path.write_text(text)
