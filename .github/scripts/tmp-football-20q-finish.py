from pathlib import Path

p = Path("src/features/games/twentyQuestionsStrictPool.tmp.audit.test.ts")
s = p.read_text()
marker = "  return rows;\n}\n\nfunction percentile"
extra = '''  for (const position of playerPositions) {
    const fineGameThresholds = league === "NFL"
      ? Array.from({ length: 50 }, (_value, index) => 5 + index * 5)
      : Array.from({ length: 30 }, (_value, index) => 2 + index * 2);
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

diag_marker = '''  const duplicateGroups = [...fingerprintGroups.values()].filter((group) => group.length > 1);
  const impossibleIndexes = new Set(duplicateGroups.flat());'''
diag_replacement = '''  const duplicateGroups = [...fingerprintGroups.values()].filter((group) => group.length > 1);
  if (duplicateGroups.length) {
    const collisionDiagnostics = duplicateGroups.map((group) => group.map((index) => {
      const person = pool[index]!;
      return {
        key: person.key,
        role: person.role,
        position: rolePosition(person),
        window: roleWindow(person),
        records: roleRecords(person).map((record) => ({
          id: record.id,
          facts: Object.fromEntries((getFootballFactualRecord(record.id)?.facts ?? []).map((fact) => [fact.metricId, fact.value])),
        })),
      };
    }));
    console.log(`TWENTY_QUESTIONS_COLLISIONS=${JSON.stringify(collisionDiagnostics)}`);
  }
  const impossibleIndexes = new Set(duplicateGroups.flat());'''
if diag_marker not in s:
    raise SystemExit("collision diagnostic marker not found")
s = s.replace(diag_marker, diag_replacement, 1)
p.write_text(s)
