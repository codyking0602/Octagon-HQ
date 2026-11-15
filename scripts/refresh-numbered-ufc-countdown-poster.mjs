/**
 * Run from the existing weekday UFC poster workflow, independently of whether
 * Picks has been staged. Only add an exact-event publisher-verified image.
 * Never publish a substitute fighter photo or unreviewed generated art.
 */
import fs from "node:fs";
import {
  nextNumberedFromEspn,
  numberedPosterLinks,
  verifiedNumberedPosterArticle,
} from "./numbered-ufc-countdown-poster-source.mjs";

const SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard";
const ARCHIVE = "https://www.mmamania.com/ufc-strikeforce-posters";
const FILE = "src/features/picks/ufcNumberedCountdownPosters.json";

async function getText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "OctagonHQEditorialVerifier/1.0", accept: "text/html,application/json" },
    signal: AbortSignal.timeout(16000),
  });
  if (!response.ok) throw new Error("Source unavailable: " + new URL(url).hostname + " (" + response.status + ")");
  const text = await response.text();
  if (!text || text.length > 3_000_000) throw new Error("Unexpected source size: " + new URL(url).hostname);
  return text;
}

const schedule = JSON.parse(await getText(SCOREBOARD));
const next = nextNumberedFromEspn(schedule);
if (!next) {
  console.log("No future numbered card with a verified headliner; retaining existing artwork.");
  process.exit(0);
}
const current = JSON.parse(fs.readFileSync(FILE, "utf8"));
if (!Array.isArray(current)) throw new Error("Numbered UFC poster ledger must be an array.");

const archive = await getText(ARCHIVE);
const links = numberedPosterLinks(archive, next.number);
if (!links.length) {
  console.log("No official-poster publisher article yet for " + next.name + "; no substitution.");
  process.exit(0);
}

let chosen = null;
for (const url of links) {
  try {
    const html = await getText(url);
    const candidate = verifiedNumberedPosterArticle(html, url, next);
    if (!candidate) continue;
    // Only use images actually served by the exact approved publisher CDN.
    const image = await fetch(candidate.src, { method: "HEAD", signal: AbortSignal.timeout(12000) });
    if (!image.ok || !/^image\/(?:jpeg|png|webp)\b/i.test(image.headers.get("content-type") ?? "")) continue;
    chosen = candidate;
    break;
  } catch (error) {
    console.warn("Poster candidate rejected: " + String(error));
  }
}
if (!chosen) {
  console.log("No source-verified horizontal UFC poster for " + next.name + "; no substitution.");
  process.exit(0);
}

const updated = [
  ...current.filter((record) => record.name !== chosen.name),
  chosen,
].sort((a, b) => a.name.localeCompare(b.name));
if (JSON.stringify(current) === JSON.stringify(updated)) {
  console.log("Verified numbered poster is current: " + next.name);
  process.exit(0);
}
fs.writeFileSync(FILE, JSON.stringify(updated, null, 2) + "\n");
console.log("Source-verified numbered UFC countdown poster: " + next.name + " " + chosen.source);
