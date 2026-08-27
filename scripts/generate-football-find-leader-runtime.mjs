import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = new URL("../", import.meta.url);
const DEFAULT_OUTPUT = "data/generated/football/find-leader-runtime-projection.json";
const read = (file) => JSON.parse(fs.readFileSync(new URL(file, root), "utf8"));
const normalize = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const finite = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const ixFor = (corpus) => Object.fromEntries(corpus.columns.map((column, index) => [column, index]));
const at = (row, ix, column) => ix[column] == null ? undefined : row[ix[column]];
const promoted = (tier) => tier === "A" || tier === "B" || tier === "C";

const outputArg = process.argv.indexOf("--output");
const outputPath = outputArg >= 0 ? process.argv[outputArg + 1] : DEFAULT_OUTPUT;
const check = process.argv.includes("--check");

const recognition = read("data/generated/football/recognizability-projection.json");
const nflPlayers = read("data/generated/football/nfl/player-seasons-1999-2025.json");
const cfbPlayers = read("data/generated/football/cfb/player-seasons-2014-2025.json");
const nflTeamSeasons = read("data/generated/football/relationships/nfl-team-season-results-1999-2025.json");
const cfbTeamSeasons = read("data/generated/football/relationships/cfb-team-season-results-2002-2025.json");

const recognitionRecords = recognition.records.filter((record) => promoted(record.tier));
const nflCareerRecognition = new Map(
  recognitionRecords
    .filter((record) => record.kind === "player-career" && record.sourceProvider === "nflverse")
    .map((record) => [String(record.sourceId), record]),
);
const cfbCareerRecognition = new Map(
  recognitionRecords
    .filter((record) => record.kind === "player-career" && record.sourceProvider === "cfbfastR")
    .map((record) => [`${String(record.sourceId)}:${normalize(record.name)}`, record]),
);
const nflTeamRecognition = new Map(
  recognitionRecords
    .filter((record) => record.kind === "team-season" && record.sourceProvider === "nflverse")
    .map((record) => [String(record.sourceId), record]),
);
const cfbTeamRecognition = new Map(
  recognitionRecords
    .filter((record) => record.kind === "team-season" && record.sourceProvider === "cfbfastR")
    .map((record) => [String(record.sourceId), record]),
);

const subjects = [];
const records = [];
const seenSubjectIds = new Set();

function pushSubject(subject) {
  if (seenSubjectIds.has(subject.id)) throw new Error(`Duplicate Find the Leader projected subject: ${subject.id}`);
  seenSubjectIds.add(subject.id);
  subjects.push(subject);
}

function pushRecord(subjectId, scope, facts) {
  const cleanFacts = facts.filter(([, value]) => typeof value === "number" && Number.isFinite(value));
  if (cleanFacts.length === 0) return;
  records.push({ subjectId, scope, facts: cleanFacts });
}

function safeDivide(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}

function nflPasserRating(completions, attempts, yards, touchdowns, interceptions) {
  if (attempts <= 0) return null;
  const a = Math.min(2.375, Math.max(0, (completions / attempts - 0.3) * 5));
  const b = Math.min(2.375, Math.max(0, (yards / attempts - 3) * 0.25));
  const c = Math.min(2.375, Math.max(0, touchdowns / attempts * 20));
  const d = Math.min(2.375, Math.max(0, 2.375 - interceptions / attempts * 25));
  return (a + b + c + d) / 6 * 100;
}

function groupRows(corpus, keyForRow) {
  const ix = ixFor(corpus);
  const groups = new Map();
  for (const row of corpus.rows) {
    const key = keyForRow(row, ix);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  return { ix, groups };
}

const nflGrouped = groupRows(nflPlayers, (row, ix) => String(at(row, ix, "sourcePlayerId") ?? ""));
for (const [sourcePlayerId, rows] of nflGrouped.groups) {
  const recognized = nflCareerRecognition.get(sourcePlayerId);
  if (!recognized) continue;
  const position = recognized.position;
  if (!["QB", "RB", "WR", "TE", "DL", "LB", "DB"].includes(position)) continue;

  const sum = (column) => rows.reduce((total, row) => total + finite(at(row, nflGrouped.ix, column)), 0);
  const games = sum("games");
  const completions = sum("completions");
  const attempts = sum("attempts");
  const passingYards = sum("passingYards");
  const passingTouchdowns = sum("passingTouchdowns");
  const passingInterceptions = sum("passingInterceptions");
  const carries = sum("carries");
  const rushingYards = sum("rushingYards");
  const rushingTouchdowns = sum("rushingTouchdowns");
  const receptions = sum("receptions");
  const receivingYards = sum("receivingYards");
  const receivingTouchdowns = sum("receivingTouchdowns");
  const defensiveSacks = sum("defensiveSacks");
  const defensiveInterceptions = sum("defensiveInterceptions");
  const scrimmageYards = rushingYards + receivingYards;
  const scrimmageTouchdowns = rushingTouchdowns + receivingTouchdowns;

  pushSubject({
    id: recognized.id,
    name: recognized.name,
    kind: "player-career",
    league: "NFL",
    position,
    startSeason: recognized.startSeason,
    endSeason: recognized.endSeason,
    tier: recognized.tier,
    sourceProvider: "nflverse",
    sourceId: sourcePlayerId,
  });

  const careerFacts = [];
  if (position === "QB") {
    careerFacts.push(
      ["nfl-career-games", games],
      ["nfl-career-passing-completions", completions],
      ["nfl-career-passing-attempts", attempts],
      ["nfl-career-passing-yards", passingYards],
      ["nfl-career-passing-touchdowns", passingTouchdowns],
      ["nfl-career-interceptions-thrown", passingInterceptions],
      ["nfl-career-passer-rating", nflPasserRating(completions, attempts, passingYards, passingTouchdowns, passingInterceptions)],
      ["nfl-career-completion-percentage", safeDivide(completions * 100, attempts)],
      ["nfl-career-passing-yards-per-attempt", safeDivide(passingYards, attempts)],
      ["nfl-career-passing-touchdown-percentage", safeDivide(passingTouchdowns * 100, attempts)],
      ["nfl-career-passing-yards-per-game", safeDivide(passingYards, games)],
      ["nfl-career-passing-touchdowns-per-game", safeDivide(passingTouchdowns, games)],
      ["nfl-career-passing-completions-per-game", safeDivide(completions, games)],
      ["nfl-career-passing-attempts-per-game", safeDivide(attempts, games)],
      ["nfl-career-passing-touchdown-interception-ratio", safeDivide(passingTouchdowns, passingInterceptions)],
    );
  }
  if (position === "RB") {
    careerFacts.push(
      ["nfl-career-games", games],
      ["nfl-career-rushing-attempts", carries],
      ["nfl-career-rushing-yards", rushingYards],
      ["nfl-career-rushing-touchdowns", rushingTouchdowns],
      ["nfl-career-receptions", receptions],
      ["nfl-career-receiving-yards", receivingYards],
      ["nfl-career-receiving-touchdowns", receivingTouchdowns],
      ["nfl-career-rushing-yards-per-attempt", safeDivide(rushingYards, carries)],
      ["nfl-career-rushing-yards-per-game", safeDivide(rushingYards, games)],
      ["nfl-career-rushing-touchdowns-per-game", safeDivide(rushingTouchdowns, games)],
      ["nfl-career-receptions-per-game", safeDivide(receptions, games)],
      ["nfl-career-receiving-yards-per-game", safeDivide(receivingYards, games)],
      ["nfl-career-scrimmage-yards", scrimmageYards],
      ["nfl-career-scrimmage-yards-per-game", safeDivide(scrimmageYards, games)],
      ["nfl-career-scrimmage-touchdowns", scrimmageTouchdowns],
    );
  }
  if (position === "WR" || position === "TE") {
    careerFacts.push(
      ["nfl-career-receptions", receptions],
      ["nfl-career-receiving-yards", receivingYards],
      ["nfl-career-receiving-touchdowns", receivingTouchdowns],
    );
  }
  if (["DL", "LB", "DB"].includes(position)) {
    careerFacts.push(
      ["nfl-career-sacks", defensiveSacks],
      ["nfl-career-interceptions", defensiveInterceptions],
    );
  }
  pushRecord(recognized.id, "nfl-player-career", careerFacts);

  if (position === "QB") {
    for (const row of rows) {
      const season = finite(at(row, nflGrouped.ix, "season"));
      const seasonAttempts = finite(at(row, nflGrouped.ix, "attempts"));
      if (!season || seasonAttempts < 200) continue;
      const seasonCompletions = finite(at(row, nflGrouped.ix, "completions"));
      const seasonYards = finite(at(row, nflGrouped.ix, "passingYards"));
      const seasonTds = finite(at(row, nflGrouped.ix, "passingTouchdowns"));
      const seasonInts = finite(at(row, nflGrouped.ix, "passingInterceptions"));
      const id = `nflverse-player-season-${sourcePlayerId}-${season}`;
      pushSubject({
        id,
        name: `${recognized.name} ${season}`,
        kind: "player-season",
        league: "NFL",
        position: "QB",
        season,
        tier: recognized.tier,
        sourceProvider: "nflverse",
        sourceId: `${sourcePlayerId}:${season}`,
      });
      pushRecord(id, "nfl-player-season", [
        ["nfl-season-passing-yards", seasonYards],
        ["nfl-season-passing-touchdowns", seasonTds],
        ["nfl-season-interceptions", seasonInts],
        ["nfl-season-passer-rating", nflPasserRating(seasonCompletions, seasonAttempts, seasonYards, seasonTds, seasonInts)],
      ]);
    }
  }
}

const cfbGrouped = groupRows(cfbPlayers, (row, ix) => {
  const sourcePlayerId = String(at(row, ix, "sourcePlayerId") ?? "");
  const name = String(at(row, ix, "playerName") ?? "");
  return sourcePlayerId && name ? `${sourcePlayerId}:${normalize(name)}` : "";
});
for (const [key, rows] of cfbGrouped.groups) {
  const recognized = cfbCareerRecognition.get(key);
  if (!recognized) continue;
  const position = recognized.position;
  if (!["QB", "RB", "WR", "TE", "DL", "LB", "DB"].includes(position)) continue;

  const bySeason = new Map();
  for (const row of rows) {
    const season = finite(at(row, cfbGrouped.ix, "season"));
    if (!season) continue;
    const seasonValues = bySeason.get(season) ?? {};
    for (const column of [
      "passYards", "passTouchdowns", "interceptionsThrown", "rushYards", "rushTouchdowns",
      "receptions", "receivingYards", "receivingTouchdowns", "sacks", "defensiveInterceptions",
    ]) seasonValues[column] = finite(seasonValues[column]) + finite(at(row, cfbGrouped.ix, column));
    bySeason.set(season, seasonValues);
  }
  const best = (column) => Math.max(0, ...[...bySeason.values()].map((values) => finite(values[column])));

  pushSubject({
    id: recognized.id,
    name: recognized.name,
    kind: "player-career",
    league: "CFB",
    position,
    school: recognized.school,
    startSeason: recognized.startSeason,
    endSeason: recognized.endSeason,
    tier: recognized.tier,
    sourceProvider: "cfbfastR",
    sourceId: recognized.sourceId,
  });
  const facts = [];
  if (position === "QB") facts.push(
    ["cfb-best-season-passing-yards", best("passYards")],
    ["cfb-best-season-passing-touchdowns", best("passTouchdowns")],
    ["cfb-best-season-interceptions", best("interceptionsThrown")],
  );
  if (position === "QB" || position === "RB") facts.push(
    ["cfb-best-season-rushing-yards", best("rushYards")],
    ["cfb-best-season-rushing-touchdowns", best("rushTouchdowns")],
  );
  if (position === "WR" || position === "TE" || position === "RB") facts.push(
    ["cfb-best-season-receptions", best("receptions")],
    ["cfb-best-season-receiving-yards", best("receivingYards")],
    ["cfb-best-season-receiving-touchdowns", best("receivingTouchdowns")],
  );
  if (["DL", "LB", "DB"].includes(position)) facts.push(
    ["cfb-best-season-sacks", best("sacks")],
    ["cfb-best-season-defensive-interceptions", best("defensiveInterceptions")],
  );
  pushRecord(recognized.id, "cfb-player-career", facts);
}

function emitTeamSeasons(corpus, league, recognitionBySource) {
  const ix = ixFor(corpus);
  for (const row of corpus.rows) {
    const season = finite(at(row, ix, "season"));
    const sourceId = league === "NFL"
      ? `${season}:${String(at(row, ix, "franchiseId") ?? "")}`
      : `${season}:${String(at(row, ix, "sourceProgramId") ?? "")}`;
    const recognized = recognitionBySource.get(sourceId);
    if (!recognized) continue;
    const games = finite(at(row, ix, "overallGames"));
    const wins = finite(at(row, ix, "overallWins"));
    const losses = finite(at(row, ix, "overallLosses"));
    const pointsFor = finite(at(row, ix, "pointsFor"));
    const pointsAgainst = finite(at(row, ix, "pointsAgainst"));
    pushSubject({
      id: recognized.id,
      name: recognized.name,
      kind: "team-season",
      league,
      season,
      tier: recognized.tier,
      sourceProvider: league === "NFL" ? "nflverse" : "cfbfastR",
      sourceId,
    });
    const facts = league === "NFL" ? [
      ["nfl-team-overall-wins", wins],
      ["nfl-team-overall-losses", losses],
      ["nfl-team-points-per-game", safeDivide(pointsFor, games)],
      ["nfl-team-opponent-points-per-game", safeDivide(pointsAgainst, games)],
    ] : [
      ["cfb-team-wins", wins],
      ["cfb-team-losses", losses],
      ["cfb-team-points-for", pointsFor],
      ["cfb-team-points-against", pointsAgainst],
      ["cfb-team-points-per-game", safeDivide(pointsFor, games)],
      ["cfb-team-opponent-points-per-game", safeDivide(pointsAgainst, games)],
      ["cfb-team-point-differential", pointsFor - pointsAgainst],
      ["cfb-team-scoring-margin-per-game", safeDivide(pointsFor - pointsAgainst, games)],
      ["cfb-team-points-for-against-ratio", safeDivide(pointsFor, pointsAgainst)],
      ["cfb-team-differential-rate-percentage", safeDivide((pointsFor - pointsAgainst) * 100, pointsFor)],
      ["cfb-team-total-points", pointsFor + pointsAgainst],
    ];
    pushRecord(recognized.id, league === "NFL" ? "nfl-team-season" : "cfb-team-season", facts);
  }
}

emitTeamSeasons(nflTeamSeasons, "NFL", nflTeamRecognition);
emitTeamSeasons(cfbTeamSeasons, "CFB", cfbTeamRecognition);

subjects.sort((left, right) => left.league.localeCompare(right.league) || left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id));
records.sort((left, right) => left.subjectId.localeCompare(right.subjectId));

const artifact = {
  schemaVersion: 1,
  generatedFrom: {
    recognizabilityVersion: recognition.version,
    nflPlayerCorpus: "data/generated/football/nfl/player-seasons-1999-2025.json",
    cfbPlayerCorpus: "data/generated/football/cfb/player-seasons-2014-2025.json",
    nflTeamSeasonCorpus: "data/generated/football/relationships/nfl-team-season-results-1999-2025.json",
    cfbTeamSeasonCorpus: "data/generated/football/relationships/cfb-team-season-results-2002-2025.json",
  },
  sourceIds: {
    NFL: "nflverse-find-leader-projection",
    CFB: "cfbfast-r-find-leader-projection",
  },
  eligibility: {
    recognizabilityTiers: ["A", "B", "C"],
    nflQbSeasonMinimumAttempts: 200,
  },
  summary: {
    subjectCount: subjects.length,
    factualRecordCount: records.length,
    byLeague: Object.fromEntries(["NFL", "CFB"].map((league) => [league, subjects.filter((subject) => subject.league === league).length])),
    byKind: Object.fromEntries([...new Set(subjects.map((subject) => subject.kind))].sort().map((kind) => [kind, subjects.filter((subject) => subject.kind === kind).length])),
  },
  subjects,
  records,
};

const serialized = `${JSON.stringify(artifact)}\n`;
const absoluteOutput = path.resolve(new URL(".", root).pathname, outputPath);
if (check) {
  if (!fs.existsSync(absoluteOutput) || fs.readFileSync(absoluteOutput, "utf8") !== serialized) {
    throw new Error(`Find the Leader runtime projection is stale. Run node scripts/generate-football-find-leader-runtime.mjs`);
  }
  console.log(`Find the Leader runtime projection is current (${subjects.length} subjects, ${records.length} factual records).`);
} else {
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, serialized);
  console.log(`Wrote ${outputPath}: ${subjects.length} subjects, ${records.length} factual records.`);
}
