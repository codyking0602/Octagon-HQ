import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { parseCsv } from "./lib/footballCsv.mjs";

const DEFAULT_SOURCE_MANIFEST = "public/data/football/nfl/historical-player-team-seasons.source-manifest.json";
const DEFAULT_PLAYER_OUTPUT = "data/generated/football/nfl/player-seasons-1999-2025.json";
const DEFAULT_TEAM_OUTPUT = "data/generated/football/nfl/team-seasons-1999-2025.json";
const DEFAULT_MANIFEST = "data/generated/football/nfl/historical-stats-1999-2025.manifest.json";
const DEFAULT_COVERAGE = "data/generated/football/nfl/historical-stats-1999-2025.coverage.json";

const PLAYER_COLUMNS = [
  "season", "sourcePlayerId", "playerName", "playerDisplayName", "position", "positionGroup", "recentTeam", "games",
  "completions", "attempts", "passingYards", "passingTouchdowns", "passingInterceptions",
  "carries", "rushingYards", "rushingTouchdowns",
  "receptions", "targets", "receivingYards", "receivingTouchdowns",
  "tacklesSolo", "tacklesForLoss", "forcedFumbles", "defensiveSacks", "defensiveInterceptions", "passesDefended",
  "fieldGoalsMade", "fieldGoalsAttempted", "puntingAttempts", "puntingYards"
];

const TEAM_COLUMNS = [
  "season", "team", "games",
  "completions", "attempts", "passingYards", "passingTouchdowns", "passingInterceptions",
  "carries", "rushingYards", "rushingTouchdowns",
  "receptions", "targets", "receivingYards", "receivingTouchdowns",
  "defensiveSacks", "defensiveInterceptions",
  "fieldGoalsMade", "fieldGoalsAttempted", "puntingAttempts", "puntingYards"
];

const PLAYER_FIELD_MAP = {
  season: "season",
  sourcePlayerId: "player_id",
  playerName: "player_name",
  playerDisplayName: "player_display_name",
  position: "position",
  positionGroup: "position_group",
  recentTeam: "recent_team",
  games: "games",
  completions: "completions",
  attempts: "attempts",
  passingYards: "passing_yards",
  passingTouchdowns: "passing_tds",
  passingInterceptions: "passing_interceptions",
  carries: "carries",
  rushingYards: "rushing_yards",
  rushingTouchdowns: "rushing_tds",
  receptions: "receptions",
  targets: "targets",
  receivingYards: "receiving_yards",
  receivingTouchdowns: "receiving_tds",
  tacklesSolo: "def_tackles_solo",
  tacklesForLoss: "def_tackles_for_loss",
  forcedFumbles: "def_fumbles_forced",
  defensiveSacks: "def_sacks",
  defensiveInterceptions: "def_interceptions",
  passesDefended: "def_pass_defended",
  fieldGoalsMade: "fg_made",
  fieldGoalsAttempted: "fg_att",
  puntingAttempts: "pt_att",
  puntingYards: "pt_yards"
};

const TEAM_FIELD_MAP = {
  season: "season",
  team: "team",
  games: "games",
  completions: "completions",
  attempts: "attempts",
  passingYards: "passing_yards",
  passingTouchdowns: "passing_tds",
  passingInterceptions: "passing_interceptions",
  carries: "carries",
  rushingYards: "rushing_yards",
  rushingTouchdowns: "rushing_tds",
  receptions: "receptions",
  targets: "targets",
  receivingYards: "receiving_yards",
  receivingTouchdowns: "receiving_tds",
  defensiveSacks: "def_sacks",
  defensiveInterceptions: "def_interceptions",
  fieldGoalsMade: "fg_made",
  fieldGoalsAttempted: "fg_att",
  puntingAttempts: "pt_att",
  puntingYards: "pt_yards"
};

const PLAYER_REQUIRED = ["player_id", "season", "season_type", "recent_team", "games"];
const TEAM_REQUIRED = ["season", "season_type", "team", "games"];
const TEXT_FIELDS = new Set(["sourcePlayerId", "playerName", "playerDisplayName", "position", "positionGroup", "recentTeam", "team"]);

function parseArgs(argv) {
  const args = {
    sourceManifest: DEFAULT_SOURCE_MANIFEST,
    sourceDir: null,
    seasons: null,
    playerOutput: DEFAULT_PLAYER_OUTPUT,
    teamOutput: DEFAULT_TEAM_OUTPUT,
    manifest: DEFAULT_MANIFEST,
    coverage: DEFAULT_COVERAGE
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--source-manifest") args.sourceManifest = argv[++index] ?? DEFAULT_SOURCE_MANIFEST;
    else if (token === "--source-dir") args.sourceDir = argv[++index] ?? null;
    else if (token === "--seasons") args.seasons = (argv[++index] ?? "").split(",").filter(Boolean).map(Number);
    else if (token === "--player-output") args.playerOutput = argv[++index] ?? DEFAULT_PLAYER_OUTPUT;
    else if (token === "--team-output") args.teamOutput = argv[++index] ?? DEFAULT_TEAM_OUTPUT;
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

function numericOrNull(value) {
  if (!isPresent(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Expected numeric NFL stat, got ${JSON.stringify(value)}`);
  return parsed;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function loadAsset(asset, sourceDir) {
  if (sourceDir) {
    const localPath = path.join(sourceDir, asset.name);
    return { text: fs.readFileSync(localPath, "utf8"), verifiedPinnedAsset: false };
  }
  const response = await fetch(asset.url, { headers: { "user-agent": "Octagon-HQ-NFL-historical-import" } });
  if (!response.ok) throw new Error(`NFL source download failed: ${response.status} ${response.statusText} (${asset.name})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== asset.bytes) throw new Error(`${asset.name} byte-size mismatch: ${bytes.length} !== ${asset.bytes}.`);
  const digest = sha256(bytes);
  if (digest !== asset.sha256) throw new Error(`${asset.name} SHA-256 mismatch: ${digest} !== ${asset.sha256}.`);
  return { text: bytes.toString("utf8"), verifiedPinnedAsset: true };
}

function normalizeCsv(text, { season, columns, fieldMap, required, identity }) {
  const parsed = parseCsv(text).filter((row) => row.some(isPresent));
  if (parsed.length < 2) throw new Error(`NFL ${identity} source ${season} did not contain data rows.`);
  const [header, ...rows] = parsed;
  const indexes = new Map(header.map((column, index) => [column, index]));
  for (const column of required) {
    if (!indexes.has(column)) throw new Error(`NFL ${identity} ${season} source is missing required column ${column}.`);
  }

  const read = (row, sourceColumn) => {
    const index = indexes.get(sourceColumn);
    return index == null ? "" : row[index] ?? "";
  };

  rows.forEach((row, rowIndex) => {
    if (row.length !== header.length) {
      throw new Error(`NFL ${identity} ${season} row ${rowIndex + 2} has ${row.length} columns; expected ${header.length}.`);
    }
    const rowSeason = Number(read(row, "season"));
    if (rowSeason !== season) throw new Error(`NFL ${identity} source season mismatch: expected ${season}, got ${read(row, "season")}.`);
    const seasonType = String(read(row, "season_type")).trim();
    if (seasonType !== "REG") {
      throw new Error(`Dedicated NFL regular-season ${identity} source ${season} contained unexpected season_type ${JSON.stringify(seasonType)}.`);
    }
  });

  const output = rows.map((row) => columns.map((column) => {
    const value = read(row, fieldMap[column]);
    if (TEXT_FIELDS.has(column)) return isPresent(value) ? String(value).trim() : null;
    return numericOrNull(value);
  }));

  output.sort((left, right) => String(left[1] ?? "").localeCompare(String(right[1] ?? "")));
  return { header, rows: output };
}

function makeCorpus({ kind, seasons, columns, rows, source }) {
  return {
    schemaVersion: 1,
    league: "NFL",
    recordKind: kind,
    source,
    seasonStart: Math.min(...seasons),
    seasonEnd: Math.max(...seasons),
    seasons,
    columns,
    rowCount: rows.length,
    rows
  };
}

const args = parseArgs(process.argv.slice(2));
const sourceManifest = JSON.parse(fs.readFileSync(args.sourceManifest, "utf8"));
if (sourceManifest.provider !== "nflverse" || sourceManifest.license !== "CC BY 4.0") {
  throw new Error("NFL source manifest must remain pinned to the licensed nflverse source owner.");
}
if (sourceManifest.players?.summaryLevel !== "reg" || sourceManifest.teams?.summaryLevel !== "reg") {
  throw new Error("NFL historical source manifest must use dedicated nflverse regular-season assets for players and teams.");
}

const availableSeasons = sourceManifest.players.assets.map((asset) => asset.season);
const selectedSeasons = args.seasons ?? availableSeasons;
if (selectedSeasons.some((season) => !Number.isInteger(season))) throw new Error("--seasons must contain integer seasons.");
if (new Set(selectedSeasons).size !== selectedSeasons.length) throw new Error("--seasons must not contain duplicates.");

const source = {
  provider: sourceManifest.provider,
  repository: sourceManifest.repository,
  dataRepositoryCommit: sourceManifest.dataRepositoryCommit,
  nflreadrCommit: sourceManifest.nflreadrCommit,
  license: sourceManifest.license,
  assetFamily: "reg",
  summaryLevel: "regular"
};

const allPlayerRows = [];
const allTeamRows = [];
const coverage = [];
const sourceVerification = [];
const sourcePlayerIds = new Set();
const teamIds = new Set();

for (const season of selectedSeasons) {
  const playerAsset = sourceManifest.players.assets.find((asset) => asset.season === season);
  const teamAsset = sourceManifest.teams.assets.find((asset) => asset.season === season);
  if (!playerAsset || !teamAsset) throw new Error(`NFL source manifest is missing player/team asset coverage for ${season}.`);

  const [playerSource, teamSource] = await Promise.all([
    loadAsset(playerAsset, args.sourceDir),
    loadAsset(teamAsset, args.sourceDir)
  ]);
  const players = normalizeCsv(playerSource.text, {
    season,
    columns: PLAYER_COLUMNS,
    fieldMap: PLAYER_FIELD_MAP,
    required: PLAYER_REQUIRED,
    identity: "player"
  });
  const teams = normalizeCsv(teamSource.text, {
    season,
    columns: TEAM_COLUMNS,
    fieldMap: TEAM_FIELD_MAP,
    required: TEAM_REQUIRED,
    identity: "team"
  });

  allPlayerRows.push(...players.rows);
  allTeamRows.push(...teams.rows);
  players.rows.forEach((row) => sourcePlayerIds.add(row[PLAYER_COLUMNS.indexOf("sourcePlayerId")]));
  teams.rows.forEach((row) => teamIds.add(row[TEAM_COLUMNS.indexOf("team")]));
  coverage.push({
    season,
    playerRowCount: players.rows.length,
    teamRowCount: teams.rows.length,
    playerSourceColumnCount: players.header.length,
    teamSourceColumnCount: teams.header.length
  });
  sourceVerification.push({
    season,
    playerAssetId: playerAsset.assetId,
    playerSha256: playerAsset.sha256,
    playerVerifiedPinnedAsset: playerSource.verifiedPinnedAsset,
    teamAssetId: teamAsset.assetId,
    teamSha256: teamAsset.sha256,
    teamVerifiedPinnedAsset: teamSource.verifiedPinnedAsset
  });
  console.log(`Normalized NFL ${season}: ${players.rows.length.toLocaleString()} player rows + ${teams.rows.length.toLocaleString()} team rows.`);
}

allPlayerRows.sort((left, right) => Number(left[0]) - Number(right[0]) || String(left[1]).localeCompare(String(right[1])));
allTeamRows.sort((left, right) => Number(left[0]) - Number(right[0]) || String(left[1]).localeCompare(String(right[1])));

const playerCorpus = makeCorpus({ kind: "player-season", seasons: selectedSeasons, columns: PLAYER_COLUMNS, rows: allPlayerRows, source });
const teamCorpus = makeCorpus({ kind: "team-season", seasons: selectedSeasons, columns: TEAM_COLUMNS, rows: allTeamRows, source });
const playerSerialized = `${JSON.stringify(playerCorpus)}\n`;
const teamSerialized = `${JSON.stringify(teamCorpus)}\n`;
const importManifest = {
  schemaVersion: 1,
  league: "NFL",
  seasonStart: Math.min(...selectedSeasons),
  seasonEnd: Math.max(...selectedSeasons),
  seasonCount: selectedSeasons.length,
  playerRowCount: allPlayerRows.length,
  teamRowCount: allTeamRows.length,
  uniqueSourcePlayerCount: sourcePlayerIds.size,
  uniqueTeamCount: teamIds.size,
  playerColumnCount: PLAYER_COLUMNS.length,
  teamColumnCount: TEAM_COLUMNS.length,
  playerSha256: sha256(Buffer.from(playerSerialized)),
  teamSha256: sha256(Buffer.from(teamSerialized)),
  source,
  sourceVerification,
  generatedBy: "scripts/import-football-nfl-historical-stats.mjs"
};
const coverageReport = {
  schemaVersion: 1,
  league: "NFL",
  source,
  seasonStart: importManifest.seasonStart,
  seasonEnd: importManifest.seasonEnd,
  totals: {
    playerRowCount: allPlayerRows.length,
    teamRowCount: allTeamRows.length,
    uniqueSourcePlayerCount: sourcePlayerIds.size,
    uniqueTeamCount: teamIds.size
  },
  seasons: coverage
};

for (const filePath of [args.playerOutput, args.teamOutput, args.manifest, args.coverage]) ensureParent(filePath);
fs.writeFileSync(args.playerOutput, playerSerialized);
fs.writeFileSync(args.teamOutput, teamSerialized);
fs.writeFileSync(args.manifest, `${JSON.stringify(importManifest, null, 2)}\n`);
fs.writeFileSync(args.coverage, `${JSON.stringify(coverageReport, null, 2)}\n`);

console.log(`Generated ${allPlayerRows.length.toLocaleString()} NFL player-seasons and ${allTeamRows.length.toLocaleString()} NFL team-seasons across ${selectedSeasons.length} seasons.`);
console.log(`Player corpus SHA-256: ${importManifest.playerSha256}`);
console.log(`Team corpus SHA-256: ${importManifest.teamSha256}`);
