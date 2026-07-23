import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
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
  <head><meta charset="utf-8"><title>V1 ranking input capture</title></head>
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
      if (request.url?.startsWith("/__ranking-input-capture.html")) {
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

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be a finite number; received ${String(value)}.`);
  return number;
}

function finiteOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizedName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´'."]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") ?? null;
}

function assetSlug(...paths) {
  const path = paths.find((value) => typeof value === "string" && value.trim());
  if (!path) return null;
  const filename = basename(path.split("?")[0]);
  const slug = filename.replace(/-thumb\.webp$/i, "").replace(/\.webp$/i, "");
  return slug && slug !== filename ? slug : null;
}

function normalizeJudgmentCalls(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (Array.isArray(entry)) {
        const title = String(entry[0] || "").trim();
        const detail = String(entry[1] || "").trim();
        return [title, detail].filter(Boolean).join(": ");
      }
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object") {
        const title = String(entry.title || entry.label || "").trim();
        const detail = String(entry.detail || entry.text || entry.note || "").trim();
        return [title, detail].filter(Boolean).join(": ");
      }
      return "";
    })
    .filter(Boolean);
}

function mapFight(fight) {
  const audited = fight?.rounds?.status === "audited";
  const classification = fight?.lossClassification || {};
  const championship = fight?.championshipContext || {};
  return {
    id: String(fight?.id || ""),
    date: String(fight?.date || ""),
    opponent: String(fight?.opponent || ""),
    officialResult: String(fight?.officialResult || ""),
    scoringDisposition: String(fight?.scoringDisposition || ""),
    methodCategory: String(fight?.method?.category || "other"),
    qualityTier: String(fight?.opponentContext?.qualityTier || "none"),
    championshipType: String(championship.type || "none"),
    championshipEligible: championship.fighterEligible !== false,
    championshipOpponentStrength: finiteOrNull(championship.opponentStrength),
    championshipManualCredit: finiteOrNull(championship.manualCredit),
    rounds: {
      status: audited ? "audited" : "unavailable",
      won: audited ? finiteNumber(fight.rounds.won || 0, `${fight.id} rounds won`) : 0,
      lost: audited ? finiteNumber(fight.rounds.lost || 0, `${fight.id} rounds lost`) : 0,
      drawn: audited ? finiteNumber(fight.rounds.drawn || 0, `${fight.id} rounds drawn`) : 0,
    },
    lossClassification: {
      competitive: classification.competitive !== false,
      divisionContext: classification.divisionContext === "upward" ? "upward" : "home",
      overrideRule: classification.overrideRule || null,
    },
  };
}

function presentationFor(window, row, record) {
  const override = window.DISPLAY_OVERRIDES?.[row.fighter] || {};
  const primaryDivision = firstValue(row.primaryDivision, record?.identity?.primaryDivision, "");
  const secondaryDivision = firstValue(
    row.secondaryDivision,
    Array.isArray(record?.identity?.secondaryDivisions) ? record.identity.secondaryDivisions.join(" / ") : null,
    "",
  );
  const divisionLabel = firstValue(
    row.divisionLabel,
    override.divisionLabel,
    [primaryDivision, secondaryDivision].filter(Boolean).join(" / "),
    "UFC",
  );
  const photoUrl = firstValue(row.photoUrl, row.profileUrl, override.photoUrl, override.profileUrl);
  const thumbUrl = firstValue(row.thumbUrl, override.thumbUrl);
  const slug = firstValue(row.slug, override.slug, assetSlug(thumbUrl, photoUrl), slugify(row.fighter));
  const oneLiner = firstValue(
    row.oneLiner,
    override.oneLiner,
    `${row.fighter} is ranked from a UFC-only calculation of championship value, opponent quality, prime dominance, and elite longevity.`,
  );
  const whyRankedHere = firstValue(
    row.whyRankedHere,
    override.whyRankedHere,
    `${row.fighter}'s position is produced by the complete UFC-only scoring model rather than a manual ranking slot.`,
  );
  const whyNotHigher = firstValue(
    row.whyNotHigher,
    override.whyNotHigher,
    `The fighters above ${row.fighter} currently have stronger combined UFC-only category and modifier totals.`,
  );

  return {
    slug,
    primaryDivision,
    secondaryDivision,
    divisionLabel,
    resumeTag: firstValue(row.resumeTag, override.resumeTag, "UFC-only all-time case"),
    oneLiner,
    whyRankedHere,
    whyNotHigher,
    finalTakeaway: firstValue(row.finalTakeaway, override.finalTakeaway, oneLiner),
    keyJudgmentCalls: normalizeJudgmentCalls(
      firstValue(row.keyJudgmentCalls, row.judgmentCalls, override.keyJudgmentCalls, override.bigAssumptions, []),
    ),
    photoUrl,
    thumbUrl,
  };
}

function eraDepthInputFor(window, fighter) {
  const key = normalizedName(fighter);
  const shadow = window.UFC_DIVISION_ERA_DEPTH_SHADOW;
  const resolutionApi = window.UFC_CANONICAL_DIVISION_ERA_DEPTH_APPROVED_RESOLUTIONS;
  const direct = (shadow?.fighters || []).find((row) => normalizedName(row?.fighter) === key) || null;
  const resolution = resolutionApi?.entryFor?.(fighter) || null;
  const source = direct || resolution?.sourceRow || null;
  const trace = window.UFC_CATEGORY_CALCULATORS?.entryFor?.(fighter)?.traces?.eraDepth || null;
  const depthIndex = finiteOrNull(source?.depthIndex ?? trace?.depthIndex);
  const approvedAdjustment = finiteOrNull(resolution?.approvedAdjustment);
  if (depthIndex === null) throw new Error(`Missing era-depth input for ${fighter}.`);
  return { fighter, depthIndex, approvedAdjustment };
}

function inputRow(window, projectionRow) {
  const fighter = projectionRow.fighter;
  const facts = window.UFC_CANONICAL_FIGHTER_FACTS;
  const judgments = window.UFC_CANONICAL_SCORING_JUDGMENTS;
  const eraApi = window.UFC_FIGHTER_ERA_LEDGERS;
  const record = facts?.get?.(fighter);
  const era = eraApi?.entryFor?.(fighter);
  const championship = judgments?.entryFor?.("championship", fighter);
  const opponentQuality = judgments?.entryFor?.("opponentQuality", fighter);
  const apex = judgments?.entryFor?.("apex", fighter);

  if (!record) throw new Error(`Missing canonical fighter facts for ${fighter}.`);
  if (!era?.window || !era?.longevity) throw new Error(`Missing shared fighter era ledger for ${fighter}.`);
  if (!championship || !opponentQuality || !apex) throw new Error(`Missing scoring judgment inputs for ${fighter}.`);

  return {
    fighter,
    board: projectionRow.board,
    facts: {
      identity: {
        primaryDivision: String(record?.identity?.primaryDivision || ""),
        secondaryDivisions: clone(record?.identity?.secondaryDivisions || []),
      },
      primeWindow: {
        startFightId: String(record?.primeWindow?.startFightId || ""),
        endFightId: record?.primeWindow?.open ? null : (record?.primeWindow?.endFightId || null),
        open: Boolean(record?.primeWindow?.open),
      },
      gapCapMonths: finiteNumber(record?.longevityContext?.gapCapMonths || 18, `${fighter} canonical gap cap`),
      fights: (record.fights || []).map(mapFight),
    },
    era: {
      window: {
        start: String(era.window.start || ""),
        end: era.window.end || null,
      },
      statusMultiplier: finiteNumber(era.longevity.statusMultiplier || 1, `${fighter} status multiplier`),
      divisionMultiplier: finiteNumber(era.longevity.divisionMultiplier || 1, `${fighter} division multiplier`),
    },
    judgments: {
      championship: { fighter, ...clone(championship) },
      opponentQuality: { fighter, ...clone(opponentQuality) },
      apex: { fighter, ...clone(apex) },
    },
    eraDepth: eraDepthInputFor(window, fighter),
    presentation: presentationFor(window, projectionRow, record),
  };
}

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => errors.push(`[jsdom] ${error.message}`));
virtualConsole.on("error", (...values) => errors.push(`[console.error] ${values.map(String).join(" ")}`));

const { server, origin } = await startServer();
let dom;
try {
  dom = await JSDOM.fromURL(`${origin}/__ranking-input-capture.html`, {
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

  const fighters = [...projection.men, ...projection.women].map((row) => inputRow(dom.window, row));
  const slugs = new Set(fighters.map((row) => row.presentation.slug));
  if (slugs.size !== fighters.length) throw new Error("Captured presentation slugs are not unique.");

  const dataset = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    source: {
      repository: "codyking0602/ufc-goat-rankings",
      commit: v1Commit,
      factsVersion: dom.window.UFC_CANONICAL_FIGHTER_FACTS?.version || null,
      judgmentVersion: dom.window.UFC_CANONICAL_SCORING_JUDGMENTS?.version || null,
      eraLedgerVersion: dom.window.UFC_FIGHTER_ERA_LEDGERS?.version || null,
      eraDepthVersion: dom.window.UFC_DIVISION_ERA_DEPTH_SHADOW?.version || null,
      eraDepthResolutionVersion: dom.window.UFC_CANONICAL_DIVISION_ERA_DEPTH_APPROVED_RESOLUTIONS?.version || null,
      modelAsOfDate: dom.window.UFC_CANONICAL_FIGHTER_FACTS?.modelAsOfDate || null,
    },
    counts: {
      fighters: fighters.length,
      men: fighters.filter((row) => row.board === "men").length,
      women: fighters.filter((row) => row.board === "women").length,
    },
    fighters,
  };

  await mkdir(resolve(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Captured ${fighters.length} complete V1 ranking input rows to ${outputPath}.`);
} finally {
  dom?.window.close();
  await new Promise((resolvePromise) => server.close(resolvePromise));
}
