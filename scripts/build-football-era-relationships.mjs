import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_INPUT_DIR = "data/generated/football/relationships";
const DEFAULT_OUTPUT_DIR = "data/generated/football/relationships";
const DEFAULT_MAX_TITLE_GAP = 4;

const CFB_CHAMPIONSHIP_INPUT = "cfb-national-championships-2002-2025.json";
const CFB_TEAM_SEASON_INPUT = "cfb-team-season-results-2002-2025.json";
const NFL_COACH_STINT_INPUT = "nfl-coach-stints-1999-2025.json";

const CFB_ERA_OUTPUT = "cfb-championship-eras-2002-2025.json";
const MANIFEST_OUTPUT = "football-era-relationships.manifest.json";
const COVERAGE_OUTPUT = "football-era-relationships.coverage.json";

const CFB_ERA_COLUMNS = [
  "sourceEraKey",
  "eraBasis",
  "maxAdjacentTitleGap",
  "sourceProgramId",
  "programName",
  "startSeason",
  "endSeason",
  "seasonCount",
  "seasons",
  "championshipSelectionCount",
  "championshipSelectionSeasons",
  "splitTitleSelectionCount",
  "sourceAsteriskedSelectionCount",
  "conferences",
  "sourceObservedGames",
  "sourceObservedWins",
  "sourceObservedLosses",
  "sourceObservedTies",
  "sourceObservedPointsFor",
  "sourceObservedPointsAgainst",
  "sourceObservedPointDifferential",
];

const TEAM_OBSERVED_COLUMNS = [
  "overallGames",
  "overallWins",
  "overallLosses",
  "overallTies",
  "pointsFor",
  "pointsAgainst",
];

function parseArgs(argv) {
  const args = {
    inputDir: DEFAULT_INPUT_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    maxTitleGap: DEFAULT_MAX_TITLE_GAP,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--input-dir") args.inputDir = argv[++index] ?? DEFAULT_INPUT_DIR;
    else if (token === "--output-dir") args.outputDir = argv[++index] ?? DEFAULT_OUTPUT_DIR;
    else if (token === "--max-title-gap") args.maxTitleGap = Number(argv[++index] ?? DEFAULT_MAX_TITLE_GAP);
    else throw new Error(`Unknown argument: ${token}`);
  }
  if (!Number.isInteger(args.maxTitleGap) || args.maxTitleGap < 1) {
    throw new Error("--max-title-gap must be a positive integer.");
  }
  return args;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function serialize(value, pretty = false) {
  return `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`;
}

function readCompact(filePath, expectedLeague, expectedKind) {
  const text = fs.readFileSync(filePath, "utf8");
  const corpus = JSON.parse(text);
  if (corpus.league !== expectedLeague || corpus.recordKind !== expectedKind) {
    throw new Error(`${filePath} must be ${expectedLeague} ${expectedKind}.`);
  }
  if (!Array.isArray(corpus.columns) || !Array.isArray(corpus.rows)) {
    throw new Error(`${filePath} is missing compact corpus columns/rows.`);
  }
  const index = Object.fromEntries(corpus.columns.map((column, columnIndex) => [column, columnIndex]));
  return { corpus, index, text };
}

function required(row, index, column) {
  const columnIndex = index[column];
  if (columnIndex == null) throw new Error(`Required Football relationship column ${column} is missing.`);
  return row[columnIndex];
}

function numeric(row, index, column) {
  const raw = required(row, index, column);
  if (raw == null || raw === "") return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`Expected numeric ${column}, got ${JSON.stringify(raw)}.`);
  return parsed;
}

function groupChampionshipSelections(championships) {
  const groups = new Map();
  for (const row of championships.corpus.rows) {
    const sourceProgramId = String(required(row, championships.index, "sourceProgramId"));
    const season = Number(required(row, championships.index, "season"));
    const programName = String(required(row, championships.index, "programName"));
    if (!Number.isInteger(season)) throw new Error(`Invalid CFB championship season ${season}.`);
    const selection = {
      season,
      programName,
      splitTitle: Boolean(required(row, championships.index, "splitTitle")),
      sourceAsterisked: Boolean(required(row, championships.index, "sourceAsterisked")),
    };
    if (!groups.has(sourceProgramId)) groups.set(sourceProgramId, []);
    groups.get(sourceProgramId).push(selection);
  }
  for (const selections of groups.values()) selections.sort((left, right) => left.season - right.season);
  return groups;
}

function multiTitleClusters(selections, maxTitleGap) {
  if (selections.length < 2) return [];
  const clusters = [];
  let current = [selections[0]];
  for (let index = 1; index < selections.length; index += 1) {
    const selection = selections[index];
    const previous = current.at(-1);
    if (selection.season - previous.season <= maxTitleGap) current.push(selection);
    else {
      if (current.length >= 2) clusters.push(current);
      current = [selection];
    }
  }
  if (current.length >= 2) clusters.push(current);
  return clusters;
}

function buildTeamSeasonIndex(teamSeasons) {
  const byProgramSeason = new Map();
  for (const row of teamSeasons.corpus.rows) {
    const sourceProgramId = String(required(row, teamSeasons.index, "sourceProgramId"));
    const season = Number(required(row, teamSeasons.index, "season"));
    const key = `${sourceProgramId}:${season}`;
    if (byProgramSeason.has(key)) throw new Error(`Duplicate CFB team-season relationship ${key}.`);
    byProgramSeason.set(key, row);
  }
  return byProgramSeason;
}

function sumObservedTeamSeasons(rows, teamSeasons) {
  const totals = Object.fromEntries(TEAM_OBSERVED_COLUMNS.map((column) => [
    column,
    rows.reduce((total, row) => total + numeric(row, teamSeasons.index, column), 0),
  ]));
  return {
    sourceObservedGames: totals.overallGames,
    sourceObservedWins: totals.overallWins,
    sourceObservedLosses: totals.overallLosses,
    sourceObservedTies: totals.overallTies,
    sourceObservedPointsFor: totals.pointsFor,
    sourceObservedPointsAgainst: totals.pointsAgainst,
    sourceObservedPointDifferential: totals.pointsFor - totals.pointsAgainst,
  };
}

function buildCfbEraRows(championships, teamSeasons, maxTitleGap) {
  const selectionGroups = groupChampionshipSelections(championships);
  const teamSeasonByKey = buildTeamSeasonIndex(teamSeasons);
  const records = [];

  for (const [sourceProgramId, selections] of selectionGroups) {
    for (const cluster of multiTitleClusters(selections, maxTitleGap)) {
      const startSeason = cluster[0].season;
      const endSeason = cluster.at(-1).season;
      const seasons = Array.from({ length: endSeason - startSeason + 1 }, (_, offset) => startSeason + offset);
      const seasonRows = seasons.map((season) => {
        const row = teamSeasonByKey.get(`${sourceProgramId}:${season}`);
        if (!row) throw new Error(`Missing CFB team-season relationship for ${sourceProgramId}:${season}.`);
        return row;
      });
      const programNames = new Set(seasonRows.map((row) => String(required(row, teamSeasons.index, "programName"))));
      if (programNames.size !== 1 || !programNames.has(cluster[0].programName)) {
        throw new Error(`CFB era program identity mismatch for ${sourceProgramId}:${startSeason}-${endSeason}.`);
      }
      const conferences = [...new Set(seasonRows
        .map((row) => required(row, teamSeasons.index, "conference"))
        .filter((conference) => conference != null && String(conference).trim() !== "")
        .map(String))].sort();
      const record = {
        sourceEraKey: `cfb:${sourceProgramId}:multi-title:${startSeason}-${endSeason}`,
        eraBasis: "multi-title-championship-cluster",
        maxAdjacentTitleGap: maxTitleGap,
        sourceProgramId,
        programName: cluster[0].programName,
        startSeason,
        endSeason,
        seasonCount: seasons.length,
        seasons,
        championshipSelectionCount: cluster.length,
        championshipSelectionSeasons: cluster.map((selection) => selection.season),
        splitTitleSelectionCount: cluster.filter((selection) => selection.splitTitle).length,
        sourceAsteriskedSelectionCount: cluster.filter((selection) => selection.sourceAsterisked).length,
        conferences,
        ...sumObservedTeamSeasons(seasonRows, teamSeasons),
      };
      records.push(record);
    }
  }

  records.sort((left, right) =>
    left.startSeason - right.startSeason || left.programName.localeCompare(right.programName)
  );
  return records.map((record) => CFB_ERA_COLUMNS.map((column) => record[column] ?? null));
}

function buildNflEraReference(coachStints, inputPath) {
  const franchiseIndex = coachStints.index.franchiseId;
  const coachIndex = coachStints.index.sourceCoachNameKey;
  if (franchiseIndex == null || coachIndex == null) {
    throw new Error("NFL coach-stint corpus is missing franchise/coach identity columns.");
  }
  return {
    relationshipOwner: "existing-coach-stint-corpus",
    recordKind: coachStints.corpus.recordKind,
    path: inputPath,
    rowCount: coachStints.corpus.rowCount ?? coachStints.corpus.rows.length,
    franchiseCount: new Set(coachStints.corpus.rows.map((row) => row[franchiseIndex])).size,
    sourceCoachNameKeyCount: new Set(coachStints.corpus.rows.map((row) => row[coachIndex])).size,
    sha256: sha256(coachStints.text),
    source: coachStints.corpus.source,
    note: "Contiguous coach-within-franchise stints are already natural objective NFL eras; this initiative references that canonical owner instead of duplicating the rows.",
  };
}

const args = parseArgs(process.argv.slice(2));
const championshipPath = path.join(args.inputDir, CFB_CHAMPIONSHIP_INPUT);
const teamSeasonPath = path.join(args.inputDir, CFB_TEAM_SEASON_INPUT);
const coachStintPath = path.join(args.inputDir, NFL_COACH_STINT_INPUT);

const championships = readCompact(championshipPath, "CFB", "national-championship-selection");
const teamSeasons = readCompact(teamSeasonPath, "CFB", "team-season-results");
const coachStints = readCompact(coachStintPath, "NFL", "coach-stint");

const cfbRows = buildCfbEraRows(championships, teamSeasons, args.maxTitleGap);
const cfbCorpus = {
  schemaVersion: 1,
  league: "CFB",
  recordKind: "championship-era",
  eraBasis: {
    type: "multi-title-championship-cluster",
    maxAdjacentTitleGap: args.maxTitleGap,
    minimumChampionshipSelections: 2,
    note: "Objective clustering rule only. These rows are not automatically labeled dynasties or made casual-game eligible.",
  },
  resultSemantics: {
    metricBasis: "source-observed-team-season-results",
    postseasonCompleteness: "not-guaranteed",
    note: "CFB title selections are complete for 2002-2025 through the NCAA relationship owner. Team-season result aggregates preserve only the games present in the existing cfbfastR relationship corpus and must not be presented as guaranteed complete postseason records.",
  },
  source: {
    championshipRelationships: {
      path: CFB_CHAMPIONSHIP_INPUT,
      sha256: sha256(championships.text),
      source: championships.corpus.source,
    },
    teamSeasonRelationships: {
      path: CFB_TEAM_SEASON_INPUT,
      sha256: sha256(teamSeasons.text),
      source: teamSeasons.corpus.source,
    },
  },
  seasonStart: championships.corpus.seasonStart,
  seasonEnd: championships.corpus.seasonEnd,
  columns: CFB_ERA_COLUMNS,
  rowCount: cfbRows.length,
  rows: cfbRows,
};

const cfbText = serialize(cfbCorpus);
const nflEraReference = buildNflEraReference(coachStints, NFL_COACH_STINT_INPUT);
const cfbProgramIndex = CFB_ERA_COLUMNS.indexOf("sourceProgramId");
const cfbSeasonCountIndex = CFB_ERA_COLUMNS.indexOf("seasonCount");
const cfbTitleCountIndex = CFB_ERA_COLUMNS.indexOf("championshipSelectionCount");
const coverage = {
  schemaVersion: 1,
  relationshipFamily: "football-era-support",
  cfb: {
    recordKind: cfbCorpus.recordKind,
    clusterCount: cfbRows.length,
    programCount: new Set(cfbRows.map((row) => row[cfbProgramIndex])).size,
    representedSeasonCount: cfbRows.reduce((total, row) => total + Number(row[cfbSeasonCountIndex]), 0),
    championshipSelectionCount: cfbRows.reduce((total, row) => total + Number(row[cfbTitleCountIndex]), 0),
    maxAdjacentTitleGap: args.maxTitleGap,
    resultSemantics: cfbCorpus.resultSemantics,
  },
  nfl: {
    recordKind: nflEraReference.recordKind,
    stintCount: nflEraReference.rowCount,
    franchiseCount: nflEraReference.franchiseCount,
    sourceCoachNameKeyCount: nflEraReference.sourceCoachNameKeyCount,
  },
};
const manifest = {
  schemaVersion: 1,
  relationshipFamily: "football-era-support",
  cfb: {
    relationshipOwner: "generated-championship-clusters",
    path: CFB_ERA_OUTPUT,
    rowCount: cfbRows.length,
    sha256: sha256(cfbText),
    eraBasis: cfbCorpus.eraBasis,
    resultSemantics: cfbCorpus.resultSemantics,
  },
  nfl: nflEraReference,
  generatedBy: "scripts/build-football-era-relationships.mjs",
};

for (const [fileName, text] of [
  [CFB_ERA_OUTPUT, cfbText],
  [MANIFEST_OUTPUT, serialize(manifest, true)],
  [COVERAGE_OUTPUT, serialize(coverage, true)],
]) {
  fs.mkdirSync(args.outputDir, { recursive: true });
  fs.writeFileSync(path.join(args.outputDir, fileName), text);
}

console.log(`Generated ${cfbRows.length} objective CFB multi-title era clusters.`);
console.log(`Referenced ${nflEraReference.rowCount} existing NFL coach-stint era records without duplication.`);
