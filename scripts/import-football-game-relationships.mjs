import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { gitBlobSha1, parseCsv } from "./lib/footballCsv.mjs";

const DEFAULT_SOURCE_MANIFEST = "public/data/football/football-game-relationships.source-manifest.json";
const DEFAULT_OUTPUT_DIR = "data/generated/football/relationships";

const CFB_PROGRAM_COLUMNS = [
  "sourceProgramId", "programName", "firstSeason", "lastSeason", "seasonCount", "latestDivision", "latestConference"
];
const CFB_TEAM_SEASON_COLUMNS = [
  "season", "sourceProgramId", "programName", "division", "conference",
  "regularSeasonGames", "regularSeasonWins", "regularSeasonLosses", "regularSeasonTies",
  "postseasonGames", "postseasonWins", "postseasonLosses", "postseasonTies",
  "overallGames", "overallWins", "overallLosses", "overallTies", "pointsFor", "pointsAgainst",
  "conferenceGames", "conferenceWins", "conferenceLosses", "conferenceTies",
  "explicitNationalChampionshipGame", "explicitNationalChampion"
];
const CFB_GAME_COLUMNS = [
  "sourceGameId", "season", "week", "seasonType", "date", "neutralSite", "conferenceGame",
  "homeProgramId", "homeTeam", "homeDivision", "homeConference", "homePoints",
  "awayProgramId", "awayTeam", "awayDivision", "awayConference", "awayPoints",
  "winnerProgramId", "loserProgramId", "tie", "notes", "explicitNationalChampionshipGame"
];
const NFL_FRANCHISE_COLUMNS = ["franchiseId", "sourceTeamCodes", "firstSeason", "lastSeason", "seasonCount"];
const NFL_TEAM_SEASON_COLUMNS = [
  "season", "franchiseId", "sourceTeamCode",
  "regularSeasonGames", "regularSeasonWins", "regularSeasonLosses", "regularSeasonTies",
  "postseasonGames", "postseasonWins", "postseasonLosses", "postseasonTies",
  "overallGames", "overallWins", "overallLosses", "overallTies", "pointsFor", "pointsAgainst",
  "playoffBerth", "conferenceChampionshipGame", "superBowlAppearance", "superBowlChampion"
];
const NFL_GAME_COLUMNS = [
  "sourceGameId", "season", "gameType", "week", "date",
  "awayFranchiseId", "awayTeamCode", "awayScore", "homeFranchiseId", "homeTeamCode", "homeScore",
  "winnerFranchiseId", "loserFranchiseId", "tie", "overtime", "superBowl"
];

function parseArgs(argv) {
  const args = { sourceManifest: DEFAULT_SOURCE_MANIFEST, sourceDir: null, cfbSeasons: null, nflSeasons: null, outputDir: DEFAULT_OUTPUT_DIR };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--source-manifest") args.sourceManifest = argv[++index] ?? DEFAULT_SOURCE_MANIFEST;
    else if (token === "--source-dir") args.sourceDir = argv[++index] ?? null;
    else if (token === "--cfb-seasons") args.cfbSeasons = parseSeasonList(argv[++index] ?? "");
    else if (token === "--nfl-seasons") args.nflSeasons = parseSeasonList(argv[++index] ?? "");
    else if (token === "--output-dir") args.outputDir = argv[++index] ?? DEFAULT_OUTPUT_DIR;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function parseSeasonList(value) {
  const seasons = value.split(",").filter(Boolean).map(Number);
  if (seasons.some((season) => !Number.isInteger(season))) throw new Error("Season lists must contain integers.");
  if (new Set(seasons).size !== seasons.length) throw new Error("Season lists must not contain duplicates.");
  return seasons;
}

function isPresent(value) {
  if (value == null) return false;
  const normalized = String(value).trim();
  return normalized !== "" && normalized !== "NA" && normalized !== "NULL" && normalized !== "NaN";
}

function textOrNull(value) {
  return isPresent(value) ? String(value).trim() : null;
}

function numberOrNull(value) {
  if (!isPresent(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Expected numeric football value, got ${JSON.stringify(value)}`);
  return parsed;
}

function booleanValue(value) {
  if (!isPresent(value)) return false;
  return ["true", "t", "1", "yes"].includes(String(value).trim().toLowerCase());
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function accessor(header, required, label) {
  const indexes = new Map(header.map((column, index) => [column, index]));
  for (const column of required) {
    if (!indexes.has(column)) throw new Error(`${label} is missing required column ${column}.`);
  }
  return (row, column) => {
    const index = indexes.get(column);
    return index == null ? "" : row[index] ?? "";
  };
}

async function loadGitCsv({ repository, commit, asset, sourceDir, localFolder, userAgent }) {
  if (sourceDir) {
    const localPath = path.join(sourceDir, localFolder, asset.name ?? path.basename(asset.path));
    return { text: fs.readFileSync(localPath, "utf8"), verifiedPinnedBlob: false };
  }
  const url = `https://raw.githubusercontent.com/${repository}/${commit}/${asset.path}`;
  const response = await fetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`Football source download failed: ${response.status} ${response.statusText} (${asset.path})`);
  const text = await response.text();
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes !== asset.bytes) throw new Error(`${asset.path} byte-size mismatch: ${bytes} !== ${asset.bytes}.`);
  const blobSha = gitBlobSha1(text);
  if (blobSha !== asset.gitBlobSha) throw new Error(`${asset.path} Git blob mismatch: ${blobSha} !== ${asset.gitBlobSha}.`);
  return { text, verifiedPinnedBlob: true };
}

function blankResultRecord(identity) {
  return {
    ...identity,
    regularSeasonGames: 0, regularSeasonWins: 0, regularSeasonLosses: 0, regularSeasonTies: 0,
    postseasonGames: 0, postseasonWins: 0, postseasonLosses: 0, postseasonTies: 0,
    overallGames: 0, overallWins: 0, overallLosses: 0, overallTies: 0,
    pointsFor: 0, pointsAgainst: 0
  };
}

function addGameResult(record, pointsFor, pointsAgainst, postseason) {
  record.overallGames += 1;
  record.pointsFor += pointsFor;
  record.pointsAgainst += pointsAgainst;
  const result = pointsFor > pointsAgainst ? "Wins" : pointsFor < pointsAgainst ? "Losses" : "Ties";
  record[`overall${result}`] += 1;
  const prefix = postseason ? "postseason" : "regularSeason";
  record[`${prefix}Games`] += 1;
  record[`${prefix}${result}`] += 1;
  return result;
}

function explicitNationalChampionshipFromNotes(notes) {
  return isPresent(notes) && /national championship/i.test(String(notes));
}

function processCfbSeason(csv, expectedSeason) {
  const parsed = parseCsv(csv).filter((row) => row.some(isPresent));
  if (parsed.length < 2) throw new Error(`CFB schedule ${expectedSeason} did not contain games.`);
  const [header, ...rows] = parsed;
  const get = accessor(header, [
    "game_id", "season", "week", "season_type", "start_date", "completed", "neutral_site", "conference_game",
    "home_id", "home_team", "home_division", "home_conference", "home_points",
    "away_id", "away_team", "away_division", "away_conference", "away_points", "notes"
  ], `CFB schedule ${expectedSeason}`);

  const programs = new Map();
  const teamSeasons = new Map();
  const games = [];

  function touchProgram({ id, name, division, conference }) {
    const key = String(id);
    let record = programs.get(key);
    if (!record) {
      record = { sourceProgramId: key, programName: name, firstSeason: expectedSeason, lastSeason: expectedSeason, seasons: new Set(), latestDivision: division, latestConference: conference };
      programs.set(key, record);
    }
    record.seasons.add(expectedSeason);
    if (expectedSeason >= record.lastSeason) {
      record.lastSeason = expectedSeason;
      record.programName = name ?? record.programName;
      record.latestDivision = division ?? record.latestDivision;
      record.latestConference = conference ?? record.latestConference;
    }
    record.firstSeason = Math.min(record.firstSeason, expectedSeason);
    return record;
  }

  function touchTeamSeason({ id, name, division, conference }) {
    const sourceProgramId = String(id);
    const key = `${expectedSeason}\u0000${sourceProgramId}`;
    let record = teamSeasons.get(key);
    if (!record) {
      record = {
        ...blankResultRecord({ season: expectedSeason, sourceProgramId, programName: name, division, conference }),
        conferenceGames: 0, conferenceWins: 0, conferenceLosses: 0, conferenceTies: 0,
        explicitNationalChampionshipGame: false, explicitNationalChampion: false
      };
      teamSeasons.set(key, record);
    }
    return record;
  }

  rows.forEach((row, rowIndex) => {
    if (row.length !== header.length) throw new Error(`CFB schedule ${expectedSeason} row ${rowIndex + 2} has ${row.length} columns; expected ${header.length}.`);
    const season = Number(get(row, "season"));
    if (season !== expectedSeason) throw new Error(`CFB schedule season mismatch: expected ${expectedSeason}, got ${get(row, "season")}.`);
    if (!booleanValue(get(row, "completed"))) return;

    const homeId = textOrNull(get(row, "home_id"));
    const awayId = textOrNull(get(row, "away_id"));
    const homePoints = numberOrNull(get(row, "home_points"));
    const awayPoints = numberOrNull(get(row, "away_points"));
    if (!homeId || !awayId || homePoints == null || awayPoints == null) return;

    const home = { id: homeId, name: textOrNull(get(row, "home_team")), division: textOrNull(get(row, "home_division")), conference: textOrNull(get(row, "home_conference")) };
    const away = { id: awayId, name: textOrNull(get(row, "away_team")), division: textOrNull(get(row, "away_division")), conference: textOrNull(get(row, "away_conference")) };
    touchProgram(home);
    touchProgram(away);
    const homeSeason = touchTeamSeason(home);
    const awaySeason = touchTeamSeason(away);
    const seasonType = String(get(row, "season_type") || "regular").trim().toLowerCase();
    const postseason = seasonType !== "regular";
    const conferenceGame = booleanValue(get(row, "conference_game"));
    const notes = textOrNull(get(row, "notes"));
    const explicitNationalChampionshipGame = postseason && explicitNationalChampionshipFromNotes(notes);

    const homeResult = addGameResult(homeSeason, homePoints, awayPoints, postseason);
    const awayResult = addGameResult(awaySeason, awayPoints, homePoints, postseason);
    if (conferenceGame) {
      homeSeason.conferenceGames += 1;
      awaySeason.conferenceGames += 1;
      homeSeason[`conference${homeResult}`] += 1;
      awaySeason[`conference${awayResult}`] += 1;
    }
    if (explicitNationalChampionshipGame) {
      homeSeason.explicitNationalChampionshipGame = true;
      awaySeason.explicitNationalChampionshipGame = true;
      if (homePoints > awayPoints) homeSeason.explicitNationalChampion = true;
      if (awayPoints > homePoints) awaySeason.explicitNationalChampion = true;
    }

    const tie = homePoints === awayPoints;
    const winnerProgramId = tie ? null : homePoints > awayPoints ? homeId : awayId;
    const loserProgramId = tie ? null : homePoints > awayPoints ? awayId : homeId;
    games.push([
      String(get(row, "game_id")), expectedSeason, numberOrNull(get(row, "week")), seasonType,
      textOrNull(get(row, "start_date")), booleanValue(get(row, "neutral_site")), conferenceGame,
      homeId, home.name, home.division, home.conference, homePoints,
      awayId, away.name, away.division, away.conference, awayPoints,
      winnerProgramId, loserProgramId, tie, notes, explicitNationalChampionshipGame
    ]);
  });

  const programRows = [...programs.values()].map((record) => [
    record.sourceProgramId, record.programName, record.firstSeason, record.lastSeason, record.seasons.size, record.latestDivision, record.latestConference
  ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  const teamSeasonRows = [...teamSeasons.values()].map((record) => CFB_TEAM_SEASON_COLUMNS.map((column) => record[column] ?? null))
    .sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  games.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  return { programRows, teamSeasonRows, games, sourceRowCount: rows.length };
}

function canonicalNflFranchiseId(teamCode) {
  const normalized = String(teamCode).trim().toUpperCase();
  return ({ LA: "LAR", STL: "LAR", OAK: "LV", SD: "LAC", WSH: "WAS", JAC: "JAX" })[normalized] ?? normalized;
}

function processNflGames(csv, selectedSeasons) {
  const parsed = parseCsv(csv).filter((row) => row.some(isPresent));
  if (parsed.length < 2) throw new Error("NFL schedule source did not contain games.");
  const [header, ...rows] = parsed;
  const get = accessor(header, ["game_id", "season", "game_type", "week", "gameday", "away_team", "away_score", "home_team", "home_score"], "NFL games schedule");
  const seasonSet = new Set(selectedSeasons);
  const franchises = new Map();
  const teamSeasons = new Map();
  const games = [];
  const coverageBySeason = new Map(selectedSeasons.map((season) => [season, { season, sourceRowCount: 0, gameCount: 0, franchiseCount: new Set(), playoffGameCount: 0, superBowlCount: 0 }]));

  function touchFranchise(sourceCode, season) {
    const franchiseId = canonicalNflFranchiseId(sourceCode);
    let record = franchises.get(franchiseId);
    if (!record) {
      record = { franchiseId, sourceTeamCodes: new Set(), firstSeason: season, lastSeason: season, seasons: new Set() };
      franchises.set(franchiseId, record);
    }
    record.sourceTeamCodes.add(String(sourceCode).trim().toUpperCase());
    record.seasons.add(season);
    record.firstSeason = Math.min(record.firstSeason, season);
    record.lastSeason = Math.max(record.lastSeason, season);
    return record;
  }

  function touchTeamSeason(sourceCode, season) {
    const franchiseId = canonicalNflFranchiseId(sourceCode);
    const key = `${season}\u0000${franchiseId}`;
    let record = teamSeasons.get(key);
    if (!record) {
      record = {
        ...blankResultRecord({ season, franchiseId, sourceTeamCode: String(sourceCode).trim().toUpperCase() }),
        playoffBerth: false, conferenceChampionshipGame: false, superBowlAppearance: false, superBowlChampion: false
      };
      teamSeasons.set(key, record);
    }
    return record;
  }

  rows.forEach((row, rowIndex) => {
    if (row.length !== header.length) throw new Error(`NFL games row ${rowIndex + 2} has ${row.length} columns; expected ${header.length}.`);
    const season = Number(get(row, "season"));
    if (!seasonSet.has(season)) return;
    const seasonCoverage = coverageBySeason.get(season);
    seasonCoverage.sourceRowCount += 1;
    const awayCode = textOrNull(get(row, "away_team"));
    const homeCode = textOrNull(get(row, "home_team"));
    const awayScore = numberOrNull(get(row, "away_score"));
    const homeScore = numberOrNull(get(row, "home_score"));
    if (!awayCode || !homeCode || awayScore == null || homeScore == null) return;

    const awayFranchise = touchFranchise(awayCode, season);
    const homeFranchise = touchFranchise(homeCode, season);
    seasonCoverage.franchiseCount.add(awayFranchise.franchiseId);
    seasonCoverage.franchiseCount.add(homeFranchise.franchiseId);
    const awaySeason = touchTeamSeason(awayCode, season);
    const homeSeason = touchTeamSeason(homeCode, season);
    const gameType = String(get(row, "game_type")).trim().toUpperCase();
    const postseason = gameType !== "REG";
    addGameResult(awaySeason, awayScore, homeScore, postseason);
    addGameResult(homeSeason, homeScore, awayScore, postseason);
    if (postseason) {
      awaySeason.playoffBerth = true;
      homeSeason.playoffBerth = true;
      seasonCoverage.playoffGameCount += 1;
    }
    if (gameType === "CON") {
      awaySeason.conferenceChampionshipGame = true;
      homeSeason.conferenceChampionshipGame = true;
    }
    if (gameType === "SB") {
      awaySeason.superBowlAppearance = true;
      homeSeason.superBowlAppearance = true;
      if (awayScore > homeScore) awaySeason.superBowlChampion = true;
      if (homeScore > awayScore) homeSeason.superBowlChampion = true;
      seasonCoverage.superBowlCount += 1;
    }

    const tie = awayScore === homeScore;
    const winnerFranchiseId = tie ? null : awayScore > homeScore ? awayFranchise.franchiseId : homeFranchise.franchiseId;
    const loserFranchiseId = tie ? null : awayScore > homeScore ? homeFranchise.franchiseId : awayFranchise.franchiseId;
    games.push([
      String(get(row, "game_id")), season, gameType, numberOrNull(get(row, "week")), textOrNull(get(row, "gameday")),
      awayFranchise.franchiseId, String(awayCode).trim().toUpperCase(), awayScore,
      homeFranchise.franchiseId, String(homeCode).trim().toUpperCase(), homeScore,
      winnerFranchiseId, loserFranchiseId, tie, booleanValue(get(row, "overtime")), gameType === "SB"
    ]);
    seasonCoverage.gameCount += 1;
  });

  const franchiseRows = [...franchises.values()].map((record) => [record.franchiseId, [...record.sourceTeamCodes].sort(), record.firstSeason, record.lastSeason, record.seasons.size])
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  const teamSeasonRows = [...teamSeasons.values()].map((record) => NFL_TEAM_SEASON_COLUMNS.map((column) => record[column] ?? null))
    .sort((a, b) => Number(a[0]) - Number(b[0]) || String(a[1]).localeCompare(String(b[1])));
  games.sort((a, b) => Number(a[1]) - Number(b[1]) || String(a[0]).localeCompare(String(b[0])));
  const coverage = [...coverageBySeason.values()].map((record) => ({ ...record, franchiseCount: record.franchiseCount.size }));
  return { franchiseRows, teamSeasonRows, games, coverage, sourceRowCount: rows.length };
}

function corpus({ league, recordKind, columns, rows, source, seasonStart, seasonEnd }) {
  return { schemaVersion: 1, league, recordKind, source, seasonStart, seasonEnd, columns, rowCount: rows.length, rows };
}

function writeCorpus(outputDir, name, value) {
  const serialized = `${JSON.stringify(value)}\n`;
  const filePath = path.join(outputDir, name);
  ensureParent(filePath);
  fs.writeFileSync(filePath, serialized);
  return { filePath, sha256: sha256(serialized), rowCount: value.rowCount };
}

const args = parseArgs(process.argv.slice(2));
const sourceManifest = JSON.parse(fs.readFileSync(args.sourceManifest, "utf8"));
if (sourceManifest.cfb?.provider !== "cfbfastR" || sourceManifest.cfb?.license !== "CC BY 4.0") throw new Error("CFB game relationship source must remain pinned to cfbfastR CC BY 4.0 data.");
if (sourceManifest.nfl?.provider !== "nflverse" || sourceManifest.nfl?.license !== "CC BY 4.0") throw new Error("NFL game relationship source must remain pinned to nflverse CC BY 4.0 data.");

const cfbSeasons = args.cfbSeasons ?? sourceManifest.cfb.assets.map((asset) => asset.season);
const nflSeasons = args.nflSeasons ?? Array.from({ length: sourceManifest.nfl.seasonEnd - sourceManifest.nfl.seasonStart + 1 }, (_, index) => sourceManifest.nfl.seasonStart + index);
const cfbPrograms = new Map();
const cfbTeamSeasons = [];
const cfbGames = [];
const cfbCoverage = [];
const cfbSourceVerification = [];

for (const season of cfbSeasons) {
  const asset = sourceManifest.cfb.assets.find((candidate) => candidate.season === season);
  if (!asset) throw new Error(`CFB relationship source manifest is missing season ${season}.`);
  const loaded = await loadGitCsv({ repository: sourceManifest.cfb.repository, commit: sourceManifest.cfb.commit, asset, sourceDir: args.sourceDir, localFolder: "cfb", userAgent: "Octagon-HQ-Football-relationships" });
  const result = processCfbSeason(loaded.text, season);
  result.programRows.forEach((row) => {
    const id = row[0];
    const existing = cfbPrograms.get(id);
    if (!existing) cfbPrograms.set(id, { row: [...row], seasons: new Set([season]) });
    else {
      existing.seasons.add(season);
      existing.row[1] = row[1] ?? existing.row[1];
      existing.row[2] = Math.min(existing.row[2], row[2]);
      existing.row[3] = Math.max(existing.row[3], row[3]);
      existing.row[4] = existing.seasons.size;
      if (row[3] >= existing.row[3]) {
        existing.row[5] = row[5] ?? existing.row[5];
        existing.row[6] = row[6] ?? existing.row[6];
      }
    }
  });
  cfbTeamSeasons.push(...result.teamSeasonRows);
  cfbGames.push(...result.games);
  cfbCoverage.push({ season, sourceRowCount: result.sourceRowCount, gameCount: result.games.length, teamSeasonCount: result.teamSeasonRows.length, programCount: result.programRows.length, explicitNationalChampionshipGameCount: result.games.filter((row) => row[CFB_GAME_COLUMNS.indexOf("explicitNationalChampionshipGame")] === true).length });
  cfbSourceVerification.push({ season, path: asset.path, gitBlobSha: asset.gitBlobSha, verifiedPinnedBlob: loaded.verifiedPinnedBlob });
  console.log(`Normalized CFB ${season}: ${result.games.length.toLocaleString()} games, ${result.teamSeasonRows.length.toLocaleString()} team seasons.`);
}

const nflLoaded = await loadGitCsv({ repository: sourceManifest.nfl.repository, commit: sourceManifest.nfl.commit, asset: sourceManifest.nfl.asset, sourceDir: args.sourceDir, localFolder: "nfl", userAgent: "Octagon-HQ-Football-relationships" });
const nfl = processNflGames(nflLoaded.text, nflSeasons);
const cfbProgramRows = [...cfbPrograms.values()].map(({ row, seasons }) => { row[4] = seasons.size; return row; }).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
cfbTeamSeasons.sort((a, b) => Number(a[0]) - Number(b[0]) || String(a[1]).localeCompare(String(b[1])));
cfbGames.sort((a, b) => Number(a[1]) - Number(b[1]) || String(a[0]).localeCompare(String(b[0])));

const cfbSource = { provider: sourceManifest.cfb.provider, repository: sourceManifest.cfb.repository, commit: sourceManifest.cfb.commit, license: sourceManifest.cfb.license, championshipSignal: sourceManifest.cfb.championshipSignal };
const nflSource = { provider: sourceManifest.nfl.provider, repository: sourceManifest.nfl.repository, commit: sourceManifest.nfl.commit, nflreadrCommit: sourceManifest.nfl.nflreadrCommit, license: sourceManifest.nfl.license };
const outputs = [
  writeCorpus(args.outputDir, "cfb-programs-2002-2025.json", corpus({ league: "CFB", recordKind: "program", columns: CFB_PROGRAM_COLUMNS, rows: cfbProgramRows, source: cfbSource, seasonStart: Math.min(...cfbSeasons), seasonEnd: Math.max(...cfbSeasons) })),
  writeCorpus(args.outputDir, "cfb-team-season-results-2002-2025.json", corpus({ league: "CFB", recordKind: "team-season-results", columns: CFB_TEAM_SEASON_COLUMNS, rows: cfbTeamSeasons, source: cfbSource, seasonStart: Math.min(...cfbSeasons), seasonEnd: Math.max(...cfbSeasons) })),
  writeCorpus(args.outputDir, "cfb-games-2002-2025.json", corpus({ league: "CFB", recordKind: "game", columns: CFB_GAME_COLUMNS, rows: cfbGames, source: cfbSource, seasonStart: Math.min(...cfbSeasons), seasonEnd: Math.max(...cfbSeasons) })),
  writeCorpus(args.outputDir, "nfl-franchises-1999-2025.json", corpus({ league: "NFL", recordKind: "franchise", columns: NFL_FRANCHISE_COLUMNS, rows: nfl.franchiseRows, source: nflSource, seasonStart: Math.min(...nflSeasons), seasonEnd: Math.max(...nflSeasons) })),
  writeCorpus(args.outputDir, "nfl-team-season-results-1999-2025.json", corpus({ league: "NFL", recordKind: "team-season-results", columns: NFL_TEAM_SEASON_COLUMNS, rows: nfl.teamSeasonRows, source: nflSource, seasonStart: Math.min(...nflSeasons), seasonEnd: Math.max(...nflSeasons) })),
  writeCorpus(args.outputDir, "nfl-games-1999-2025.json", corpus({ league: "NFL", recordKind: "game", columns: NFL_GAME_COLUMNS, rows: nfl.games, source: nflSource, seasonStart: Math.min(...nflSeasons), seasonEnd: Math.max(...nflSeasons) }))
];

const generatedManifest = {
  schemaVersion: 1,
  generatedBy: "scripts/import-football-game-relationships.mjs",
  outputs: outputs.map(({ filePath, sha256: digest, rowCount }) => ({ file: path.basename(filePath), sha256: digest, rowCount })),
  cfbSourceVerification,
  nflSourceVerification: { path: sourceManifest.nfl.asset.path, gitBlobSha: sourceManifest.nfl.asset.gitBlobSha, verifiedPinnedBlob: nflLoaded.verifiedPinnedBlob }
};
const coverage = {
  schemaVersion: 1,
  cfb: {
    championshipSignal: sourceManifest.cfb.championshipSignal,
    seasonStart: Math.min(...cfbSeasons), seasonEnd: Math.max(...cfbSeasons), programCount: cfbProgramRows.length, teamSeasonCount: cfbTeamSeasons.length, gameCount: cfbGames.length,
    explicitNationalChampionshipGameCount: cfbGames.filter((row) => row[CFB_GAME_COLUMNS.indexOf("explicitNationalChampionshipGame")] === true).length,
    seasons: cfbCoverage
  },
  nfl: {
    seasonStart: Math.min(...nflSeasons), seasonEnd: Math.max(...nflSeasons), franchiseCount: nfl.franchiseRows.length, teamSeasonCount: nfl.teamSeasonRows.length, gameCount: nfl.games.length,
    playoffGameCount: nfl.coverage.reduce((sum, season) => sum + season.playoffGameCount, 0), superBowlCount: nfl.coverage.reduce((sum, season) => sum + season.superBowlCount, 0),
    seasons: nfl.coverage
  }
};
const manifestPath = path.join(args.outputDir, "football-game-relationships.manifest.json");
const coveragePath = path.join(args.outputDir, "football-game-relationships.coverage.json");
fs.writeFileSync(manifestPath, `${JSON.stringify(generatedManifest, null, 2)}\n`);
fs.writeFileSync(coveragePath, `${JSON.stringify(coverage, null, 2)}\n`);

console.log(`Generated CFB: ${cfbProgramRows.length.toLocaleString()} programs, ${cfbTeamSeasons.length.toLocaleString()} team seasons, ${cfbGames.length.toLocaleString()} games.`);
console.log(`Generated NFL: ${nfl.franchiseRows.length.toLocaleString()} franchises, ${nfl.teamSeasonRows.length.toLocaleString()} team seasons, ${nfl.games.length.toLocaleString()} games.`);
