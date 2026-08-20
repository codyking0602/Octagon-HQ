#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(process.env.UFCSTATS_SOURCE_DIR || process.argv[2] || ".");
const outputPath = path.resolve(
  root,
  process.env.UFCSTATS_OUTPUT || process.argv[3] || "src/features/rankings/data/generated/canonical-fight-supplemental-facts.json",
);
const checkedAt = process.env.CHECKED_AT || "2026-08-18";
const sourceRepository = process.env.UFCSTATS_SOURCE_REPOSITORY || "Greco1899/scrape_ufc_stats";
const sourceCommit = process.env.UFCSTATS_SOURCE_COMMIT || "8e40eb945e1127bf0ef172ab211a34787948f312";
const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);

const NAME_ALIASES = new Map([
  ["bobbygreen", "kinggreen"],
]);

function compact(value) {
  const normalized = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return NAME_ALIASES.get(normalized) ?? normalized;
}

function isoDate(value) {
  const parsed = Date.parse(String(value ?? "").replace(/([A-Za-z]{3})\./, "$1"));
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function sourceId(url, segment) {
  return String(url ?? "").match(new RegExp(`/${segment}/([^/?#]+)`))?.[1] ?? "";
}

function parseInteger(value) {
  const cleaned = String(value ?? "").trim();
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

function parseTimeSeconds(value) {
  const match = String(value ?? "").trim().match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes <= 5 && seconds <= 59 ? minutes * 60 + seconds : null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1)
    .filter((values) => values.some((value) => value.trim() !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function readCsv(name) {
  return parseCsv(await fs.readFile(path.join(sourceDir, name), "utf8"));
}

async function loadCanonicalFighters() {
  const vite = await createServer({ root, appType: "custom", logLevel: "error", server: { middlewareMode: true } });
  try {
    const rankingInputs = await vite.ssrLoadModule("/src/features/rankings/data/rankingInputs.ts");
    return rankingInputs.canonicalRankingInputs.fighters.map((fighter) => ({
      name: fighter.fighter,
      slug: fighter.presentation.slug,
      fights: fighter.facts.fights.map((fight) => ({
        id: fight.id,
        date: fight.date,
        opponent: fight.opponent,
        methodCategory: fight.methodCategory,
      })),
    }));
  } finally {
    await vite.close();
  }
}

function boutNames(value) {
  const pieces = String(value ?? "").split(/\s+vs\.\s+/i);
  return pieces.length === 2 ? pieces.map(compact) : [];
}

function boutKey(event, bout) {
  return `${compact(event)}|${boutNames(bout).sort().join("|")}`;
}

function fighterKey(event, bout, fighter) {
  return `${boutKey(event, bout)}|${compact(fighter)}`;
}

const [eventRows, detailRows, resultRows, statRows, canonicalFighters] = await Promise.all([
  readCsv("ufc_event_details.csv"),
  readCsv("ufc_fight_details.csv"),
  readCsv("ufc_fight_results.csv"),
  readCsv("ufc_fight_stats.csv"),
  loadCanonicalFighters(),
]);

const events = new Map();
for (const row of eventRows) {
  const event = compact(row.EVENT);
  const eventId = sourceId(row.URL, "event-details");
  const date = isoDate(row.DATE);
  if (!event || !eventId || !date) throw new Error(`Invalid UFCStats event row: ${JSON.stringify(row)}`);
  events.set(event, { eventId, date, name: row.EVENT });
}

const fightDetails = new Map();
const detailRowsByBout = new Map();
const detailCountByEvent = new Map();
const skippedDetailEvents = new Set();
for (const row of detailRows) {
  const event = compact(row.EVENT);
  const eventFacts = events.get(event);
  if (!eventFacts) {
    skippedDetailEvents.add(row.EVENT);
    continue;
  }
  const names = boutNames(row.BOUT).sort();
  const fightId = sourceId(row.URL, "fight-details");
  if (names.length !== 2 || !fightId) throw new Error(`Invalid UFCStats fight detail row: ${JSON.stringify(row)}`);
  if (fightDetails.has(fightId)) throw new Error(`Duplicate UFCStats fight id ${fightId}.`);
  const position = detailCountByEvent.get(event) ?? 0;
  detailCountByEvent.set(event, position + 1);
  const sourceBoutKey = boutKey(row.EVENT, row.BOUT);
  const detail = {
    ...eventFacts,
    fightId,
    fightUrl: row.URL,
    names,
    boutKey: sourceBoutKey,
    mainEvent: position === 0,
  };
  fightDetails.set(fightId, detail);
  const sameBoutRows = detailRowsByBout.get(sourceBoutKey) ?? [];
  sameBoutRows.push(detail);
  detailRowsByBout.set(sourceBoutKey, sameBoutRows);
}

const results = new Map();
for (const row of resultRows) {
  const fightId = sourceId(row.URL, "fight-details");
  if (!fightId) throw new Error(`UFCStats result is missing its fight id: ${JSON.stringify(row)}`);
  if (results.has(fightId)) throw new Error(`Duplicate UFCStats fight result ${fightId}.`);
  results.set(fightId, row);
}

const ambiguousStatBouts = new Set(
  [...detailRowsByBout.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key]) => key),
);
const knockdowns = new Map();
const seenStatRounds = new Set();
for (const row of statRows) {
  const sourceBoutKey = boutKey(row.EVENT, row.BOUT);
  if (ambiguousStatBouts.has(sourceBoutKey)) continue;
  const round = parseInteger(row.ROUND);
  const kd = parseInteger(row.KD);
  const key = fighterKey(row.EVENT, row.BOUT, row.FIGHTER);
  if (round == null || round < 1 || kd == null) continue;
  const roundKey = `${key}|${round}`;
  if (seenStatRounds.has(roundKey)) throw new Error(`Duplicate UFCStats stat round ${roundKey}.`);
  seenStatRounds.add(roundKey);
  knockdowns.set(key, (knockdowns.get(key) ?? 0) + kd);
}

const detailRowsByDate = new Map();
for (const detail of fightDetails.values()) {
  const rows = detailRowsByDate.get(detail.date) ?? [];
  rows.push(detail);
  detailRowsByDate.set(detail.date, rows);
}

function matchDetail(fighterName, fight) {
  const targetNames = [compact(fighterName), compact(fight.opponent)].sort();
  const matches = (detailRowsByDate.get(fight.date) ?? []).filter((detail) => (
    detail.names[0] === targetNames[0] && detail.names[1] === targetNames[1]
  ));
  if (matches.length !== 1) {
    throw new Error(`${fighterName} ${fight.id} (${fight.date} vs ${fight.opponent}) matched ${matches.length} UFCStats fights.`);
  }
  return matches[0];
}

function finishFact(fight, result) {
  if (!FINISH_METHODS.has(fight.methodCategory)) return { status: "not-applicable" };
  const round = parseInteger(result?.ROUND);
  const timeSeconds = parseTimeSeconds(result?.TIME);
  return round != null && round >= 1 && round <= 5 && timeSeconds != null
    ? { status: "verified", round, timeSeconds }
    : { status: "unavailable" };
}

function knockdownFact(detail, fighterName, opponentName) {
  if (ambiguousStatBouts.has(detail.boutKey)) return { status: "unavailable" };
  const forValue = knockdowns.get(`${detail.boutKey}|${compact(fighterName)}`);
  const againstValue = knockdowns.get(`${detail.boutKey}|${compact(opponentName)}`);
  return Number.isInteger(forValue) && Number.isInteger(againstValue)
    ? { status: "verified", for: forValue, against: againstValue }
    : { status: "unavailable" };
}

const entries = [];
for (const fighter of canonicalFighters) {
  for (const fight of fighter.fights) {
    const detail = matchDetail(fighter.name, fight);
    const result = results.get(detail.fightId);
    if (!result) throw new Error(`Missing UFCStats result row for fight ${detail.fightId}.`);
    entries.push({
      fighterId: fighter.slug,
      canonicalFightId: fight.id,
      supplementalFacts: {
        source: {
          provider: "ufcstats",
          eventId: detail.eventId,
          fightId: detail.fightId,
          checkedAt,
        },
        mainEvent: { status: "verified", value: detail.mainEvent },
        bonuses: { status: "unavailable" },
        finish: finishFact(fight, result),
        knockdowns: knockdownFact(detail, fighter.name, fight.opponent),
      },
    });
  }
}

entries.sort((left, right) => (
  left.fighterId.localeCompare(right.fighterId)
  || left.canonicalFightId.localeCompare(right.canonicalFightId)
));
const expectedFightCount = canonicalFighters.reduce((sum, fighter) => sum + fighter.fights.length, 0);
const keys = new Set(entries.map((entry) => `${entry.fighterId}:${entry.canonicalFightId}`));
if (entries.length !== expectedFightCount || keys.size !== entries.length) {
  throw new Error(`Canonical snapshot reconciliation failed: ${entries.length} rows / ${keys.size} keys / ${expectedFightCount} fights.`);
}

const coverage = {
  fighters: canonicalFighters.length,
  fights: entries.length,
  events: new Set(entries.map((entry) => entry.supplementalFacts.source.eventId)).size,
  upstreamDetailEventsSkippedWithoutMetadata: skippedDetailEvents.size,
  upstreamDuplicateBoutKeysWithoutStatIdentity: ambiguousStatBouts.size,
  mainEventVerified: entries.filter((entry) => entry.supplementalFacts.mainEvent.status === "verified").length,
  bonusesVerified: 0,
  bonusesUnavailable: entries.length,
  finishVerified: entries.filter((entry) => entry.supplementalFacts.finish.status === "verified").length,
  finishNotApplicable: entries.filter((entry) => entry.supplementalFacts.finish.status === "not-applicable").length,
  finishUnavailable: entries.filter((entry) => entry.supplementalFacts.finish.status === "unavailable").length,
  knockdownsVerified: entries.filter((entry) => entry.supplementalFacts.knockdowns.status === "verified").length,
  knockdownsUnavailable: entries.filter((entry) => entry.supplementalFacts.knockdowns.status === "unavailable").length,
};

const snapshot = {
  schemaVersion: 1,
  provider: "ufcstats",
  checkedAt,
  transport: {
    repository: sourceRepository,
    commit: sourceCommit,
    files: [
      "ufc_event_details.csv",
      "ufc_fight_details.csv",
      "ufc_fight_results.csv",
      "ufc_fight_stats.csv",
    ],
    note: "Pinned checked-in UFCStats extract. Bonus flags are not retained by this transport and remain explicitly unavailable; round stats without per-fight identity remain unavailable for duplicate same-event bouts.",
  },
  coverage,
  entries,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Wrote ${path.relative(root, outputPath)} from ${sourceRepository}@${sourceCommit}.`);
if (skippedDetailEvents.size) {
  console.log(`Skipped ${skippedDetailEvents.size} upstream detail event(s) absent from the pinned event index; canonical fights still require exact matches.`);
}
if (ambiguousStatBouts.size) {
  console.log(`Marked round-stat identity unavailable for ${ambiguousStatBouts.size} duplicate same-event matchup key(s).`);
}
console.log(JSON.stringify(coverage));
