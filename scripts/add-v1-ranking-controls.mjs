import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import process from "node:process";
import { JSDOM, VirtualConsole } from "jsdom";

const DEFAULT_TIMEOUT_MS = 90_000;

function readArgument(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function requiredArgument(name) {
  const value = readArgument(name);
  if (!value) throw new Error(`Missing required --${name} argument.`);
  return value;
}

const v1Directory = resolve(requiredArgument("v1-dir"));
const inputPath = resolve(requiredArgument("input"));
const timeoutMs = Number(readArgument("timeout-ms", DEFAULT_TIMEOUT_MS));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const captureHtml = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>V1 ranking controls capture</title></head>
  <body>
    <script src="/assets/data/ranking-data.js"></script>
    <script src="/assets/data/display-overrides.js"></script>
    <script src="/assets/data/era-filter-data.js"></script>
    <script>window.DISPLAY_OVERRIDES = typeof DISPLAY_OVERRIDES !== "undefined" ? DISPLAY_OVERRIDES : {};</script>
    <script src="/assets/js/production-ranking-bootstrap.js"></script>
  </body>
</html>`;

function safePathname(url) {
  const pathname = decodeURIComponent(new URL(url, "http://127.0.0.1").pathname);
  const relative = pathname.replace(/^\/+/, "");
  const candidate = resolve(v1Directory, relative);
  if (candidate !== v1Directory && !candidate.startsWith(`${v1Directory}${sep}`)) {
    throw new Error(`Blocked path outside V1 checkout: ${pathname}`);
  }
  return candidate;
}

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      if (request.url?.startsWith("/__ranking-controls-capture.html")) {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(captureHtml);
        return;
      }
      const filePath = safePathname(request.url || "/");
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error(`Not a file: ${filePath}`);
      const body = await readFile(filePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      });
      response.end(body);
    } catch (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end(String(error?.message || error));
    }
  });
  await new Promise((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not resolve capture server port.");
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

function installBrowserStubs(window) {
  window.matchMedia ||= () => ({
    matches: false,
    media: "",
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  });
  window.scrollTo = () => {};
  window.open = () => null;
  window.alert = () => {};
  window.requestAnimationFrame ||= (callback) => window.setTimeout(() => callback(Date.now()), 0);
  window.cancelAnimationFrame ||= (id) => window.clearTimeout(id);
  window.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };
  window.IntersectionObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
  window.structuredClone ||= globalThis.structuredClone;
  window.fetch ||= globalThis.fetch;
  window.TextEncoder ||= globalThis.TextEncoder;
  window.TextDecoder ||= globalThis.TextDecoder;
}

async function waitForControls(window, errors) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const lifecycle = window.UFC_PRODUCTION_RANKING_BOOTSTRAP_LIFECYCLE;
    const facts = window.UFC_CANONICAL_FIGHTER_FACTS;
    const filters = window.UFC_ERA_FILTER_DATA;
    if (lifecycle?.status === "ready" && facts?.get && filters?.eras && filters?.curatedMembership) {
      return { facts, filters };
    }
    if (lifecycle?.status === "error") {
      throw new Error(`V1 production ranking bootstrap failed.\n${errors.join("\n")}`);
    }
    await new Promise((resolvePromise) => window.setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out waiting for V1 ranking controls.\n${errors.join("\n")}`);
}

function normalizedName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function deriveEraMembership(fighter, eras, modelAsOfDate) {
  const fights = fighter.facts.fights;
  const startFight = fights.find((fight) => fight.id === fighter.facts.primeWindow.startFightId);
  const endFight = fighter.facts.primeWindow.open
    ? fights.at(-1)
    : fights.find((fight) => fight.id === fighter.facts.primeWindow.endFightId);
  if (!startFight || !endFight) throw new Error(`Cannot derive era membership for ${fighter.fighter}.`);

  const start = Date.parse(`${startFight.date}T00:00:00Z`);
  const endDate = fighter.facts.primeWindow.open ? modelAsOfDate : endFight.date;
  const end = Date.parse(`${endDate}T23:59:59Z`);
  const ranked = eras
    .map((era, index) => {
      const eraStart = Date.UTC(era.startYear, 0, 1);
      const eraEnd = era.endYear === null
        ? Date.parse(`${modelAsOfDate}T23:59:59Z`)
        : Date.UTC(era.endYear, 11, 31, 23, 59, 59);
      const overlap = Math.max(0, Math.min(end, eraEnd) - Math.max(start, eraStart));
      return { era, overlap, index };
    })
    .filter((entry) => entry.overlap > 0)
    .sort(
      (left, right) =>
        right.overlap - left.overlap ||
        right.era.startYear - left.era.startYear ||
        left.index - right.index,
    );

  if (!ranked.length) throw new Error(`No era overlaps the prime window for ${fighter.fighter}.`);
  return {
    primary: ranked[0].era.id,
    secondary: ranked[1]?.era.id ?? null,
  };
}

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => errors.push(`[jsdom] ${error.message}`));
virtualConsole.on("error", (...values) => errors.push(`[console.error] ${values.map(String).join(" ")}`));

const { server, origin } = await startServer();
let dom;
try {
  dom = await JSDOM.fromURL(`${origin}/__ranking-controls-capture.html`, {
    beforeParse: installBrowserStubs,
    pretendToBeVisual: true,
    resources: "usable",
    runScripts: "dangerously",
    virtualConsole,
  });
  const { facts, filters } = await waitForControls(dom.window, errors);
  const dataset = JSON.parse(await readFile(inputPath, "utf8"));

  for (const fighter of dataset.fighters) {
    const record = facts.get(fighter.fighter);
    if (!record) throw new Error(`Missing V1 canonical facts for ${fighter.fighter}.`);
    const sourceFights = new Map((record.fights || []).map((fight) => [fight.id, fight]));
    for (const fight of fighter.facts.fights) {
      const source = sourceFights.get(fight.id);
      if (!source) throw new Error(`Missing V1 fight ${fight.id} for ${fighter.fighter}.`);
      const division = String(source.division || record.identity?.primaryDivision || "").trim();
      if (!division) throw new Error(`Missing division for ${fighter.fighter} fight ${fight.id}.`);
      fight.division = division;
    }
  }

  const eras = filters.eras.map((era) => ({
    id: String(era.id),
    name: String(era.name),
    years: String(era.years),
    startYear: Number(era.startYear),
    endYear: era.endYear === null || era.endYear === undefined ? null : Number(era.endYear),
    description: String(era.description),
  }));
  if (eras.length !== 8) throw new Error(`Expected 8 V1 eras; received ${eras.length}.`);

  const curatedByName = new Map(
    Object.entries(filters.curatedMembership).map(([fighter, membership]) => [
      normalizedName(fighter),
      membership,
    ]),
  );
  const derivedFighters = [];
  const eraMembership = Object.fromEntries(
    dataset.fighters.map((fighter) => {
      const curated = curatedByName.get(normalizedName(fighter.fighter));
      if (curated) {
        return [
          fighter.fighter,
          {
            primary: String(curated.primary),
            secondary: curated.secondary ? String(curated.secondary) : null,
          },
        ];
      }
      derivedFighters.push(fighter.fighter);
      return [
        fighter.fighter,
        deriveEraMembership(fighter, eras, dataset.source.modelAsOfDate),
      ];
    }),
  );

  if (Object.keys(eraMembership).length !== dataset.counts.fighters) {
    throw new Error("Era membership does not cover the complete ranking field.");
  }

  dataset.filters = { eras, eraMembership };
  await writeFile(inputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(
    `Added fight divisions and ${eras.length} eras for ${dataset.fighters.length} fighters. ` +
      `Derived missing memberships for: ${derivedFighters.join(", ") || "none"}.`,
  );
} finally {
  dom?.window.close();
  await new Promise((resolvePromise) => server.close(resolvePromise));
}
