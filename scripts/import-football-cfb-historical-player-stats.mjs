import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { gitBlobSha1, iterateCsvRows } from "./lib/footballCsv.mjs";

const DEFAULT_SOURCE_MANIFEST = "public/data/football/cfb/historical-player-seasons.source-manifest.json";
const DEFAULT_OUTPUT = "data/generated/football/cfb/player-seasons-2014-2025.json";
const DEFAULT_MANIFEST = "data/generated/football/cfb/player-seasons-2014-2025.manifest.json";
const DEFAULT_COVERAGE = "data/generated/football/cfb/player-seasons-2014-2025.coverage.json";
const SOURCE_URL_PREFIX = "https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data";

const OUTPUT_COLUMNS = [
  "season",
  "sourcePlayerId",
  "playerName",
  "team",
  "conference",
  "gamesPlayed",
  "passCompletions",
  "passAttempts",
  "passYards",
  "passTouchdowns",
  "interceptionsThrown",
  "rushAttempts",
  "rushYards",
  "rushTouchdowns",
  "receptions",
  "targets",
  "receivingYards",
  "receivingTouchdowns",
  "totalTouchdowns",
  "defensiveInterceptions",
  "sacks",
  "passBreakups",
  "forcedFumbles",
  "fumbleRecoveries",
  "fumbles",
  "fieldGoalsAttempted",
  "fieldGoalsMade",
  "fieldGoalsMissed",
  "fieldGoalsBlocked"
];

const REQUIRED_COLUMNS = [
  "game_id",
  "season",
  "team",
  "conference",
  "completion_player_id",
  "completion_player",
  "completion_yds",
  "rush_player_id",
  "rush_player",
  "rush_yds",
  "reception_player_id",
  "reception_player",
  "reception_yds",
  "touchdown_player_id",
  "touchdown_player",
  "touchdown_stat"
];

function parseArgs(argv) {
  const args = {
    sourceManifest: DEFAULT_SOURCE_MANIFEST,
    sourceDir: null,
    seasons: null,
    output: DEFAULT_OUTPUT,
    manifest: DEFAULT_MANIFEST,
    coverage: DEFAULT_COVERAGE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--source-manifest") args.sourceManifest = argv[++index] ?? DEFAULT_SOURCE_MANIFEST;
    else if (token === "--source-dir") args.sourceDir = argv[++index] ?? null;
    else if (token === "--seasons") args.seasons = (argv[++index] ?? "").split(",").filter(Boolean).map(Number);
    else if (token === "--output") args.output = argv[++index] ?? DEFAULT_OUTPUT;
    else if (token === "--manifest") args.manifest = argv[++index] ?? DEFAULT_MANIFEST;
    else if (token === "--coverage") args.coverage = argv[++index] ?? DEFAULT_COVERAGE;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function isPresent(value) {
  if (value == null) return false;
  const normalized = String(value).trim();
  return normalized !== "" && normalized !== "NA" && normalized !== "NULL" && normalized !== "NaN";
}

function numberOrZero(value) {
  if (!isPresent(value)) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Expected numeric CFB value, got ${JSON.stringify(value)}`);
  return parsed;
}

function countOrOne(value) {
  const parsed = numberOrZero(value);
  return parsed === 0 ? 1 : parsed;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function incrementName(record, name) {
  if (!isPresent(name)) return;
  const clean = String(name).trim();
  record.nameCounts.set(clean, (record.nameCounts.get(clean) ?? 0) + 1);
}

function incrementConference(record, conference) {
  if (!isPresent(conference)) return;
  const clean = String(conference).trim();
  record.conferenceCounts.set(clean, (record.conferenceCounts.get(clean) ?? 0) + 1);
}

function mostFrequent(counts) {
  let best = null;
  let bestCount = -1;
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

function createPlayerRecord({ season, sourcePlayerId, team }) {
  return {
    season,
    sourcePlayerId,
    team,
    nameCounts: new Map(),
    conferenceCounts: new Map(),
    games: new Set(),
    passCompletions: 0,
    passAttempts: 0,
    passYards: 0,
    passTouchdowns: 0,
    interceptionsThrown: 0,
    rushAttempts: 0,
    rushYards: 0,
    rushTouchdowns: 0,
    receptions: 0,
    targets: 0,
    receivingYards: 0,
    receivingTouchdowns: 0,
    totalTouchdowns: 0,
    defensiveInterceptions: 0,
    sacks: 0,
    passBreakups: 0,
    forcedFumbles: 0,
    fumbleRecoveries: 0,
    fumbles: 0,
    fieldGoalsAttempted: 0,
    fieldGoalsMade: 0,
    fieldGoalsMissed: 0,
    fieldGoalsBlocked: 0
  };
}

function buildAccessor(columns) {
  const indexes = new Map(columns.map((column, index) => [column, index]));
  for (const column of REQUIRED_COLUMNS) {
    if (!indexes.has(column)) throw new Error(`Historical CFB source is missing required column ${column}.`);
  }
  return (row, column) => {
    const index = indexes.get(column);
    return index == null ? "" : row[index] ?? "";
  };
}

function splitIds(value) {
  if (!isPresent(value)) return [];
  return String(value).split(",").map((id) => id.trim()).filter(isPresent);
}

function splitNames(value) {
  if (!isPresent(value)) return [];
  return String(value).split(",").map((name) => name.trim()).filter(isPresent);
}

function processSeasonCsv(csv, expectedSeason) {
  const iterator = iterateCsvRows(csv);
  const header = iterator.next();
  if (header.done) throw new Error(`Historical CFB ${expectedSeason} source is empty.`);
  const columns = header.value;
  const get = buildAccessor(columns);
  const records = new Map();
  let sourceRowCount = 0;

  function touch(row, playerId, playerName) {
    if (!isPresent(playerId)) return null;
    const season = Number(get(row, "season"));
    if (season !== expectedSeason) {
      throw new Error(`Historical CFB source season mismatch: expected ${expectedSeason}, got ${get(row, "season")}.`);
    }
    const team = isPresent(get(row, "team")) ? String(get(row, "team")).trim() : "Unknown";
    const id = String(playerId).trim();
    const key = `${season}\u0000${team}\u0000${id}`;
    let record = records.get(key);
    if (!record) {
      record = createPlayerRecord({ season, sourcePlayerId: id, team });
      records.set(key, record);
    }
    incrementName(record, playerName);
    incrementConference(record, get(row, "conference"));
    if (isPresent(get(row, "game_id"))) record.games.add(String(get(row, "game_id")));
    return record;
  }

  for (const row of iterator) {
    if (row.every((value) => !isPresent(value))) continue;
    sourceRowCount += 1;
    if (row.length !== columns.length) {
      throw new Error(`Historical CFB ${expectedSeason} row ${sourceRowCount + 1} has ${row.length} columns; expected ${columns.length}.`);
    }

    const completion = touch(row, get(row, "completion_player_id"), get(row, "completion_player"));
    if (completion) {
      completion.passCompletions += 1;
      completion.passAttempts += 1;
      completion.passYards += numberOrZero(get(row, "completion_yds"));
      if (isPresent(get(row, "reception_player_id")) && isPresent(get(row, "touchdown_player_id"))) completion.passTouchdowns += 1;
    }

    const incompletion = touch(row, get(row, "incompletion_player_id"), get(row, "incompletion_player"));
    if (incompletion) incompletion.passAttempts += countOrOne(get(row, "incompletion_stat"));

    const interceptionThrown = touch(row, get(row, "interception_thrown_player_id"), get(row, "interception_thrown_player"));
    if (interceptionThrown) {
      const count = countOrOne(get(row, "interception_thrown_stat"));
      interceptionThrown.passAttempts += count;
      interceptionThrown.interceptionsThrown += count;
    }

    const rush = touch(row, get(row, "rush_player_id"), get(row, "rush_player"));
    if (rush) {
      rush.rushAttempts += 1;
      rush.rushYards += numberOrZero(get(row, "rush_yds"));
      if (String(get(row, "rush_player_id")).trim() === String(get(row, "touchdown_player_id")).trim()) rush.rushTouchdowns += countOrOne(get(row, "touchdown_stat"));
    }

    const reception = touch(row, get(row, "reception_player_id"), get(row, "reception_player"));
    if (reception) {
      reception.receptions += 1;
      reception.receivingYards += numberOrZero(get(row, "reception_yds"));
      if (String(get(row, "reception_player_id")).trim() === String(get(row, "touchdown_player_id")).trim()) reception.receivingTouchdowns += countOrOne(get(row, "touchdown_stat"));
    }

    const target = touch(row, get(row, "target_player_id"), get(row, "target_player"));
    if (target) target.targets += countOrOne(get(row, "target_stat"));

    const touchdown = touch(row, get(row, "touchdown_player_id"), get(row, "touchdown_player"));
    if (touchdown) touchdown.totalTouchdowns += countOrOne(get(row, "touchdown_stat"));

    const defensiveInterception = touch(row, get(row, "interception_player_id"), get(row, "interception_player"));
    if (defensiveInterception) defensiveInterception.defensiveInterceptions += countOrOne(get(row, "interception_stat"));

    const sackIds = splitIds(get(row, "sack_player_id"));
    const sackNames = splitNames(get(row, "sack_player"));
    sackIds.forEach((id, index) => {
      const sack = touch(row, id, sackNames[index] ?? sackNames[0] ?? null);
      if (sack) sack.sacks += countOrOne(get(row, "sack_stat"));
    });

    const passBreakup = touch(row, get(row, "pass_breakup_player_id"), get(row, "pass_breakup_player"));
    if (passBreakup) passBreakup.passBreakups += countOrOne(get(row, "pass_breakup_stat"));

    const forcedFumble = touch(row, get(row, "fumble_forced_player_id"), get(row, "fumble_forced_player"));
    if (forcedFumble) forcedFumble.forcedFumbles += countOrOne(get(row, "fumble_forced_stat"));

    const recovery = touch(row, get(row, "fumble_recovered_player_id"), get(row, "fumble_recovered_player"));
    if (recovery) recovery.fumbleRecoveries += countOrOne(get(row, "fumble_recovered_stat"));

    const fumble = touch(row, get(row, "fumble_player_id"), get(row, "fumble_player"));
    if (fumble) fumble.fumbles += countOrOne(get(row, "fumble_stat"));

    const fieldGoalAttempt = touch(row, get(row, "field_goal_attempt_player_id"), get(row, "field_goal_attempt_player"));
    if (fieldGoalAttempt) fieldGoalAttempt.fieldGoalsAttempted += countOrOne(get(row, "field_goal_attempt_stat"));

    const fieldGoalMade = touch(row, get(row, "field_goal_made_player_id"), get(row, "field_goal_made_player"));
    if (fieldGoalMade) fieldGoalMade.fieldGoalsMade += countOrOne(get(row, "field_goal_made_stat"));

    const fieldGoalMissed = touch(row, get(row, "field_goal_missed_player_id"), get(row, "field_goal_missed_player"));
    if (fieldGoalMissed) fieldGoalMissed.fieldGoalsMissed += countOrOne(get(row, "field_goal_missed_stat"));

    const fieldGoalBlocked = touch(row, get(row, "field_goal_blocked_player_id"), get(row, "field_goal_blocked_player"));
    if (fieldGoalBlocked) fieldGoalBlocked.fieldGoalsBlocked += countOrOne(get(row, "field_goal_blocked_stat"));
  }

  const normalized = [...records.values()].map((record) => [
    record.season,
    record.sourcePlayerId,
    mostFrequent(record.nameCounts) ?? `CFB player ${record.sourcePlayerId}`,
    record.team,
    mostFrequent(record.conferenceCounts),
    record.games.size,
    record.passCompletions,
    record.passAttempts,
    record.passYards,
    record.passTouchdowns,
    record.interceptionsThrown,
    record.rushAttempts,
    record.rushYards,
    record.rushTouchdowns,
    record.receptions,
    record.targets,
    record.receivingYards,
    record.receivingTouchdowns,
    record.totalTouchdowns,
    record.defensiveInterceptions,
    record.sacks,
    record.passBreakups,
    record.forcedFumbles,
    record.fumbleRecoveries,
    record.fumbles,
    record.fieldGoalsAttempted,
    record.fieldGoalsMade,
    record.fieldGoalsMissed,
    record.fieldGoalsBlocked
  ]);

  normalized.sort((left, right) =>
    String(left[3]).localeCompare(String(right[3])) || String(left[1]).localeCompare(String(right[1]))
  );

  const metricIndex = Object.fromEntries(OUTPUT_COLUMNS.map((column, index) => [column, index]));
  const sourcePlayers = new Set(normalized.map((row) => row[metricIndex.sourcePlayerId]));
  const teams = new Set(normalized.map((row) => row[metricIndex.team]));
  const conferences = new Set(normalized.map((row) => row[metricIndex.conference]).filter(Boolean));
  const anyPositive = (row, columnsToCheck) => columnsToCheck.some((column) => Number(row[metricIndex[column]]) > 0);

  return {
    columns,
    sourceRowCount,
    normalized,
    coverage: {
      season: expectedSeason,
      sourceRowCount,
      normalizedRowCount: normalized.length,
      uniqueSourcePlayerCount: sourcePlayers.size,
      teamCount: teams.size,
      conferenceCount: conferences.size,
      passingPlayerCount: normalized.filter((row) => anyPositive(row, ["passAttempts", "passYards"])).length,
      rushingPlayerCount: normalized.filter((row) => anyPositive(row, ["rushAttempts", "rushYards"])).length,
      receivingPlayerCount: normalized.filter((row) => anyPositive(row, ["receptions", "targets", "receivingYards"])).length,
      defensivePlayerCount: normalized.filter((row) => anyPositive(row, ["defensiveInterceptions", "sacks", "passBreakups", "forcedFumbles", "fumbleRecoveries"])).length,
      kickingPlayerCount: normalized.filter((row) => anyPositive(row, ["fieldGoalsAttempted", "fieldGoalsMade", "fieldGoalsMissed", "fieldGoalsBlocked"])).length
    }
  };
}

async function loadSeasonCsv({ asset, sourceDir, sourceCommit }) {
  if (sourceDir) {
    const localPath = path.join(sourceDir, `player_stats_${asset.season}.csv`);
    return { text: fs.readFileSync(localPath, "utf8"), url: localPath, verifiedPinnedBlob: false };
  }

  const url = `${SOURCE_URL_PREFIX}/${sourceCommit}/${asset.path}`;
  const response = await fetch(url, { headers: { "user-agent": "Octagon-HQ-CFB-historical-import" } });
  if (!response.ok) throw new Error(`Historical CFB ${asset.season} download failed: ${response.status} ${response.statusText}`);
  const text = await response.text();
  const bytes = Buffer.byteLength(text, "utf8");
  const blobSha = gitBlobSha1(text);
  if (bytes !== asset.bytes) throw new Error(`Historical CFB ${asset.season} byte-size mismatch: ${bytes} !== ${asset.bytes}.`);
  if (blobSha !== asset.gitBlobSha) throw new Error(`Historical CFB ${asset.season} blob mismatch: ${blobSha} !== ${asset.gitBlobSha}.`);
  return { text, url, verifiedPinnedBlob: true };
}

const args = parseArgs(process.argv.slice(2));
const sourceManifest = JSON.parse(fs.readFileSync(args.sourceManifest, "utf8"));
if (sourceManifest.provider !== "cfbfastR" || sourceManifest.license !== "CC BY 4.0") {
  throw new Error("Historical CFB source manifest must remain pinned to the licensed cfbfastR source owner.");
}

const selectedSeasons = args.seasons ?? sourceManifest.assets.map((asset) => asset.season);
if (selectedSeasons.some((season) => !Number.isInteger(season))) throw new Error("--seasons must contain integer seasons.");
const selectedAssets = selectedSeasons.map((season) => {
  const asset = sourceManifest.assets.find((candidate) => candidate.season === season);
  if (!asset) throw new Error(`Historical CFB source manifest does not contain season ${season}.`);
  return asset;
});

const allRows = [];
const seasonCoverage = [];
const sourceVerification = [];
const allSourcePlayers = new Set();
const allTeams = new Set();
const allConferences = new Set();
let totalSourceRows = 0;

for (const asset of selectedAssets) {
  const loaded = await loadSeasonCsv({ asset, sourceDir: args.sourceDir, sourceCommit: sourceManifest.commit });
  const result = processSeasonCsv(loaded.text, asset.season);
  totalSourceRows += result.sourceRowCount;
  allRows.push(...result.normalized);
  seasonCoverage.push(result.coverage);
  sourceVerification.push({
    season: asset.season,
    path: asset.path,
    gitBlobSha: asset.gitBlobSha,
    bytes: asset.bytes,
    verifiedPinnedBlob: loaded.verifiedPinnedBlob
  });

  const idIndex = OUTPUT_COLUMNS.indexOf("sourcePlayerId");
  const teamIndex = OUTPUT_COLUMNS.indexOf("team");
  const conferenceIndex = OUTPUT_COLUMNS.indexOf("conference");
  result.normalized.forEach((row) => {
    allSourcePlayers.add(row[idIndex]);
    allTeams.add(row[teamIndex]);
    if (row[conferenceIndex]) allConferences.add(row[conferenceIndex]);
  });
  console.log(`Normalized CFB ${asset.season}: ${result.sourceRowCount.toLocaleString()} source rows -> ${result.normalized.length.toLocaleString()} player-season-team rows.`);
}

allRows.sort((left, right) => Number(left[0]) - Number(right[0]) || String(left[3]).localeCompare(String(right[3])) || String(left[1]).localeCompare(String(right[1])));
const corpus = {
  schemaVersion: 1,
  league: "CFB",
  recordKind: "player-season-team",
  source: {
    provider: sourceManifest.provider,
    repository: sourceManifest.repository,
    commit: sourceManifest.commit,
    license: sourceManifest.license,
    sourcePathTemplate: sourceManifest.sourcePathTemplate
  },
  seasonStart: Math.min(...selectedSeasons),
  seasonEnd: Math.max(...selectedSeasons),
  seasons: selectedSeasons,
  columns: OUTPUT_COLUMNS,
  rowCount: allRows.length,
  rows: allRows
};

const serialized = `${JSON.stringify(corpus)}\n`;
const sha256 = createHash("sha256").update(serialized).digest("hex");
const manifest = {
  schemaVersion: 1,
  league: corpus.league,
  recordKind: corpus.recordKind,
  seasonStart: corpus.seasonStart,
  seasonEnd: corpus.seasonEnd,
  seasonCount: selectedSeasons.length,
  rowCount: corpus.rowCount,
  sourceRowCount: totalSourceRows,
  uniqueSourcePlayerCount: allSourcePlayers.size,
  teamCount: allTeams.size,
  conferenceCount: allConferences.size,
  columnCount: OUTPUT_COLUMNS.length,
  sha256,
  source: corpus.source,
  sourceVerification,
  generatedBy: "scripts/import-football-cfb-historical-player-stats.mjs"
};
const coverage = {
  schemaVersion: 1,
  league: "CFB",
  source: corpus.source,
  seasonStart: corpus.seasonStart,
  seasonEnd: corpus.seasonEnd,
  totals: {
    sourceRowCount: totalSourceRows,
    normalizedRowCount: allRows.length,
    uniqueSourcePlayerCount: allSourcePlayers.size,
    teamCount: allTeams.size,
    conferenceCount: allConferences.size
  },
  seasons: seasonCoverage
};

for (const filePath of [args.output, args.manifest, args.coverage]) ensureParent(filePath);
fs.writeFileSync(args.output, serialized);
fs.writeFileSync(args.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(args.coverage, `${JSON.stringify(coverage, null, 2)}\n`);

console.log(`Generated ${allRows.length.toLocaleString()} normalized historical CFB player-season-team rows across ${selectedSeasons.length} seasons.`);
console.log(`Corpus SHA-256: ${sha256}`);
