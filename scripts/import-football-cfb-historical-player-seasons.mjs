#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(repoRoot, "scripts", "football-cfb-historical-source-lock.json");
const outputDir = path.join(repoRoot, "public", "data", "football", "cfb", "historical-player-seasons");
const sourceLock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
const releaseBase = `https://github.com/${sourceLock.repository}/releases/download/${sourceLock.releaseTag}`;
const sourceDirArgIndex = process.argv.indexOf("--source-dir");
const sourceDir = sourceDirArgIndex >= 0 ? path.resolve(process.argv[sourceDirArgIndex + 1]) : null;

if (sourceDirArgIndex >= 0 && !process.argv[sourceDirArgIndex + 1]) {
  throw new Error("--source-dir requires a directory path");
}

const columns = [
  "id",
  "athlete_id",
  "athlete_name",
  "team_id",
  "season",
  "games",
  "pass_cmp",
  "pass_att",
  "pass_yds",
  "pass_td",
  "rush_att",
  "rush_yds",
  "rush_td",
  "rec",
  "rec_yds",
  "rec_td",
  "tackles_tot",
  "tackles_solo",
  "sacks",
  "tfl",
  "pbu",
  "def_int",
  "def_int_yds",
  "def_int_td",
  "kick_ret",
  "kick_ret_yds",
  "kick_ret_td",
  "punt_ret",
  "punt_ret_yds",
  "punt_ret_td",
  "fgm",
  "fga",
  "xpm",
  "xpa",
  "kick_points",
  "punts",
  "punt_yds"
];

const additiveFields = new Map([
  ["passingYards", "pass_yds"],
  ["passingTouchdowns", "pass_td"],
  ["rushingAttempts", "rush_att"],
  ["rushingYards", "rush_yds"],
  ["rushingTouchdowns", "rush_td"],
  ["receptions", "rec"],
  ["receivingYards", "rec_yds"],
  ["receivingTouchdowns", "rec_td"],
  ["totalTackles", "tackles_tot"],
  ["soloTackles", "tackles_solo"],
  ["sacks", "sacks"],
  ["tacklesForLoss", "tfl"],
  ["passesDefended", "pbu"],
  ["interceptionYards", "def_int_yds"],
  ["interceptionTouchdowns", "def_int_td"],
  ["kickReturns", "kick_ret"],
  ["kickReturnYards", "kick_ret_yds"],
  ["kickReturnTouchdowns", "kick_ret_td"],
  ["puntReturns", "punt_ret"],
  ["puntReturnYards", "punt_ret_yds"],
  ["puntReturnTouchdowns", "punt_ret_td"],
  ["totalKickingPoints", "kick_points"],
  ["punts", "punts"],
  ["puntYards", "punt_yds"]
]);

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.endsWith("\r") ? value.slice(0, -1) : value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.endsWith("\r") ? value.slice(0, -1) : value);
    rows.push(row);
  }

  return rows;
}

function numberOrZero(value) {
  if (value == null) return 0;
  const normalized = String(value).trim();
  if (!normalized || normalized === "NA" || normalized === "NaN" || normalized === "null") return 0;
  const parsed = Number(normalized.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePair(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized === "NA") return [0, 0];
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  return match ? [numberOrZero(match[1]), numberOrZero(match[2])] : [0, 0];
}

function blankStats() {
  return Object.fromEntries(columns.slice(6).map((column) => [column, 0]));
}

function rowObject(headers, values) {
  if (values.length !== headers.length) {
    throw new Error(`CSV row has ${values.length} values; expected ${headers.length}`);
  }
  return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
}

async function readSourceAsset(asset) {
  if (sourceDir) {
    return fs.readFileSync(path.join(sourceDir, asset.name));
  }
  const response = await fetch(`${releaseBase}/${asset.name}`);
  if (!response.ok) throw new Error(`Failed ${asset.name}: ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

function aggregateSeason(asset, csvText) {
  const parsed = parseCsv(csvText);
  if (parsed.length < 2) throw new Error(`${asset.name} has no data rows`);
  const headers = parsed[0];
  const required = ["category", "athlete_id", "athlete_name", "team_id", "game_id", "season"];
  for (const name of required) {
    if (!headers.includes(name)) throw new Error(`${asset.name} is missing ${name}`);
  }

  const records = new Map();

  for (const values of parsed.slice(1)) {
    if (values.length === 1 && values[0] === "") continue;
    const source = rowObject(headers, values);
    const athleteId = String(source.athlete_id ?? "").trim();
    const teamId = String(source.team_id ?? "").trim();
    const athleteName = String(source.athlete_name ?? "").trim();
    const season = numberOrZero(source.season);
    if (!athleteId || athleteId === "NA" || !teamId || teamId === "NA" || !athleteName || season !== asset.season) continue;

    const key = `${athleteId}:${teamId}`;
    let record = records.get(key);
    if (!record) {
      record = {
        id: `cfb-espn-${athleteId}-${season}-${teamId}`,
        athleteId,
        athleteName,
        teamId,
        season,
        games: new Set(),
        stats: blankStats()
      };
      records.set(key, record);
    }

    const gameId = String(source.game_id ?? "").trim();
    if (gameId && gameId !== "NA") record.games.add(gameId);

    for (const [sourceColumn, outputColumn] of additiveFields) {
      record.stats[outputColumn] += numberOrZero(source[sourceColumn]);
    }

    const category = String(source.category ?? "").trim().toLowerCase();
    if (category === "passing") {
      const [completions, attempts] = parsePair(source["completions/passingAttempts"]);
      record.stats.pass_cmp += completions;
      record.stats.pass_att += attempts;
    }
    if (category === "interceptions") {
      record.stats.def_int += numberOrZero(source.interceptions);
    }
    if (category === "kicking") {
      const [fgm, fga] = parsePair(source["fieldGoalsMade/fieldGoalAttempts"]);
      const [xpm, xpa] = parsePair(source["extraPointsMade/extraPointAttempts"]);
      record.stats.fgm += fgm;
      record.stats.fga += fga;
      record.stats.xpm += xpm;
      record.stats.xpa += xpa;
    }
  }

  const rows = [...records.values()]
    .sort((a, b) => Number(a.athleteId) - Number(b.athleteId) || Number(a.teamId) - Number(b.teamId))
    .map((record) => [
      record.id,
      record.athleteId,
      record.athleteName,
      record.teamId,
      record.season,
      record.games.size,
      ...columns.slice(6).map((column) => record.stats[column])
    ]);

  return {
    schemaVersion: 1,
    league: "CFB",
    season: asset.season,
    columns,
    rowCount: rows.length,
    rows
  };
}

fs.mkdirSync(outputDir, { recursive: true });
for (const file of fs.readdirSync(outputDir)) {
  if (file.endsWith(".json")) fs.rmSync(path.join(outputDir, file));
}

const seasonManifests = [];
const uniqueAthletes = new Set();
const uniqueTeams = new Set();
let totalRows = 0;

for (const asset of sourceLock.assets) {
  process.stdout.write(`Importing CFB ${asset.season}... `);
  const compressed = await readSourceAsset(asset);
  const actualSourceSha = sha256(compressed);
  if (actualSourceSha !== asset.sha256) {
    throw new Error(`${asset.name} SHA mismatch: expected ${asset.sha256}, got ${actualSourceSha}`);
  }

  const csv = zlib.gunzipSync(compressed).toString("utf8");
  const corpus = aggregateSeason(asset, csv);
  if (corpus.rowCount < 1_000) {
    throw new Error(`${asset.season} normalized to only ${corpus.rowCount} player-team seasons`);
  }

  const content = `${JSON.stringify(corpus)}\n`;
  const outputName = `player-season-${asset.season}.json`;
  const outputPath = path.join(outputDir, outputName);
  fs.writeFileSync(outputPath, content);

  const athleteIndex = columns.indexOf("athlete_id");
  const teamIndex = columns.indexOf("team_id");
  for (const row of corpus.rows) {
    uniqueAthletes.add(row[athleteIndex]);
    uniqueTeams.add(row[teamIndex]);
  }

  totalRows += corpus.rowCount;
  seasonManifests.push({
    season: asset.season,
    rowCount: corpus.rowCount,
    sourceAssetId: asset.assetId,
    sourceAsset: asset.name,
    sourceSha256: asset.sha256,
    output: outputName,
    outputSha256: sha256(Buffer.from(content))
  });
  console.log(`${corpus.rowCount.toLocaleString()} rows`);
}

if (totalRows < 50_000) throw new Error(`Historical corpus is unexpectedly shallow: ${totalRows} rows`);
if (uniqueAthletes.size < 20_000) throw new Error(`Historical corpus has only ${uniqueAthletes.size} unique athletes`);
if (uniqueTeams.size < 100) throw new Error(`Historical corpus has only ${uniqueTeams.size} unique ESPN team ids`);

const manifest = {
  schemaVersion: 1,
  league: "CFB",
  corpus: "historical-player-seasons",
  coverage: sourceLock.coverage,
  seasonCount: seasonManifests.length,
  rowCount: totalRows,
  uniqueAthleteCount: uniqueAthletes.size,
  uniqueTeamIdCount: uniqueTeams.size,
  columnCount: columns.length,
  columns,
  source: {
    provider: sourceLock.provider,
    repository: sourceLock.repository,
    releaseId: sourceLock.releaseId,
    releaseTag: sourceLock.releaseTag,
    license: sourceLock.license,
    lockFile: "scripts/football-cfb-historical-source-lock.json"
  },
  seasons: seasonManifests
};

fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Historical CFB corpus: ${totalRows.toLocaleString()} player-team seasons, ${uniqueAthletes.size.toLocaleString()} athletes, ${uniqueTeams.size} team ids.`);
