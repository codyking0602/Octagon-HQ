import { writeFile } from "node:fs/promises";

const origin = (process.env.OCTAGON_PRODUCTION_ORIGIN ?? "https://octagon.hq-app.workers.dev").replace(/\/$/, "");
const expectedSha = process.env.EXPECTED_SOURCE_SHA?.trim().toLowerCase() ?? "";
const crawlerHeaders = {
  "User-Agent": "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)",
  "Cache-Control": "no-cache",
};

const cases = [
  {
    kind: "fighter",
    path: "/fighters/jon-jones",
    requiredText: ["Jon Jones", "UFC Rank #1", "/share-preview/fighter-"],
  },
  {
    kind: "comparison",
    path: "/rankings?compareLeft=jon-jones&compareRight=georges-st-pierre",
    requiredText: ["Jon Jones", "Georges St-Pierre", "/share-preview/comparison-"],
  },
  {
    kind: "challenge",
    path: "/play/blind-resume?seed=live-preview-proof",
    requiredText: ["Blind Resume challenge", "/share-preview/challenge-"],
  },
];

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function firstOpenGraphImage(html) {
  const propertyFirst = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["'][^>]*>/i);
  if (propertyFirst?.[1]) return decodeHtml(propertyFirst[1]);
  const contentFirst = html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["'][^>]*>/i);
  return contentFirst?.[1] ? decodeHtml(contentFirst[1]) : "";
}

function assertPng(buffer, label) {
  if (buffer.length < 24) throw new Error(`${label} preview PNG is too small.`);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${label} preview image is not a PNG.`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    throw new Error(`${label} preview image is ${width}x${height}, expected 1200x630.`);
  }
}

async function verifyCase(testCase, attempt) {
  const url = new URL(testCase.path, `${origin}/`);
  url.searchParams.set("share", `${expectedSha || "live"}-${attempt}`);
  const response = await fetch(url, { headers: crawlerHeaders, redirect: "follow" });
  const html = await response.text();

  if (!response.ok) throw new Error(`${testCase.kind} page returned HTTP ${response.status}.`);
  const kind = response.headers.get("x-octagon-preview")?.toLowerCase() ?? "";
  if (kind !== testCase.kind) {
    throw new Error(`${testCase.kind} page returned preview kind ${kind || "missing"}.`);
  }
  if (/property=["']og:image["'][^>]+app-icon\.png/i.test(html)) {
    throw new Error(`${testCase.kind} page returned the generic app image.`);
  }
  for (const marker of testCase.requiredText) {
    if (!html.includes(marker)) throw new Error(`${testCase.kind} page is missing ${marker}.`);
  }

  const imageUrl = firstOpenGraphImage(html);
  if (!imageUrl || !imageUrl.startsWith(`${origin}/share-preview/`)) {
    throw new Error(`${testCase.kind} page did not publish its rendered card URL.`);
  }

  const imageResponse = await fetch(imageUrl, { headers: crawlerHeaders, redirect: "follow" });
  const contentType = imageResponse.headers.get("content-type")?.toLowerCase() ?? "";
  const imageKind = imageResponse.headers.get("x-octagon-preview-image")?.toLowerCase() ?? "";
  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  if (!imageResponse.ok) throw new Error(`${testCase.kind} card returned HTTP ${imageResponse.status}.`);
  if (!contentType.startsWith("image/png")) {
    throw new Error(`${testCase.kind} card returned ${contentType || "no content type"}.`);
  }
  if (imageKind !== testCase.kind) {
    throw new Error(`${testCase.kind} card returned image kind ${imageKind || "missing"}.`);
  }
  assertPng(buffer, testCase.kind);
  await writeFile(`${process.env.RUNNER_TEMP ?? "/tmp"}/octagon-${testCase.kind}-preview.png`, buffer);
}

let lastError;
for (let attempt = 1; attempt <= 12; attempt += 1) {
  try {
    for (const testCase of cases) await verifyCase(testCase, attempt);
    console.log("Verified live fighter, comparison, and challenge rich-preview cards at 1200x630.");
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.log(`Rich-preview verification attempt ${attempt} failed: ${error instanceof Error ? error.message : error}`);
    if (attempt < 12) await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}

throw lastError instanceof Error ? lastError : new Error("Live rich-preview verification failed.");
