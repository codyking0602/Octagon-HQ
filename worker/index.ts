import { normalizeCfbApTop25 } from "./cfbRankings";
import {
  dynamicPreviewRequest,
  resolveRichPreview,
  type DynamicPreviewData,
  type RichPreviewCatalog,
  type RichPreviewMetadata,
} from "./previewModel";
import {
  canonicalPreviewUrl,
  ensureDestinationPreview,
  previewCardFingerprint,
  previewCardImagePath,
  renderPreviewCardHtml,
} from "./previewCard";

interface HtmlRewriterElement {
  setInnerContent(content: string): void;
  setAttribute(name: string, value: string): void;
  append(content: string, options?: { html?: boolean }): void;
}

interface HtmlRewriterInstance {
  on(selector: string, handlers: { element: (element: HtmlRewriterElement) => void }): HtmlRewriterInstance;
  transform(response: Response): Response;
}

declare const HTMLRewriter: new () => HtmlRewriterInstance;
declare const __OCTAGON_SUPABASE_URL__: string;
declare const __OCTAGON_SUPABASE_PUBLISHABLE_KEY__: string;
declare const __OCTAGON_PREVIEW_CATALOG__: string;
declare const __OCTAGON_DEPLOYMENT_SHA__: string;

interface BrowserRunBinding {
  quickAction(
    action: "screenshot",
    input: {
      html: string;
      viewport: { width: number; height: number; deviceScaleFactor?: number };
      screenshotOptions?: { captureBeyondViewport?: boolean; omitBackground?: boolean };
    },
  ): Promise<Response>;
}

interface Env {
  ASSETS: {
    fetch(input: Request | URL | string): Promise<Response>;
  };
  BROWSER: BrowserRunBinding;
}

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const EMPTY_CATALOG: RichPreviewCatalog = {
  version: 2,
  fighters: [],
  games: [],
  fighterAssets: {},
};

function embeddedCatalog(): RichPreviewCatalog {
  try {
    const previewCatalog = JSON.parse(__OCTAGON_PREVIEW_CATALOG__) as RichPreviewCatalog;
    return previewCatalog?.version === 2
      && Array.isArray(previewCatalog.fighters)
      && Array.isArray(previewCatalog.games)
      && previewCatalog.fighterAssets
      && typeof previewCatalog.fighterAssets === "object"
      ? previewCatalog
      : EMPTY_CATALOG;
  } catch {
    return EMPTY_CATALOG;
  }
}

const catalog = embeddedCatalog();

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteUrl(path: string, origin: string) {
  return new URL(path, `${origin}/`).toString();
}

function metadataMarkup(
  title: string,
  description: string,
  canonicalUrl: string,
  cardImageUrl: string,
) {
  return [
    `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
    `<meta property="og:site_name" content="Octagon HQ" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeAttribute(cardImageUrl)}" />`,
    `<meta property="og:image:secure_url" content="${escapeAttribute(cardImageUrl)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttribute(cardImageUrl)}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttribute(title)}" />`,
  ].join("");
}

async function loadDynamicPreview(requestUrl: URL): Promise<DynamicPreviewData | null> {
  const request = dynamicPreviewRequest(requestUrl);
  if (!request) return null;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(__OCTAGON_SUPABASE_URL__)) return null;
  if (!__OCTAGON_SUPABASE_PUBLISHABLE_KEY__) return null;

  try {
    const response = await fetch(`${__OCTAGON_SUPABASE_URL__}/rest/v1/rpc/get_rich_preview_data`, {
      method: "POST",
      headers: {
        apikey: __OCTAGON_SUPABASE_PUBLISHABLE_KEY__,
        Authorization: `Bearer ${__OCTAGON_SUPABASE_PUBLISHABLE_KEY__}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ p_kind: request.kind, p_key: request.key }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data && typeof data === "object" && !Array.isArray(data)
      ? data as DynamicPreviewData
      : null;
  } catch {
    return null;
  }
}

const NFL_ROSTER_TEAM_CODES = new Set([
  "ari", "atl", "bal", "buf", "car", "chi", "cin", "cle",
  "dal", "den", "det", "gb", "hou", "ind", "jax", "kc",
  "lac", "lar", "lv", "mia", "min", "ne", "no", "nyg",
  "nyj", "phi", "pit", "sea", "sf", "tb", "ten", "wsh",
]);

const CFB_ROSTER_ESPN_IDS = new Set([
  "68",
  "333", "8", "2", "57", "61", "96", "99", "344", "142", "201", "145", "2579", "2633", "251", "245", "238",
  "356", "84", "2294", "120", "130", "127", "135", "158", "77", "194", "2483", "213", "2509", "164", "26", "30", "264", "275",
  "12", "9", "239", "252", "2132", "38", "248", "66", "2305", "2306", "197", "2628", "2641", "2116", "254", "277",
  "103", "25", "228", "150", "52", "59", "97", "2390", "152", "153", "221", "2567", "24", "183", "258", "259", "154", "87",
]);

export function nflRosterUpstreamUrl(teamCode: string) {
  const normalized = teamCode.trim().toLowerCase();
  if (!NFL_ROSTER_TEAM_CODES.has(normalized)) return null;
  return `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${normalized}/roster`;
}

async function serveNflRoster(requestUrl: URL) {
  const upstreamUrl = nflRosterUpstreamUrl(requestUrl.searchParams.get("team") ?? "");
  if (!upstreamUrl) {
    return new Response(JSON.stringify({ error: "Unknown NFL team." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "OctagonHQ/1.0",
      },
    });
    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: "Current NFL roster is unavailable." }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    headers.delete("Set-Cookie");
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "Current NFL roster is unavailable." }), {
      status: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}

export function cfbRosterUpstreamUrl(espnId: string) {
  const normalized = espnId.trim();
  if (!CFB_ROSTER_ESPN_IDS.has(normalized)) return null;
  return `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${normalized}/roster`;
}

async function serveCfbRoster(requestUrl: URL) {
  const upstreamUrl = cfbRosterUpstreamUrl(requestUrl.searchParams.get("team") ?? "");
  if (!upstreamUrl) {
    return new Response(JSON.stringify({ error: "Unknown CFB school." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "OctagonHQ/1.0",
      },
    });
    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: "Current college roster is unavailable." }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    headers.delete("Set-Cookie");
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "Current college roster is unavailable." }), {
      status: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}

function isPreviewRoute(url: URL) {
  return url.pathname.startsWith("/fighters/")
    || url.pathname === "/rankings"
    || url.pathname === "/rankings/"
    || url.pathname === "/picks"
    || url.pathname === "/picks/"
    || url.pathname === "/play"
    || url.pathname === "/play/"
    || url.pathname.startsWith("/play/");
}

function previewSourceUrl(imageUrl: URL) {
  const path = imageUrl.searchParams.get("path") ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  try {
    const source = canonicalPreviewUrl(new URL(path, imageUrl.origin));
    return source.origin === imageUrl.origin && isPreviewRoute(source) ? source : null;
  } catch {
    return null;
  }
}

function imageRequestMatchesPreview(requestUrl: URL, preview: RichPreviewMetadata) {
  const match = requestUrl.pathname.match(/^\/share-preview\/([a-z-]+)-([0-9a-f]{8})\.png$/);
  if (!match) return false;
  return match[1] === preview.kind && match[2] === previewCardFingerprint(preview);
}

function edgeCache() {
  return (globalThis as unknown as { caches: { default: Cache } }).caches.default;
}

async function resolvedPreview(requestUrl: URL) {
  const canonicalUrl = canonicalPreviewUrl(requestUrl);
  const dynamicData = await loadDynamicPreview(canonicalUrl);
  return ensureDestinationPreview(
    canonicalUrl,
    resolveRichPreview(canonicalUrl, catalog, dynamicData),
  );
}

async function servePreviewImage(
  request: Request,
  env: Env,
  context: WorkerExecutionContext,
) {
  const requestUrl = new URL(request.url);
  const sourceUrl = previewSourceUrl(requestUrl);
  if (!sourceUrl) return new Response("Invalid preview source.", { status: 400 });

  const cache = edgeCache();
  const cached = await cache.match(request);
  if (cached) return cached;

  const preview = await resolvedPreview(sourceUrl);
  if (preview.kind === "default" || !imageRequestMatchesPreview(requestUrl, preview)) {
    return new Response("Preview card is stale or unavailable.", { status: 404 });
  }

  const screenshot = await env.BROWSER.quickAction("screenshot", {
    html: renderPreviewCardHtml(preview, requestUrl.origin),
    viewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
    screenshotOptions: { captureBeyondViewport: false, omitBackground: false },
  });
  if (!screenshot.ok || !screenshot.body) {
    return new Response("Preview card rendering failed.", { status: 503 });
  }

  const response = new Response(screenshot.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Octagon-Preview-Image": preview.kind,
    },
  });
  context.waitUntil(cache.put(request, response.clone()));
  return response;
}

function serveDeploymentMarker() {
  return new Response(`${JSON.stringify({ sha: __OCTAGON_DEPLOYMENT_SHA__ })}\n`, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function servePreviewPage(request: Request, env: Env) {
  const requestUrl = new URL(request.url);
  const shell = await env.ASSETS.fetch(request);
  const contentType = shell.headers.get("content-type") ?? "";
  if (!shell.ok || !contentType.includes("text/html")) return shell;

  const preview = await resolvedPreview(requestUrl);
  const canonicalUrl = absoluteUrl(preview.canonicalPath, requestUrl.origin);
  const cardImageUrl = absoluteUrl(previewCardImagePath(preview), requestUrl.origin);
  const markup = metadataMarkup(
    preview.title,
    preview.description,
    canonicalUrl,
    cardImageUrl,
  );

  const transformed = new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent(preview.title);
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", preview.description);
      },
    })
    .on("head", {
      element(element) {
        element.append(markup, { html: true });
      },
    })
    .transform(shell);

  const headers = new Headers(transformed.headers);
  headers.set("X-Octagon-Preview", preview.kind);
  headers.set("X-Octagon-Preview-Image", cardImageUrl);
  headers.set("Cache-Control", "no-cache");
  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env, context: WorkerExecutionContext): Promise<Response> {
    const requestUrl = new URL(request.url);
    if (request.method !== "GET") return env.ASSETS.fetch(request);
    if (requestUrl.pathname === "/api/football/nfl-roster") {
      return serveNflRoster(requestUrl);
    }
    if (requestUrl.pathname === "/api/football/cfb-roster") {
      return serveCfbRoster(requestUrl);
    }
    if (requestUrl.pathname === "/deployment.json") {
      return serveDeploymentMarker();
    }
    if (requestUrl.pathname.startsWith("/share-preview/")) {
      return servePreviewImage(request, env, context);
    }
    if (!isPreviewRoute(requestUrl)) return env.ASSETS.fetch(request);
    return servePreviewPage(request, env);
  },
};
