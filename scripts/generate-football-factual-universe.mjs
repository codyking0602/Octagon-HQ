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
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const normalized = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const rowObjects = (data) => {
  const indexes = new Map(data.columns.map((name, index) => [name, index]));
  return data.rows.map((row) => Object.fromEntries([...indexes].map(([key, index]) => [key, row[index]])));
};
const valuesFor = (rows, key) => rows.map((row) => row[key]).filter(finite);
const sumKnown = (rows, key) => {
  const values = valuesFor(rows, key);
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
};
const sumObserved = (rows, key) => {
  const values = valuesFor(rows, key);
  return values.some((value) => value !== 0) ? values.reduce((sum, value) => sum + value, 0) : null;
};
const maxObserved = (rows, key) => {
  const values = valuesFor(rows, key);
  return values.some((value) => value !== 0) ? Math.max(...values) : null;
};
const compact = (rows) => rows.filter(Boolean);
const sourceId = (league) => league === "NFL" ? "nflverse-factual-universe" : "cfbfast-r-factual-universe";
const fact = (league, metricId, value) => finite(value) ? { metricId, value, evidence: { sourceIds: [sourceId(league)], kind: "reported" } } : null;
const derived = (league, metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: [sourceId(league)], kind: "derived", formula } } : null;
const relationshipFact = (metricId, value) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "reported" } } : null;
const relationshipDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "derived", formula } } : null;

const recognition = readJson("data/generated/football/recognizability-projection.json");
const promoted = recognition.records.filter((record) => record.tier !== "D");
const promotedPlayers = promoted.filter((record) => record.kind === "player-career");
const promotedTeamSeasons = promoted.filter((record) => record.kind === "team-season");
const promotedOrganizations = promoted.filter((record) => record.kind === "franchise" || record.kind === "program");
const promotedGames = promoted.filter((record) => record.kind === "game");

const nflPlayers = rowObjects(readJson("data/generated/football/nfl/player-seasons-1999-2025.json"));
const cfbPlayers = rowObjects(readJson("data/generated/football/cfb/player-seasons-2014-2025.json"));
const nflTeamStats = rowObjects(readJson("data/generated/football/nfl/team-seasons-1999-2025.json"));
const nflTeamResults = rowObjects(readJson("data/generated/football/relationships/nfl-team-season-results-1999-2025.json"));
const cfbTeamResults = rowObjects(readJson("data/generated/football/relationships/cfb-team-season-results-2002-2025.json"));
const nflGames = rowObjects(readJson("data/generated/football/relationships/nfl-games-1999-2025.json"));
const cfbGames = rowObjects(readJson("data/generated/football/relationships/cfb-games-2002-2025.json"));

const nflPlayersById = new Map();
for (const row of nflPlayers) {
  const rows = nflPlayersById.get(String(row.sourcePlayerId)) ?? [];
  rows.push(row);
  nflPlayersById.set(String(row.sourcePlayerId), rows);
}
const cfbPlayersByName = new Map();
for (const row of cfbPlayers) {
  const key = normalized(row.playerName);
  const rows = cfbPlayersByName.get(key) ?? [];
  rows.push(row);
  cfbPlayersByName.set(key, rows);
}
const withinWindow = (row, subject) => (subject.startSeason == null || row.season >= subject.startSeason) && (subject.endSeason == null || row.season <= subject.endSeason);

function nflPlayerFacts(subject) {
  const rows = (nflPlayersById.get(String(subject.sourceId)) ?? []).filter((row) => withinWindow(row, subject));
  if (!rows.length) return [];
  const p = subject.position;
  const facts = [];
  const games = sumObserved(rows, "games");
  if (finite(games)) facts.push(fact("NFL", "nfl-career-games", games));
  if (p === "QB") {
    const attempts = sumObserved(rows, "attempts");
    const completions = sumObserved(rows, "completions");
    const yards = sumObserved(rows, "passingYards");
    facts.push(...compact([
      fact("NFL", "nfl-career-passing-completions", completions), fact("NFL", "nfl-career-passing-attempts", attempts), fact("NFL", "nfl-career-passing-yards", yards),
      fact("NFL", "nfl-career-passing-touchdowns", sumObserved(rows, "passingTouchdowns")), fact("NFL", "nfl-career-interceptions-thrown", sumObserved(rows, "passingInterceptions")),
    ]));
    if (finite(attempts) && attempts > 0 && finite(completions)) facts.push(derived("NFL", "nfl-career-completion-percentage", completions / attempts * 100, "passing completions / passing attempts * 100"));
    if (finite(attempts) && attempts > 0 && finite(yards)) facts.push(derived("NFL", "nfl-career-passing-yards-per-attempt", yards / attempts, "passing yards / passing attempts"));
  }
  if (["QB", "RB", "WR", "TE"].includes(p)) {
    const carries = sumObserved(rows, "carries");
    const yards = sumObserved(rows, "rushingYards");
    facts.push(...compact([fact("NFL", "nfl-career-rushing-attempts", carries), fact("NFL", "nfl-career-rushing-yards", yards), fact("NFL", "nfl-career-rushing-touchdowns", sumObserved(rows, "rushingTouchdowns"))]));
    if (finite(carries) && carries > 0 && finite(yards)) facts.push(derived("NFL", "nfl-career-rushing-yards-per-attempt", yards / carries, "rushing yards / rushing attempts"));
  }
  if (["RB", "WR", "TE"].includes(p)) facts.push(...compact([
    fact("NFL", "nfl-career-receptions", sumObserved(rows, "receptions")), fact("NFL", "nfl-career-targets", sumObserved(rows, "targets")), fact("NFL", "nfl-career-receiving-yards", sumObserved(rows, "receivingYards")), fact("NFL", "nfl-career-receiving-touchdowns", sumObserved(rows, "receivingTouchdowns")),
  ]));
  if (["DL", "LB", "DB"].includes(p)) facts.push(...compact([
    fact("NFL", "nfl-career-solo-tackles", sumObserved(rows, "tacklesSolo")), fact("NFL", "nfl-career-tackles-for-loss", sumObserved(rows, "tacklesForLoss")), fact("NFL", "nfl-career-forced-fumbles", sumObserved(rows, "forcedFumbles")),
    fact("NFL", "nfl-career-sacks", sumObserved(rows, "defensiveSacks")), fact("NFL", "nfl-career-interceptions", sumObserved(rows, "defensiveInterceptions")), fact("NFL", "nfl-career-passes-defended", sumObserved(rows, "passesDefended")),
  ]));
  if (p === "K") {
    const attempts = sumObserved(rows, "fieldGoalsAttempted");
    const made = finite(attempts) && attempts > 0 ? sumKnown(rows, "fieldGoalsMade") : null;
    facts.push(...compact([fact("NFL", "nfl-career-field-goals-made", made), fact("NFL", "nfl-career-field-goals-attempted", attempts)]));
    if (finite(attempts) && attempts > 0 && finite(made)) facts.push(derived("NFL", "nfl-career-field-goal-percentage", made / attempts * 100, "field goals made / field goals attempted * 100"));
  }
  if (p === "P") {
    const punts = sumObserved(rows, "puntingAttempts");
    const yards = sumObserved(rows, "puntingYards");
    facts.push(...compact([fact("NFL", "nfl-career-punts", punts), fact("NFL", "nfl-career-punting-yards", yards)]));
    if (finite(punts) && punts > 0 && finite(yards)) facts.push(derived("NFL", "nfl-career-punting-average", yards / punts, "punting yards / punts"));
  }
  return compact(facts);
}

function cfbPlayerFacts(subject) {
  let rows = (cfbPlayersByName.get(normalized(subject.name)) ?? []).filter((row) => withinWindow(row, subject));
  if (subject.school) {
    const schoolRows = rows.filter((row) => normalized(row.team) === normalized(subject.school));
    if (schoolRows.length) rows = schoolRows;
  }
  if (!rows.length) return [];
  const p = subject.position;
  const facts = [fact("CFB", "cfb-career-games", sumObserved(rows, "gamesPlayed"))];
  if (p === "QB") facts.push(...compact([
    fact("CFB", "cfb-career-passing-completions", sumObserved(rows, "passCompletions")), fact("CFB", "cfb-career-passing-attempts", sumObserved(rows, "passAttempts")), fact("CFB", "cfb-career-passing-yards", sumObserved(rows, "passYards")),
    fact("CFB", "cfb-career-passing-touchdowns", sumObserved(rows, "passTouchdowns")), fact("CFB", "cfb-career-interceptions-thrown", sumObserved(rows, "interceptionsThrown")), fact("CFB", "cfb-best-season-passing-yards", maxObserved(rows, "passYards")), fact("CFB", "cfb-best-season-passing-touchdowns", maxObserved(rows, "passTouchdowns")),
  ]));
  if (["QB", "RB", "WR", "TE"].includes(p)) facts.push(...compact([
    fact("CFB", "cfb-career-rushing-attempts", sumObserved(rows, "rushAttempts")), fact("CFB", "cfb-career-rushing-yards", sumObserved(rows, "rushYards")), fact("CFB", "cfb-career-rushing-touchdowns", sumObserved(rows, "rushTouchdowns")),
    fact("CFB", "cfb-best-season-rushing-yards", maxObserved(rows, "rushYards")), fact("CFB", "cfb-best-season-rushing-touchdowns", maxObserved(rows, "rushTouchdowns")),
  ]));
  if (["RB", "WR", "TE"].includes(p)) facts.push(...compact([
    fact("CFB", "cfb-career-receptions", sumObserved(rows, "receptions")), fact("CFB", "cfb-career-targets", sumObserved(rows, "targets")), fact("CFB", "cfb-career-receiving-yards", sumObserved(rows, "receivingYards")), fact("CFB", "cfb-career-receiving-touchdowns", sumObserved(rows, "receivingTouchdowns")),
    fact("CFB", "cfb-career-total-touchdowns", sumObserved(rows, "totalTouchdowns")), fact("CFB", "cfb-best-season-receptions", maxObserved(rows, "receptions")), fact("CFB", "cfb-best-season-receiving-yards", maxObserved(rows, "receivingYards")), fact("CFB", "cfb-best-season-receiving-touchdowns", maxObserved(rows, "receivingTouchdowns")),
  ]));
  if (["DL", "LB", "DB"].includes(p)) facts.push(...compact([
    fact("CFB", "cfb-career-defensive-interceptions", sumObserved(rows, "defensiveInterceptions")), fact("CFB", "cfb-career-sacks", sumObserved(rows, "sacks")), fact("CFB", "cfb-career-pass-breakups", sumObserved(rows, "passBreakups")),
    fact("CFB", "cfb-career-forced-fumbles", sumObserved(rows, "forcedFumbles")), fact("CFB", "cfb-career-fumble-recoveries", sumObserved(rows, "fumbleRecoveries")), fact("CFB", "cfb-best-season-sacks", maxObserved(rows, "sacks")), fact("CFB", "cfb-best-season-defensive-interceptions", maxObserved(rows, "defensiveInterceptions")),
  ]));
  if (p === "K") {
    const attempts = sumObserved(rows, "fieldGoalsAttempted");
    const made = finite(attempts) && attempts > 0 ? sumKnown(rows, "fieldGoalsMade") : null;
    facts.push(...compact([fact("CFB", "cfb-career-field-goals-made", made), fact("CFB", "cfb-career-field-goals-attempted", attempts)]));
    if (finite(attempts) && attempts > 0 && finite(made)) facts.push(derived("CFB", "cfb-career-field-goal-percentage", made / attempts * 100, "field goals made / field goals attempted * 100"));
  }
  return compact(facts);
}

const nflTeamResultsByKey = new Map(nflTeamResults.map((row) => [`${row.season}:${row.franchiseId}`, row]));
const cfbTeamResultsByKey = new Map(cfbTeamResults.map((row) => [`${row.season}:${row.sourceProgramId}`, row]));
const nflTeamStatsByKey = new Map(nflTeamStats.map((row) => [`${row.season}:${row.team}`, row]));
function teamSeasonFacts(subject) {
  if (subject.league === "NFL") {
    const row = nflTeamResultsByKey.get(String(subject.sourceId));
    if (!row) return [];
    const stats = nflTeamStatsByKey.get(`${row.season}:${row.sourceTeamCode}`) ?? nflTeamStatsByKey.get(`${row.season}:${row.franchiseId}`);
    const games = row.overallGames;
    return compact([
      relationshipFact("nfl-team-overall-wins", row.overallWins), relationshipFact("nfl-team-overall-losses", row.overallLosses), relationshipFact("nfl-team-overall-ties", row.overallTies), relationshipFact("nfl-team-points-for", row.pointsFor), relationshipFact("nfl-team-points-against", row.pointsAgainst),
      finite(games) && games > 0 ? relationshipDerived("nfl-team-points-per-game", row.pointsFor / games, "points for / overall games") : null, finite(games) && games > 0 ? relationshipDerived("nfl-team-opponent-points-per-game", row.pointsAgainst / games, "points against / overall games") : null,
      relationshipDerived("nfl-team-point-differential", row.pointsFor - row.pointsAgainst, "points for - points against"), relationshipFact("nfl-team-postseason-wins", row.postseasonWins), relationshipFact("nfl-team-playoff-berth", row.playoffBerth ? 1 : 0),
      relationshipFact("nfl-team-conference-championship-game", row.conferenceChampionshipGame ? 1 : 0), relationshipFact("nfl-team-super-bowl-appearance", row.superBowlAppearance ? 1 : 0), relationshipFact("nfl-super-bowl-title", row.superBowlChampion ? 1 : 0),
      stats ? fact("NFL", "nfl-team-passing-yards", stats.passingYards) : null, stats ? fact("NFL", "nfl-team-rushing-yards", stats.rushingYards) : null, stats ? fact("NFL", "nfl-team-defensive-sacks", stats.defensiveSacks) : null, stats ? fact("NFL", "nfl-team-defensive-interceptions", stats.defensiveInterceptions) : null,
    ]);
  }
  const row = cfbTeamResultsByKey.get(String(subject.sourceId));
  if (!row) return [];
  const games = row.overallGames;
  return compact([
    relationshipFact("cfb-team-wins", row.overallWins), relationshipFact("cfb-team-losses", row.overallLosses), relationshipFact("cfb-team-ties", row.overallTies), relationshipFact("cfb-team-points-for", row.pointsFor), relationshipFact("cfb-team-points-against", row.pointsAgainst),
    finite(games) && games > 0 ? relationshipDerived("cfb-team-points-per-game", row.pointsFor / games, "points for / overall games") : null, finite(games) && games > 0 ? relationshipDerived("cfb-team-opponent-points-per-game", row.pointsAgainst / games, "points against / overall games") : null,
    relationshipDerived("cfb-team-point-differential", row.pointsFor - row.pointsAgainst, "points for - points against"), relationshipFact("cfb-team-postseason-wins", row.postseasonWins), relationshipFact("cfb-team-conference-wins", row.conferenceWins), relationshipFact("cfb-team-conference-losses", row.conferenceLosses),
    row.explicitNationalChampion ? relationshipFact("cfb-national-title", 1) : null,
  ]);
}

const nflGamesById = new Map(nflGames.map((row) => [String(row.sourceGameId), row]));
const cfbGamesById = new Map(cfbGames.map((row) => [String(row.sourceGameId), row]));
function gameFacts(subject) {
  const row = (subject.league === "NFL" ? nflGamesById : cfbGamesById).get(String(subject.sourceId));
  if (!row) return [];
  const homeScore = subject.league === "NFL" ? row.homeScore : row.homePoints;
  const awayScore = subject.league === "NFL" ? row.awayScore : row.awayPoints;
  return compact([
    relationshipFact("football-game-home-score", homeScore), relationshipFact("football-game-away-score", awayScore), finite(homeScore) && finite(awayScore) ? relationshipDerived("football-game-margin", Math.abs(homeScore - awayScore), "absolute value of home score - away score") : null,
    subject.league === "NFL" ? relationshipFact("football-game-overtime", row.overtime ? 1 : 0) : null,
    subject.league === "NFL" ? relationshipFact("football-game-postseason", row.gameType !== "REG" ? 1 : 0) : relationshipFact("football-game-postseason", String(row.seasonType).toLowerCase() !== "regular" ? 1 : 0),
    subject.league === "NFL" ? relationshipFact("football-game-championship", row.superBowl ? 1 : 0) : (row.explicitNationalChampionshipGame ? relationshipFact("football-game-championship", 1) : null),
  ]);
}

function organizationFacts(subject) {
  const rows = subject.league === "NFL" ? nflTeamResults.filter((row) => String(row.franchiseId) === String(subject.sourceId)) : cfbTeamResults.filter((row) => String(row.sourceProgramId) === String(subject.sourceId));
  if (!rows.length) return [];
  if (subject.league === "NFL") return compact([
    relationshipFact("nfl-franchise-wins-since-1999", sumKnown(rows, "overallWins")), relationshipFact("nfl-franchise-losses-since-1999", sumKnown(rows, "overallLosses")), relationshipFact("nfl-franchise-playoff-wins-since-1999", sumKnown(rows, "postseasonWins")),
    relationshipFact("nfl-franchise-super-bowl-appearances-since-1999", rows.filter((row) => row.superBowlAppearance).length), relationshipFact("nfl-franchise-super-bowl-titles-since-1999", rows.filter((row) => row.superBowlChampion).length),
  ]);
  return compact([relationshipFact("cfb-program-wins-since-2000", sumKnown(rows, "overallWins")), relationshipFact("cfb-program-losses-since-2000", sumKnown(rows, "overallLosses")), relationshipFact("cfb-program-postseason-wins-since-2000", sumKnown(rows, "postseasonWins"))]);
}

const records = [];
for (const subject of promotedPlayers) { const facts = subject.league === "NFL" ? nflPlayerFacts(subject) : cfbPlayerFacts(subject); if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-player-career" : "cfb-player-career", facts }); }
for (const subject of promotedTeamSeasons) { const facts = teamSeasonFacts(subject); if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-team-season" : "cfb-team-season", facts }); }
for (const subject of promotedOrganizations) { const facts = organizationFacts(subject); if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-franchise" : "cfb-program", facts }); }
for (const subject of promotedGames) { const facts = gameFacts(subject); if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-game" : "cfb-game", facts }); }
records.sort((a, b) => a.subjectId.localeCompare(b.subjectId));

const familyFor = (metricId) => {
  if (/field-goal|punt/.test(metricId)) return "specialist";
  if (/all-pro|mvp|dpoy|heisman|honor|award/.test(metricId)) return "honors";
  if (/sack|tackle|defensive|forced-fumble|pass-breakup|passes-defended/.test(metricId)) return "defense";
  if (/percentage|per-attempt|rating|average/.test(metricId)) return "efficiency";
  if (/postseason|playoff|super-bowl|national-title|championship/.test(metricId)) return "team-success";
  if (/game-|program-|franchise-/.test(metricId)) return "relationship";
  return "production";
};
const recordsBySubject = new Map(records.map((record) => [record.subjectId, record]));
const pools = [["QB", ["QB"]], ["RB", ["RB"]], ["WR", ["WR"]], ["TE", ["TE"]], ["OL", ["OL"]], ["DL / EDGE", ["DL"]], ["LB", ["LB"]], ["Secondary", ["DB"]], ["K / P", ["K", "P"]]];
const matrixRows = [];
for (const league of ["NFL", "CFB"]) for (const [pool, positions] of pools) {
  const universe = promotedPlayers.filter((subject) => subject.league === league && positions.includes(subject.position));
  const hydrated = universe.filter((subject) => recordsBySubject.has(subject.id));
  const familyCounts = {};
  for (const subject of hydrated) for (const family of new Set(recordsBySubject.get(subject.id).facts.map((row) => familyFor(row.metricId)))) familyCounts[family] = (familyCounts[family] ?? 0) + 1;
  matrixRows.push({ league, pool, universeSubjects: universe.length, subjectsWithFacts: hydrated.length, readinessPct: universe.length ? Number((hydrated.length / universe.length * 100).toFixed(1)) : 0, averageFacts: hydrated.length ? Number((hydrated.reduce((sum, subject) => sum + recordsBySubject.get(subject.id).facts.length, 0) / hydrated.length).toFixed(2)) : 0, metricFamilySubjectCounts: familyCounts });
}
for (const league of ["NFL", "CFB"]) for (const kind of ["team-season", "franchise", "program", "coach-stop", "era", "game"]) {
  const universe = promoted.filter((subject) => subject.league === league && subject.kind === kind);
  if (!universe.length) continue;
  const hydrated = universe.filter((subject) => recordsBySubject.has(subject.id));
  matrixRows.push({ league, pool: kind, universeSubjects: universe.length, subjectsWithFacts: hydrated.length, readinessPct: Number((hydrated.length / universe.length * 100).toFixed(1)), averageFacts: hydrated.length ? Number((hydrated.reduce((sum, subject) => sum + recordsBySubject.get(subject.id).facts.length, 0) / hydrated.length).toFixed(2)) : 0 });
}

writeJson("data/generated/football/factual-universe-projection.json", { schemaVersion: 1, methodology: "Stage 12 source-projected A/B/C identities hydrated only from pinned normalized factual/relationship corpora; structural player zeroes are not treated as observed facts; no rankings or greatness weights", gate: { source: "recognizability-projection.json", promotedSourceProjectionCount: promoted.length }, sourceCoverage: { nfl: "1999-2025", cfbPlayers: "2014-2025", cfbRelationships: "2002-2025" }, records });
writeJson("data/generated/football/factual-coverage-matrix.json", { schemaVersion: 1, scope: "source-projected portion of canonical Stage 12 A/B/C; canonical runtime matrix includes curated/evidence-bridged A/B/C identities", gatePromotedSourceProjectionCount: promoted.length, generatedRecordCount: records.length, rawRecognitionRecordCount: recognition.summary?.rawRecordCount ?? null, rows: matrixRows, notes: ["Denominators are promoted A/B/C source-projection records, never raw database rows.", "Structural player zeroes are omitted unless an attempted/made denominator proves the zero is observed.", "Reviewed canonical honor facts retain ownership and are not inferred from recognition-only evidence.", "Sparse CFB championship note flags are emitted only when explicitly true; false is not asserted as complete historical evidence."] });
console.log(`Generated ${records.length} Stage 13 factual records from ${promoted.length} promoted source-projection records.`);
