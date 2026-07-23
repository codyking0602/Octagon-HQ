import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import process from "node:process";
import { JSDOM, VirtualConsole } from "jsdom";

const EXPECTED_FIGHTERS = 80;
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
const v1Commit = requiredArgument("v1-commit");
const outputPath = resolve(requiredArgument("output"));
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
  <head><meta charset="utf-8"><title>V1 ranking parity capture</title></head>
  <body>
    <script src="/assets/data/ranking-data.js"></script>
    <script src="/assets/data/display-overrides.js"></script>
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
      if (request.url?.startsWith("/__ranking-parity-capture.html")) {
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
  window.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
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

async function waitForProjection(window, errors) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const projection = window.UFC_CALCULATED_RANKING_PROJECTION;
    const lifecycle = window.UFC_PRODUCTION_RANKING_BOOTSTRAP_LIFECYCLE;
    if (projection && lifecycle?.status === "ready") return projection;
    if (lifecycle?.status === "error") {
      const message = lifecycle.result?.error || window.UFC_PRODUCTION_RANKING_BOOTSTRAP?.error || "Unknown V1 bootstrap error.";
      throw new Error(`V1 production ranking bootstrap failed: ${message}\n${errors.join("\n")}`);
    }
    await new Promise((resolvePromise) => window.setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out waiting for V1 production ranking readiness.\n${errors.join("\n")}`);
}

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be a finite number; received ${String(value)}.`);
  return number;
}

function penaltyTraceFor(window, fighter) {
  const entry = window.UFC_CATEGORY_CALCULATORS?.entryFor?.(fighter);
  const trace = entry?.traces?.penalty;
  if (!trace) throw new Error(`Missing production penalty trace for ${fighter}.`);
  return {
    reconstructedPenalty: finiteNumber(trace.reconstructedPenalty, `${fighter} reconstructedPenalty`),
    exposure: finiteNumber(trace.exposure, `${fighter} penalty exposure`),
    severity: finiteNumber(trace.severity, `${fighter} penalty severity`),
    frequency: finiteNumber(trace.frequency, `${fighter} penalty frequency`),
    primeVolumeFloor: finiteNumber(trace.primeVolumeFloor, `${fighter} primeVolumeFloor`),
    preDivision: finiteNumber(trace.preDivision, `${fighter} preDivision`),
    divisionMultiplier: finiteNumber(trace.divisionMultiplier, `${fighter} divisionMultiplier`),
    divisionDiscountPct: finiteNumber(trace.divisionDiscountPct, `${fighter} divisionDiscountPct`),
    events: (trace.events || []).map((event) => ({
      fightId: event.fightId || null,
      date: event.date || null,
      opponent: event.opponent || null,
      phase: event.phase || null,
      qualityTier: event.qualityTier || null,
      elite: Boolean(event.elite),
      finished: Boolean(event.finished),
      upwardDivision: Boolean(event.upwardDivision),
      competitive: Boolean(event.competitive),
      technicalException: Boolean(event.technicalException),
      penaltyEligible: Boolean(event.penaltyEligible),
      methodCategory: event.methodCategory || null,
      divisionContext: event.divisionContext || null,
      overrideRule: event.overrideRule || null,
      base: event.base === null ? null : finiteNumber(event.base, `${fighter} penalty base`),
      finishExtra: event.finishExtra === null ? null : finiteNumber(event.finishExtra, `${fighter} finishExtra`),
      rawPenalty: event.rawPenalty === null ? null : finiteNumber(event.rawPenalty, `${fighter} rawPenalty`),
    })),
  };
}

function fixtureRow(window, row) {
  const weighted = row.weightedScoreBreakdown;
  if (!weighted) throw new Error(`Missing weighted score breakdown for ${row.fighter}.`);
  return {
    fighter: row.fighter,
    board: row.board,
    rank: finiteNumber(row.rank, `${row.fighter} rank`),
    categories: {
      championship: finiteNumber(row.championship, `${row.fighter} championship`),
      opponentQuality: finiteNumber(row.opponentQuality, `${row.fighter} opponentQuality`),
      primeDominance: finiteNumber(row.primeDominance, `${row.fighter} primeDominance`),
      longevity: finiteNumber(row.longevity, `${row.fighter} longevity`),
    },
    modifiers: {
      apex: finiteNumber(row.apexPeak, `${row.fighter} apex`),
      penalty: finiteNumber(row.penalty, `${row.fighter} penalty`),
      eraDepth: finiteNumber(row.eraDepthAdjustment, `${row.fighter} eraDepth`),
    },
    weighted: {
      championship: finiteNumber(weighted.championship, `${row.fighter} weighted championship`),
      opponentQuality: finiteNumber(weighted.opponentQuality, `${row.fighter} weighted opponentQuality`),
      primeDominance: finiteNumber(weighted.primeDominance, `${row.fighter} weighted primeDominance`),
      longevity: finiteNumber(weighted.longevity, `${row.fighter} weighted longevity`),
    },
    totals: {
      baseScore: finiteNumber(weighted.baseScore, `${row.fighter} baseScore`),
      preEraDepthTotalScore: finiteNumber(weighted.preEraDepthTotalScore, `${row.fighter} preEraDepthTotalScore`),
      modifierScore: finiteNumber(weighted.modifierScore, `${row.fighter} modifierScore`),
      totalScore: finiteNumber(row.totalScore, `${row.fighter} totalScore`),
    },
    tieBreakers: {
      totalScore: finiteNumber(row.totalScore, `${row.fighter} tie totalScore`),
      championship: finiteNumber(row.championship, `${row.fighter} tie championship`),
      opponentQuality: finiteNumber(row.opponentQuality, `${row.fighter} tie opponentQuality`),
      fighter: row.fighter,
    },
    ovr: finiteNumber(row.overallOvr, `${row.fighter} OVR`),
    visibleStats: JSON.parse(JSON.stringify(row.visibleStats || {})),
    penaltyTrace: penaltyTraceFor(window, row.fighter),
  };
}

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => errors.push(`[jsdom] ${error.message}`));
virtualConsole.on("error", (...values) => errors.push(`[console.error] ${values.map(String).join(" ")}`));

const { server, origin } = await startServer();
let dom;
try {
  dom = await JSDOM.fromURL(`${origin}/__ranking-parity-capture.html`, {
    beforeParse: installBrowserStubs,
    pretendToBeVisual: true,
    resources: "usable",
    runScripts: "dangerously",
    virtualConsole,
  });

  const projection = await waitForProjection(dom.window, errors);
  if (projection.rows?.length !== EXPECTED_FIGHTERS) {
    throw new Error(`Expected ${EXPECTED_FIGHTERS} calculated fighters; received ${projection.rows?.length || 0}.`);
  }
  if (projection.categoryAudit?.passed !== true) throw new Error("V1 production category audit did not pass.");

  const rows = [...projection.men, ...projection.women].map((row) => fixtureRow(dom.window, row));
  const fixture = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    source: {
      repository: "codyking0602/ufc-goat-rankings",
      commit: v1Commit,
      captureEvent: "ufc-production-ranking-ready",
      projectionGlobal: "UFC_CALCULATED_RANKING_PROJECTION",
      factsVersion: projection.sourceFactsVersion,
      categoryCalculatorVersion: projection.sourceCategoryVersion,
      rankingPipelineVersion: projection.version,
      modelAsOfDate: dom.window.UFC_CANONICAL_FIGHTER_FACTS?.modelAsOfDate || null,
    },
    contract: {
      categoryMax: projection.categoryMax,
      weights: JSON.parse(JSON.stringify(projection.weights)),
      ovr: JSON.parse(JSON.stringify(projection.ovr)),
      tieBreakOrder: ["totalScore:desc", "championship:desc", "opponentQuality:desc", "fighter:asc"],
    },
    counts: {
      fighters: rows.length,
      men: projection.men.length,
      women: projection.women.length,
    },
    boards: {
      men: projection.men.map((row) => row.fighter),
      women: projection.women.map((row) => row.fighter),
    },
    fighters: rows,
  };

  await mkdir(resolve(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");
  console.log(`Captured ${rows.length} V1 production ranking rows to ${outputPath}.`);
} finally {
  dom?.window.close();
  await new Promise((resolvePromise) => server.close(resolvePromise));
}
