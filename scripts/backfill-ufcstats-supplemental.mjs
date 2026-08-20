#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "src/features/rankings/data/generated/ufcstats-supplemental-facts-v1.json");

const CORE = {
  repository: "Greco1899/scrape_ufc_stats",
  commit: "8e40eb945e1127bf0ef172ab211a34787948f312",
  refreshedAt: "2026-08-18",
  files: ["ufc_event_details.csv", "ufc_fight_details.csv", "ufc_fight_results.csv", "ufc_fight_stats.csv"],
};
const BONUSES = {
  repository: "manzlerh/MMA-Grid",
  commit: "2d363d60b3a3f44e6a8bf83cdcef409f47fb3948",
  refreshedAt: "2026-03-02",
  files: ["data/raw/ufc_bonuses.csv"],
};
const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);
const BONUS_TYPES = new Map([
  ["FIGHT", "fight-of-the-night"],
  ["PERF", "performance-of-the-night"],
  ["SUB", "submission-of-the-night"],
  ["KO", "knockout-of-the-night"],
]);
const NAME_ALIASES = new Map([
  ["bobbygreen", "kinggreen"],
  ["mirkofilipovic", "mirkocrocop"],
  ["phildefries", "philipdefries"],
  ["janbachowicz", "janblachowicz"],
  ["carlosdiegoferreira", "carlosferreira"],
  ["josephduffy", "joeduffy"],
  ["ulkasasaski", "yutasasaki"],
  ["ronaldosouza", "jacaresouza"],
  ["josealbertoquinonez", "josequinonez"],
  ["mauricioshogunrua", "mauriciorua"],
  ["tankabbott", "davidabbott"],
  ["criscyborg", "cristianejustino"],
  ["katlynchookagian", "katlyncerminara"],
  ["teciatorres", "teciapennington"],
  ["michellewaterson", "michellewatersongomez"],
  ["joannecalderwood", "joannewood"],
  ["yanakunitskaya", "yanasantos"],
  ["heatherjoclark", "heatherclark"],
  ["zhangweili", "weilizhang"],
]);

function rawUrl(repository, commit, file) {
  return `https://raw.githubusercontent.com/${repository}/${commit}/${file}`;
}
async function downloadText(repository, commit, file) {
  const url = rawUrl(repository, commit, file);
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status} ${response.statusText}`);
  return response.text();
}
function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') { value += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else value += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ',') { row.push(value); value = ""; }
    else if (char === '\n') { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  return rows.filter((values) => values.some((entry) => entry.trim().length))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
function clean(value) { return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
function nameKey(value) {
  let normalized = clean(value).replace(/[“"][^”"]+[”"]/g, " ").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "").toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, " ").replace(/[^a-z0-9]+/g, "");
  normalized = NAME_ALIASES.get(normalized) ?? normalized;
  return normalized;
}
function splitBout(value) { const parts = clean(value).split(/\s+vs\.?\s+/i); return parts.length === 2 ? parts : []; }
function isoDate(value) {
  const parsed = new Date(`${clean(value)} 00:00:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}
function dateOffset(value, days) { const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
function idFromUrl(value, segment) { return clean(value).match(new RegExp(`/${segment}/([a-z0-9]+)`, "i"))?.[1] ?? null; }
function timeSeconds(value) {
  const match = clean(value).match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const result = Number(match[1]) * 60 + Number(match[2]);
  return Number.isInteger(result) && result >= 0 && result <= 300 ? result : null;
}
function integer(value) { const text = clean(value); return /^\d+$/.test(text) ? Number(text) : null; }
async function loadCanonicalRankingInputs() {
  const vite = await createServer({ root, appType: "custom", logLevel: "error", server: { middlewareMode: true } });
  try { return (await vite.ssrLoadModule("/src/features/rankings/data/rankingInputs.ts")).canonicalRankingInputs; }
  finally { await vite.close(); }
}
function eventBoutKey(event, bout) { return `${clean(event)}\u0000${clean(bout)}`; }
function buildCoreIndex(eventRows, detailRows, resultRows, statRows) {
  const eventByName = new Map();
  for (const row of eventRows) {
    const date = isoDate(row.DATE);
    const eventId = idFromUrl(row.URL, "event-details");
    if (row.EVENT && date && eventId) eventByName.set(clean(row.EVENT), { name: clean(row.EVENT), date, eventId });
  }
  const detailsByDate = new Map();
  const detailByEventBout = new Map();
  const eventPosition = new Map();
  for (const row of detailRows) {
    const event = eventByName.get(clean(row.EVENT));
    const fightId = idFromUrl(row.URL, "fight-details");
    const names = splitBout(row.BOUT);
    if (!event || !fightId || names.length !== 2) continue;
    const position = eventPosition.get(event.name) ?? 0;
    eventPosition.set(event.name, position + 1);
    const detail = { ...event, fightId, bout: clean(row.BOUT), names, mainEvent: position === 0 };
    detailByEventBout.set(eventBoutKey(event.name, detail.bout), detail);
    const bucket = detailsByDate.get(event.date) ?? [];
    bucket.push(detail);
    detailsByDate.set(event.date, bucket);
  }
  const resultByFightId = new Map();
  for (const row of resultRows) { const fightId = idFromUrl(row.URL, "fight-details"); if (fightId) resultByFightId.set(fightId, row); }
  const statsByFightId = new Map();
  for (const row of statRows) {
    const detail = detailByEventBout.get(eventBoutKey(row.EVENT, row.BOUT));
    if (!detail) continue;
    const fighter = nameKey(row.FIGHTER);
    const kd = integer(row.KD);
    const fightStats = statsByFightId.get(detail.fightId) ?? new Map();
    const current = fightStats.get(fighter) ?? { known: true, total: 0, rows: 0 };
    current.rows += 1;
    if (kd == null) current.known = false; else current.total += kd;
    fightStats.set(fighter, current);
    statsByFightId.set(detail.fightId, fightStats);
  }
  return { detailsByDate, resultByFightId, statsByFightId };
}
function buildBonusIndex(rows) {
  const byEvent = new Map();
  for (const row of rows) {
    const event = clean(row.event_name);
    const fighter = nameKey(row.fighter_name);
    const type = BONUS_TYPES.get(clean(row.bonus_type).toUpperCase());
    if (!event || !fighter || !type) continue;
    const fighters = byEvent.get(event) ?? new Map();
    const values = fighters.get(fighter) ?? new Set();
    values.add(type); fighters.set(fighter, values); byEvent.set(event, fighters);
  }
  return byEvent;
}
function matchDetail(details, fighterName, opponentName) {
  const fighter = nameKey(fighterName); const opponent = nameKey(opponentName);
  const matches = details.filter((detail) => {
    const [left, right] = detail.names.map(nameKey);
    return (left === fighter && right === opponent) || (left === opponent && right === fighter);
  });
  return matches.length === 1 ? matches[0] : { matches };
}
function finishFact(resultRow, methodCategory) {
  if (!FINISH_METHODS.has(methodCategory)) return { status: "not-applicable" };
  const round = integer(resultRow?.ROUND); const seconds = timeSeconds(resultRow?.TIME);
  return round != null && round >= 1 && round <= 5 && seconds != null
    ? { status: "verified", round, timeSeconds: seconds }
    : { status: "unavailable" };
}
function knockdownFact(stats, fighterName, opponentName) {
  if (!stats) return { status: "unavailable" };
  const fighter = stats.get(nameKey(fighterName)); const opponent = stats.get(nameKey(opponentName));
  return !fighter?.known || !opponent?.known || fighter.rows === 0 || opponent.rows === 0
    ? { status: "unavailable" }
    : { status: "verified", for: fighter.total, against: opponent.total };
}
function bonusFact(bonusByEvent, eventName, fighterName) {
  const event = bonusByEvent.get(eventName);
  return !event ? { status: "unavailable" } : { status: "verified", values: [...(event.get(nameKey(fighterName)) ?? [])].sort() };
}
function candidateDetails(detailsByDate, canonicalDate) {
  return [-1, 0, 1].flatMap((offset) => detailsByDate.get(dateOffset(canonicalDate, offset)) ?? []);
}
async function main() {
  const canonicalRankingInputs = await loadCanonicalRankingInputs();
  const modelDate = canonicalRankingInputs.source.modelAsOfDate;
  if (modelDate > CORE.refreshedAt) throw new Error(`Pinned UFCStats core export ${CORE.refreshedAt} is older than model date ${modelDate}.`);
  const [eventText, detailText, resultText, statsText, bonusText] = await Promise.all([
    downloadText(CORE.repository, CORE.commit, CORE.files[0]), downloadText(CORE.repository, CORE.commit, CORE.files[1]),
    downloadText(CORE.repository, CORE.commit, CORE.files[2]), downloadText(CORE.repository, CORE.commit, CORE.files[3]),
    downloadText(BONUSES.repository, BONUSES.commit, BONUSES.files[0]),
  ]);
  const core = buildCoreIndex(parseCsv(eventText), parseCsv(detailText), parseCsv(resultText), parseCsv(statsText));
  const bonuses = buildBonusIndex(parseCsv(bonusText));
  const fighters = {}; const unmatched = [];
  let totalFights = 0; let verifiedBonuses = 0; let unavailableBonuses = 0; let verifiedKnockdowns = 0; let unavailableKnockdowns = 0;
  for (const fighter of canonicalRankingInputs.fighters) {
    const byFight = {};
    for (const fight of fighter.facts.fights) {
      totalFights += 1;
      const candidates = candidateDetails(core.detailsByDate, fight.date);
      const matched = matchDetail(candidates, fighter.fighter, fight.opponent);
      if (matched.matches) {
        unmatched.push(`${fighter.fighter} vs ${fight.opponent} ${fight.date}: ${matched.matches.length} matches; candidates=${candidates.map((candidate) => `${candidate.date}:${candidate.bout}`).join(" | ")}`);
        continue;
      }
      const bonus = bonusFact(bonuses, matched.name, fighter.fighter);
      const knockdowns = knockdownFact(core.statsByFightId.get(matched.fightId), fighter.fighter, fight.opponent);
      if (bonus.status === "verified") verifiedBonuses += 1; else unavailableBonuses += 1;
      if (knockdowns.status === "verified") verifiedKnockdowns += 1; else unavailableKnockdowns += 1;
      byFight[fight.id] = {
        source: { provider: "ufcstats", eventId: matched.eventId, fightId: matched.fightId, checkedAt: CORE.refreshedAt },
        mainEvent: { status: "verified", value: matched.mainEvent }, bonuses: bonus,
        finish: finishFact(core.resultByFightId.get(matched.fightId), fight.methodCategory), knockdowns,
      };
    }
    fighters[fighter.presentation.slug] = byFight;
  }
  if (unmatched.length) {
    unmatched.slice(0, 100).forEach((message) => console.error(`UNMATCHED ${message}`));
    throw new Error(`Pinned UFCStats exports failed to reconcile ${unmatched.length}/${totalFights} canonical fight rows.`);
  }
  const output = { schemaVersion: 1, provider: "ufcstats", provenance: { core: CORE, bonuses: BONUSES }, fighters: Object.fromEntries(Object.entries(fighters).sort(([a], [b]) => a.localeCompare(b))) };
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${totalFights} canonical UFCStats supplemental fight rows.`);
  console.log(`Bonuses: ${verifiedBonuses} verified, ${unavailableBonuses} unavailable from the pinned bonus export.`);
  console.log(`Knockdowns: ${verifiedKnockdowns} verified, ${unavailableKnockdowns} unavailable in UFCStats.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
