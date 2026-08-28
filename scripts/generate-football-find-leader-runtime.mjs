import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { parseCsv } from "./lib/footballCsv.mjs";
import { footballRecognitionEvidenceRecords } from "../src/features/back-room/footballRecognitionEvidence.ts";

const root = new URL("../", import.meta.url);
const DEFAULT_OUTPUT = "data/generated/football/find-leader-runtime-projection.json";
const DRAFT_URL = "https://github.com/nflverse/nflverse-data/releases/download/draft_picks/draft_picks.csv";
const DRAFT_BYTES = 1656280;
const DRAFT_SHA256 = "91f1ead0d531aec7e219e3f19756b3084d8ef6d8dbf37c8b4ec147dd3985c215";
const read = (file) => JSON.parse(fs.readFileSync(new URL(file, root), "utf8"));
const normalize = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ixFor = (corpus) => Object.fromEntries(corpus.columns.map((column, index) => [column, index]));
const at = (row, ix, column) => ix[column] == null ? undefined : row[ix[column]];
const promoted = (tier) => tier === "A" || tier === "B" || tier === "C";
const numeric = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const numericText = (value) => {
  if (value == null || String(value).trim() === "" || String(value).trim() === "NA") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const outputArg = process.argv.indexOf("--output");
const outputPath = outputArg >= 0 ? process.argv[outputArg + 1] : DEFAULT_OUTPUT;
const check = process.argv.includes("--check");

const recognition = read("data/generated/football/recognizability-projection.json");
const nflPlayers = read("data/generated/football/nfl/player-seasons-1999-2025.json");
const nflTeams = read("data/generated/football/nfl/team-seasons-1999-2025.json");
const cfbPlayers = read("data/generated/football/cfb/player-seasons-2014-2025.json");
const nflTeamSeasons = read("data/generated/football/relationships/nfl-team-season-results-1999-2025.json");
const cfbTeamSeasons = read("data/generated/football/relationships/cfb-team-season-results-2002-2025.json");
const cfbHonors = read("public/data/football/cfb/stage13-major-honors.json");

async function loadPinnedDraftPicks() {
  const response = await fetch(DRAFT_URL, { headers: { "user-agent": "Octagon-HQ-Stage13-factual-universe" } });
  if (!response.ok) throw new Error(`NFL draft-picks source download failed: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== DRAFT_BYTES) throw new Error(`NFL draft-picks byte-size mismatch: ${bytes.length} !== ${DRAFT_BYTES}.`);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== DRAFT_SHA256) throw new Error(`NFL draft-picks SHA-256 mismatch: ${digest} !== ${DRAFT_SHA256}.`);
  const parsed = parseCsv(bytes.toString("utf8")).filter((row) => row.some((value) => String(value ?? "").trim() !== ""));
  const [header, ...rows] = parsed;
  const ix = Object.fromEntries(header.map((column, index) => [column, index]));
  for (const required of ["season", "round", "pick", "team", "gsis_id", "pfr_player_name", "position", "category", "college", "allpro", "probowls", "hof", "games"]) {
    if (ix[required] == null) throw new Error(`NFL draft-picks source is missing required column ${required}.`);
  }
  const value = (row, column) => row[ix[column]] ?? "";
  return rows.map((row) => ({
    season: numericText(value(row, "season")), round: numericText(value(row, "round")), pick: numericText(value(row, "pick")),
    team: String(value(row, "team") || "").trim(), gsisId: String(value(row, "gsis_id") || "").trim(),
    name: String(value(row, "pfr_player_name") || "").trim(), position: String(value(row, "position") || "").trim(),
    category: String(value(row, "category") || "").trim(), college: String(value(row, "college") || "").trim(),
    allPro: numericText(value(row, "allpro")), proBowls: numericText(value(row, "probowls")), games: numericText(value(row, "games")),
    hallOfFame: ["true", "t", "1"].includes(String(value(row, "hof") || "").trim().toLowerCase()),
    passCompletions: numericText(value(row, "pass_completions")), passAttempts: numericText(value(row, "pass_attempts")),
    passYards: numericText(value(row, "pass_yards")), passTouchdowns: numericText(value(row, "pass_tds")), passInterceptions: numericText(value(row, "pass_ints")),
    rushAttempts: numericText(value(row, "rush_atts")), rushYards: numericText(value(row, "rush_yards")), rushTouchdowns: numericText(value(row, "rush_tds")),
    receptions: numericText(value(row, "receptions")), receivingYards: numericText(value(row, "rec_yards")), receivingTouchdowns: numericText(value(row, "rec_tds")),
  }));
}

const draftRows = await loadPinnedDraftPicks();
const generatedRecognitionRecords = recognition.records.filter((record) => promoted(record.tier));
const evidenceRecognitionRecords = footballRecognitionEvidenceRecords.filter((record) => promoted(record.tier));
const recognitionIdentityKey = (record) => [
  record.kind,
  record.league,
  normalize(record.name),
  record.position ?? "",
  normalize(record.school ?? ""),
  record.season ?? "",
].join(":");
const evidenceRecognitionKeys = new Set(evidenceRecognitionRecords.map(recognitionIdentityKey));
// Mirror the Stage 12 registry exactly: independent recognition evidence wins when it names the same identity.
// Evidence remains membership-only; every Stage 13 fact still comes from a pinned factual source.
const recognitionRecords = [
  ...generatedRecognitionRecords.filter((record) => !evidenceRecognitionKeys.has(recognitionIdentityKey(record))),
  ...evidenceRecognitionRecords,
];
const playerRecognition = recognitionRecords.filter((record) => record.kind === "player-career");
const playerRecognitionByIdentity = new Map(playerRecognition.map((record) => [recognitionIdentityKey(record), record]));
// Preserve normalized source identities beneath evidence overrides so hydration stays one-to-one.
const nflCareerRecognition = new Map(generatedRecognitionRecords.filter((record) => record.kind === "player-career" && record.league === "NFL" && record.sourceProvider === "nflverse").map((record) => [String(record.sourceId), playerRecognitionByIdentity.get(recognitionIdentityKey(record)) ?? record]));
const cfbCareerRecognition = new Map(generatedRecognitionRecords.filter((record) => record.kind === "player-career" && record.league === "CFB" && record.sourceProvider === "cfbfastR").map((record) => [String(record.sourceId) + ":" + normalize(record.name), playerRecognitionByIdentity.get(recognitionIdentityKey(record)) ?? record]));
const nflTeamRecognition = new Map(recognitionRecords.filter((record) => record.kind === "team-season" && record.league === "NFL").map((record) => [String(record.sourceId), record]));
const cfbTeamRecognition = new Map(recognitionRecords.filter((record) => record.kind === "team-season" && record.league === "CFB").map((record) => [String(record.sourceId), record]));
const evidencePlayerRecognitionByLeagueName = new Map();
for (const record of evidenceRecognitionRecords.filter((row) => row.kind === "player-career")) {
  const key = record.league + ":" + normalize(record.name);
  const values = evidencePlayerRecognitionByLeagueName.get(key) ?? [];
  values.push(record);
  evidencePlayerRecognitionByLeagueName.set(key, values);
}

const draftByGsis = new Map(draftRows.filter((row) => row.gsisId).map((row) => [row.gsisId, row]));
const draftByName = new Map();
for (const row of draftRows) {
  if (!row.name) continue;
  const key = normalize(row.name);
  const list = draftByName.get(key) ?? [];
  list.push(row);
  draftByName.set(key, list);
}

function positionMatches(recognized, draft) {
  const pos = recognized.position;
  if (!pos) return true;
  if (pos === "DL") return draft.category === "DL" || draft.category === "ED" || ["DE", "DT", "NT"].includes(draft.position);
  if (pos === "DB") return draft.category === "DB" || ["CB", "S", "FS", "SS"].includes(draft.position);
  if (pos === "OL") return draft.category === "OL" || ["T", "OT", "G", "OG", "C"].includes(draft.position);
  return draft.category === pos || draft.position === pos;
}

function draftForRecognition(recognized) {
  if (recognized.league === "NFL" && recognized.sourceProvider === "nflverse") {
    const byId = draftByGsis.get(String(recognized.sourceId));
    if (byId) return byId;
  }
  let candidates = (draftByName.get(normalize(recognized.name)) ?? []).filter((row) => positionMatches(recognized, row));
  if (recognized.school && candidates.length > 1) {
    const school = normalize(recognized.school);
    const schoolMatches = candidates.filter((row) => normalize(row.college) === school || normalize(row.college).includes(school) || school.includes(normalize(row.college)));
    if (schoolMatches.length === 1) candidates = schoolMatches;
  }
  return candidates.length === 1 ? candidates[0] : null;
}

function recognitionForSourceRows(league, rows, ix) {
  const names = [...new Set(rows.flatMap((row) => [
    at(row, ix, "playerDisplayName"),
    at(row, ix, "playerName"),
  ]).map(normalize).filter(Boolean))];
  const candidatesById = new Map();
  for (const name of names) {
    for (const record of evidencePlayerRecognitionByLeagueName.get(league + ":" + name) ?? []) candidatesById.set(record.id, record);
  }
  const candidates = [...candidatesById.values()];
  if (candidates.length === 1) return candidates[0];
  if (league === "CFB" && candidates.length > 1) {
    const teams = new Set(rows.map((row) => normalize(at(row, ix, "team"))).filter(Boolean));
    const schoolMatches = candidates.filter((record) => record.school && teams.has(normalize(record.school)));
    if (schoolMatches.length === 1) return schoolMatches[0];
  }
  return null;
}

const subjects = [];
const records = [];
const relationships = [];
const seenSubjectIds = new Set();
const factMapBySubject = new Map();

function ensureSubject(subject) {
  if (seenSubjectIds.has(subject.id)) return;
  seenSubjectIds.add(subject.id);
  subjects.push(subject);
}

function setFact(subjectId, metricId, value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return;
  const map = factMapBySubject.get(subjectId) ?? new Map();
  if (map.has(metricId) && map.get(metricId) !== value) throw new Error(`Conflicting Stage 13 projected fact ${subjectId}:${metricId}.`);
  map.set(metricId, value);
  factMapBySubject.set(subjectId, map);
}

function pushRelationship(row) {
  relationships.push(row);
}

function safeDivide(numerator, denominator) {
  return numerator != null && denominator != null && denominator > 0 ? numerator / denominator : null;
}

function nflPasserRating(completions, attempts, yards, touchdowns, interceptions) {
  if ([completions, attempts, yards, touchdowns, interceptions].some((value) => value == null) || attempts <= 0) return null;
  const a = Math.min(2.375, Math.max(0, (completions / attempts - 0.3) * 5));
  const b = Math.min(2.375, Math.max(0, (yards / attempts - 3) * 0.25));
  const c = Math.min(2.375, Math.max(0, touchdowns / attempts * 20));
  const d = Math.min(2.375, Math.max(0, 2.375 - interceptions / attempts * 25));
  return (a + b + c + d) / 6 * 100;
}

function cfbPasserRating(completions, attempts, yards, touchdowns, interceptions) {
  if ([completions, attempts, yards, touchdowns, interceptions].some((value) => value == null) || attempts <= 0) return null;
  return (8.4 * yards + 330 * touchdowns + 100 * completions - 200 * interceptions) / attempts;
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

function completeSum(rows, ix, column) {
  const values = rows.map((row) => numeric(at(row, ix, column)));
  if (!values.length || values.some((value) => value == null)) return null;
  return values.reduce((total, value) => total + value, 0);
}

function registerPlayer(recognized) {
  ensureSubject({
    id: recognized.id, name: recognized.name, kind: "player-career", league: recognized.league,
    position: recognized.position, school: recognized.school, startSeason: recognized.startSeason, endSeason: recognized.endSeason,
    tier: recognized.tier, sourceProvider: recognized.sourceProvider, sourceId: String(recognized.sourceId),
  });
}

for (const recognized of playerRecognition) {
  const draft = draftForRecognition(recognized);
  if (!draft) continue;
  registerPlayer(recognized);
  pushRelationship({
    subjectId: recognized.id,
    kind: "draft-selection",
    targetId: draft.team || undefined,
    targetName: draft.team || undefined,
    season: draft.season,
    details: { round: draft.round, pick: draft.pick, college: draft.college || undefined },
    evidenceSource: "nflverse-draft-picks-projection",
  });
  if (recognized.league === "NFL") {
    // The checksum-pinned nflverse draft/PFR release is the full-career aggregate owner whenever a drafted
    // player's row supplies the metric. Seasonal nflverse rows remain the owner of season facts and may supply
    // career aggregates only for undrafted players whose complete recognized career is covered by the corpus.
    setFact(recognized.id, "nfl-career-games", draft.games);
    setFact(recognized.id, "nfl-first-team-all-pros", draft.allPro);
    setFact(recognized.id, "nfl-pro-bowl-selections", draft.proBowls);
    setFact(recognized.id, "nfl-hall-of-fame", draft.hallOfFame ? 1 : 0);
    if (["QB", "RB", "WR", "TE"].includes(recognized.position)) {
      setFact(recognized.id, "nfl-career-passing-completions", recognized.position === "QB" ? draft.passCompletions : null);
      setFact(recognized.id, "nfl-career-passing-attempts", recognized.position === "QB" ? draft.passAttempts : null);
      setFact(recognized.id, "nfl-career-passing-yards", recognized.position === "QB" ? draft.passYards : null);
      setFact(recognized.id, "nfl-career-passing-touchdowns", recognized.position === "QB" ? draft.passTouchdowns : null);
      setFact(recognized.id, "nfl-career-interceptions-thrown", recognized.position === "QB" ? draft.passInterceptions : null);
      setFact(recognized.id, "nfl-career-rushing-attempts", ["QB", "RB"].includes(recognized.position) ? draft.rushAttempts : null);
      setFact(recognized.id, "nfl-career-rushing-yards", ["QB", "RB"].includes(recognized.position) ? draft.rushYards : null);
      setFact(recognized.id, "nfl-career-rushing-touchdowns", ["QB", "RB"].includes(recognized.position) ? draft.rushTouchdowns : null);
      setFact(recognized.id, "nfl-career-receptions", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receptions : null);
      setFact(recognized.id, "nfl-career-receiving-yards", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receivingYards : null);
      setFact(recognized.id, "nfl-career-receiving-touchdowns", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receivingTouchdowns : null);
      if (recognized.position === "QB") {
        setFact(recognized.id, "nfl-career-passer-rating", nflPasserRating(draft.passCompletions, draft.passAttempts, draft.passYards, draft.passTouchdowns, draft.passInterceptions));
        setFact(recognized.id, "nfl-career-completion-percentage", safeDivide(draft.passCompletions == null ? null : draft.passCompletions * 100, draft.passAttempts));
        setFact(recognized.id, "nfl-career-passing-yards-per-attempt", safeDivide(draft.passYards, draft.passAttempts));
        setFact(recognized.id, "nfl-career-passing-touchdown-percentage", safeDivide(draft.passTouchdowns == null ? null : draft.passTouchdowns * 100, draft.passAttempts));
      }
      if (recognized.position === "RB") {
        setFact(recognized.id, "nfl-career-rushing-yards-per-attempt", safeDivide(draft.rushYards, draft.rushAttempts));
      }
    }
  }
}

const nflGrouped = groupRows(nflPlayers, (row, ix) => String(at(row, ix, "sourcePlayerId") ?? ""));
for (const [sourcePlayerId, rows] of nflGrouped.groups) {
  const recognized = nflCareerRecognition.get(sourcePlayerId) ?? recognitionForSourceRows("NFL", rows, nflGrouped.ix);
  if (!recognized) continue;
  registerPlayer(recognized);
  const draft = draftForRecognition(recognized);
  const normalizedSeasons = rows.map((row) => numeric(at(row, nflGrouped.ix, "season"))).filter((season) => season != null);
  const normalizedCareerCoverageComplete = recognized.startSeason != null
    && recognized.endSeason != null
    && normalizedSeasons.length > 0
    && Math.min(...normalizedSeasons) <= recognized.startSeason
    && Math.max(...normalizedSeasons) >= recognized.endSeason;
  const position = recognized.position;
  const sum = (column) => completeSum(rows, nflGrouped.ix, column);
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
  const tacklesSolo = sum("tacklesSolo");
  const tacklesForLoss = sum("tacklesForLoss");
  const forcedFumbles = sum("forcedFumbles");
  const defensiveSacks = sum("defensiveSacks");
  const defensiveInterceptions = sum("defensiveInterceptions");
  const passesDefended = sum("passesDefended");
  const fieldGoalsMade = sum("fieldGoalsMade");
  const fieldGoalsAttempted = sum("fieldGoalsAttempted");
  const puntingAttempts = sum("puntingAttempts");
  const puntingYards = sum("puntingYards");

  if (normalizedCareerCoverageComplete) {
    // A drafted player's full-career PFR aggregate remains authoritative for the career metrics it supplies.
    // Undrafted players can use normalized sums only when the observed rows span the whole recognized career.
    if (!draft) {
      setFact(recognized.id, "nfl-career-games", games);
      if (position === "QB") {
        setFact(recognized.id, "nfl-career-passing-completions", completions);
        setFact(recognized.id, "nfl-career-passing-attempts", attempts);
        setFact(recognized.id, "nfl-career-passing-yards", passingYards);
        setFact(recognized.id, "nfl-career-passing-touchdowns", passingTouchdowns);
        setFact(recognized.id, "nfl-career-interceptions-thrown", passingInterceptions);
        setFact(recognized.id, "nfl-career-passer-rating", nflPasserRating(completions, attempts, passingYards, passingTouchdowns, passingInterceptions));
        setFact(recognized.id, "nfl-career-completion-percentage", safeDivide(completions == null ? null : completions * 100, attempts));
        setFact(recognized.id, "nfl-career-passing-yards-per-attempt", safeDivide(passingYards, attempts));
        setFact(recognized.id, "nfl-career-passing-touchdown-percentage", safeDivide(passingTouchdowns == null ? null : passingTouchdowns * 100, attempts));
      }
      if (position === "RB") {
        setFact(recognized.id, "nfl-career-rushing-attempts", carries);
        setFact(recognized.id, "nfl-career-rushing-yards", rushingYards);
        setFact(recognized.id, "nfl-career-rushing-touchdowns", rushingTouchdowns);
        setFact(recognized.id, "nfl-career-rushing-yards-per-attempt", safeDivide(rushingYards, carries));
      }
      if (["RB", "WR", "TE"].includes(position)) {
        setFact(recognized.id, "nfl-career-receptions", receptions);
        setFact(recognized.id, "nfl-career-receiving-yards", receivingYards);
        setFact(recognized.id, "nfl-career-receiving-touchdowns", receivingTouchdowns);
      }
    }
    if (["DL", "LB", "DB"].includes(position)) {
      setFact(recognized.id, "nfl-career-tackles-solo", tacklesSolo);
      setFact(recognized.id, "nfl-career-tackles-for-loss", tacklesForLoss);
      setFact(recognized.id, "nfl-career-forced-fumbles", forcedFumbles);
      setFact(recognized.id, "nfl-career-sacks", defensiveSacks);
      setFact(recognized.id, "nfl-career-interceptions", defensiveInterceptions);
      setFact(recognized.id, "nfl-career-passes-defended", passesDefended);
    }
    if (position === "K") {
      setFact(recognized.id, "nfl-career-field-goals-made", fieldGoalsMade);
      setFact(recognized.id, "nfl-career-field-goals-attempted", fieldGoalsAttempted);
      setFact(recognized.id, "nfl-career-field-goal-percentage", safeDivide(fieldGoalsMade == null ? null : fieldGoalsMade * 100, fieldGoalsAttempted));
    }
    if (position === "P") {
      setFact(recognized.id, "nfl-career-punts", puntingAttempts);
      setFact(recognized.id, "nfl-career-punting-yards", puntingYards);
      setFact(recognized.id, "nfl-career-punting-average", safeDivide(puntingYards, puntingAttempts));
    }
  }
  const teams = [...new Set(rows.map((row) => String(at(row, nflGrouped.ix, "recentTeam") ?? "")).filter(Boolean))].sort();
  for (const team of teams) pushRelationship({ subjectId: recognized.id, kind: "played-for", targetId: team, targetName: team, evidenceSource: "nflverse-factual-universe-projection" });

  if (position === "QB") {
    for (const row of rows) {
      const season = numeric(at(row, nflGrouped.ix, "season"));
      const seasonAttempts = numeric(at(row, nflGrouped.ix, "attempts"));
      if (!season || seasonAttempts == null || seasonAttempts < 200) continue;
      const seasonCompletions = numeric(at(row, nflGrouped.ix, "completions"));
      const seasonYards = numeric(at(row, nflGrouped.ix, "passingYards"));
      const seasonTds = numeric(at(row, nflGrouped.ix, "passingTouchdowns"));
      const seasonInts = numeric(at(row, nflGrouped.ix, "passingInterceptions"));
      const id = `nflverse-player-season-${sourcePlayerId}-${season}`;
      ensureSubject({ id, name: `${recognized.name} ${season}`, kind: "player-season", league: "NFL", position: "QB", season, tier: recognized.tier, sourceProvider: "nflverse", sourceId: `${sourcePlayerId}:${season}` });
      setFact(id, "nfl-season-passing-yards", seasonYards);
      setFact(id, "nfl-season-passing-touchdowns", seasonTds);
      setFact(id, "nfl-season-interceptions", seasonInts);
      setFact(id, "nfl-season-passer-rating", nflPasserRating(seasonCompletions, seasonAttempts, seasonYards, seasonTds, seasonInts));
      pushRelationship({ subjectId: id, kind: "season-of", targetId: recognized.id, targetName: recognized.name, season, evidenceSource: "nflverse-factual-universe-projection" });
    }
  }
}

const cfbGrouped = groupRows(cfbPlayers, (row, ix) => {
  const sourcePlayerId = String(at(row, ix, "sourcePlayerId") ?? "");
  const name = String(at(row, ix, "playerName") ?? "");
  return sourcePlayerId && name ? `${sourcePlayerId}:${normalize(name)}` : "";
});
for (const [key, rows] of cfbGrouped.groups) {
  const recognized = cfbCareerRecognition.get(key) ?? recognitionForSourceRows("CFB", rows, cfbGrouped.ix);
  if (!recognized) continue;
  const normalizedSeasons = rows.map((row) => numeric(at(row, cfbGrouped.ix, "season"))).filter((season) => season != null);
  const normalizedCareerCoverageComplete = recognized.startSeason != null
    && recognized.endSeason != null
    && normalizedSeasons.length > 0
    && Math.min(...normalizedSeasons) <= recognized.startSeason
    && Math.max(...normalizedSeasons) >= recognized.endSeason;
  if (!normalizedCareerCoverageComplete) continue;
  registerPlayer(recognized);
  const bySeason = new Map();
  for (const row of rows) {
    const season = numeric(at(row, cfbGrouped.ix, "season"));
    if (!season) continue;
    const values = bySeason.get(season) ?? {};
    for (const column of ["passCompletions", "passAttempts", "passYards", "passTouchdowns", "interceptionsThrown", "rushAttempts", "rushYards", "rushTouchdowns", "receptions", "receivingYards", "receivingTouchdowns", "defensiveInterceptions", "sacks", "passBreakups", "forcedFumbles", "fieldGoalsAttempted", "fieldGoalsMade"]) {
      const value = numeric(at(row, cfbGrouped.ix, column));
      if (value != null) values[column] = (values[column] ?? 0) + value;
    }
    bySeason.set(season, values);
  }
  const seasons = [...bySeason.values()];
  const best = (column) => {
    const values = seasons.map((row) => numeric(row[column])).filter((value) => value != null);
    return values.length ? Math.max(...values) : null;
  };
  const bestRatio = (formula) => {
    const values = seasons.map(formula).filter((value) => typeof value === "number" && Number.isFinite(value));
    return values.length ? Math.max(...values) : null;
  };
  const position = recognized.position;
  if (position === "QB") {
    setFact(recognized.id, "cfb-best-season-passing-yards", best("passYards"));
    setFact(recognized.id, "cfb-best-season-passing-touchdowns", best("passTouchdowns"));
    setFact(recognized.id, "cfb-best-season-interceptions", best("interceptionsThrown"));
    setFact(recognized.id, "cfb-best-season-passer-rating", bestRatio((v) => cfbPasserRating(v.passCompletions, v.passAttempts, v.passYards, v.passTouchdowns, v.interceptionsThrown)));
    setFact(recognized.id, "cfb-best-season-completion-percentage", bestRatio((v) => safeDivide(v.passCompletions == null ? null : v.passCompletions * 100, v.passAttempts)));
    setFact(recognized.id, "cfb-best-season-passing-yards-per-attempt", bestRatio((v) => safeDivide(v.passYards, v.passAttempts)));
  }
  if (["QB", "RB"].includes(position)) {
    setFact(recognized.id, "cfb-best-season-rushing-yards", best("rushYards"));
    setFact(recognized.id, "cfb-best-season-rushing-touchdowns", best("rushTouchdowns"));
    if (position === "RB") setFact(recognized.id, "cfb-best-season-rushing-yards-per-attempt", bestRatio((v) => safeDivide(v.rushYards, v.rushAttempts)));
  }
  if (["RB", "WR", "TE"].includes(position)) {
    setFact(recognized.id, "cfb-best-season-receptions", best("receptions"));
    setFact(recognized.id, "cfb-best-season-receiving-yards", best("receivingYards"));
    setFact(recognized.id, "cfb-best-season-receiving-touchdowns", best("receivingTouchdowns"));
    setFact(recognized.id, "cfb-best-season-receiving-yards-per-reception", bestRatio((v) => safeDivide(v.receivingYards, v.receptions)));
  }
  if (["DL", "LB", "DB"].includes(position)) {
    setFact(recognized.id, "cfb-best-season-sacks", best("sacks"));
    setFact(recognized.id, "cfb-best-season-defensive-interceptions", best("defensiveInterceptions"));
    setFact(recognized.id, "cfb-best-season-pass-breakups", best("passBreakups"));
    setFact(recognized.id, "cfb-best-season-forced-fumbles", best("forcedFumbles"));
  }
  if (position === "K") {
    setFact(recognized.id, "cfb-best-season-field-goals-made", best("fieldGoalsMade"));
    setFact(recognized.id, "cfb-best-season-field-goals-attempted", best("fieldGoalsAttempted"));
    setFact(recognized.id, "cfb-best-season-field-goal-percentage", bestRatio((v) => safeDivide(v.fieldGoalsMade == null ? null : v.fieldGoalsMade * 100, v.fieldGoalsAttempted)));
  }
  const programs = [...new Set(rows.map((row) => String(at(row, cfbGrouped.ix, "team") ?? "")).filter(Boolean))].sort();
  for (const program of programs) pushRelationship({ subjectId: recognized.id, kind: "played-at", targetName: program, evidenceSource: "cfbfast-r-factual-universe-projection" });
}

const cfbHonorByIdentity = new Map();
for (const row of cfbHonors.rows) {
  const key = `${normalize(row.name)}:${normalize(row.school)}:${row.position}`;
  const list = cfbHonorByIdentity.get(key) ?? [];
  list.push(row);
  cfbHonorByIdentity.set(key, list);
}
for (const recognized of playerRecognition.filter((row) => row.league === "CFB")) {
  const honors = cfbHonorByIdentity.get(`${normalize(recognized.name)}:${normalize(recognized.school)}:${recognized.position}`) ?? [];
  if (!honors.length) continue;
  registerPlayer(recognized);
  setFact(recognized.id, "cfb-major-national-award-wins", honors.length);
  for (const honor of honors) pushRelationship({ subjectId: recognized.id, kind: "won-award", targetName: honor.award, season: honor.season, evidenceSource: "cfb-major-honors-stage13" });
}

function emitTeamSeasons(corpus, league, recognitionBySource) {
  const ix = ixFor(corpus);
  const teamStatsIx = league === "NFL" ? ixFor(nflTeams) : null;
  const nflTeamStats = league === "NFL" ? new Map(nflTeams.rows.map((row) => [`${at(row, teamStatsIx, "season")}:${at(row, teamStatsIx, "team")}`, row])) : null;
  for (const row of corpus.rows) {
    const season = numeric(at(row, ix, "season"));
    if (!season) continue;
    const sourceCode = league === "NFL" ? String(at(row, ix, "franchiseId") ?? "") : String(at(row, ix, "sourceProgramId") ?? "");
    const sourceId = `${season}:${sourceCode}`;
    const recognized = recognitionBySource.get(sourceId);
    if (!recognized) continue;
    ensureSubject({ id: recognized.id, name: recognized.name, kind: "team-season", league, season, tier: recognized.tier, sourceProvider: recognized.sourceProvider, sourceId });
    const overallGames = numeric(at(row, ix, "overallGames"));
    const overallWins = numeric(at(row, ix, "overallWins"));
    const overallLosses = numeric(at(row, ix, "overallLosses"));
    const pointsFor = numeric(at(row, ix, "pointsFor"));
    const pointsAgainst = numeric(at(row, ix, "pointsAgainst"));
    if (league === "NFL") {
      setFact(recognized.id, "nfl-team-overall-wins", overallWins);
      setFact(recognized.id, "nfl-team-overall-losses", overallLosses);
      setFact(recognized.id, "nfl-team-points-per-game", safeDivide(pointsFor, overallGames));
      setFact(recognized.id, "nfl-team-opponent-points-per-game", safeDivide(pointsAgainst, overallGames));
      setFact(recognized.id, "nfl-team-regular-season-wins", numeric(at(row, ix, "regularSeasonWins")));
      setFact(recognized.id, "nfl-team-regular-season-losses", numeric(at(row, ix, "regularSeasonLosses")));
      setFact(recognized.id, "nfl-team-postseason-games", numeric(at(row, ix, "postseasonGames")));
      setFact(recognized.id, "nfl-team-postseason-wins", numeric(at(row, ix, "postseasonWins")));
      setFact(recognized.id, "nfl-team-postseason-losses", numeric(at(row, ix, "postseasonLosses")));
      setFact(recognized.id, "nfl-team-playoff-berth", at(row, ix, "playoffBerth") ? 1 : 0);
      setFact(recognized.id, "nfl-team-conference-championship-game", at(row, ix, "conferenceChampionshipGame") ? 1 : 0);
      setFact(recognized.id, "nfl-team-super-bowl-appearance", at(row, ix, "superBowlAppearance") ? 1 : 0);
      setFact(recognized.id, "nfl-super-bowl-title", at(row, ix, "superBowlChampion") ? 1 : 0);
      const teamCode = String(at(row, ix, "sourceTeamCode") ?? "");
      const statRow = nflTeamStats.get(`${season}:${teamCode}`);
      if (statRow) {
        setFact(recognized.id, "nfl-team-passing-yards", numeric(at(statRow, teamStatsIx, "passingYards")));
        setFact(recognized.id, "nfl-team-rushing-yards", numeric(at(statRow, teamStatsIx, "rushingYards")));
        setFact(recognized.id, "nfl-team-passing-interceptions-thrown", numeric(at(statRow, teamStatsIx, "passingInterceptions")));
        setFact(recognized.id, "nfl-team-defensive-sacks", numeric(at(statRow, teamStatsIx, "defensiveSacks")));
        setFact(recognized.id, "nfl-team-defensive-interceptions", numeric(at(statRow, teamStatsIx, "defensiveInterceptions")));
        setFact(recognized.id, "nfl-team-field-goals-made", numeric(at(statRow, teamStatsIx, "fieldGoalsMade")));
        setFact(recognized.id, "nfl-team-punting-average", safeDivide(numeric(at(statRow, teamStatsIx, "puntingYards")), numeric(at(statRow, teamStatsIx, "puntingAttempts"))));
      }
    } else {
      setFact(recognized.id, "cfb-team-wins", overallWins);
      setFact(recognized.id, "cfb-team-losses", overallLosses);
      setFact(recognized.id, "cfb-team-points-for", pointsFor);
      setFact(recognized.id, "cfb-team-points-against", pointsAgainst);
      setFact(recognized.id, "cfb-team-points-per-game", safeDivide(pointsFor, overallGames));
      setFact(recognized.id, "cfb-team-opponent-points-per-game", safeDivide(pointsAgainst, overallGames));
      setFact(recognized.id, "cfb-team-point-differential", pointsFor != null && pointsAgainst != null ? pointsFor - pointsAgainst : null);
      setFact(recognized.id, "cfb-team-scoring-margin-per-game", safeDivide(pointsFor != null && pointsAgainst != null ? pointsFor - pointsAgainst : null, overallGames));
      setFact(recognized.id, "cfb-team-points-for-against-ratio", safeDivide(pointsFor, pointsAgainst));
      setFact(recognized.id, "cfb-team-differential-rate-percentage", safeDivide(pointsFor != null && pointsAgainst != null ? (pointsFor - pointsAgainst) * 100 : null, pointsFor));
      setFact(recognized.id, "cfb-team-total-points", pointsFor != null && pointsAgainst != null ? pointsFor + pointsAgainst : null);
      setFact(recognized.id, "cfb-team-regular-season-wins", numeric(at(row, ix, "regularSeasonWins")));
      setFact(recognized.id, "cfb-team-regular-season-losses", numeric(at(row, ix, "regularSeasonLosses")));
      setFact(recognized.id, "cfb-team-postseason-games", numeric(at(row, ix, "postseasonGames")));
      setFact(recognized.id, "cfb-team-postseason-wins", numeric(at(row, ix, "postseasonWins")));
      setFact(recognized.id, "cfb-team-postseason-losses", numeric(at(row, ix, "postseasonLosses")));
      setFact(recognized.id, "cfb-team-conference-wins", numeric(at(row, ix, "conferenceWins")));
      setFact(recognized.id, "cfb-team-conference-losses", numeric(at(row, ix, "conferenceLosses")));
    }
    pushRelationship({ subjectId: recognized.id, kind: "team-season-of", targetId: sourceCode, targetName: sourceCode, season, evidenceSource: league === "NFL" ? "nflverse-factual-universe-projection" : "cfbfast-r-factual-universe-projection" });
  }
}

emitTeamSeasons(nflTeamSeasons, "NFL", nflTeamRecognition);
emitTeamSeasons(cfbTeamSeasons, "CFB", cfbTeamRecognition);

for (const [subjectId, facts] of factMapBySubject) {
  const subject = subjects.find((row) => row.id === subjectId);
  if (!subject) throw new Error(`Projected facts are missing subject ${subjectId}.`);
  const scope = subject.kind === "player-season" ? "nfl-player-season" : subject.kind === "team-season" ? (subject.league === "NFL" ? "nfl-team-season" : "cfb-team-season") : (subject.league === "NFL" ? "nfl-player-career" : "cfb-player-career");
  records.push({ subjectId, scope, facts: [...facts].sort(([left], [right]) => left.localeCompare(right)) });
}

const productionMetrics = new Set([
  "nfl-career-games", "nfl-career-passing-yards", "nfl-career-passing-touchdowns", "nfl-career-rushing-yards", "nfl-career-rushing-touchdowns", "nfl-career-receptions", "nfl-career-receiving-yards", "nfl-career-receiving-touchdowns", "nfl-career-sacks", "nfl-career-interceptions", "nfl-career-tackles-solo", "nfl-career-tackles-for-loss", "nfl-career-forced-fumbles", "nfl-career-passes-defended", "nfl-career-field-goals-made", "nfl-career-punts", "nfl-career-punting-yards",
  "cfb-best-season-passing-yards", "cfb-best-season-passing-touchdowns", "cfb-best-season-rushing-yards", "cfb-best-season-rushing-touchdowns", "cfb-best-season-receptions", "cfb-best-season-receiving-yards", "cfb-best-season-receiving-touchdowns", "cfb-best-season-sacks", "cfb-best-season-defensive-interceptions", "cfb-best-season-pass-breakups", "cfb-best-season-forced-fumbles", "cfb-best-season-field-goals-made",
]);
const efficiencyMetrics = new Set([
  "nfl-career-passer-rating", "nfl-career-completion-percentage", "nfl-career-passing-yards-per-attempt", "nfl-career-rushing-yards-per-attempt", "nfl-career-field-goal-percentage", "nfl-career-punting-average",
  "cfb-best-season-passer-rating", "cfb-best-season-completion-percentage", "cfb-best-season-passing-yards-per-attempt", "cfb-best-season-rushing-yards-per-attempt", "cfb-best-season-receiving-yards-per-reception", "cfb-best-season-field-goal-percentage",
]);
const honorMetrics = new Set(["nfl-first-team-all-pros", "nfl-pro-bowl-selections", "nfl-hall-of-fame", "cfb-major-national-award-wins"]);
const poolName = (position) => position === "DL" ? "DL / EDGE" : position === "DB" ? "Secondary" : position === "K" || position === "P" ? "K / P" : position;
const recordById = new Map(records.map((record) => [record.subjectId, record]));
const relationshipsById = new Map();
for (const row of relationships) {
  const list = relationshipsById.get(row.subjectId) ?? [];
  list.push(row);
  relationshipsById.set(row.subjectId, list);
}
const permanentPools = ["QB", "RB", "WR", "TE", "OL", "DL / EDGE", "LB", "Secondary", "K / P"];
const coverageRows = [];
for (const league of ["NFL", "CFB"]) {
  for (const pool of permanentPools) {
    const eligible = playerRecognition.filter((row) => row.league === league && poolName(row.position) === pool);
    const subjectIds = new Set(eligible.map((row) => row.id));
    const countFamily = (family) => [...subjectIds].filter((id) => {
      const metrics = new Set((recordById.get(id)?.facts ?? []).map(([metricId]) => metricId));
      const rels = relationshipsById.get(id) ?? [];
      if (family === "production") return [...metrics].some((metricId) => productionMetrics.has(metricId));
      if (family === "efficiency") return [...metrics].some((metricId) => efficiencyMetrics.has(metricId));
      if (family === "honors") return [...metrics].some((metricId) => honorMetrics.has(metricId)) || rels.some((row) => row.kind === "won-award");
      if (family === "draft") return rels.some((row) => row.kind === "draft-selection");
      if (family === "relationships") return rels.length > 0;
      return false;
    }).length;
    coverageRows.push({ league, pool, eligibleSubjectCount: subjectIds.size, production: countFamily("production"), efficiency: countFamily("efficiency"), honors: countFamily("honors"), draft: countFamily("draft"), relationships: countFamily("relationships") });
  }
}

const nonPlayerCoverage = Object.fromEntries(["NFL", "CFB"].map((league) => [league, Object.fromEntries(
  [...new Set(recognitionRecords.filter((row) => row.league === league && row.kind !== "player-career").map((row) => row.kind))].sort().map((kind) => {
    const eligible = recognitionRecords.filter((row) => row.league === league && row.kind === kind);
    const covered = eligible.filter((row) => recordById.has(row.id) || relationshipsById.has(row.id));
    return [kind, { eligibleSubjectCount: new Set(eligible.map((row) => row.id)).size, factualOrRelationshipCount: new Set(covered.map((row) => row.id)).size }];
  })
)]));

subjects.sort((left, right) => left.league.localeCompare(right.league) || left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id));
records.sort((left, right) => left.subjectId.localeCompare(right.subjectId));
relationships.sort((left, right) => left.subjectId.localeCompare(right.subjectId) || left.kind.localeCompare(right.kind) || String(left.targetName ?? "").localeCompare(String(right.targetName ?? "")));

const artifact = {
  schemaVersion: 2,
  purpose: "Shared Stage 13 A/B/C factual universe projection. Find the Leader retains this legacy artifact filename but no longer owns the facts.",
  generatedFrom: {
    recognizabilityVersion: recognition.version,
    stage12RecognitionEvidence: "src/features/back-room/footballRecognitionEvidence.ts",
    nflPlayerCorpus: "data/generated/football/nfl/player-seasons-1999-2025.json",
    nflTeamCorpus: "data/generated/football/nfl/team-seasons-1999-2025.json",
    cfbPlayerCorpus: "data/generated/football/cfb/player-seasons-2014-2025.json",
    nflTeamSeasonCorpus: "data/generated/football/relationships/nfl-team-season-results-1999-2025.json",
    cfbTeamSeasonCorpus: "data/generated/football/relationships/cfb-team-season-results-2002-2025.json",
    nflDraftPicks: { url: DRAFT_URL, bytes: DRAFT_BYTES, sha256: DRAFT_SHA256, dataUpdated: "2026-05-05T07:26:28Z" },
    cfbMajorHonors: "public/data/football/cfb/stage13-major-honors.json",
  },
  sourceIds: {
    NFL: "nflverse-factual-universe-projection",
    CFB: "cfbfast-r-factual-universe-projection",
    NFL_DRAFT: "nflverse-draft-picks-projection",
    CFB_HONORS: "cfb-major-honors-stage13",
  },
  eligibility: {
    recognizabilityTiers: ["A", "B", "C"],
    excludesTierD: true,
    nflCareerNormalizedCoverageRule: "observed player-season endpoints must contain the full recognized career before career aggregates are emitted",
    cfbCareerNormalizedCoverageRule: "observed player-season endpoints must contain the full recognized career before career-best values are emitted",
    nflQbSeasonMinimumAttempts: 200,
    unknownPolicy: "null-or-absent; never manufacture zero from a missing source value",
  },
  summary: {
    eligiblePlayerCareerCount: new Set(playerRecognition.map((row) => row.id)).size,
    subjectCount: subjects.length,
    factualRecordCount: records.length,
    relationshipCount: relationships.length,
    byLeague: Object.fromEntries(["NFL", "CFB"].map((league) => [league, subjects.filter((subject) => subject.league === league).length])),
    byKind: Object.fromEntries([...new Set(subjects.map((subject) => subject.kind))].sort().map((kind) => [kind, subjects.filter((subject) => subject.kind === kind).length])),
  },
  coverageMatrix: {
    denominator: "Stage 12 canonical recognizability universe after generated projection + independent evidence reconciliation and the A/B/C gate; Tier D and raw corpus rows are excluded",
    metricFamilies: ["production", "efficiency", "honors", "draft", "relationships"],
    playerPools: coverageRows,
    nonPlayers: nonPlayerCoverage,
  },
  subjects,
  records,
  relationships,
};

const serialized = `${JSON.stringify(artifact)}\n`;
const absoluteOutput = path.resolve(new URL(".", root).pathname, outputPath);
if (check) {
  if (!fs.existsSync(absoluteOutput) || fs.readFileSync(absoluteOutput, "utf8") !== serialized) {
    throw new Error(`Shared Football factual-universe projection is stale. Run node scripts/generate-football-find-leader-runtime.mjs`);
  }
  console.log(`Shared Football factual-universe projection is current (${subjects.length} subjects, ${records.length} factual records, ${relationships.length} relationships).`);
} else {
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, serialized);
  console.log(`Wrote ${outputPath}: ${subjects.length} subjects, ${records.length} factual records, ${relationships.length} relationships.`);
}
