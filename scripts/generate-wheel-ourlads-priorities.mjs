import { mkdir, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://secure.ourlads.com/nfldepthcharts/pfdepthcharts.aspx";
const OUTPUT_PATH = process.argv[2] ?? "tmp/wheel-ourlads-priorities.json";

const TEAM_CODE = {
  ARZ: "ARI",
  ATL: "ATL",
  BAL: "BAL",
  BUF: "BUF",
  CAR: "CAR",
  CHI: "CHI",
  CIN: "CIN",
  CLE: "CLE",
  DAL: "DAL",
  DEN: "DEN",
  DET: "DET",
  GB: "GB",
  HOU: "HOU",
  IND: "IND",
  JAX: "JAX",
  KC: "KC",
  LAC: "LAC",
  LAR: "LAR",
  LV: "LV",
  MIA: "MIA",
  MIN: "MIN",
  NE: "NE",
  NO: "NO",
  NYG: "NYG",
  NYJ: "NYJ",
  PHI: "PHI",
  PIT: "PIT",
  SEA: "SEA",
  SF: "SF",
  TB: "TB",
  TEN: "TEN",
  WAS: "WSH",
};

const FRONT_POSITIONS = new Set([
  "DE", "LDE", "RDE", "DT", "NT", "DL", "ED", "EDGE", "RUSH",
  "LB", "ILB", "OLB", "WLB", "SLB", "MLB", "LILB", "RILB", "LOLB", "ROLB",
]);
const SECONDARY_POSITIONS = new Set(["CB", "LCB", "RCB", "NB", "NCB", "DB", "S", "SS", "FS"]);
const RESERVE_STATUSES = new Set(["IR", "PUP", "NFI", "DFR", "SUS", "CE", "PS/IR"]);
const PLAYER_POSITION_SUFFIXES = new Set([
  "QB", "RB", "FB", "WR", "TE",
  "DE", "DT", "NT", "DL", "ED", "EDGE",
  "LB", "ILB", "OLB", "WLB", "SLB", "MLB", "LILB", "RILB", "LOLB", "ROLB",
  "CB", "DB", "S", "SS", "FS",
]);

function decodeHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
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

function activePlayerName(raw) {
  let value = raw.trim();
  value = value.replace(/\s+(?:\d{2}\/\d\*?|(?:U|T|W|CC|P|R)\/[A-Za-z]+|(?:SF|CF)\d{2}\*?)$/i, "");
  return displayName(value);
}

function reservePlayer(raw) {
  let value = raw.trim();
  const match = value.match(/^(.*)\s+([A-Z]{1,5})\^?$/);
  if (!match) return null;
  const position = match[2].toUpperCase();
  if (!PLAYER_POSITION_SUFFIXES.has(position)) return null;
  return { name: displayName(match[1]), position };
}

function displayName(value) {
  const comma = value.indexOf(",");
  if (comma < 0) return titleCaseAllCaps(value);
  const last = value.slice(0, comma).trim();
  const first = value.slice(comma + 1).trim();
  return titleCaseAllCaps(`${first} ${last}`);
}

function titleCaseAllCaps(value) {
  if (!/[a-z]/.test(value) && /[A-Z]/.test(value)) {
    return value.toLowerCase().replace(/(^|[\s'-])([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase())
      .replace(/\bIi\b/g, "II")
      .replace(/\bIii\b/g, "III")
      .replace(/\bIv\b/g, "IV")
      .replace(/\bSr\b/g, "Sr.")
      .replace(/\bJr\b/g, "Jr.");
  }
  return value;
}

function bucketForPosition(position) {
  if (position === "QB") return "QB";
  if (position === "RB") return "RB";
  if (position === "TE") return "TE";
  if (["WR", "LWR", "RWR", "SWR"].includes(position)) return "WR";
  if (FRONT_POSITIONS.has(position)) return "Front Seven";
  if (SECONDARY_POSITIONS.has(position)) return "Secondary";
  return null;
}

function emptyBucket() {
  return { starters: [], depth: [], reserves: [] };
}

function emptyTeam() {
  return {
    QB: emptyBucket(),
    RB: emptyBucket(),
    WR: emptyBucket(),
    TE: emptyBucket(),
    "Front Seven": emptyBucket(),
    Secondary: emptyBucket(),
  };
}

function pushUnique(list, name) {
  if (name && !list.includes(name)) list.push(name);
}

async function fetchSource() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(SOURCE_URL, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Octagon-HQ-Wheel-audit/1.0",
      },
    });
    if (response.ok) return response.text();
    if (attempt === 3 || (response.status !== 429 && response.status < 500)) {
      throw new Error(`Ourlads depth-chart fetch failed HTTP ${response.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 600));
  }
  throw new Error("Ourlads depth-chart fetch failed.");
}

const html = await fetchSource();
const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => {
  const cells = [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
    .map((cell) => decodeHtml(cell[1]));
  return cells;
});

const teams = Object.fromEntries(Object.values(TEAM_CODE).map((code) => [code, emptyTeam()]));
const activePhase = Object.fromEntries(Object.values(TEAM_CODE).map((code) => [code, true]));

for (const cells of rows) {
  const sourceCode = cells[0]?.trim().toUpperCase();
  const teamCode = sourceCode ? TEAM_CODE[sourceCode] : null;
  if (!teamCode || cells.length < 4) continue;
  const position = cells[1]?.trim().toUpperCase();
  if (!position) continue;

  if (RESERVE_STATUSES.has(position)) {
    for (let index = 3; index < cells.length; index += 2) {
      const parsed = reservePlayer(cells[index] ?? "");
      if (!parsed) continue;
      const bucket = bucketForPosition(parsed.position);
      if (bucket) pushUnique(teams[teamCode][bucket].reserves, parsed.name);
    }
    continue;
  }

  if (position === "KR") {
    activePhase[teamCode] = false;
    continue;
  }
  if (!activePhase[teamCode]) continue;

  const bucket = bucketForPosition(position);
  if (!bucket) continue;
  const rawPlayers = [];
  for (let index = 3; index < cells.length; index += 2) {
    const raw = cells[index]?.trim();
    if (raw) rawPlayers.push(raw);
  }
  if (!rawPlayers.length) continue;
  const names = rawPlayers.map(activePlayerName).filter(Boolean);
  pushUnique(teams[teamCode][bucket].starters, names[0]);
  for (const name of names.slice(1)) pushUnique(teams[teamCode][bucket].depth, name);
}

const failures = [];
for (const [code, team] of Object.entries(teams)) {
  if (team.QB.starters.length !== 1) failures.push(`${code}: expected exactly one QB starter row, got ${team.QB.starters.length}`);
  if (team.RB.starters.length !== 1) failures.push(`${code}: expected exactly one RB starter row, got ${team.RB.starters.length}`);
  if (team.WR.starters.length < 2) failures.push(`${code}: fewer than two WR starters`);
  if (team.TE.starters.length < 1) failures.push(`${code}: missing TE starter`);
  if (team["Front Seven"].starters.length < 5) failures.push(`${code}: fewer than five front-seven starters`);
  if (team.Secondary.starters.length < 4) failures.push(`${code}: fewer than four secondary starters`);
}

if (Object.keys(teams).length !== 32) failures.push(`expected 32 teams, got ${Object.keys(teams).length}`);
if (failures.length) {
  throw new Error(`Ourlads Wheel audit failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

const output = {
  source: "Ourlads 2026 NFL Depth Charts",
  sourceUrl: SOURCE_URL,
  auditedAt: "2026-10-03",
  teams,
};

await mkdir(OUTPUT_PATH.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");

const totalReserveCandidates = Object.values(teams).reduce(
  (total, team) => total + Object.values(team).reduce((sum, bucket) => sum + bucket.reserves.length, 0),
  0,
);
console.log(`PASS: parsed 32 Ourlads teams for Wheel priorities; captured ${totalReserveCandidates} reserve/injury candidates.`);
console.log(`Wrote ${OUTPUT_PATH}`);
