import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectionPath = path.join(root, "data/generated/football/factual-universe-projection.json");
const playerSeasonPath = path.join(root, "data/generated/football/cfb/player-seasons-2014-2025.json");

const projection = JSON.parse(fs.readFileSync(projectionPath, "utf8"));
const playerSeasonData = JSON.parse(fs.readFileSync(playerSeasonPath, "utf8"));
const indexes = new Map(playerSeasonData.columns.map((name, index) => [name, index]));
const playerSeasons = playerSeasonData.rows.map((row) => (
  Object.fromEntries([...indexes].map(([key, index]) => [key, row[index]]))
));

const normalize = (value) => String(value ?? "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]/g, "");
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const n = (value) => finite(value) ? value : 0;
const nearlyEqual = (left, right) => Math.abs(left - right) < 1e-9;

const sourceFieldByMetric = new Map([
  ["cfb-best-season-passing-yards", "passYards"],
  ["cfb-best-season-passing-touchdowns", "passTouchdowns"],
  ["cfb-best-season-rushing-yards", "rushYards"],
  ["cfb-best-season-rushing-touchdowns", "rushTouchdowns"],
  ["cfb-best-season-receiving-yards", "receivingYards"],
  ["cfb-best-season-receiving-touchdowns", "receivingTouchdowns"],
  ["cfb-best-season-sacks", "sacks"],
  ["cfb-best-season-defensive-interceptions", "defensiveInterceptions"],
]);
const sourceFields = [...new Set(sourceFieldByMetric.values())];

// Reviewed context for peak seasons that predate the pinned 2014-2025 player-season corpus.
// Values intentionally match the existing canonical Football factual ledger; this file does not own or alter facts.
const historicalOverrides = new Map([
  ["cfb-cam-newton:cfb-best-season-passing-yards", { value: 2854, seasons: [2010] }],
  ["cfb-cam-newton:cfb-best-season-passing-touchdowns", { value: 30, seasons: [2010] }],
  ["cfb-cam-newton:cfb-best-season-rushing-yards", { value: 1473, seasons: [2010] }],
  ["cfb-cam-newton:cfb-best-season-rushing-touchdowns", { value: 20, seasons: [2010] }],
  ["cfb-vince-young:cfb-best-season-passing-yards", { value: 3036, seasons: [2005] }],
  ["cfb-vince-young:cfb-best-season-passing-touchdowns", { value: 26, seasons: [2005] }],
  ["cfb-vince-young:cfb-best-season-rushing-yards", { value: 1050, seasons: [2005] }],
  ["cfb-vince-young:cfb-best-season-rushing-touchdowns", { value: 12, seasons: [2005] }],
  ["cfb-tim-tebow:cfb-best-season-passing-yards", { value: 3286, seasons: [2007] }],
  ["cfb-tim-tebow:cfb-best-season-passing-touchdowns", { value: 32, seasons: [2007] }],
  ["cfb-tim-tebow:cfb-best-season-rushing-yards", { value: 895, seasons: [2007] }],
  ["cfb-tim-tebow:cfb-best-season-rushing-touchdowns", { value: 23, seasons: [2007] }],
  ["cfb-barry-sanders:cfb-best-season-rushing-yards", { value: 2628, seasons: [1988] }],
  ["cfb-barry-sanders:cfb-best-season-rushing-touchdowns", { value: 37, seasons: [1988] }],
  ["cfb-adrian-peterson:cfb-best-season-rushing-yards", { value: 1925, seasons: [2004] }],
  ["cfb-adrian-peterson:cfb-best-season-rushing-touchdowns", { value: 15, seasons: [2004] }],
  ["cfb-ricky-williams:cfb-best-season-rushing-yards", { value: 2124, seasons: [1998] }],
  ["cfb-ricky-williams:cfb-best-season-rushing-touchdowns", { value: 27, seasons: [1998] }],
  ["cfb-reggie-bush:cfb-best-season-rushing-yards", { value: 1740, seasons: [2005] }],
  ["cfb-reggie-bush:cfb-best-season-rushing-touchdowns", { value: 16, seasons: [2005] }],
  ["cfb-reggie-bush:cfb-best-season-receiving-yards", { value: 478, seasons: [2005] }],
  ["cfb-reggie-bush:cfb-best-season-receiving-touchdowns", { value: 2, seasons: [2005] }],
  ["cfb-darren-mcfadden:cfb-best-season-rushing-yards", { value: 1830, seasons: [2007] }],
  ["cfb-darren-mcfadden:cfb-best-season-rushing-touchdowns", { value: 16, seasons: [2007] }],
  ["cfb-mark-ingram-ii:cfb-best-season-rushing-yards", { value: 1658, seasons: [2009] }],
  ["cfb-mark-ingram-ii:cfb-best-season-rushing-touchdowns", { value: 17, seasons: [2009] }],
  ["cfb-keenan-reynolds:cfb-best-season-rushing-touchdowns", { value: 31, seasons: [2013] }],
  ["cfb-ron-dayne:cfb-best-season-rushing-yards", { value: 1863, seasons: [1996] }],
  ["cfb-ron-dayne:cfb-best-season-rushing-touchdowns", { value: 19, seasons: [1999] }],
  ["cfb-eddie-george:cfb-best-season-rushing-yards", { value: 1826, seasons: [1995] }],
  ["cfb-eddie-george:cfb-best-season-rushing-touchdowns", { value: 23, seasons: [1995] }],
  ["cfb-rashaan-salaam:cfb-best-season-rushing-yards", { value: 2055, seasons: [1994] }],
  ["cfb-rashaan-salaam:cfb-best-season-rushing-touchdowns", { value: 24, seasons: [1994] }],
  ["cfb-larry-fitzgerald:cfb-best-season-receiving-yards", { value: 1672, seasons: [2003] }],
  ["cfb-larry-fitzgerald:cfb-best-season-receiving-touchdowns", { value: 22, seasons: [2003] }],
  ["cfb-calvin-johnson:cfb-best-season-receiving-yards", { value: 1202, seasons: [2006] }],
  ["cfb-calvin-johnson:cfb-best-season-receiving-touchdowns", { value: 15, seasons: [2006] }],
  ["cfb-michael-crabtree:cfb-best-season-receiving-yards", { value: 1962, seasons: [2007] }],
  ["cfb-michael-crabtree:cfb-best-season-receiving-touchdowns", { value: 22, seasons: [2007] }],
  ["cfb-desmond-howard:cfb-best-season-receiving-yards", { value: 950, seasons: [1991] }],
  ["cfb-desmond-howard:cfb-best-season-receiving-touchdowns", { value: 19, seasons: [1991] }],
  ["cfb-nndamukong-suh:cfb-best-season-sacks", { value: 12, seasons: [2009] }],
  ["cfb-aaron-donald:cfb-best-season-sacks", { value: 11, seasons: [2011, 2013] }],
  ["cfb-jadeveon-clowney:cfb-best-season-sacks", { value: 13, seasons: [2012] }],
  ["cfb-charles-woodson:cfb-best-season-defensive-interceptions", { value: 7, seasons: [1997] }],
]);

const gateServer = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

let queryFootballSubjects;
let getFootballFact;
try {
  ({ queryFootballSubjects } = await gateServer.ssrLoadModule("/src/features/back-room/footballSubjectRegistry.ts"));
  ({ getFootballFact } = await gateServer.ssrLoadModule("/src/features/back-room/footballFactualStats.ts"));
} finally {
  await gateServer.close();
}

const cfbPlayers = queryFootballSubjects({
  league: "CFB",
  kind: "player-career",
  casualEligible: true,
  includeProjectedSourceSubjects: true,
});
const playersById = new Map(cfbPlayers.map((subject) => [subject.id, subject]));
const playersBySourceId = new Map();
const playersByName = new Map();
for (const subject of cfbPlayers) {
  for (const sourceKey of subject.sourceIdentityKeys ?? []) {
    if (sourceKey.provider !== "cfbfastR") continue;
    const rows = playersBySourceId.get(String(sourceKey.id)) ?? [];
    rows.push(subject);
    playersBySourceId.set(String(sourceKey.id), rows);
  }
  const nameKey = normalize(subject.name);
  const rows = playersByName.get(nameKey) ?? [];
  rows.push(subject);
  playersByName.set(nameKey, rows);
}

function withinCareerWindow(row, subject) {
  return (subject.startSeason == null || row.season >= subject.startSeason)
    && (subject.endSeason == null || row.season <= subject.endSeason);
}

function unique(rows) {
  return rows.length === 1 ? rows[0] : null;
}

function subjectForSourceRow(row) {
  const sourceMatches = (playersBySourceId.get(String(row.sourcePlayerId)) ?? [])
    .filter((subject) => withinCareerWindow(row, subject));
  if (sourceMatches.length === 1) return sourceMatches[0];

  const nameMatches = (playersByName.get(normalize(row.playerName)) ?? [])
    .filter((subject) => withinCareerWindow(row, subject));
  if (nameMatches.length === 1) return nameMatches[0];

  const schoolMatches = nameMatches.filter((subject) => (
    subject.school && normalize(subject.school) === normalize(row.team)
  ));
  return unique(schoolMatches);
}

const seasonTotalsBySubject = new Map();
for (const row of playerSeasons) {
  if (!Number.isInteger(row.season)) continue;
  const subject = subjectForSourceRow(row);
  if (!subject || !playersById.has(subject.id)) continue;
  const bySeason = seasonTotalsBySubject.get(subject.id) ?? new Map();
  const totals = bySeason.get(row.season) ?? Object.fromEntries(sourceFields.map((field) => [field, 0]));
  for (const field of sourceFields) totals[field] += n(row[field]);
  bySeason.set(row.season, totals);
  seasonTotalsBySubject.set(subject.id, bySeason);
}

function sourceSeasonsFor(subjectId, sourceField, canonicalValue) {
  const bySeason = seasonTotalsBySubject.get(subjectId);
  if (!bySeason) return [];
  return [...bySeason.entries()]
    .filter(([, totals]) => nearlyEqual(totals[sourceField], canonicalValue))
    .map(([season]) => season)
    .sort((left, right) => left - right);
}

const contextRows = [];
const missing = [];
for (const subject of cfbPlayers) {
  for (const [metricId, sourceField] of sourceFieldByMetric) {
    const resolved = getFootballFact(subject.id, metricId);
    if (!resolved) continue;
    const key = `${subject.id}:${metricId}`;
    const override = historicalOverrides.get(key);
    let seasons;
    if (override) {
      if (!nearlyEqual(override.value, resolved.fact.value)) {
        throw new Error(`Peak-season context value drift for ${key}: expected ${override.value}, canonical ${resolved.fact.value}.`);
      }
      seasons = override.seasons;
    } else {
      seasons = sourceSeasonsFor(subject.id, sourceField, resolved.fact.value);
    }
    if (!seasons.length) {
      missing.push(`${key}=${resolved.fact.value}`);
      continue;
    }
    contextRows.push([subject.id, metricId, resolved.fact.value, seasons]);
  }
}

if (missing.length) {
  throw new Error(`Missing Football Hit the Number peak-season context:\n${missing.join("\n")}`);
}

contextRows.sort((left, right) => `${left[0]}:${left[1]}`.localeCompare(`${right[0]}:${right[1]}`));
projection.hitTheNumberPeakSeasonContext = contextRows;
fs.writeFileSync(projectionPath, `${JSON.stringify(projection)}\n`);
console.log(`Enriched Football Hit the Number with ${contextRows.length} metric-specific peak-season contexts.`);
