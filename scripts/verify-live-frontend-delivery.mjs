const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const DEFAULT_ORIGIN = "https://octagon.hq-app.workers.dev";
const DEFAULT_ATTEMPTS = 12;
const DEFAULT_DELAY_MS = 5_000;

const REQUIRED_JAVASCRIPT_MARKERS = [
  "vite:preloadError",
  "deployment.json",
  "octagon-hq:update-target-sha",
];

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2] ?? "";
}

function normalizedAssetPath(value, origin) {
  if (!value) return "";
  try {
    const url = new URL(value, `${origin}/`);
    if (url.origin !== origin) return "";
    if (!url.pathname.startsWith("/assets/")) return "";
    if (!/\.(?:js|css)$/i.test(url.pathname)) return "";
    return url.pathname;
  } catch {
    return "";
  }
}

export function extractShellAssetReferences(html, origin = DEFAULT_ORIGIN) {
  const references = new Set();
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const isScript = /^<script\b/i.test(tag);
    const rel = attribute(tag, "rel").toLowerCase().split(/\s+/);
    if (!isScript && !rel.includes("stylesheet") && !rel.includes("modulepreload")) continue;
    const path = normalizedAssetPath(attribute(tag, isScript ? "src" : "href"), origin);
    if (path) references.add(path);
  }
  return [...references].sort();
}

async function responseText(response, label) {
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}.`);
  return response.text();
}

async function fetchNoCache(url, fetchFn) {
  return fetchFn(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
    },
    redirect: "follow",
  });
}

async function verifyAttempt({ origin, expectedSha, attempt, fetchFn }) {
  const shellUrl = new URL("/", `${origin}/`);
  shellUrl.searchParams.set("delivery", expectedSha);
  shellUrl.searchParams.set("attempt", String(attempt));
  const shellResponse = await fetchNoCache(shellUrl, fetchFn);
  const shell = await responseText(shellResponse, "Live SPA shell");
  const cacheControl = shellResponse.headers.get("cache-control")?.toLowerCase() ?? "";
  if (!cacheControl.includes("no-cache")) {
    throw new Error(`Live SPA shell cache policy is ${cacheControl || "missing"}, expected no-cache.`);
  }

  const markerUrl = new URL("/deployment.json", `${origin}/`);
  markerUrl.searchParams.set("delivery", expectedSha);
  markerUrl.searchParams.set("attempt", String(attempt));
  const markerResponse = await fetchNoCache(markerUrl, fetchFn);
  const markerText = await responseText(markerResponse, "Live deployment marker");
  let marker;
  try {
    marker = JSON.parse(markerText);
  } catch {
    throw new Error("Live deployment marker did not return valid JSON.");
  }
  if (marker?.sha !== expectedSha) {
    throw new Error(`Live deployment marker is ${marker?.sha ?? "missing"}, expected ${expectedSha}.`);
  }

  const references = extractShellAssetReferences(shell, origin);
  const javascript = references.filter((path) => path.endsWith(".js"));
  const stylesheets = references.filter((path) => path.endsWith(".css"));
  if (!javascript.length || !stylesheets.length) {
    throw new Error(`Live shell references ${javascript.length} JavaScript and ${stylesheets.length} CSS assets.`);
  }
  for (const path of references) {
    if (!/^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:js|css)$/.test(path)) {
      throw new Error(`Live shell references a non-fingerprinted application asset: ${path}.`);
    }
  }

  const javascriptSources = [];
  const stylesheetSources = [];
  for (const path of references) {
    const assetUrl = new URL(path, `${origin}/`);
    assetUrl.searchParams.set("delivery", expectedSha);
    assetUrl.searchParams.set("attempt", String(attempt));
    const response = await fetchNoCache(assetUrl, fetchFn);
    const source = await responseText(response, `Live asset ${path}`);
    if (/<!doctype html/i.test(source)) {
      throw new Error(`Live asset ${path} resolved to the SPA fallback.`);
    }
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (path.endsWith(".css")) {
      if (!contentType.includes("text/css")) {
        throw new Error(`Live stylesheet ${path} returned ${contentType || "no content type"}.`);
      }
      stylesheetSources.push(source);
    } else {
      if (!contentType.includes("javascript")) {
        throw new Error(`Live JavaScript ${path} returned ${contentType || "no content type"}.`);
      }
      javascriptSources.push(source);
    }
  }

  const liveJavascript = javascriptSources.join("\n");
  const liveCss = stylesheetSources.join("\n");
  if (!liveJavascript.includes(expectedSha)) {
    throw new Error(`The JavaScript loaded by the live shell does not contain deployment ${expectedSha}.`);
  }
  for (const markerValue of REQUIRED_JAVASCRIPT_MARKERS) {
    if (!liveJavascript.includes(markerValue)) {
      throw new Error(`The JavaScript loaded by the live shell is missing ${markerValue}.`);
    }
  }
  if (!liveCss.includes(".app-shell") || !liveCss.includes(".identity-trigger")) {
    throw new Error("The CSS loaded by the live shell is not the Octagon HQ application stylesheet.");
  }

  return {
    expectedSha,
    javascriptAssets: javascript.length,
    stylesheetAssets: stylesheets.length,
    references,
  };
}

export async function verifyLiveFrontendDelivery({
  origin = DEFAULT_ORIGIN,
  expectedSha,
  attempts = DEFAULT_ATTEMPTS,
  delayMs = DEFAULT_DELAY_MS,
  fetchFn = fetch,
} = {}) {
  const normalizedOrigin = origin.replace(/\/$/, "");
  const normalizedSha = String(expectedSha ?? "").trim().toLowerCase();
  if (!SHA_PATTERN.test(normalizedSha)) {
    throw new Error("An exact 40-character deployment SHA is required.");
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await verifyAttempt({
        origin: normalizedOrigin,
        expectedSha: normalizedSha,
        attempt,
        fetchFn,
      });
    } catch (error) {
      lastError = error;
      console.log(
        `Live frontend delivery verification attempt ${attempt} failed: ${error instanceof Error ? error.message : error}`,
      );
      if (attempt < attempts) await wait(delayMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Live frontend delivery verification failed.");
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = await verifyLiveFrontendDelivery({
    origin: process.env.OCTAGON_PRODUCTION_ORIGIN ?? DEFAULT_ORIGIN,
    expectedSha: process.env.EXPECTED_SOURCE_SHA ?? process.env.SOURCE_SHA,
    attempts: Number(process.env.FRONTEND_DELIVERY_ATTEMPTS ?? DEFAULT_ATTEMPTS),
    delayMs: Number(process.env.FRONTEND_DELIVERY_DELAY_MS ?? DEFAULT_DELAY_MS),
  });
  console.log(
    `PASS: live shell loads deployment ${result.expectedSha} through ${result.javascriptAssets} JavaScript and ${result.stylesheetAssets} CSS assets.`,
  );
}

// Verification-only trigger for merged main 60ac1aadb9c056bd0536babef330289ee1ea40f2; no behavior change.
