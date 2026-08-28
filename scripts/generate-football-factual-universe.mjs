import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const writeJson = (relative, value) => {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`);
};
const normalized = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const columns = (data) => new Map(data.columns.map((name, index) => [name, index]));
const rowObjects = (data) => {
  const byColumn = columns(data);
  return data.rows.map((row) => Object.fromEntries([...byColumn].map(([key, index]) => [key, row[index]])));
};
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const sumKnown = (rows, key) => {
  const values = rows.map((row) => row[key]).filter(finite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
};
const maxKnown = (rows, key) => {
  const values = rows.map((row) => row[key]).filter(finite);
  return values.length ? Math.max(...values) : null;
};
const sourceIdForLeague = (league) => league === "NFL" ? "nflverse-factual-universe" : "cfbfast-r-factual-universe";
const reported = (league, metricId, value) => finite(value) ? { metricId, value, evidence: { sourceIds: [sourceIdForLeague(league)], kind: "reported" } } : null;
const relationshipReported = (metricId, value) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "reported" } } : null;
const derived = (league, metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: [sourceIdForLeague(league)], kind: "derived", formula } } : null;
const relationshipDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "derived", formula } } : null;
const compactFacts = (facts) => facts.filter(Boolean);

const recognition = readJson("data/generated/football/recognizability-projection.json");
const promoted = recognition.records.filter((record) => record.tier !== "D");
const promotedPlayers = promoted.filter((record) => record.kind === "player-career");
const promotedTeamSeasons = promoted.filter((record) => record.kind === "team-season");
const promotedPrograms = promoted.filter((record) => record.kind === "program" || record.kind === "franchise");
const promotedGames = promoted.filter((record) => record.kind === "game");

const nflPlayerRows = rowObjects(readJson("data/generated/football/nfl/player-seasons-1999-2025.json"));
const cfbPlayerRows = rowObjects(readJson("data/generated/football/cfb/player-seasons-2014-2025.json"));
const nflTeamStatRows = rowObjects(readJson("data/generated/football/nfl/team-seasons-1999-2025.json"));
const nflTeamResultRows = rowObjects(readJson("data/generated/football/relationships/nfl-team-season-results-1999-2025.json"));
const cfbTeamResultRows = rowObjects(readJson("data/generated/football/relationships/cfb-team-season-results-2002-2025.json"));
const nflGameRows = rowObjects(readJson("data/generated/football/relationships/nfl-games-1999-2025.json"));
const cfbGameRows = rowObjects(readJson("data/generated/football/relationships/cfb-games-2002-2025.json"));

const nflPlayersById = new Map();
for (const row of nflPlayerRows) {
  const values = nflPlayersById.get(String(row.sourcePlayerId)) ?? [];
  values.push(row);
  nflPlayersById.set(String(row.sourcePlayerId), values);
}
const cfbPlayersByName = new Map();
for (const row of cfbPlayerRows) {
  const key = normalized(row.playerName);
  const values = cfbPlayersByName.get(key) ?? [];
  values.push(row);
  cfbPlayersByName.set(key, values);
}

const withinWindow = (row, subject) => (
  (subject.startSeason == null || row.season >= subject.startSeason)
  && (subject.endSeason == null || row.season <= subject.endSeason)
);

function nflPlayerFacts(subject) {
  const rows = (nflPlayersById.get(String(subject.sourceId)) ?? [])
    .filter((row) => withinWindow(row, subject));
  if (!rows.length) return [];
  const games = sumKnown(rows, "games");
  const attempts = sumKnown(rows, "attempts");
  const completions = sumKnown(rows, "completions");
  const passYards = sumKnown(rows, "passingYards");
  const passTds = sumKnown(rows, "passingTouchdowns");
  const interceptionsThrown = sumKnown(rows, "passingInterceptions");
  const carries = sumKnown(rows, "carries");
  const rushYards = sumKnown(rows, "rushingYards");
  const rushTds = sumKnown(rows, "rushingTouchdowns");
  const receptions = sumKnown(rows, "receptions");
  const targets = sumKnown(rows, "targets");
  const receivingYards = sumKnown(rows, "receivingYards");
  const receivingTds = sumKnown(rows, "receivingTouchdowns");
  const fieldGoalsMade = sumKnown(rows, "fieldGoalsMade");
  const fieldGoalsAttempted = sumKnown(rows, "fieldGoalsAttempted");
  const punts = sumKnown(rows, "puntingAttempts");
  const puntingYards = sumKnown(rows, "puntingYards");
  const facts = compactFacts([
    reported("NFL", "nfl-career-games", games),
    reported("NFL", "nfl-career-passing-completions", completions),
    reported("NFL", "nfl-career-passing-attempts", attempts),
    reported("NFL", "nfl-career-passing-yards", passYards),
    reported("NFL", "nfl-career-passing-touchdowns", passTds),
    reported("NFL", "nfl-career-interceptions-thrown", interceptionsThrown),
    reported("NFL", "nfl-career-rushing-attempts", carries),
    reported("NFL", "nfl-career-rushing-yards", rushYards),
    reported("NFL", "nfl-career-rushing-touchdowns", rushTds),
    reported("NFL", "nfl-career-receptions", receptions),
    reported("NFL", "nfl-career-targets", targets),
    reported("NFL", "nfl-career-receiving-yards", receivingYards),
    reported("NFL", "nfl-career-receiving-touchdowns", receivingTds),
    reported("NFL", "nfl-career-solo-tackles", sumKnown(rows, "tacklesSolo")),
    reported("NFL", "nfl-career-tackles-for-loss", sumKnown(rows, "tacklesForLoss")),
    reported("NFL", "nfl-career-forced-fumbles", sumKnown(rows, "forcedFumbles")),
    reported("NFL", "nfl-career-sacks", sumKnown(rows, "defensiveSacks")),
    reported("NFL", "nfl-career-interceptions", sumKnown(rows, "defensiveInterceptions")),
    reported("NFL", "nfl-career-passes-defended", sumKnown(rows, "passesDefended")),
    reported("NFL", "nfl-career-field-goals-made", fieldGoalsMade),
    reported("NFL", "nfl-career-field-goals-attempted", fieldGoalsAttempted),
    reported("NFL", "nfl-career-punts", punts),
    reported("NFL", "nfl-career-punting-yards", puntingYards),
  ]);
  if (finite(attempts) && attempts > 0 && finite(completions)) facts.push(derived("NFL", "nfl-career-completion-percentage", completions / attempts * 100, "passing completions / passing attempts * 100"));
  if (finite(attempts) && attempts > 0 && finite(passYards)) facts.push(derived("NFL", "nfl-career-passing-yards-per-attempt", passYards / attempts, "passing yards / passing attempts"));
  if (finite(carries) && carries > 0 && finite(rushYards)) facts.push(derived("NFL", "nfl-career-rushing-yards-per-attempt", rushYards / carries, "rushing yards / rushing attempts"));
  if (finite(fieldGoalsAttempted) && fieldGoalsAttempted > 0 && finite(fieldGoalsMade)) facts.push(derived("NFL", "nfl-career-field-goal-percentage", fieldGoalsMade / fieldGoalsAttempted * 100, "field goals made / field goals attempted * 100"));
  if (finite(punts) && punts > 0 && finite(puntingYards)) facts.push(derived("NFL", "nfl-career-punting-average", puntingYards / punts, "punting yards / punts"));
  return facts;
}

function cfbPlayerFacts(subject) {
  let rows = (cfbPlayersByName.get(normalized(subject.name)) ?? []).filter((row) => withinWindow(row, subject));
  if (subject.school) {
    const schoolRows = rows.filter((row) => normalized(row.team) === normalized(subject.school));
    if (schoolRows.length) rows = schoolRows;
  }
  if (!rows.length) return [];
  const fgm = sumKnown(rows, "fieldGoalsMade");
  const fga = sumKnown(rows, "fieldGoalsAttempted");
  const facts = compactFacts([
    reported("CFB", "cfb-career-games", sumKnown(rows, "gamesPlayed")),
    reported("CFB", "cfb-career-passing-completions", sumKnown(rows, "passCompletions")),
    reported("CFB", "cfb-career-passing-attempts", sumKnown(rows, "passAttempts")),
    reported("CFB", "cfb-career-passing-yards", sumKnown(rows, "passYards")),
    reported("CFB", "cfb-career-passing-touchdowns", sumKnown(rows, "passTouchdowns")),
    reported("CFB", "cfb-career-interceptions-thrown", sumKnown(rows, "interceptionsThrown")),
    reported("CFB", "cfb-career-rushing-attempts", sumKnown(rows, "rushAttempts")),
    reported("CFB", "cfb-career-rushing-yards", sumKnown(rows, "rushYards")),
    reported("CFB", "cfb-career-rushing-touchdowns", sumKnown(rows, "rushTouchdowns")),
    reported("CFB", "cfb-career-receptions", sumKnown(rows, "receptions")),
    reported("CFB", "cfb-career-targets", sumKnown(rows, "targets")),
    reported("CFB", "cfb-career-receiving-yards", sumKnown(rows, "receivingYards")),
    reported("CFB", "cfb-career-receiving-touchdowns", sumKnown(rows, "receivingTouchdowns")),
    reported("CFB", "cfb-career-total-touchdowns", sumKnown(rows, "totalTouchdowns")),
    reported("CFB", "cfb-career-defensive-interceptions", sumKnown(rows, "defensiveInterceptions")),
    reported("CFB", "cfb-career-sacks", sumKnown(rows, "sacks")),
    reported("CFB", "cfb-career-pass-breakups", sumKnown(rows, "passBreakups")),
    reported("CFB", "cfb-career-forced-fumbles", sumKnown(rows, "forcedFumbles")),
    reported("CFB", "cfb-career-fumble-recoveries", sumKnown(rows, "fumbleRecoveries")),
    reported("CFB", "cfb-career-fumbles", sumKnown(rows, "fumbles")),
    reported("CFB", "cfb-career-field-goals-made", fgm),
    reported("CFB", "cfb-career-field-goals-attempted", fga),
    reported("CFB", "cfb-best-season-passing-yards", maxKnown(rows, "passYards")),
    reported("CFB", "cfb-best-season-passing-touchdowns", maxKnown(rows, "passTouchdowns")),
    reported("CFB", "cfb-best-season-rushing-yards", maxKnown(rows, "rushYards")),
    reported("CFB", "cfb-best-season-rushing-touchdowns", maxKnown(rows, "rushTouchdowns")),
    reported("CFB", "cfb-best-season-receptions", maxKnown(rows, "receptions")),
    reported("CFB", "cfb-best-season-receiving-yards", maxKnown(rows, "receivingYards")),
    reported("CFB", "cfb-best-season-receiving-touchdowns", maxKnown(rows, "receivingTouchdowns")),
    reported("CFB", "cfb-best-season-sacks", maxKnown(rows, "sacks")),
    reported("CFB", "cfb-best-season-defensive-interceptions", maxKnown(rows, "defensiveInterceptions")),
  ]);
  if (finite(fga) && fga > 0 && finite(fgm)) facts.push(derived("CFB", "cfb-career-field-goal-percentage", fgm / fga * 100, "field goals made / field goals attempted * 100"));
  return facts;
}

const nflTeamResultsByKey = new Map(nflTeamResultRows.map((row) => [`${row.season}:${row.franchiseId}`, row]));
const cfbTeamResultsByKey = new Map(cfbTeamResultRows.map((row) => [`${row.season}:${row.sourceProgramId}`, row]));
const nflTeamStatsByKey = new Map(nflTeamStatRows.map((row) => [`${row.season}:${row.team}`, row]));

function teamSeasonFacts(subject) {
  if (subject.league === "NFL") {
    const result = nflTeamResultsByKey.get(String(subject.sourceId));
    if (!result) return [];
    const stats = nflTeamStatsByKey.get(`${result.season}:${result.sourceTeamCode}`);
    const games = result.overallGames;
    return compactFacts([
      relationshipReported("nfl-team-overall-wins", result.overallWins),
      relationshipReported("nfl-team-overall-losses", result.overallLosses),
      relationshipReported("nfl-team-overall-ties", result.overallTies),
      relationshipReported("nfl-team-points-for", result.pointsFor),
      relationshipReported("nfl-team-points-against", result.pointsAgainst),
      finite(games) && games > 0 ? relationshipDerived("nfl-team-points-per-game", result.pointsFor / games, "points for / overall games") : null,
      finite(games) && games > 0 ? relationshipDerived("nfl-team-opponent-points-per-game", result.pointsAgainst / games, "points against / overall games") : null,
      relationshipDerived("nfl-team-point-differential", result.pointsFor - result.pointsAgainst, "points for - points against"),
      relationshipReported("nfl-team-postseason-wins", result.postseasonWins),
      relationshipReported("nfl-team-playoff-berth", result.playoffBerth ? 1 : 0),
      relationshipReported("nfl-team-conference-championship-game", result.conferenceChampionshipGame ? 1 : 0),
      relationshipReported("nfl-team-super-bowl-appearance", result.superBowlAppearance ? 1 : 0),
      relationshipReported("nfl-super-bowl-title", result.superBowlChampion ? 1 : 0),
      stats ? reported("NFL", "nfl-team-passing-yards", stats.passingYards) : null,
      stats ? reported("NFL", "nfl-team-rushing-yards", stats.rushingYards) : null,
      stats ? reported("NFL", "nfl-team-defensive-sacks", stats.defensiveSacks) : null,
      stats ? reported("NFL", "nfl-team-defensive-interceptions", stats.defensiveInterceptions) : null,
    ]);
  }
  const result = cfbTeamResultsByKey.get(String(subject.sourceId));
  if (!result) return [];
  const games = result.overallGames;
  return compactFacts([
    relationshipReported("cfb-team-wins", result.overallWins),
    relationshipReported("cfb-team-losses", result.overallLosses),
    relationshipReported("cfb-team-ties", result.overallTies),
    relationshipReported("cfb-team-points-for", result.pointsFor),
    relationshipReported("cfb-team-points-against", result.pointsAgainst),
    finite(games) && games > 0 ? relationshipDerived("cfb-team-points-per-game", result.pointsFor / games, "points for / overall games") : null,
    finite(games) && games > 0 ? relationshipDerived("cfb-team-opponent-points-per-game", result.pointsAgainst / games, "points against / overall games") : null,
    relationshipDerived("cfb-team-point-differential", result.pointsFor - result.pointsAgainst, "points for - points against"),
    relationshipReported("cfb-team-postseason-wins", result.postseasonWins),
    relationshipReported("cfb-team-conference-wins", result.conferenceWins),
    relationshipReported("cfb-team-conference-losses", result.conferenceLosses),
    result.explicitNationalChampion ? relationshipReported("cfb-national-title", 1) : null,
  ]);
}

const nflGamesById = new Map(nflGameRows.map((row) => [String(row.sourceGameId), row]));
const cfbGamesById = new Map(cfbGameRows.map((row) => [String(row.sourceGameId), row]));
function gameFacts(subject) {
  const row = (subject.league === "NFL" ? nflGamesById : cfbGamesById).get(String(subject.sourceId));
  if (!row) return [];
  const homeScore = row.homeScore ?? row.homePoints;
  const awayScore = row.awayScore ?? row.awayPoints;
  return compactFacts([
    relationshipReported("football-game-home-score", homeScore),
    relationshipReported("football-game-away-score", awayScore),
    finite(homeScore) && finite(awayScore) ? relationshipDerived("football-game-margin", Math.abs(homeScore - awayScore), "absolute value of home score - away score") : null,
    relationshipReported("football-game-overtime", row.overtime ? 1 : 0),
    relationshipReported("football-game-postseason", subject.league === "NFL" ? (row.gameType !== "REG" ? 1 : 0) : (row.postseason ? 1 : 0)),
    relationshipReported("football-game-championship", subject.league === "NFL" ? (row.superBowl ? 1 : 0) : (row.nationalChampionship ? 1 : 0)),
  ]);
}

function aggregateOrganizationFacts(subject) {
  const rows = subject.league === "NFL"
    ? nflTeamResultRows.filter((row) => String(row.franchiseId) === String(subject.sourceId))
    : cfbTeamResultRows.filter((row) => String(row.sourceProgramId) === String(subject.sourceId));
  if (!rows.length) return [];
  if (subject.league === "NFL") return compactFacts([
    relationshipReported("nfl-franchise-wins-since-1999", sumKnown(rows, "overallWins")),
    relationshipReported("nfl-franchise-losses-since-1999", sumKnown(rows, "overallLosses")),
    relationshipReported("nfl-franchise-playoff-wins-since-1999", sumKnown(rows, "postseasonWins")),
    relationshipReported("nfl-franchise-super-bowl-appearances-since-1999", rows.filter((row) => row.superBowlAppearance).length),
    relationshipReported("nfl-franchise-super-bowl-titles-since-1999", rows.filter((row) => row.superBowlChampion).length),
  ]);
  return compactFacts([
    relationshipReported("cfb-program-wins-since-2000", sumKnown(rows, "overallWins")),
    relationshipReported("cfb-program-losses-since-2000", sumKnown(rows, "overallLosses")),
    relationshipReported("cfb-program-postseason-wins-since-2000", sumKnown(rows, "postseasonWins")),
  ]);
}

const records = [];
for (const subject of promotedPlayers) {
  const facts = subject.league === "NFL" ? nflPlayerFacts(subject) : cfbPlayerFacts(subject);
  if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-player-career" : "cfb-player-career", facts });
}
for (const subject of promotedTeamSeasons) {
  const facts = teamSeasonFacts(subject);
  if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-team-season" : "cfb-team-season", facts });
}
for (const subject of promotedPrograms) {
  const facts = aggregateOrganizationFacts(subject);
  if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-franchise" : "cfb-program", facts });
}
for (const subject of promotedGames) {
  const facts = gameFacts(subject);
  if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-game" : "cfb-game", facts });
}
records.sort((a, b) => a.subjectId.localeCompare(b.subjectId));

const metricFamily = (metricId) => {
  if (metricId.includes("field-goal") || metricId.includes("punt")) return "specialist";
  if (metricId.includes("sack") || metricId.includes("tackle") || metricId.includes("defensive") || metricId.includes("forced-fumble") || metricId.includes("pass-breakup") || metricId.includes("passes-defended")) return "defense";
  if (metricId.includes("percentage") || metricId.includes("per-") || metricId.includes("rating")) return "efficiency";
  if (metricId.includes("postseason") || metricId.includes("playoff") || metricId.includes("super-bowl") || metricId.includes("national-title") || metricId.includes("championship")) return "team-success";
  if (metricId.includes("game-") || metricId.includes("program-") || metricId.includes("franchise-")) return "relationship";
  return "production";
};
const recordBySubject = new Map(records.map((record) => [record.subjectId, record]));
const playerPools = [["QB", ["QB"]], ["RB", ["RB"]], ["WR", ["WR"]], ["TE", ["TE"]], ["OL", ["OL"]], ["DL / EDGE", ["DL"]], ["LB", ["LB"]], ["Secondary", ["DB"]], ["K / P", ["K", "P"]]];
const coverageRows = [];
for (const league of ["NFL", "CFB"]) for (const [pool, positions] of playerPools) {
  const universe = promotedPlayers.filter((subject) => subject.league === league && positions.includes(subject.position));
  const hydrated = universe.filter((subject) => recordBySubject.has(subject.id));
  const familyCounts = {};
  for (const subject of hydrated) {
    const families = new Set(recordBySubject.get(subject.id).facts.map((fact) => metricFamily(fact.metricId)));
    for (const family of families) familyCounts[family] = (familyCounts[family] ?? 0) + 1;
  }
  coverageRows.push({ league, pool, universeSubjects: universe.length, subjectsWithFacts: hydrated.length, readinessPct: universe.length ? Number((hydrated.length / universe.length * 100).toFixed(1)) : 0, averageFacts: hydrated.length ? Number((hydrated.reduce((sum, subject) => sum + recordBySubject.get(subject.id).facts.length, 0) / hydrated.length).toFixed(2)) : 0, metricFamilySubjectCounts: familyCounts });
}
const nonPlayerKinds = ["team-season", "franchise", "program", "coach-stop", "era", "game"];
for (const league of ["NFL", "CFB"]) for (const kind of nonPlayerKinds) {
  const universe = promoted.filter((subject) => subject.league === league && subject.kind === kind);
  if (!universe.length) continue;
  const hydrated = universe.filter((subject) => recordBySubject.has(subject.id));
  coverageRows.push({ league, pool: kind, universeSubjects: universe.length, subjectsWithFacts: hydrated.length, readinessPct: Number((hydrated.length / universe.length * 100).toFixed(1)), averageFacts: hydrated.length ? Number((hydrated.reduce((sum, subject) => sum + recordBySubject.get(subject.id).facts.length, 0) / hydrated.length).toFixed(2)) : 0 });
}

const output = {
  schemaVersion: 1,
  methodology: "Stage 12 A/B/C gate hydrated only from existing pinned normalized factual and relationship corpora; missing values remain absent; no ranking or greatness weights",
  gate: { source: "recognizability-projection.json", promotedRecordCount: promoted.length },
  sourceCoverage: { nfl: "1999-2025", cfbPlayers: "2014-2025", cfbRelationships: "2002-2025" },
  records,
};
const matrix = {
  schemaVersion: 1,
  gatePromotedRecordCount: promoted.length,
  generatedRecordCount: records.length,
  rawRecognitionRecordCount: recognition.summary?.rawRecordCount ?? null,
  rows: coverageRows,
  notes: [
    "Counts are post-gate A/B/C recognition identities, never raw database counts.",
    "A subject is fact-ready only when at least one source-backed Stage 13 fact reconciles to it.",
    "Unknown source values are omitted; the generator never substitutes zero for null/undefined.",
    "Honors already owned by reviewed canonical facts remain authoritative and are not inferred from recognition evidence.",
  ],
};
writeJson("data/generated/football/factual-universe-projection.json", output);
writeJson("data/generated/football/factual-coverage-matrix.json", matrix);
console.log(`Generated ${records.length} Stage 13 factual records from ${promoted.length} A/B/C recognition records.`);
