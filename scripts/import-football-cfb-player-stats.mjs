import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { parseCsv } from "./lib/footballCsv.mjs";

const SOURCE_COMMIT = "9789928e911091186bab979cc772e874c47a83f1";
const SOURCE_URL = `https://raw.githubusercontent.com/Dharit13/NCAA_2025-26-Season-Dataset/${SOURCE_COMMIT}/by_sport/football/stats.csv`;
const DEFAULT_OUTPUT = "public/data/football/cfb/player-season-2025.json";
const DEFAULT_MANIFEST = "public/data/football/cfb/player-season-2025.manifest.json";
const MIN_EXPECTED_ROWS = 30_000;

function parseArgs(argv) {
  const args = { source: null, output: DEFAULT_OUTPUT, manifest: DEFAULT_MANIFEST };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--source") args.source = argv[++index] ?? null;
    else if (token === "--output") args.output = argv[++index] ?? DEFAULT_OUTPUT;
    else if (token === "--manifest") args.manifest = argv[++index] ?? DEFAULT_MANIFEST;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

async function readSource(sourcePath) {
  if (sourcePath) return fs.readFileSync(sourcePath, "utf8");
  const response = await fetch(SOURCE_URL, { headers: { "user-agent": "Octagon-HQ-CFB-corpus-import" } });
  if (!response.ok) throw new Error(`CFB source download failed: ${response.status} ${response.statusText}`);
  return response.text();
}

function numericOrNull(value) {
  if (value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Expected numeric football stat, got ${JSON.stringify(value)}`);
  return parsed;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const args = parseArgs(process.argv.slice(2));
const csv = await readSource(args.source);
const parsed = parseCsv(csv);
if (parsed.length < 2) throw new Error("CFB source did not contain player rows.");

const [columns, ...sourceRows] = parsed;
const requiredIdentity = ["athlete_id", "first_name", "last_name"];
for (const column of requiredIdentity) {
  if (!columns.includes(column)) throw new Error(`CFB source is missing required column ${column}.`);
}

const numericColumns = new Set(columns.slice(3));
const athleteIdIndex = columns.indexOf("athlete_id");
const firstNameIndex = columns.indexOf("first_name");
const lastNameIndex = columns.indexOf("last_name");
const seenIds = new Set();
const rows = sourceRows
  .filter((row) => row.some((value) => value !== ""))
  .map((row, rowIndex) => {
    if (row.length !== columns.length) {
      throw new Error(`CFB source row ${rowIndex + 2} has ${row.length} columns; expected ${columns.length}.`);
    }
    const athleteId = row[athleteIdIndex];
    const firstName = row[firstNameIndex];
    const lastName = row[lastNameIndex];
    if (!athleteId || !firstName) throw new Error(`CFB source row ${rowIndex + 2} is missing player identity.`);
    if (seenIds.has(athleteId)) throw new Error(`Duplicate CFB athlete id: ${athleteId}`);
    seenIds.add(athleteId);

    return row.map((value, index) => (numericColumns.has(columns[index]) ? numericOrNull(value) : (value || null)));
  });

if (rows.length < MIN_EXPECTED_ROWS) {
  throw new Error(`CFB corpus unexpectedly shallow: ${rows.length} rows; expected at least ${MIN_EXPECTED_ROWS}.`);
}

const corpus = {
  schemaVersion: 1,
  league: "CFB",
  athleticYear: "2025-26",
  statSeason: 2025,
  source: {
    provider: "Dharit Shah NCAA All Sports Rosters 2025-26",
    license: "CC0-1.0",
    repository: "Dharit13/NCAA_2025-26-Season-Dataset",
    commit: SOURCE_COMMIT,
    path: "by_sport/football/stats.csv",
    url: SOURCE_URL,
  },
  columns,
  rowCount: rows.length,
  rows,
};

const serialized = `${JSON.stringify(corpus)}\n`;
const sha256 = createHash("sha256").update(serialized).digest("hex");
const manifest = {
  schemaVersion: 1,
  league: corpus.league,
  athleticYear: corpus.athleticYear,
  statSeason: corpus.statSeason,
  rowCount: corpus.rowCount,
  uniqueAthleteCount: seenIds.size,
  columnCount: columns.length,
  sha256,
  source: corpus.source,
  publicPath: "/data/football/cfb/player-season-2025.json",
  generatedBy: "scripts/import-football-cfb-player-stats.mjs",
};

ensureParent(args.output);
ensureParent(args.manifest);
fs.writeFileSync(args.output, serialized);
fs.writeFileSync(args.manifest, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${rows.length.toLocaleString()} CFB player-season stat rows (${columns.length} columns).`);
console.log(`Corpus SHA-256: ${sha256}`);
