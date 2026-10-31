/** Read-only CDN evidence for the private NBA GM. No assets are downloaded to the repo.
 * Only the NBA's existing public headshot and logo URLs are requested.
 * Broken/blocked CDN URLs are reported, not mistaken for identity mismatches.
 */
import { readFileSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";

const fixture = readFileSync("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql", "utf8");
const overlaySource = readFileSync("src/features/nba/nbaGmOfficialHeadshots.ts", "utf8");
const brandingSource = readFileSync("src/features/nba/nbaTeamBranding.tsx", "utf8");
const overlayBody = overlaySource.split("NBA_GM_VERIFIED_HEADSHOT_IDS: Readonly<Record<string, string>> = {")[1]?.split("\n};")[0];
if (!overlayBody) throw new Error("Cannot find existing private NBA GM identity overlay");
const recovered = new Map([...overlayBody.matchAll(/"(nba-gm-draft-[^"]+)":\s*"(\d+)"/g)].map(m => [m[1], m[2]]));
const players = [...fixture.matchAll(/\('([^']+)','((?:[^']|'')+)','([A-Z]{3})',ARRAY\[[^\n]*?::bigint\[\],(null|'[0-9]+'),/g)]
  .map(m => ({
    id: m[1], name: m[2].replaceAll("''", "'"), team: m[3],
    nbaId: m[4] === "null" ? recovered.get(m[1]) : m[4].slice(1, -1),
  }));
const teamSection = brandingSource.split("const NBA_IDS: Record<string,string> = {")[1]?.split("\n};")[0];
const teams = new Map([...String(teamSection ?? "").matchAll(/([A-Z]{3}):"(\d+)"/g)].map(m => [m[1], m[2]]));
if (players.length !== 330 || new Set(players.map(p => p.id)).size !== 330 ||
  new Set(players.map(p => p.nbaId)).size !== 330 ||
  players.some(p => !/^\d+$/.test(p.nbaId ?? "")) ||
  new Set(players.map(p => p.team)).size !== 30 || teams.size !== 30) {
  throw new Error("Private identity map has gaps or duplicates; CDN audit cannot be trusted");
}

const logoRequests = [...teams].map(([team, id]) => ({
  label: team, kind: "logo", url: `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`,
}));
const portraitRequests = players.map(p => ({
  label: `${p.team} ${p.name} (${p.nbaId})`, kind: "portrait",
  url: `https://cdn.nba.com/headshots/nba/latest/260x190/${p.nbaId}.png`,
}));
async function check(item) {
  try {
    const response = await fetch(item.url, { signal: AbortSignal.timeout(9000) });
    if (!response.ok) return { ...item, status: `HTTP ${response.status}` };
    const body = Buffer.from(await response.arrayBuffer());
    if (item.kind === "portrait") {
      if (body.length < 1000 || body.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
        return { ...item, status: "not a valid PNG" };
      const width = body.readUInt32BE(16), height = body.readUInt32BE(20);
      if (width < 100 || height < 100) return { ...item, status: `unexpected dimensions ${width}x${height}` };
      return { ...item, status: "PNG delivered", hash: createHash("sha256").update(body).digest("hex") };
    }
    if (body.length < 100 || !/<svg\b/i.test(body.toString("utf8")))
      return { ...item, status: "not a valid SVG" };
    return { ...item, status: "SVG delivered" };
  } catch (error) {
    return { ...item, status: `unreachable: ${error?.name ?? "network"}` };
  }
}
const tasks = [...portraitRequests, ...logoRequests], outcomes = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: 12 }, async () => {
  while (next < tasks.length) {
    const i = next++;
    outcomes[i] = await check(tasks[i]);
  }
}));
const success = outcomes.filter(r => r.status.endsWith("delivered"));
const failures = outcomes.filter(r => !r.status.endsWith("delivered"));
const byHash = new Map();
for (const item of success.filter(r => r.kind === "portrait")) {
  const copies = byHash.get(item.hash) ?? [];
  copies.push(item.label);
  byHash.set(item.hash, copies);
}
const duplicateImages = [...byHash.values()].filter(group => group.length > 1);
const summary = [
  "## NBA GM private NBA CDN delivery audit",
  `- Mapped identities: ${players.length}; teams: ${teams.size}`,
  `- Delivered PNG portraits: ${success.filter(x => x.kind === "portrait").length}/330`,
  `- Delivered SVG logos: ${success.filter(x => x.kind === "logo").length}/30`,
  `- Non-deliveries: ${failures.length}; duplicate PNG hashes: ${duplicateImages.length}`,
  "- CDN network errors do not prove an asset is missing. This is not a visual identity/cropping review.",
  "",
  ...failures.slice(0, 100).map(x => `- ${x.label}: ${x.status}`),
  ...duplicateImages.slice(0, 20).map(group => `- Identical portraits: ${group.join(", ")}`),
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
// Network-dependent image presence is not a source-code check. The UI must fall
// back safely regardless of the CDN's availability or current roster coverage.
