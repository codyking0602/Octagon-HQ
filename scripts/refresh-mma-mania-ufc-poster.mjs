/**
 * Read-only verified MMA Mania poster discovery for the next live UFC event.
 * Writes ONLY the checked-in editorial ledger; a GitHub workflow validates,
 * reviews the exact generated head and deploys it through the ordinary PR flow.
 * A missing publisher poster is not an excuse to substitute random photo art.
 */
import fs from "node:fs";
const archive = "https://www.mmamania.com/ufc-strikeforce-posters";
const ledgerFile = "src/features/picks/ufcMmaManiaWeeklyPosters.json";
const project = process.env.SUPABASE_PROJECT_ID;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!project || !token) throw new Error("Poster monitor needs existing Supabase management read credentials.");
const response = await fetch(`https://api.supabase.com/v1/projects/${encodeURIComponent(project)}/database/query`, {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ query: "select name, subtitle, starts_at from public.pick_events where sport = 'mma' and status = 'upcoming' and starts_at > now() order by starts_at asc limit 1" }),
  signal: AbortSignal.timeout(20000),
});
if (!response.ok) throw new Error(`Cannot read the next UFC event (${response.status}); poster ledger unchanged.`);
const rows = await response.json();
const event = Array.isArray(rows) ? rows[0] : null;
if (!event?.name || !event?.subtitle || !event?.starts_at) {
  console.log("No upcoming UFC event; leaving the publisher ledger unchanged.");
  process.exit(0);
}
const startsAt = new Date(event.starts_at);
if (!Number.isFinite(startsAt.valueOf())) throw new Error("Invalid event date");
const fighters = String(event.subtitle).split(/\s+vs\.?\s+/i).map((name) => name.trim().split(/\s+/).at(-1));
if (fighters.length !== 2 || fighters.some((part) => !part || part.length < 3)) {
  throw new Error("The next UFC event has no safe pair of headliner surnames.");
}

async function getHtml(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "OctagonHQEditorialVerifier/1.0 (publisher attribution)" },
    signal: AbortSignal.timeout(16000),
  });
  if (!res.ok) throw new Error(`Publisher request ${res.status} at ${url}`);
  return res.text();
}
function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/gi, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function meta(html, key) {
  for (const tag of html.match(/<meta\s+[^>]*>/gi) ?? []) {
    const isMatch = new RegExp(`(?:property|name)=["']${key}["']`, "i").test(tag);
    if (!isMatch) continue;
    return decodeEntities(tag.match(/content=["']([^"']+)["']/i)?.[1] ?? "");
  }
  return "";
}
function cleanText(html) {
  return decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase());
}
function chicagoParts(ms) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago",
    weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ms));
  const key = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return key;
}
function releaseTuesday(eventStart) {
  // DST-safe; search previous 7 days of actual UTC hours for the last
  // Tuesday at exactly midnight in Chicago.
  for (let ago = 0; ago <= 7 * 24; ago++) {
    const ms = eventStart - ago * 3600000;
    const parts = chicagoParts(ms);
    if (parts.weekday === "Tue" && parts.hour === "00" && parts.minute === "00") {
      return new Date(ms).toISOString();
    }
  }
  throw new Error("Cannot resolve event-week Tuesday in America/Chicago");
}
const current = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
if (!Array.isArray(current)) throw new Error("Poster ledger is not an array");
const releaseAt = releaseTuesday(startsAt.getTime());
const expiresAt = new Date(startsAt.getTime() + 36 * 3600000).toISOString();

const archiveHtml = await getHtml(archive);
const articleLinks = [...archiveHtml.matchAll(/href=["']([^"']+)["']/gi)]
  .map((match) => decodeEntities(match[1]))
  .map((value) => { try { return new URL(value, archive).href; } catch { return ""; } })
  .filter((url) => /^https:\/\/www\.mmamania\.com\//i.test(url) && /poster|ufc-3\d\d/i.test(url))
  .filter((url) => !url.includes("/ufc-strikeforce-posters?"))
  .filter((url, i, values) => values.indexOf(url) === i)
  .slice(0, 15);

let chosen = null;
for (const url of articleLinks) {
  let html;
  try { html = await getHtml(url); }
  catch (error) { console.warn(String(error)); continue; }
  const body = cleanText(html);
  const title = meta(html, "og:title").toLowerCase();
  const identity = String(event.name).toLowerCase().replace(/\s+/g, " ");
  const editorialMatch = title.includes(identity) || fighters.every((name) => title.includes(name.toLowerCase()));
  if (!editorialMatch || !body.includes("poster") || !fighters.every((name) => body.includes(name.toLowerCase()))) continue;
  const sourceImage = meta(html, "og:image");
  let image;
  try { image = new URL(sourceImage); } catch { continue; }
  if (image.protocol !== "https:" || image.hostname !== "platform.mmamania.com" || !/\.(jpe?g|png|webp)$/i.test(image.pathname)) continue;
  const width = Number(meta(html, "og:image:width"));
  const height = Number(meta(html, "og:image:height"));
  const ratio = Number.isFinite(width / height) && width >= 600 && height >= 300 && width / height >= 1.2 && width / height <= 2.5
    ? `${width} / ${height}`
    : null;
  if (!ratio) { console.warn(`MMA Mania candidate ${url} has no verified horizontal dimensions`); continue; }
  chosen = {
    eventTitleContains: fighters,
    eventStartsAt: startsAt.toISOString(),
    releaseAt,
    expiresAt,
    source: url,
    src: image.href,
    aspectRatio: ratio,
  };
  break;
}
if (!chosen) {
  console.log(`No verified horizontal MMA Mania poster published for ${event.name} — retain official-image fallback / owner review.`);
  process.exit(0);
}
const existing = current.find((poster) => poster.eventStartsAt === chosen.eventStartsAt
  && JSON.stringify(poster.eventTitleContains) === JSON.stringify(chosen.eventTitleContains));
if (existing && JSON.stringify(existing) === JSON.stringify(chosen)) {
  console.log("Verified poster already current.");
  process.exit(0);
}
const next = [...current.filter((poster) => poster.eventStartsAt !== chosen.eventStartsAt), chosen];
fs.writeFileSync(ledgerFile, JSON.stringify(next, null, 2) + "\n");
console.log(`Verified and staged MMA Mania poster for ${event.name}: ${chosen.source}`);
