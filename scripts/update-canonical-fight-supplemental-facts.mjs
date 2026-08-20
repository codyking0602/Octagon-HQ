#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import fs from "node:fs/promises";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.resolve(
  root,
  process.argv[2] || "src/features/rankings/data/generated/canonical-fight-supplemental-facts.json",
);
const checkedAt = process.env.CHECKED_AT || new Date().toISOString().slice(0, 10);
const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);
const MAX_INDEX_PAGES = 20;

const UFCSTATS_NAME_ALIASES = new Map([
  ["bobbygreen", "King Green"],
]);

function compactName(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function clean(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function urlId(value, segment) {
  const match = String(value).match(new RegExp(`/${segment}/([^/?#]+)`));
  return match?.[1] ?? "";
}

function parseDate(value) {
  const match = clean(value).match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},\s+\d{4}\b/i);
  if (!match) return null;
  const parsed = Date.parse(match[0].replace(/([A-Za-z]{3})\./, "$1"));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : null;
}

function parseInteger(value) {
  const normalized = clean(value);
  if (!/^\d+$/.test(normalized)) return null;
  return Number(normalized);
}

function parseTimeSeconds(value) {
  const match = clean(value).match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (minutes > 5 || seconds > 59) return null;
  return minutes * 60 + seconds;
}

function profileIndexLetter(name) {
  const parts = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  while (["jr", "sr", "ii", "iii", "iv"].includes(parts.at(-1) ?? "")) parts.pop();
  const initial = parts.at(-1)?.[0] ?? "";
  if (!/^[a-z]$/.test(initial)) throw new Error(`Cannot determine UFCStats index letter for ${name}.`);
  return initial;
}

function chromePath() {
  return [
    process.env.OCTAGON_CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean).find((candidate) => existsSync(candidate)) ?? null;
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForJson(url, attempts = 160) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response.json();
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw lastError ?? new Error(`${url} did not become ready.`);
}

async function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGTERM");
    else child.kill("SIGTERM");
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    if (this.socket.readyState !== WebSocket.OPEN) {
      await new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve, { once: true });
        this.socket.addEventListener("error", reject, { once: true });
      });
    }
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    try { this.socket.close(); } catch { /* browser may already be gone */ }
  }
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result?.exceptionDetails) throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
  return result?.result?.value;
}

async function navigateAndExtract(client, url, readyExpression, extractExpression) {
  await client.send("Page.navigate", { url: url.replace(/^http:/i, "https:") });
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const state = await evaluate(client, `(() => ({
      ready: Boolean(${readyExpression}),
      text: document.body?.innerText?.slice(0, 120) ?? "",
      href: location.href,
    }))()`);
    if (state?.ready) return evaluate(client, extractExpression);
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error(`UFCStats page did not become ready: ${url}`);
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

async function createUfcStatsBrowser() {
  const chrome = chromePath();
  if (!chrome) throw new Error("Chrome is required to refresh canonical UFCStats fight facts.");
  const debugPort = await freePort();
  const profileDir = mkdtempSync(path.join(tmpdir(), "octagon-ufcstats-"));
  const spawnOptions = { stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" };
  let browserLog = "";
  const browser = spawn(chrome, [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ], spawnOptions);
  browser.stdout.on("data", (chunk) => { browserLog += String(chunk); });
  browser.stderr.on("data", (chunk) => { browserLog += String(chunk); });

  try {
    const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    if (!pageTarget) throw new Error("Chrome did not expose a debuggable page target.");
    const client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.open();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    return {
      client,
      async close() {
        client.close();
        await terminate(browser);
        rmSync(profileDir, { recursive: true, force: true });
      },
      browserLog: () => browserLog,
    };
  } catch (error) {
    await terminate(browser);
    rmSync(profileDir, { recursive: true, force: true });
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nChrome:\n${browserLog}`);
  }
}

const INDEX_EXTRACT = `(() => [...document.querySelectorAll('.b-statistics__table-row')].map((row) => {
  const cells = [...row.querySelectorAll('td.b-statistics__table-col')];
  if (cells.length < 2) return null;
  const first = (cells[0]?.innerText ?? '').trim();
  const last = (cells[1]?.innerText ?? '').trim();
  const url = row.querySelector('a[href*="/fighter-details/"]')?.href ?? '';
  return url ? { first, last, url } : null;
}).filter(Boolean))()`;

const FIGHTER_FIGHTS_EXTRACT = `(() => [...document.querySelectorAll('.b-fight-details__table-row')].map((row) => {
  const fightUrl = row.getAttribute('data-link') ?? '';
  const cells = [...row.querySelectorAll('td')];
  if (!fightUrl || cells.length < 10) return null;
  const fighterNames = [...cells[1].querySelectorAll('a[href*="/fighter-details/"]')].map((node) => node.textContent?.trim() ?? '').filter(Boolean);
  const kd = [...cells[2].querySelectorAll('p')].map((node) => node.textContent?.trim() ?? '').filter(Boolean);
  const eventLink = cells[6].querySelector('a[href*="/event-details/"]');
  return {
    fightUrl,
    fighterNames,
    kd,
    eventUrl: eventLink?.href ?? '',
    eventText: cells[6]?.innerText ?? '',
    methodText: cells[7]?.innerText ?? '',
    round: cells[8]?.innerText ?? '',
    time: cells[9]?.innerText ?? '',
  };
}).filter(Boolean))()`;

const EVENT_FIGHTS_EXTRACT = `(() => [...document.querySelectorAll('.b-fight-details__table-row')].map((row) => {
  const fightUrl = row.getAttribute('data-link') ?? '';
  if (!fightUrl) return null;
  const markers = [...row.querySelectorAll('a.b-flag')].map((node) => ({
    text: node.textContent ?? '',
    title: node.getAttribute('title') ?? '',
    aria: node.getAttribute('aria-label') ?? '',
    html: node.outerHTML ?? '',
  }));
  return { fightUrl, markers };
}).filter(Boolean))()`;

async function resolveProfileUrl(client, fighterName, indexCache) {
  const alias = UFCSTATS_NAME_ALIASES.get(compactName(fighterName)) ?? fighterName;
  const target = compactName(alias);
  const letter = profileIndexLetter(alias);
  for (let page = 1; page <= MAX_INDEX_PAGES; page += 1) {
    const key = `${letter}:${page}`;
    let rows = indexCache.get(key);
    if (!rows) {
      rows = await navigateAndExtract(
        client,
        `https://ufcstats.com/statistics/fighters?char=${letter}&page=${page}`,
        "document.querySelector('.b-statistics__table-row')",
        INDEX_EXTRACT,
      );
      indexCache.set(key, rows);
    }
    const exact = rows.filter((row) => compactName(`${row.first} ${row.last}`) === target);
    if (exact.length === 1) return exact[0].url;
    if (exact.length > 1) throw new Error(`UFCStats returned multiple exact fighter rows for ${fighterName}.`);
    if (rows.length === 0) break;
  }
  throw new Error(`UFCStats fighter profile not found for ${fighterName}${alias !== fighterName ? ` (alias ${alias})` : ""}.`);
}

function matchCanonicalFight(fighter, fight, rows) {
  const opponentKey = compactName(fight.opponent);
  const matches = rows.filter((row) => (
    parseDate(row.eventText) === fight.date
    && row.fighterNames.some((name) => compactName(name) === opponentKey)
  ));
  if (matches.length !== 1) {
    throw new Error(`${fighter.name} ${fight.id} (${fight.date} vs ${fight.opponent}) matched ${matches.length} UFCStats rows.`);
  }
  return matches[0];
}

function knockdownFact(fighter, fight, row) {
  if (row.fighterNames.length !== 2 || row.kd.length !== 2) return { status: "unavailable" };
  const opponentIndex = row.fighterNames.findIndex((name) => compactName(name) === compactName(fight.opponent));
  if (opponentIndex < 0) return { status: "unavailable" };
  const fighterIndex = opponentIndex === 0 ? 1 : 0;
  const forValue = parseInteger(row.kd[fighterIndex]);
  const againstValue = parseInteger(row.kd[opponentIndex]);
  return forValue == null || againstValue == null
    ? { status: "unavailable" }
    : { status: "verified", for: forValue, against: againstValue };
}

function finishFact(fight, row) {
  if (!FINISH_METHODS.has(fight.methodCategory)) return { status: "not-applicable" };
  const round = parseInteger(row.round);
  const timeSeconds = parseTimeSeconds(row.time);
  return round == null || round < 1 || round > 5 || timeSeconds == null
    ? { status: "unavailable" }
    : { status: "verified", round, timeSeconds };
}

function bonusType(marker) {
  const raw = `${marker.text} ${marker.title} ${marker.aria} ${marker.html}`.toLowerCase();
  if (/\bperf(?:ormance)?\b/.test(raw)) return "performance-of-the-night";
  if (/\bfight\b/.test(raw)) return "fight-of-the-night";
  if (/\bko\b|knockout/.test(raw)) return "knockout-of-the-night";
  if (/\bsub\b|submission/.test(raw)) return "submission-of-the-night";
  return null;
}

const fighters = await loadCanonicalFighters();
const totalFights = fighters.reduce((sum, fighter) => sum + fighter.fights.length, 0);
console.log(`Refreshing UFCStats supplemental facts for ${fighters.length} canonical fighters / ${totalFights} fight rows.`);

const browser = await createUfcStatsBrowser();
try {
  const indexCache = new Map();
  const staged = [];
  const eventUrls = new Map();

  for (let fighterIndex = 0; fighterIndex < fighters.length; fighterIndex += 1) {
    const fighter = fighters[fighterIndex];
    const profileUrl = await resolveProfileUrl(browser.client, fighter.name, indexCache);
    const rows = await navigateAndExtract(
      browser.client,
      profileUrl,
      "document.querySelector('.b-fight-details__table-row')",
      FIGHTER_FIGHTS_EXTRACT,
    );

    for (const fight of fighter.fights) {
      const row = matchCanonicalFight(fighter, fight, rows);
      const eventId = urlId(row.eventUrl, "event-details");
      const fightId = urlId(row.fightUrl, "fight-details");
      if (!eventId || !fightId) throw new Error(`UFCStats source IDs are missing for ${fighter.name} ${fight.id}.`);
      eventUrls.set(eventId, row.eventUrl);
      staged.push({
        fighterId: fighter.slug,
        canonicalFightId: fight.id,
        eventId,
        sourceFightId: fightId,
        eventUrl: row.eventUrl,
        supplementalFacts: {
          source: { provider: "ufcstats", eventId, fightId, checkedAt },
          mainEvent: { status: "unavailable" },
          bonuses: { status: "unavailable" },
          finish: finishFact(fight, row),
          knockdowns: knockdownFact(fighter, fight, row),
        },
      });
    }
    console.log(`Matched ${fighterIndex + 1}/${fighters.length}: ${fighter.name} (${fighter.fights.length} fights).`);
  }

  const eventFacts = new Map();
  let eventIndex = 0;
  for (const [eventId, eventUrl] of eventUrls) {
    eventIndex += 1;
    const rows = await navigateAndExtract(
      browser.client,
      eventUrl,
      "document.querySelector('.b-fight-details__table-row[data-link]')",
      EVENT_FIGHTS_EXTRACT,
    );
    if (!rows.length) throw new Error(`UFCStats event ${eventId} has no completed fight rows.`);
    rows.forEach((row, index) => {
      const fightId = urlId(row.fightUrl, "fight-details");
      if (!fightId) return;
      const bonuses = [];
      for (const marker of row.markers) {
        const type = bonusType(marker);
        if (!type) {
          throw new Error(`Unrecognized UFCStats bonus marker on ${eventId}/${fightId}: ${marker.html}`);
        }
        if (!bonuses.includes(type)) bonuses.push(type);
      }
      eventFacts.set(`${eventId}:${fightId}`, {
        mainEvent: { status: "verified", value: index === 0 },
        bonuses: { status: "verified", values: bonuses },
      });
    });
    if (eventIndex % 25 === 0 || eventIndex === eventUrls.size) {
      console.log(`Audited ${eventIndex}/${eventUrls.size} UFCStats events.`);
    }
  }

  const entries = staged.map((entry) => {
    const event = eventFacts.get(`${entry.eventId}:${entry.sourceFightId}`);
    if (!event) throw new Error(`UFCStats event row missing for ${entry.eventId}/${entry.sourceFightId}.`);
    return {
      fighterId: entry.fighterId,
      canonicalFightId: entry.canonicalFightId,
      supplementalFacts: {
        ...entry.supplementalFacts,
        mainEvent: event.mainEvent,
        bonuses: event.bonuses,
      },
    };
  }).sort((left, right) => (
    left.fighterId.localeCompare(right.fighterId)
    || left.canonicalFightId.localeCompare(right.canonicalFightId)
  ));

  const uniqueKeys = new Set(entries.map((entry) => `${entry.fighterId}:${entry.canonicalFightId}`));
  if (uniqueKeys.size !== entries.length || entries.length !== totalFights) {
    throw new Error(`Snapshot key reconciliation failed: ${uniqueKeys.size} unique / ${entries.length} entries / ${totalFights} canonical fights.`);
  }

  const coverage = {
    fighters: fighters.length,
    fights: entries.length,
    events: eventUrls.size,
    mainEventVerified: entries.filter((entry) => entry.supplementalFacts.mainEvent.status === "verified").length,
    bonusesVerified: entries.filter((entry) => entry.supplementalFacts.bonuses.status === "verified").length,
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
    canonicalSourceSha: process.env.CANONICAL_SOURCE_SHA || null,
    coverage,
    entries,
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(root, outputPath)}.`);
  console.log(JSON.stringify(coverage));
} catch (error) {
  throw new Error(`${error instanceof Error ? error.message : String(error)}\nChrome:\n${browser.browserLog()}`);
} finally {
  await browser.close();
}
