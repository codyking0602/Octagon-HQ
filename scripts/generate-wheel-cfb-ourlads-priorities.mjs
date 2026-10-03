import { readFile, mkdir, writeFile } from "node:fs/promises";

const OURLADS_INDEX_URL = "https://www.ourlads.com/ncaa-football-depth-charts/default.aspx";
const OUTPUT_PATH = process.argv[2] ?? "data/generated/football/cfb/wheel-football-current-priorities-2026.json";
const AUDIT_DATE = "2026-10-03";

const CAPS = {
  QB: 2,
  RB: 3,
  WR: 4,
  Flex: 4,
  "Front Seven": 6,
  Secondary: 6,
  "Head Coach": 1,
};

const OURLADS_SLUG_ALIASES = {
  "NC State": ["nc-state", "north-carolina-state"],
  "Ole Miss": ["mississippi"],
  "UCF": ["central-florida"],
  "BYU": ["brigham-young", "byu"],
  "TCU": ["texas-christian", "tcu"],
  "USC": ["southern-california", "usc"],
  "SMU": ["southern-methodist", "smu"],
  "Texas A&M": ["texas-am", "texas-a-m"],
};

const FRONT_POSITIONS = new Set([
  "DE", "LDE", "RDE", "DT", "NT", "DL", "NG", "EDGE", "ED",
  "JACK", "RUSH", "BANDIT", "BUCK",
  "LB", "ILB", "OLB", "MLB", "WLB", "SLB", "MIKE", "WILL", "SAM",
]);
const SECONDARY_POSITIONS = new Set([
  "CB", "LCB", "RCB", "FCB", "BCB", "NB", "NCB", "NICKEL", "DB", "S", "SS", "FS", "BS", "STAR",
]);

function decodeHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/a\s*&\s*m/g, "am")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function prettifyOurladsName(value) {
  const cleaned = decodeHtml(value).trim();
  if (!cleaned) return "";
  return cleaned
    .replace(/-/g, " ")
    .split(/\s+/)
    .map((token) => {
      const lower = token.toLowerCase();
      if (/^(ii|iii|iv|v)$/.test(lower)) return lower.toUpperCase();
      if (lower === "jr" || lower === "jr.") return "Jr.";
      if (lower === "sr" || lower === "sr.") return "Sr.";
      if (/^[a-z]\.$/.test(lower)) return lower.toUpperCase();
      if (/^[a-z]\.[a-z]\.?$/.test(lower)) return lower.toUpperCase();
      return lower ? lower[0].toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

function parseScope(source) {
  const rows = [];
  const pattern = /currentSchool\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
  for (const match of source.matchAll(pattern)) {
    rows.push({
      espnId: match[1],
      school: match[2],
      conference: match[3],
      id: slugify(match[2]),
    });
  }
  if (rows.length !== 68) throw new Error("Expected 68 approved CFB schools, found " + rows.length);
  return rows;
}

function depthLinks(indexHtml) {
  const map = new Map();
  const hrefPattern = /href=["']depth-chart\.aspx\?s=([^&"']+)(?:&amp;|&)id=(\d+)["']/gi;
  for (const match of indexHtml.matchAll(hrefPattern)) {
    const slug = match[1].toLowerCase();
    const id = match[2];
    map.set(slug, {
      url: "https://secure.ourlads.com/ncaa-football-depth-charts/pfdepthchart/" + slug + "/" + id,
      id,
    });
  }
  return map;
}

function candidatesForSchool(school) {
  return [slugify(school), ...(OURLADS_SLUG_ALIASES[school] ?? [])];
}

function findDepthLink(linkMap, school) {
  for (const slug of candidatesForSchool(school)) {
    const value = linkMap.get(slug);
    if (value) return value;
  }
  return null;
}

function parseDepthChart(html) {
  const rows = [];
  let section = null;
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((cell) => decodeHtml(cell[1]));
    if (!cells.length) continue;
    const first = cells[0]?.trim();
    if (/^offense$/i.test(first)) { section = "offense"; continue; }
    if (/^defense$/i.test(first)) { section = "defense"; continue; }
    if (/^special teams$/i.test(first)) { section = "special"; continue; }
    if (/^reserves$/i.test(first)) { section = "reserves"; continue; }
    if (!section || !first || /^(pos|position)$/i.test(first)) continue;

    const position = first.toUpperCase().replace(/\s+/g, "");
    const players = [];
    for (let index = 2; index < cells.length; index += 2) {
      const raw = cells[index]?.trim();
      if (!raw) continue;
      const name = prettifyOurladsName(raw);
      if (name && !players.includes(name)) players.push(name);
    }
    if (players.length) rows.push({ section, position, players });
  }
  return rows;
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function textValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function espnRoster(payload) {
  const root = asRecord(payload);
  if (!root) return { players: [], coach: null };

  const players = [];
  const groups = Array.isArray(root.athletes) ? root.athletes : [];
  for (const rawGroup of groups) {
    const group = asRecord(rawGroup);
    if (!group) continue;
    const items = Array.isArray(group.items) ? group.items : [];
    for (const rawItem of items) {
      const item = asRecord(rawItem);
      if (!item) continue;
      const name = textValue(item.displayName)
        ?? textValue(item.fullName)
        ?? [textValue(item.firstName), textValue(item.lastName)].filter(Boolean).join(" ");
      if (!name) continue;
      const position = textValue(asRecord(item.position)?.abbreviation)?.toUpperCase() ?? "";
      players.push({ name, position });
    }
  }

  const coachValues = Array.isArray(root.coach)
    ? root.coach
    : Array.isArray(root.coaches)
      ? root.coaches
      : root.coach
        ? [root.coach]
        : root.coaches
          ? [root.coaches]
          : [];
  let coach = null;
  for (const rawCoach of coachValues) {
    const item = asRecord(rawCoach);
    if (!item) continue;
    const name = textValue(item.displayName)
      ?? textValue(item.fullName)
      ?? [textValue(item.firstName), textValue(item.lastName)].filter(Boolean).join(" ");
    if (name) { coach = name; break; }
  }
  return { players, coach };
}

function lastNameKey(value) {
  const pieces = value.trim().split(/\s+/).filter(Boolean);
  while (pieces.length && /^(jr\.?|sr\.?|ii|iii|iv|v)$/i.test(pieces.at(-1))) pieces.pop();
  return normalizeName(pieces.at(-1) ?? "");
}

function firstInitial(value) {
  return normalizeName(value).slice(0, 1);
}

function reconcileName(sourceName, espnPlayers, warnings) {
  const key = normalizeName(sourceName);
  const exact = espnPlayers.filter((player) => normalizeName(player.name) === key);
  if (exact.length === 1) return exact[0].name;

  const last = lastNameKey(sourceName);
  const initial = firstInitial(sourceName);
  const close = espnPlayers.filter((player) => (
    lastNameKey(player.name) === last && firstInitial(player.name) === initial
  ));
  if (close.length === 1) return close[0].name;

  warnings.push({
    sourceName,
    reason: "Ourlads current depth-chart name not present uniquely in ESPN current roster payload",
  });
  return sourceName;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function starterThenDepth(rows, targetCount, maxCount, reconcile) {
  const starters = unique(rows.map((row) => reconcile(row.players[0])));
  const desired = Math.min(maxCount, Math.max(targetCount, Math.min(maxCount, starters.length)));
  const selected = starters.slice(0, desired);
  for (let depth = 1; selected.length < desired; depth += 1) {
    let foundAny = false;
    for (const row of rows) {
      const candidate = row.players[depth];
      if (!candidate) continue;
      foundAny = true;
      const name = reconcile(candidate);
      if (name && !selected.includes(name)) selected.push(name);
      if (selected.length >= desired) break;
    }
    if (!foundAny) break;
  }
  return selected;
}

function requireCount(school, slot, values, min, max, details = null) {
  if (values.length < min || values.length > max) {
    const detailText = details ? "\n" + JSON.stringify(details, null, 2) : "";
    throw new Error(school + " " + slot + ": expected " + min + "-" + max + ", got " + values.length + ": " + values.join(", ") + detailText);
  }
}

function buildPriority(school, rows, roster) {
  const reconciliationWarnings = [];
  const reconcile = (name) => reconcileName(name, roster.players, reconciliationWarnings);
  const offense = rows.filter((row) => row.section === "offense");
  const defense = rows.filter((row) => row.section === "defense");

  const qbRows = offense.filter((row) => row.position === "QB");
  const rbRows = offense.filter((row) => ["RB", "HB", "TB"].includes(row.position));
  const wrRows = offense.filter((row) => row.position === "WR" || row.position.startsWith("WR-"));
  const teRows = offense.filter((row) => row.position === "TE" || row.position.startsWith("TE-"));
  const frontRows = defense.filter((row) => FRONT_POSITIONS.has(row.position));
  const secondaryRows = defense.filter((row) => SECONDARY_POSITIONS.has(row.position));

  const QB = starterThenDepth(qbRows, 1, 1, reconcile);
  const RB = starterThenDepth(rbRows, 2, 3, reconcile);
  const WR = starterThenDepth(wrRows, 3, 4, reconcile);
  const TE = starterThenDepth(teRows, 1, 2, reconcile);
  const frontTarget = frontRows.length >= 6 ? 6 : 5;
  const secondaryTarget = secondaryRows.length >= 5 ? Math.min(6, secondaryRows.length) : 5;
  const frontSeven = starterThenDepth(frontRows, frontTarget, 6, reconcile);
  const secondary = starterThenDepth(secondaryRows, secondaryTarget, 6, reconcile);

  const flex = unique([RB[0], WR[0], WR[1], TE[0]]);
  for (const name of [...WR, ...RB, ...TE]) {
    if (flex.length >= 4) break;
    if (!flex.includes(name)) flex.push(name);
  }

  requireCount(school, "QB", QB, 1, 1, { sourceRows: qbRows, espn: roster.players.filter((player) => player.position === "QB") });
  requireCount(school, "RB", RB, 2, 3, { sourceRows: rbRows, espn: roster.players.filter((player) => ["RB", "HB", "FB"].includes(player.position)) });
  requireCount(school, "WR", WR, 3, 4, { sourceRows: wrRows, espn: roster.players.filter((player) => player.position === "WR") });
  requireCount(school, "Flex", flex, 4, 4, { rbRows, wrRows, teRows });
  requireCount(school, "Front Seven", frontSeven, 5, 6, { sourceRows: frontRows, espn: roster.players.filter((player) => FRONT_POSITIONS.has(player.position)) });
  requireCount(school, "Secondary", secondary, 5, 6, { sourceRows: secondaryRows, espn: roster.players.filter((player) => SECONDARY_POSITIONS.has(player.position)) });
  if (!roster.coach) throw new Error(school + ": ESPN roster did not return a head coach");

  return {
    QB,
    RB,
    WR,
    TE,
    Flex: flex,
    "Front Seven": frontSeven,
    Secondary: secondary,
    "Head Coach": [roster.coach],
    reconciliationWarnings,
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Octagon-HQ-CFB-Wheel-audit/1.0",
    },
  });
  if (!response.ok) throw new Error("Fetch failed " + response.status + ": " + url);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OctagonHQ/1.0",
    },
  });
  if (!response.ok) throw new Error("Fetch failed " + response.status + ": " + url);
  return response.json();
}

const scopeSource = await readFile("src/features/back-room/footballCfbCurrentSchoolScope.ts", "utf8");
const schools = parseScope(scopeSource);
const indexHtml = await fetchText(OURLADS_INDEX_URL);
const linkMap = depthLinks(indexHtml);

const missingLinks = schools.filter((school) => !findDepthLink(linkMap, school.school));
if (missingLinks.length) {
  const available = [...linkMap.keys()].sort().join(", ");
  throw new Error("Missing Ourlads depth links for: " + missingLinks.map((row) => row.school).join(", ") + "\nAvailable slugs: " + available);
}

const teams = {};
for (const school of schools) {
  const depth = findDepthLink(linkMap, school.school);
  const espnUrl = "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/" + school.espnId + "/roster";
  const [depthHtml, espnPayload] = await Promise.all([
    fetchText(depth.url),
    fetchJson(espnUrl),
  ]);
  const rows = parseDepthChart(depthHtml);
  const roster = espnRoster(espnPayload);
  const priority = buildPriority(school.school, rows, roster);
  teams[school.id] = {
    school: school.school,
    conference: school.conference,
    espnId: school.espnId,
    depthChartUrl: depth.url,
    rosterUrl: espnUrl,
    ...priority,
  };
  console.log("PASS " + school.school + ": QB " + priority.QB.join(" / ") + "; " + priority["Front Seven"].length + " front; " + priority.Secondary.length + " secondary; HC " + priority["Head Coach"][0] + "; warnings " + priority.reconciliationWarnings.length);
}

const output = {
  source: "Ourlads 2026 NCAA depth charts with ESPN current-roster identity reconciliation",
  sourceUrl: OURLADS_INDEX_URL,
  espnSourceTemplate: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/{espnId}/roster",
  generatedAt: AUDIT_DATE,
  season: 2026,
  status: "generated-baseline-pending-manual-conference-audit",
  notes: "Step 2 current-CFB Wheel baseline. Ourlads owns current depth-chart inclusion and structure; ESPN normalizes current roster identity where it matches and supplies head coach metadata. ESPN omissions do not silently delete an Ourlads depth-chart player; unmatched names are retained and explicitly flagged for Step 3 verification. The generator selects a deliberately small starter-first pool under the same ceilings as NFL Wheel. Raw ESPN roster order never determines priority. Step 3 must manually audit football importance and reorder/replace edge cases conference by conference before CFB Wheel runtime launch.",
  caps: CAPS,
  teamCount: Object.keys(teams).length,
  teams,
};

await mkdir(OUTPUT_PATH.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log("PASS: generated " + Object.keys(teams).length + " current CFB Wheel school baselines.");
console.log("Wrote " + OUTPUT_PATH);
