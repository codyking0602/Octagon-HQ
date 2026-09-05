import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const projectionPath = path.join(root, "data/generated/football/factual-universe-projection.json");
const expansionPath = path.join(root, "src/features/back-room/footballFactualStatsExpansion.ts");

const projection = readJson("data/generated/football/factual-universe-projection.json");
const playerSeasonData = readJson("data/generated/football/cfb/player-seasons-2014-2025.json");
const expansionSource = fs.readFileSync(expansionPath, "utf8");
const indexes = new Map(playerSeasonData.columns.map((name, index) => [name, index]));
const playerSeasons = playerSeasonData.rows.map((row) => (
  Object.fromEntries([...indexes].map(([key, index]) => [key, row[index]]))
));

const normalize = (value) => String(value ?? "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]/g, "");
const finite = (value) => typeof value === "number" && Number.isFinite(value);

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

const historicalPeakSeasons = new Map([
  ["cfb-cam-newton:cfb-best-season-passing-yards", [2010]],
  ["cfb-cam-newton:cfb-best-season-passing-touchdowns", [2010]],
  ["cfb-cam-newton:cfb-best-season-rushing-yards", [2010]],
  ["cfb-cam-newton:cfb-best-season-rushing-touchdowns", [2010]],
  ["cfb-vince-young:cfb-best-season-passing-yards", [2005]],
  ["cfb-vince-young:cfb-best-season-passing-touchdowns", [2005]],
  ["cfb-vince-young:cfb-best-season-rushing-yards", [2005]],
  ["cfb-vince-young:cfb-best-season-rushing-touchdowns", [2005]],
  ["cfb-tim-tebow:cfb-best-season-passing-yards", [2007]],
  ["cfb-tim-tebow:cfb-best-season-passing-touchdowns", [2007]],
  ["cfb-tim-tebow:cfb-best-season-rushing-yards", [2007]],
  ["cfb-tim-tebow:cfb-best-season-rushing-touchdowns", [2007]],
  ["cfb-barry-sanders:cfb-best-season-rushing-yards", [1988]],
  ["cfb-barry-sanders:cfb-best-season-rushing-touchdowns", [1988]],
  ["cfb-adrian-peterson:cfb-best-season-rushing-yards", [2004]],
  ["cfb-adrian-peterson:cfb-best-season-rushing-touchdowns", [2004]],
  ["cfb-ricky-williams:cfb-best-season-rushing-yards", [1998]],
  ["cfb-ricky-williams:cfb-best-season-rushing-touchdowns", [1998]],
  ["cfb-reggie-bush:cfb-best-season-rushing-yards", [2005]],
  ["cfb-reggie-bush:cfb-best-season-rushing-touchdowns", [2005]],
  ["cfb-reggie-bush:cfb-best-season-receiving-yards", [2005]],
  ["cfb-reggie-bush:cfb-best-season-receiving-touchdowns", [2005]],
  ["cfb-darren-mcfadden:cfb-best-season-rushing-yards", [2007]],
  ["cfb-darren-mcfadden:cfb-best-season-rushing-touchdowns", [2007]],
  ["cfb-mark-ingram-ii:cfb-best-season-rushing-yards", [2009]],
  ["cfb-mark-ingram-ii:cfb-best-season-rushing-touchdowns", [2009]],
  ["cfb-keenan-reynolds:cfb-best-season-rushing-touchdowns", [2013]],
  ["cfb-ron-dayne:cfb-best-season-rushing-yards", [1996]],
  ["cfb-ron-dayne:cfb-best-season-rushing-touchdowns", [1999]],
  ["cfb-eddie-george:cfb-best-season-rushing-yards", [1995]],
  ["cfb-eddie-george:cfb-best-season-rushing-touchdowns", [1995]],
  ["cfb-rashaan-salaam:cfb-best-season-rushing-yards", [1994]],
  ["cfb-rashaan-salaam:cfb-best-season-rushing-touchdowns", [1994]],
  ["cfb-larry-fitzgerald:cfb-best-season-receiving-yards", [2003]],
  ["cfb-larry-fitzgerald:cfb-best-season-receiving-touchdowns", [2003]],
  ["cfb-calvin-johnson:cfb-best-season-receiving-yards", [2006]],
  ["cfb-calvin-johnson:cfb-best-season-receiving-touchdowns", [2006]],
  ["cfb-michael-crabtree:cfb-best-season-receiving-yards", [2007]],
  ["cfb-michael-crabtree:cfb-best-season-receiving-touchdowns", [2007]],
  ["cfb-desmond-howard:cfb-best-season-receiving-yards", [1991]],
  ["cfb-desmond-howard:cfb-best-season-receiving-touchdowns", [1991]],
  ["cfb-nndamukong-suh:cfb-best-season-sacks", [2009]],
  ["cfb-aaron-donald:cfb-best-season-sacks", [2011, 2013]],
  ["cfb-jadeveon-clowney:cfb-best-season-sacks", [2012]],
  ["cfb-charles-woodson:cfb-best-season-defensive-interceptions", [1997]],
]);

const rowsByPlayerName = new Map();
const rowsBySourceId = new Map();
for (const row of playerSeasons) {
  const nameKey = normalize(row.playerName);
  const nameRows = rowsByPlayerName.get(nameKey) ?? [];
  nameRows.push(row);
  rowsByPlayerName.set(nameKey, nameRows);

  const sourceKey = String(row.sourcePlayerId ?? "");
  const sourceRows = rowsBySourceId.get(sourceKey) ?? [];
  sourceRows.push(row);
  rowsBySourceId.set(sourceKey, sourceRows);
}

function subjectSlug(subjectId) {
  const sourceMatch = subjectId.match(/^cfbfast-r-player-([^-]+)-(.+)$/);
  if (sourceMatch) return { sourceId: sourceMatch[1], slug: sourceMatch[2] };
  return {
    sourceId: null,
    slug: subjectId
      .replace(/^cfb-/, "")
      .replace(/-career$/, "")
      .replace(/-(?:qb|rb|wr|te|dl|lb|db)$/, ""),
  };
}

function sourceRowsFor(subjectId) {
  const { sourceId, slug } = subjectSlug(subjectId);
  if (sourceId) {
    const bySource = rowsBySourceId.get(String(sourceId)) ?? [];
    if (bySource.length) return bySource;
  }
  return rowsByPlayerName.get(normalize(slug)) ?? [];
}

function peakSeasons(subjectId, metricId) {
  const reviewed = historicalPeakSeasons.get(`${subjectId}:${metricId}`);
  if (reviewed) return reviewed;
  const sourceField = sourceFieldByMetric.get(metricId);
  if (!sourceField) return [];
  const observed = sourceRowsFor(subjectId).filter((row) => finite(row[sourceField]));
  if (!observed.length) return [];
  const peak = Math.max(...observed.map((row) => row[sourceField]));
  return [...new Set(observed
    .filter((row) => row[sourceField] === peak)
    .map((row) => row.season)
    .filter(Number.isInteger))]
    .sort((left, right) => left - right);
}

// Canonical values travel with presentation context so runtime can ignore stale year metadata
// if the factual owner changes later. Reviewed expansion facts override generated gap-fill values.
const requested = new Map();
for (const record of projection.records ?? []) {
  if (record.scope !== "cfb-player-career") continue;
  for (const fact of record.facts ?? []) {
    if (!sourceFieldByMetric.has(fact.metricId) || !finite(fact.value)) continue;
    requested.set(`${record.subjectId}:${fact.metricId}`, fact.value);
  }
}

for (const match of expansionSource.matchAll(/cfbPlayer\("([^"]+)",\s*\[([\s\S]*?)\]\),/g)) {
  const subjectId = match[1];
  const body = match[2];
  for (const metricMatch of body.matchAll(/\["(cfb-best-season-[^"]+)"\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g)) {
    const metricId = metricMatch[1];
    if (!sourceFieldByMetric.has(metricId)) continue;
    requested.set(`${subjectId}:${metricId}`, Number(metricMatch[2]));
  }
}

const contextRows = [];
const missing = [];
for (const [key, canonicalValue] of [...requested.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  const separator = key.indexOf(":");
  const subjectId = key.slice(0, separator);
  const metricId = key.slice(separator + 1);
  const seasons = peakSeasons(subjectId, metricId);
  if (!seasons.length) {
    missing.push(key);
    continue;
  }
  contextRows.push([subjectId, metricId, canonicalValue, seasons]);
}

if (missing.length) {
  throw new Error(`Missing Football Hit the Number peak-season context:\n${missing.join("\n")}`);
}

projection.hitTheNumberPeakSeasonContext = contextRows;
fs.writeFileSync(projectionPath, `${JSON.stringify(projection)}\n`);
console.log(`Enriched Football Hit the Number with ${contextRows.length} metric-specific peak-season contexts.`);
