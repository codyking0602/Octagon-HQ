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

interface BrowserRunBinding {
  quickAction(
    action: "screenshot",
    input: {
      html: string;
      viewport: { width: number; height: number; deviceScaleFactor?: number };
      screenshotOptions?: { captureBeyondViewport?: boolean; omitBackground?: boolean };
    },
  ): Promise<Response>;
  quickAction(
    action: "content",
    input: {
      url: string;
      gotoOptions?: { waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2"; timeout?: number };
      waitForSelector?: { selector: string; timeout?: number };
      rejectResourceTypes?: string[];
    },
  ): Promise<Response>;
}

interface Env {
  ASSETS: {
    fetch(input: Request | URL | string): Promise<Response>;
  };
  BROWSER: BrowserRunBinding;
  UFC_SOURCE_TRANSPORT_TOKEN?: string;
}

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const UFC_SOURCE_PATH = "/internal/ufc-source";
const UFC_SOURCE_MAX_BYTES = 3_000_000;

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

function exactUfcSourceUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "");
    if (url.protocol !== "https:" || !/^(?:www\.)?ufc\.com$/i.test(url.hostname)) return null;
    const isEvents = path === "/events" && [...url.searchParams.keys()].every((key) => key === "page")
      && (url.searchParams.get("page") === null || /^\d{1,2}$/.test(url.searchParams.get("page")!));
    const isEvent = /^\/event\/[a-z0-9-]+$/i.test(path) && url.search === "";
    if (!isEvents && !isEvent) return null;
    url.protocol = "https:";
    url.hostname = "www.ufc.com";
    url.pathname = path;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

async function serveUfcSource(request: Request, env: Env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed.", { status: 405, headers: { Allow: "POST" } });
  }
  const expectedToken = env.UFC_SOURCE_TRANSPORT_TOKEN?.trim() ?? "";
  if (!expectedToken) return new Response("UFC source transport is unavailable.", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${expectedToken}`) {
    return new Response("Unauthorized.", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }
  const sourceUrl = exactUfcSourceUrl(
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).url
      : "",
  );
  if (!sourceUrl) return new Response("Invalid UFC.com source URL.", { status: 400 });

  const isEventPage = sourceUrl.pathname.startsWith("/event/");
  let rendered: Response;
  try {
    rendered = await env.BROWSER.quickAction("content", {
      url: sourceUrl.toString(),
      gotoOptions: { waitUntil: "networkidle2", timeout: 30_000 },
      waitForSelector: {
        selector: isEventPage
          ? ".c-listing-fight__corner-name--red, #main-card .l-listing__item"
          : "a[href*='/event/']",
        timeout: 30_000,
      },
      rejectResourceTypes: ["image", "media", "font"],
    });
  } catch {
    return new Response("UFC.com browser rendering failed.", { status: 502 });
  }
  if (!rendered.ok) return new Response("UFC.com browser rendering failed.", { status: 502 });

  let envelope: unknown;
  try {
    envelope = await rendered.json();
  } catch {
    return new Response("UFC.com browser rendering returned invalid data.", { status: 502 });
  }
  const html = envelope && typeof envelope === "object" && !Array.isArray(envelope)
    && (envelope as Record<string, unknown>).success === true
    && typeof (envelope as Record<string, unknown>).result === "string"
    ? (envelope as Record<string, unknown>).result as string
    : "";
  const byteLength = new TextEncoder().encode(html).byteLength;
  if (!html || byteLength > UFC_SOURCE_MAX_BYTES) {
    return new Response("UFC.com browser rendering returned an invalid page.", { status: 502 });
  }
  if (!/<html\b|<!doctype\s+html/i.test(html) || !/\bufc\b/i.test(html)) {
    return new Response("UFC.com browser rendering did not return a UFC page.", { status: 502 });
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Octagon-UFC-Source": "ufc.com",
    },
  });
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
    if (requestUrl.pathname === UFC_SOURCE_PATH) return serveUfcSource(request, env);
    if (request.method !== "GET") return env.ASSETS.fetch(request);
    if (requestUrl.pathname.startsWith("/share-preview/")) {
      return servePreviewImage(request, env, context);
    }
    if (!isPreviewRoute(requestUrl)) return env.ASSETS.fetch(request);
    return servePreviewPage(request, env);
  },
};
