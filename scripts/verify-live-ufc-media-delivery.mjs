/**
 * Verify that new UFC fighter WebPs are actually served by the production Worker.
 * Checks exact bytes, not only a 200 SPA fallback, cache header, or a manifest.
 *
 * The two UFC 334 photos must be checked on every release after their approval;
 * additional photos changed in the latest 50 commits are discovered automatically.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const REQUIRED = [
  "public/assets/fighters/yousri-belgaroui-thumb.webp",
  "public/assets/fighters/cesar-almeida-thumb.webp",
];
const PATH = /^public\/assets\/fighters\/[a-z0-9-]+-(?:thumb|spotlight)\.webp$/;

export function selectedUfcAssets(changed, required = REQUIRED) {
  return [...new Set([...required, ...changed])]
    .filter((path) => PATH.test(path) && fs.existsSync(path))
    .sort();
}

export function isRealWebp(data) {
  return data.length > 1024
    && data.toString("ascii", 0, 4) === "RIFF"
    && data.toString("ascii", 8, 12) === "WEBP";
}

export function verifiedSameAsset(expected, delivered) {
  return isRealWebp(expected)
    && isRealWebp(delivered)
    && expected.length === delivered.length
    && crypto.timingSafeEqual(
      crypto.createHash("sha256").update(expected).digest(),
      crypto.createHash("sha256").update(delivered).digest(),
    );
}

async function verify() {
  const origin = process.env.OCTAGON_PRODUCTION_ORIGIN;
  if (!origin || !/^https:\/\/[a-z0-9.-]+\/?$/.test(origin)) {
    throw new Error("OCTAGON_PRODUCTION_ORIGIN must be a trusted HTTPS origin");
  }
  const changes = execFileSync("git", [
    "log", "-n", "50", "--pretty=format:", "--name-only",
    "--diff-filter=AM", "--", "public/assets/fighters",
  ], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  const assets = selectedUfcAssets(changes);
  console.log(`Verifying ${assets.length} recent or required UFC fighter WebPs on production`);
  if (!assets.includes(REQUIRED[0]) || !assets.includes(REQUIRED[1])) {
    throw new Error("Required approved UFC 334 assets are missing from the release source");
  }
  for (const path of assets) {
    const expected = fs.readFileSync(path);
    const url = `${origin.replace(/\/$/, "")}/${path.replace(/^public\//, "")}`;
    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(15000),
          headers: { "Cache-Control": "no-cache" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const delivered = Buffer.from(await response.arrayBuffer());
        if (!verifiedSameAsset(expected, delivered)) {
          throw new Error("production bytes do not match the reviewed WebP in git");
        }
        lastError = null;
        console.log(`Verified ${path}: ${expected.length} matching bytes`);
        break;
      } catch (error) {
        lastError = error;
        console.warn(`${path} attempt ${attempt}: ${error.message}`);
      }
    }
    if (lastError) throw new Error(`Production fighter media verification failed ${path}: ${lastError.message}`);
  }
}

if (process.argv[1]?.endsWith("verify-live-ufc-media-delivery.mjs")) {
  verify().catch((error) => { console.error(error); process.exitCode = 1; });
}
