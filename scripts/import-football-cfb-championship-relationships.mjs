import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_SOURCE = "public/data/football/cfb/fbs-championship-history.source.json";
const DEFAULT_PROGRAMS = "data/generated/football/relationships/cfb-programs-2002-2025.json";
const DEFAULT_OUTPUT = "data/generated/football/relationships/cfb-national-championships-2002-2025.json";
const DEFAULT_SUMMARY = "data/generated/football/relationships/cfb-program-championship-summary-2002-2025.json";
const DEFAULT_MANIFEST = "data/generated/football/relationships/cfb-championship-relationships.manifest.json";

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    programs: DEFAULT_PROGRAMS,
    output: DEFAULT_OUTPUT,
    summary: DEFAULT_SUMMARY,
    manifest: DEFAULT_MANIFEST,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--source") args.source = argv[++index] ?? DEFAULT_SOURCE;
    else if (token === "--programs") args.programs = argv[++index] ?? DEFAULT_PROGRAMS;
    else if (token === "--output") args.output = argv[++index] ?? DEFAULT_OUTPUT;
    else if (token === "--summary") args.summary = argv[++index] ?? DEFAULT_SUMMARY;
    else if (token === "--manifest") args.manifest = argv[++index] ?? DEFAULT_MANIFEST;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function serialize(value, pretty = false) {
  return `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`;
}

const args = parseArgs(process.argv.slice(2));
const source = readJson(args.source);
const programs = readJson(args.programs);

if (source.schemaVersion !== 1 || source.league !== "CFB") {
  throw new Error("CFB championship source snapshot has an unsupported schema.");
}
if (source.source?.provider !== "NCAA" || source.source?.url !== "https://www.ncaa.com/history/football/fbs") {
  throw new Error("CFB championship source must remain the vendored NCAA FBS history snapshot.");
}
if (source.seasonStart !== 2002 || source.seasonEnd !== 2025 || source.seasonCount !== 24) {
  throw new Error("CFB championship source must cover every season from 2002 through 2025.");
}
if (!Array.isArray(source.records) || source.records.length !== source.selectionCount) {
  throw new Error("CFB championship source selection count does not match its records.");
}

const programIdIndex = programs.columns.indexOf("sourceProgramId");
const programNameIndex = programs.columns.indexOf("programName");
if (programIdIndex < 0 || programNameIndex < 0) {
  throw new Error("CFB program corpus is missing sourceProgramId/programName.");
}
const programNameById = new Map(programs.rows.map((row) => [String(row[programIdIndex]), String(row[programNameIndex])]));

const seasons = new Map();
for (const record of source.records) {
  if (!Number.isInteger(record.season) || record.season < source.seasonStart || record.season > source.seasonEnd) {
    throw new Error(`Invalid CFB championship season ${record.season}.`);
  }
  const programName = programNameById.get(String(record.sourceProgramId));
  if (!programName) throw new Error(`Unknown CFB championship program id ${record.sourceProgramId}.`);
  if (programName !== record.programName) {
    throw new Error(`CFB championship program mismatch for ${record.sourceProgramId}: ${programName} !== ${record.programName}.`);
  }
  const seasonRecords = seasons.get(record.season) ?? [];
  seasonRecords.push(record);
  seasons.set(record.season, seasonRecords);
}

for (let season = source.seasonStart; season <= source.seasonEnd; season += 1) {
  if (!seasons.has(season)) throw new Error(`Missing CFB national champion for ${season}.`);
}

const selectionColumns = [
  "season",
  "sourceProgramId",
  "programName",
  "sourceChampionName",
  "selectingOrganization",
  "splitTitle",
  "sourceAsterisked",
];
const selectionRows = source.records
  .map((record) => [
    record.season,
    String(record.sourceProgramId),
    record.programName,
    record.sourceChampionName,
    record.selectingOrganization,
    (seasons.get(record.season)?.length ?? 0) > 1,
    Boolean(record.sourceAsterisked),
  ])
  .sort((left, right) => Number(left[0]) - Number(right[0]) || String(left[2]).localeCompare(String(right[2])));

const programSummary = new Map();
for (const row of selectionRows) {
  const [season, sourceProgramId, programName, , , splitTitle, sourceAsterisked] = row;
  const summary = programSummary.get(sourceProgramId) ?? {
    sourceProgramId,
    programName,
    championshipSelectionCount: 0,
    splitTitleSelectionCount: 0,
    sourceAsteriskedSelectionCount: 0,
    seasons: [],
  };
  summary.championshipSelectionCount += 1;
  if (splitTitle) summary.splitTitleSelectionCount += 1;
  if (sourceAsterisked) summary.sourceAsteriskedSelectionCount += 1;
  summary.seasons.push(season);
  programSummary.set(sourceProgramId, summary);
}

const summaryColumns = [
  "sourceProgramId",
  "programName",
  "championshipSelectionCount",
  "splitTitleSelectionCount",
  "sourceAsteriskedSelectionCount",
  "seasons",
];
const summaryRows = [...programSummary.values()]
  .sort((left, right) => right.championshipSelectionCount - left.championshipSelectionCount || left.programName.localeCompare(right.programName))
  .map((record) => summaryColumns.map((column) => record[column]));

const provenance = {
  provider: source.source.provider,
  title: source.source.title,
  url: source.source.url,
  verifiedAt: source.source.verifiedAt,
  snapshotPath: DEFAULT_SOURCE,
};
const selectionCorpus = {
  schemaVersion: 1,
  league: "CFB",
  recordKind: "national-championship-selection",
  source: provenance,
  seasonStart: source.seasonStart,
  seasonEnd: source.seasonEnd,
  seasonCount: source.seasonCount,
  selectionCount: selectionRows.length,
  columns: selectionColumns,
  rows: selectionRows,
};
const summaryCorpus = {
  schemaVersion: 1,
  league: "CFB",
  recordKind: "program-national-championship-summary",
  source: provenance,
  seasonStart: source.seasonStart,
  seasonEnd: source.seasonEnd,
  programCount: summaryRows.length,
  columns: summaryColumns,
  rows: summaryRows,
};

const selectionText = serialize(selectionCorpus);
const summaryText = serialize(summaryCorpus);
const manifest = {
  schemaVersion: 1,
  league: "CFB",
  seasonStart: source.seasonStart,
  seasonEnd: source.seasonEnd,
  seasonCount: source.seasonCount,
  selectionCount: selectionRows.length,
  championProgramCount: summaryRows.length,
  splitTitleSeasons: [...seasons.entries()].filter(([, records]) => records.length > 1).map(([season]) => season),
  source: provenance,
  outputs: {
    selections: { path: DEFAULT_OUTPUT, sha256: sha256(selectionText), rowCount: selectionRows.length },
    programSummary: { path: DEFAULT_SUMMARY, sha256: sha256(summaryText), rowCount: summaryRows.length },
  },
  generatedBy: "scripts/import-football-cfb-championship-relationships.mjs",
};

for (const filePath of [args.output, args.summary, args.manifest]) ensureParent(filePath);
fs.writeFileSync(args.output, selectionText);
fs.writeFileSync(args.summary, summaryText);
fs.writeFileSync(args.manifest, serialize(manifest, true));

console.log(`Generated ${selectionRows.length} CFB national-championship selections across ${source.seasonCount} seasons.`);
console.log(`Champion programs: ${summaryRows.length}. Split-title seasons: ${manifest.splitTitleSeasons.join(", ") || "none"}.`);
