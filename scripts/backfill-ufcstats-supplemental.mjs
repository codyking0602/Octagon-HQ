#!/usr/bin/env node
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(
  root,
  "src/features/rankings/data/generated/ufcstats-supplemental-facts-v1.json",
);
const completedEventsUrl = "https://ufcstats.com/statistics/events/completed?page=all";
const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);
const BONUS_TYPES = [
  "fight-of-the-night",
  "performance-of-the-night",
  "submission-of-the-night",
  "knockout-of-the-night",
];
const CHROME_BIN = process.env.CHROME_BIN || "google-chrome";
const BROWSER_WORKERS = 6;

const NAME_ALIASES = new Map([
  ["bobbygreen", "kinggreen"],
  ["mirkofilipovic", "mirkocrocop"],
]);

function clean(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function canonicalNameKey(value) {
  let normalized = clean(value)
    .replace(/[“"][^”"]+[”"]/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  normalized = NAME_ALIASES.get(normalized) ?? normalized;
  return normalized;
}

function sameName(left, right) {
  return canonicalNameKey(left) === canonicalNameKey(right);
}

function isoDateFromText(value) {
  const text = clean(value);
  const match = text.match(
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2}),\s+(\d{4})\b/i,
  );
  if (!match) return null;
  const month = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  }[match[1].slice(0, 3).toLowerCase()];
  return `${match[3]}-${month}-${String(Number(match[2])).padStart(2, "0")}`;
}

function idFromUrl(value, segment) {
  const match = String(value ?? "").match(new RegExp(`/${segment}/([a-z0-9]+)`, "i"));
  return match?.[1] ?? null;
}

function imageKey(image) {
  const source = image.getAttribute("src") ?? "";
  try {
    return new URL(source, "https://ufcstats.com").pathname.toLowerCase();
  } catch {
    return source.toLowerCase();
  }
}

function cellLines(cell) {
  if (!cell) return [];
  const paragraphs = [...cell.querySelectorAll("p")]
    .map((node) => clean(node.textContent))
    .filter(Boolean);
  if (paragraphs.length) return paragraphs;
  const text = clean(cell.textContent);
  return text ? text.split(/\s+/) : [];
}

function integerPair(cell) {
  const values = cellLines(cell)
    .flatMap((value) => value.split(/\s+/))
    .filter((value) => /^\d+$/.test(value))
    .map(Number);
  return values.length >= 2 ? [values[0], values[1]] : null;
}

function timeSeconds(value) {
  const match = clean(value).match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const seconds = Number(match[1]) * 60 + Number(match[2]);
  return Number.isInteger(seconds) && seconds >= 0 && seconds <= 300 ? seconds : null;
}

function centralDay() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function browserHtml(url, profileDir) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync(
        CHROME_BIN,
        [
          "--headless=new",
          "--no-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-background-networking",
          "--disable-default-apps",
          "--disable-extensions",
          "--disable-sync",
          "--metrics-recording-only",
          "--no-first-run",
          `--user-data-dir=${profileDir}`,
          "--virtual-time-budget=10000",
          "--dump-dom",
          url,
        ],
        { timeout: 45_000, maxBuffer: 16 * 1024 * 1024 },
      );
      if (!/<html/i.test(stdout)) {
        throw new Error("headless Chrome returned no HTML document");
      }
      if (/checking your browser|enable javascript and cookies to continue/i.test(stdout)) {
        throw new Error("UFCStats browser challenge did not clear");
      }
      return stdout;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(1000 * attempt);
    }
  }
  throw new Error(`UFCStats browser load failed for ${url}: ${lastError?.message ?? lastError}`);
}

export function parseCompletedEvents(html) {
  const document = new JSDOM(html).window.document;
  const byUrl = new Map();
  for (const anchor of document.querySelectorAll('a[href*="/event-details/"]')) {
    const href = anchor.getAttribute("href")?.trim();
    const row = anchor.closest("tr");
    const date = isoDateFromText(row?.textContent ?? "");
    const eventId = idFromUrl(href, "event-details");
    if (!href || !date || !eventId) continue;
    const url = href.replace(/^http:/i, "https:");
    byUrl.set(url, { url, eventId, date, name: clean(anchor.textContent) });
  }
  return [...byUrl.values()];
}

function bonusLegend(document) {
  const containers = [...document.querySelectorAll("li, p, div")]
    .filter((element) => /fight,\s*perf,\s*sub,\s*and\s*ko of the night bonuses/i.test(clean(element.textContent)))
    .sort((left, right) => left.textContent.length - right.textContent.length);
  const container = containers.find((element) => element.querySelectorAll("img").length >= 4);
  if (!container) return null;
  const images = [...container.querySelectorAll("img")].slice(0, 4);
  if (images.length !== 4) return null;
  return new Map(images.map((image, index) => [imageKey(image), BONUS_TYPES[index]]));
}

export function parseEventPage(html, event) {
  const document = new JSDOM(html).window.document;
  const legend = bonusLegend(document);
  const fightRows = [...document.querySelectorAll('tr[data-link*="/fight-details/"]')];

  return fightRows.map((row, index) => {
    const fightUrl = row.getAttribute("data-link")?.trim() ?? "";
    const fightId = idFromUrl(fightUrl, "fight-details");
    const fighterNames = [...row.querySelectorAll('a[href*="/fighter-details/"]')]
      .map((anchor) => clean(anchor.textContent))
      .filter(Boolean)
      .slice(0, 2);
    const cells = [...row.children].filter((child) => child.tagName === "TD");
    const kd = integerPair(cells[2]);
    const round = Number.parseInt(cellLines(cells[8])[0] ?? "", 10);
    const time = timeSeconds(cellLines(cells[9])[0] ?? "");
    const bonusTypes = legend
      ? [...new Set(
          [...row.querySelectorAll("img")]
            .map((image) => legend.get(imageKey(image)))
            .filter(Boolean),
        )]
      : null;

    return {
      eventId: event.eventId,
      eventUrl: event.url,
      eventName: event.name,
      date: event.date,
      fightId,
      fightUrl: fightUrl.replace(/^http:/i, "https:"),
      fighterNames,
      kd,
      round: Number.isInteger(round) ? round : null,
      timeSeconds: time,
      mainEvent: index === 0,
      bonusTypes,
    };
  }).filter((row) => row.fightId && row.fighterNames.length === 2);
}

function matchEventRow(rows, fighterName, opponent) {
  const matches = rows.filter((row) => (
    (sameName(row.fighterNames[0], fighterName) && sameName(row.fighterNames[1], opponent))
    || (sameName(row.fighterNames[1], fighterName) && sameName(row.fighterNames[0], opponent))
  ));
  return matches.length === 1 ? matches[0] : { ambiguousMatches: matches };
}

function bonusFact(row, officialResult) {
  if (!row.bonusTypes) return { status: "unavailable" };
  const values = row.bonusTypes.filter((bonusType) => (
    bonusType === "fight-of-the-night" || officialResult === "win"
  ));
  return { status: "verified", values };
}

function finishFact(row, methodCategory) {
  if (!FINISH_METHODS.has(methodCategory)) return { status: "not-applicable" };
  if (
    Number.isInteger(row.round)
    && row.round >= 1
    && row.round <= 5
    && Number.isInteger(row.timeSeconds)
  ) {
    return { status: "verified", round: row.round, timeSeconds: row.timeSeconds };
  }
  return { status: "unavailable" };
}

function knockdownFact(row, fighterName) {
  if (!row.kd) return { status: "unavailable" };
  const fighterIndex = sameName(row.fighterNames[0], fighterName) ? 0 : 1;
  const opponentIndex = fighterIndex === 0 ? 1 : 0;
  return {
    status: "verified",
    for: row.kd[fighterIndex],
    against: row.kd[opponentIndex],
  };
}

function factsEquivalentIgnoringCheckedAt(left, right) {
  if (!left || !right) return false;
  const withoutCheckedAt = (value) => ({
    ...value,
    source: {
      provider: value.source.provider,
      eventId: value.source.eventId,
      fightId: value.source.fightId,
    },
  });
  return JSON.stringify(withoutCheckedAt(left)) === JSON.stringify(withoutCheckedAt(right));
}

async function readExistingSnapshot() {
  try {
    return JSON.parse(await fs.readFile(outputPath, "utf8"));
  } catch {
    return { schemaVersion: 1, provider: "ufcstats", fighters: {} };
  }
}

async function loadCanonicalRankingInputs() {
  const vite = await createServer({
    root,
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true },
  });
  try {
    const rankingInputs = await vite.ssrLoadModule("/src/features/rankings/data/rankingInputs.ts");
    return rankingInputs.canonicalRankingInputs;
  } finally {
    await vite.close();
  }
}

async function main() {
  const checkedAt = process.env.UFCSTATS_CHECKED_AT || centralDay();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) {
    throw new Error(`UFCSTATS_CHECKED_AT must be YYYY-MM-DD, received ${checkedAt}.`);
  }

  const browserRoot = await fs.mkdtemp(path.join(os.tmpdir(), "octagon-ufcstats-"));
  try {
    const profileDirs = await Promise.all(
      Array.from({ length: BROWSER_WORKERS }, async (_, index) => {
        const directory = path.join(browserRoot, `profile-${index}`);
        await fs.mkdir(directory, { recursive: true });
        return directory;
      }),
    );
    const canonicalRankingInputs = await loadCanonicalRankingInputs();
    const canonicalFights = canonicalRankingInputs.fighters.flatMap((fighter) => (
      fighter.facts.fights.map((fight) => ({
        fighterName: fighter.fighter,
        fighterSlug: fighter.presentation.slug,
        fight,
      }))
    ));
    const neededDates = new Set(canonicalFights.map((entry) => entry.fight.date));
    const existingSnapshot = await readExistingSnapshot();

    console.log(`Loading UFCStats event index for ${canonicalFights.length} canonical fights across ${neededDates.size} dates...`);
    const eventIndexHtml = await browserHtml(completedEventsUrl, profileDirs[0]);
    const events = parseCompletedEvents(eventIndexHtml);
    if (!events.length) {
      throw new Error("UFCStats completed-events page did not expose any completed events after the browser challenge.");
    }
    const relevantEvents = events.filter((event) => neededDates.has(event.date));
    const coveredDates = new Set(relevantEvents.map((event) => event.date));
    const missingDates = [...neededDates].filter((date) => !coveredDates.has(date)).sort();
    if (missingDates.length) {
      throw new Error(`UFCStats event index is missing canonical fight dates: ${missingDates.join(", ")}`);
    }

    const rowsByDate = new Map();
    let nextEventIndex = 0;
    let loadedEvents = 0;
    async function loadEventWorker(workerIndex) {
      while (true) {
        const index = nextEventIndex;
        nextEventIndex += 1;
        if (index >= relevantEvents.length) return;
        const event = relevantEvents[index];
        const eventRows = parseEventPage(
          await browserHtml(event.url, profileDirs[workerIndex]),
          event,
        );
        if (!eventRows.length) {
          throw new Error(`UFCStats event ${event.eventId} exposed no fight rows after the browser challenge.`);
        }
        const bucket = rowsByDate.get(event.date) ?? [];
        bucket.push(...eventRows);
        rowsByDate.set(event.date, bucket);
        loadedEvents += 1;
        if (loadedEvents % 40 === 0 || loadedEvents === relevantEvents.length) {
          console.log(`Loaded ${loadedEvents}/${relevantEvents.length} relevant UFCStats events.`);
        }
      }
    }
    await Promise.all(profileDirs.map((_, index) => loadEventWorker(index)));

    const fighters = {};
    const unmatched = [];
    const ambiguous = [];
    let verifiedBonuses = 0;
    let unavailableBonuses = 0;
    let verifiedKnockdowns = 0;
    let unavailableKnockdowns = 0;

    for (const entry of canonicalFights) {
      const dateRows = rowsByDate.get(entry.fight.date) ?? [];
      const matched = matchEventRow(dateRows, entry.fighterName, entry.fight.opponent);
      if (matched.ambiguousMatches) {
        if (matched.ambiguousMatches.length === 0) unmatched.push(entry);
        else ambiguous.push({ ...entry, matches: matched.ambiguousMatches });
        continue;
      }

      const supplementalFacts = {
        source: {
          provider: "ufcstats",
          eventId: matched.eventId,
          fightId: matched.fightId,
          checkedAt,
        },
        mainEvent: { status: "verified", value: matched.mainEvent },
        bonuses: bonusFact(matched, entry.fight.officialResult),
        finish: finishFact(matched, entry.fight.methodCategory),
        knockdowns: knockdownFact(matched, entry.fighterName),
      };

      const previous = existingSnapshot.fighters?.[entry.fighterSlug]?.[entry.fight.id];
      if (factsEquivalentIgnoringCheckedAt(previous, supplementalFacts)) {
        supplementalFacts.source.checkedAt = previous.source.checkedAt;
      }

      fighters[entry.fighterSlug] ??= {};
      fighters[entry.fighterSlug][entry.fight.id] = supplementalFacts;
      if (supplementalFacts.bonuses.status === "verified") verifiedBonuses += 1;
      else unavailableBonuses += 1;
      if (supplementalFacts.knockdowns.status === "verified") verifiedKnockdowns += 1;
      else unavailableKnockdowns += 1;
    }

    if (unmatched.length || ambiguous.length) {
      for (const entry of unmatched.slice(0, 80)) {
        console.error(`UNMATCHED ${entry.fighterName} vs ${entry.fight.opponent} on ${entry.fight.date} (${entry.fighterSlug}:${entry.fight.id})`);
      }
      for (const entry of ambiguous.slice(0, 20)) {
        console.error(`AMBIGUOUS ${entry.fighterName} vs ${entry.fight.opponent} on ${entry.fight.date}: ${entry.matches.length} UFCStats rows`);
      }
      throw new Error(`UFCStats backfill could not reconcile ${unmatched.length} fights and found ${ambiguous.length} ambiguous fights.`);
    }

    const sortedFighters = Object.fromEntries(
      Object.entries(fighters)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([fighterSlug, fights]) => [
          fighterSlug,
          Object.fromEntries(Object.entries(fights).sort(([left], [right]) => left.localeCompare(right))),
        ]),
    );

    const output = {
      schemaVersion: 1,
      provider: "ufcstats",
      fighters: sortedFighters,
    };
    await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    console.log(`Wrote ${canonicalFights.length} canonical supplemental fight records for ${canonicalRankingInputs.fighters.length} fighters.`);
    console.log(`Bonuses: ${verifiedBonuses} verified, ${unavailableBonuses} unavailable.`);
    console.log(`Knockdowns: ${verifiedKnockdowns} verified, ${unavailableKnockdowns} unavailable.`);
  } finally {
    await fs.rm(browserRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
