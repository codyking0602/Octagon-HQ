import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const contextPath = path.join(root, "data/generated/football/hit-the-number-peak-season-context.json");

const projection = readJson("data/generated/football/factual-universe-projection.json");
const playerSeasonData = readJson("data/generated/football/cfb/player-seasons-2014-2025.json");
const indexes = new Map(playerSeasonData.columns.map((name, index) => [name, index]));
const playerSeasons = playerSeasonData.rows.map((row) => (
  Object.fromEntries([...indexes].map(([key, index]) => [key, row[index]]))
));

const normalize = (value) => String(value ?? "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]/g, "");
const finite = (value) => typeof value === "number" && Number.isFinite(value);
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

// Reviewed context for playable peaks that predate the pinned 2014-2025 source corpus.
// These rows identify seasons only. The canonical factual ledger remains the value owner.
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

function sourcePeakSeasons(subjectId, metricId, canonicalValue) {
  const sourceField = sourceFieldByMetric.get(metricId);
  if (!sourceField) return [];
  const observed = sourceRowsFor(subjectId).filter((row) => finite(row[sourceField]));
  if (!observed.length) return [];

  const exact = [...new Set(observed
    .filter((row) => nearlyEqual(row[sourceField], canonicalValue))
    .map((row) => row.season)
    .filter(Number.isInteger))]
    .sort((left, right) => left - right);
  if (exact.length) return exact;

  // Some reviewed CFR facts differ numerically from the pinned cfbfastR corpus.
  // In that case cfbfastR supplies only the identity/year of the peak, never the fact value.
  const peak = Math.max(...observed.map((row) => row[sourceField]));
  return [...new Set(observed
    .filter((row) => nearlyEqual(row[sourceField], peak))
    .map((row) => row.season)
    .filter(Number.isInteger))]
    .sort((left, right) => left - right);
}

const gateServer = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

let footballHitTheNumberSubjects;
let footballHitTheNumberMetricCatalog;
let getFootballFact;
try {
  const model = await gateServer.ssrLoadModule("/src/features/back-room/footballHitTheNumberModel.ts");
  const factual = await gateServer.ssrLoadModule("/src/features/back-room/footballFactualStats.ts");
  footballHitTheNumberSubjects = model.footballHitTheNumberSubjects;
  footballHitTheNumberMetricCatalog = model.FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG;
  getFootballFact = factual.getFootballFact;
} finally {
  await gateServer.close();
}

const peakSubjects = footballHitTheNumberSubjects.filter((subject) => subject.group === "cfb-player-peak");
const peakMetricIds = footballHitTheNumberMetricCatalog
  .filter((row) => row.group === "cfb-player-peak" && sourceFieldByMetric.has(row.metricId))
  .map((row) => row.metricId);

const contextByFact = new Map();
const missing = [];
for (const subject of peakSubjects) {
  for (const metricId of peakMetricIds) {
    const resolved = getFootballFact(subject.id, metricId);
    if (!resolved) continue;

    const factOwnerId = resolved.record.subjectId;
    const reviewed = historicalPeakSeasons.get(`${factOwnerId}:${metricId}`)
      ?? historicalPeakSeasons.get(`${subject.id}:${metricId}`);
    const seasons = reviewed ?? sourcePeakSeasons(subject.id, metricId, resolved.fact.value);
    if (!seasons.length) {
      missing.push(`${subject.id}:${metricId}`);
      continue;
    }

    const key = `${factOwnerId}:${metricId}`;
    const current = contextByFact.get(key);
    if (current && !nearlyEqual(current.canonicalValue, resolved.fact.value)) {
      throw new Error(`Conflicting canonical Football peak context value for ${key}.`);
    }
    contextByFact.set(key, {
      subjectId: factOwnerId,
      metricId,
      canonicalValue: resolved.fact.value,
      seasons: [...new Set([...(current?.seasons ?? []), ...seasons])].sort((left, right) => left - right),
    });
  }
}

if (missing.length) {
  throw new Error(`Missing Football Hit the Number peak-season context:\n${missing.join("\n")}`);
}

const rows = [...contextByFact.values()]
  .sort((left, right) => `${left.subjectId}:${left.metricId}`.localeCompare(`${right.subjectId}:${right.metricId}`))
  .map((row) => [row.subjectId, row.metricId, row.canonicalValue, row.seasons]);
fs.writeFileSync(contextPath, `${JSON.stringify({ schemaVersion: 1, rows })}\n`);
console.log(`Generated ${rows.length} playable metric-specific Football Hit the Number peak-season contexts.`);
