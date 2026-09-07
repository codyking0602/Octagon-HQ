#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "data/ufc/factual-expansion-candidates-v1.json");
const outputPath = path.join(root, "data/generated/ufc/factual-expansion-v1.json");

// Keep this pinned to the same UFCStats core snapshot already used by
// scripts/backfill-ufcstats-supplemental.mjs. This generator broadens the
// factual subject universe; it does not introduce another evidence provider.
const CORE = {
  repository: "Greco1899/scrape_ufc_stats",
  commit: "8e40eb945e1127bf0ef172ab211a34787948f312",
  refreshedAt: "2026-08-18",
  files: ["ufc_event_details.csv", "ufc_fight_results.csv"],
};

const NAME_ALIASES = new Map([
  ["bobbygreen", "kinggreen"],
  ["mirkofilipovic", "mirkocrocop"],
  ["janbachowicz", "janblachowicz"],
  ["ronaldosouza", "jacaresouza"],
  ["mauricioshogunrua", "mauriciorua"],
  ["criscyborg", "cristianejustino"],
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

function clean(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function nameKey(value) {
  let normalized = clean(value).replace(/[“"][^”"]+[”"]/g, " ").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "").toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, " ").replace(/[^a-z0-9]+/g, "");
  normalized = NAME_ALIASES.get(normalized) ?? normalized;
  return normalized;
}

function slugify(value) {
  return clean(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function splitBout(value) {
  const parts = clean(value).split(/\s+vs\.?\s+/i);
  return parts.length === 2 ? parts : [];
}

function isoDate(value) {
  const parsed = new Date(`${clean(value)} 00:00:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function idFromUrl(value) {
  return clean(value).match(/\/fight-details\/([a-z0-9]+)/i)?.[1] ?? null;
}

function resultAt(value, index) {
  const outcomes = clean(value).toUpperCase().split("/").map((part) => part.trim());
  const outcome = outcomes[index];
  if (outcome === "W") return "win";
  if (outcome === "L") return "loss";
  if (outcome === "D") return "draw";
  if (outcome === "NC") return "no-contest";
  return null;
}

function methodCategory(value) {
  const method = clean(value).toUpperCase();
  if (method.includes("KO/TKO")) return "ko-tko";
  if (method === "SUB" || method.includes("SUBMISSION")) return "submission";
  if (method.includes("DECISION")) return "decision";
  return "other";
}

function normalizeDivision(value) {
  let division = clean(value)
    .replace(/^UFC\s+/i, "")
    .replace(/\bInterim\b/gi, "")
    .replace(/\bTitle\b/gi, "")
    .replace(/\bBout\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/catch\s*weight/i.test(division)) return "Catch Weight";
  if (/open\s*weight/i.test(division)) return "Open Weight";
  return division || "Unknown";
}

function primaryDivision(fights) {
  const counts = new Map();
  for (const fight of fights) {
    if (fight.division === "Catch Weight" || fight.division === "Open Weight" || fight.division === "Unknown") continue;
    const row = counts.get(fight.division) ?? { count: 0, latest: "0000-00-00" };
    row.count += 1;
    if (fight.date > row.latest) row.latest = fight.date;
    counts.set(fight.division, row);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1].count - a[1].count || b[1].latest.localeCompare(a[1].latest));
  return ranked[0]?.[0] ?? fights.at(-1)?.division ?? "Unknown";
}

async function loadCanonicalRankingInputs() {
  const vite = await createServer({ root, appType: "custom", logLevel: "error", server: { middlewareMode: true } });
  try {
    return (await vite.ssrLoadModule("/src/features/rankings/data/rankingInputs.ts")).canonicalRankingInputs;
  } finally {
    await vite.close();
  }
}

async function main() {
  const [seedText, canonicalRankingInputs, eventText, resultText] = await Promise.all([
    fs.readFile(seedPath, "utf8"),
    loadCanonicalRankingInputs(),
    downloadText(CORE.repository, CORE.commit, CORE.files[0]),
    downloadText(CORE.repository, CORE.commit, CORE.files[1]),
  ]);
  const seed = JSON.parse(seedText);
  const rankedKeys = new Set(canonicalRankingInputs.fighters.map((fighter) => nameKey(fighter.fighter)));
  const expansionTarget = Math.max(0, seed.targetTotalSubjects - canonicalRankingInputs.fighters.length);

  const eventDates = new Map();
  for (const row of parseCsv(eventText)) {
    const date = isoDate(row.DATE);
    if (row.EVENT && date) eventDates.set(clean(row.EVENT), date);
  }

  const careers = new Map();
  for (const row of parseCsv(resultText)) {
    const names = splitBout(row.BOUT);
    const date = eventDates.get(clean(row.EVENT));
    const fightId = idFromUrl(row.URL);
    if (names.length !== 2 || !date || !fightId) continue;
    for (let index = 0; index < 2; index += 1) {
      const result = resultAt(row.OUTCOME, index);
      if (!result) continue;
      const name = names[index];
      const key = nameKey(name);
      const fights = careers.get(key) ?? [];
      fights.push({
        id: fightId,
        date,
        opponent: names[index === 0 ? 1 : 0],
        division: normalizeDivision(row.WEIGHTCLASS),
        result,
        methodCategory: methodCategory(row.METHOD),
        titleFight: /\btitle\b/i.test(clean(row.WEIGHTCLASS)),
        interimTitleFight: /\binterim\b/i.test(clean(row.WEIGHTCLASS)),
      });
      careers.set(key, fights);
    }
  }

  const selected = [];
  for (const candidate of seed.priority) {
    if (selected.length >= expansionTarget) break;
    const key = nameKey(candidate.name);
    if (rankedKeys.has(key)) continue;
    const fights = (careers.get(key) ?? []).sort((a, b) => a.date.localeCompare(b.date));
    if (!fights.length) continue;
    const lastYear = Number(fights.at(-1).date.slice(0, 4));
    const legacy = lastYear < seed.policy.modernActivityYear;
    if (legacy && candidate.legacyA !== true) continue;
    const primary = primaryDivision(fights);
    const divisions = [...new Set(fights.map((fight) => fight.division).filter((division) => division !== "Unknown"))];
    selected.push({
      id: `ufc:${slugify(candidate.name)}`,
      name: candidate.name,
      slug: slugify(candidate.name),
      recognizabilityTier: seed.policy.recognizabilityTier,
      legacyA: legacy,
      primaryDivision: primary,
      secondaryDivisions: divisions.filter((division) => division !== primary),
      activeFrom: fights[0].date,
      activeTo: fights.at(-1).date,
      fights,
    });
  }

  if (selected.length !== expansionTarget) {
    throw new Error(`UFC factual expansion found ${selected.length} usable unranked A-tier subjects; expected ${expansionTarget}.`);
  }
  const legacyCount = selected.filter((subject) => subject.legacyA).length;
  const modernCount = selected.length - legacyCount;
  const modernShare = selected.length ? modernCount / selected.length : 1;
  if (legacyCount > seed.policy.maximumLegacySubjects) {
    throw new Error(`UFC factual expansion selected ${legacyCount} legacy subjects; max is ${seed.policy.maximumLegacySubjects}.`);
  }
  if (modernShare < seed.policy.minimumModernShare) {
    throw new Error(`UFC factual expansion modern share ${modernShare.toFixed(3)} is below ${seed.policy.minimumModernShare}.`);
  }

  const output = {
    schemaVersion: 1,
    targetTotalSubjects: seed.targetTotalSubjects,
    rankedSubjectCountAtGeneration: canonicalRankingInputs.fighters.length,
    expansionSubjectCount: selected.length,
    recognizabilityTier: seed.policy.recognizabilityTier,
    policy: seed.policy,
    provenance: { provider: "ufcstats", core: CORE },
    subjects: selected,
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  const eraBuckets = { legacy: legacyCount, modern: modernCount };
  console.log(`UFC_FACTUAL_EXPANSION=${JSON.stringify({ ranked: canonicalRankingInputs.fighters.length, expansion: selected.length, total: canonicalRankingInputs.fighters.length + selected.length, eraBuckets, modernShare: Number(modernShare.toFixed(3)) })}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
