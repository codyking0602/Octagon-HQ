import {
  dynamicPreviewRequest,
  resolveRichPreview,
  type DynamicPreviewData,
  type RichPreviewCatalog,
  type RichPreviewImage,
} from "./previewModel";

declare const HTMLRewriter: new () => {
  on: (selector: string, handlers: { element: (element: any) => void }) => any;
  transform: (response: Response) => Response;
};
declare const __OCTAGON_SUPABASE_URL__: string;
declare const __OCTAGON_SUPABASE_PUBLISHABLE_KEY__: string;

interface Env {
  ASSETS: {
    fetch(input: Request | URL | string): Promise<Response>;
  };
}

const EMPTY_CATALOG: RichPreviewCatalog = {
  version: 2,
  fighters: [],
  games: [],
  fighterAssets: {},
};
let catalogPromise: Promise<RichPreviewCatalog> | null = null;

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

function imageType(image: RichPreviewImage) {
  const path = image.path.toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "image/*";
}

function metadataMarkup(
  title: string,
  description: string,
  canonicalUrl: string,
  images: RichPreviewImage[],
  origin: string,
) {
  const primaryImage = images[0];
  const openGraphImages = images.map((image) => {
    const url = absoluteUrl(image.path, origin);
    return [
      `<meta property="og:image" content="${escapeAttribute(url)}" />`,
      `<meta property="og:image:secure_url" content="${escapeAttribute(url)}" />`,
      `<meta property="og:image:type" content="${imageType(image)}" />`,
      `<meta property="og:image:alt" content="${escapeAttribute(image.alt)}" />`,
    ].join("");
  }).join("");

  return [
    `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
    `<meta property="og:site_name" content="Octagon HQ" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`,
    openGraphImages,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    primaryImage
      ? `<meta name="twitter:image" content="${escapeAttribute(absoluteUrl(primaryImage.path, origin))}" />`
      : "",
    primaryImage
      ? `<meta name="twitter:image:alt" content="${escapeAttribute(primaryImage.alt)}" />`
      : "",
  ].join("");
}

async function loadCatalog(env: Env, requestUrl: URL) {
  catalogPromise ??= (async () => {
    try {
      const catalogUrl = new URL("/preview-data/rankings.json", requestUrl.origin);
      const response = await env.ASSETS.fetch(new Request(catalogUrl, {
        headers: { Accept: "application/json" },
      }));
      if (!response.ok) return EMPTY_CATALOG;
      const catalog = await response.json() as RichPreviewCatalog;
      return catalog?.version === 2
        && Array.isArray(catalog.fighters)
        && Array.isArray(catalog.games)
        && catalog.fighterAssets
        && typeof catalog.fighterAssets === "object"
        ? catalog
        : EMPTY_CATALOG;
    } catch {
      return EMPTY_CATALOG;
    }
  })();
  return catalogPromise;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);
    if (request.method !== "GET" || !isPreviewRoute(requestUrl)) {
      return env.ASSETS.fetch(request);
    }

    const shell = await env.ASSETS.fetch(request);
    const contentType = shell.headers.get("content-type") ?? "";
    if (!shell.ok || !contentType.includes("text/html")) return shell;

    const [catalog, dynamicData] = await Promise.all([
      loadCatalog(env, requestUrl),
      loadDynamicPreview(requestUrl),
    ]);
    const preview = resolveRichPreview(requestUrl, catalog, dynamicData);
    const canonicalUrl = absoluteUrl(preview.canonicalPath, requestUrl.origin);
    const markup = metadataMarkup(
      preview.title,
      preview.description,
      canonicalUrl,
      preview.images,
      requestUrl.origin,
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
    headers.set("Cache-Control", "no-cache");
    return new Response(transformed.body, {
      status: transformed.status,
      statusText: transformed.statusText,
      headers,
    });
  },
};
