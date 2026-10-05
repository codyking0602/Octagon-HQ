import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const PRIORITY_PATH = path.join(ROOT, "data/generated/football/wheel-football-priorities.json");
const OUTPUT_PATH = path.join(ROOT, "data/generated/football/gm-mode-nfl-contracts-2026.json");

const POSITION_PAGES = [
  ["QB", "QB", "quarterback"],
  ["RB", "RB", "running-back"],
  ["WR", "WR", "wide-receiver"],
  ["TE", "TE", "tight-end"],
  ["Front Seven", "DL", "interior-defensive-line"],
  ["Front Seven", "DL", "edge-rusher"],
  ["Front Seven", "LB", "linebacker"],
  ["Secondary", "DB", "cornerback"],
  ["Secondary", "DB", "safety"],
];

const TEAM_CODE_BY_NAME = {
  cardinals: "ARI", falcons: "ATL", ravens: "BAL", bills: "BUF",
  panthers: "CAR", bears: "CHI", bengals: "CIN", browns: "CLE",
  cowboys: "DAL", broncos: "DEN", lions: "DET", packers: "GB",
  texans: "HOU", colts: "IND", jaguars: "JAX", chiefs: "KC",
  raiders: "LV", chargers: "LAC", rams: "LAR", dolphins: "MIA",
  vikings: "MIN", patriots: "NE", saints: "NO", giants: "NYG",
  jets: "NYJ", eagles: "PHI", steelers: "PIT", "49ers": "SF",
  seahawks: "SEA", buccaneers: "TB", titans: "TEN", commanders: "WSH",
};

const FAMILY_KEYS = ["QB", "RB", "WR", "TE", "Front Seven", "Secondary"];
const SUFFIX = /(?:iii|ii|iv|jr|sr|v)$/;

const NAME_ALIASES = {
  gregrousseau: "gregoryrousseau",
  cjgardnerjohnson: "chaunceygardnerjohnsonjr",
  daxhill: "daxtonhill",
  patsurtainii: "patricksurtainii",
  saucegardner: "ahmadgardner",
  matthewstafford: "mattstafford",
  kamcurl: "kamrencurl",
  joshuche: "joshuauche",
  jujubrents: "juliusbrents",
  joshuametellus: "joshmetellus",
  druphillips: "andruphillips",
  riqwoolen: "tariqwoolen",
  kennygainwell: "kennethgainwell",
  chigokonkwo: "chigoziemokonkwo",
};

const GM_POSITION_OVERRIDES = {
  "IND|Front Seven|jayloncarlies": "LB",
  "JAX|Secondary|travishunter": "DB",
};

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function identityName(value) {
  const normalized = normalize(value);
  return NAME_ALIASES[normalized] ?? normalized;
}

function baseName(value) {
  return identityName(value).replace(SUFFIX, "");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function cellText(value) {
  return decodeHtml(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  ).trim();
}

function money(value) {
  const number = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function parsePositionPage(html, sourceFamily, gmPosition) {
  const rows = [];
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => cellText(match[1]));
    if (cells.length < 8) continue;
    const [player, team, ageRaw, , apyRaw, , , freeAgencyRaw] = cells;
    const age = Number(ageRaw);
    const apy = money(apyRaw);
    const freeAgencyMatch = freeAgencyRaw.match(/(20\d{2})\s*(\w+)?/);
    const teamCode = TEAM_CODE_BY_NAME[normalize(team)];
    if (!player || !teamCode || !Number.isFinite(age) || apy == null || !freeAgencyMatch) continue;
    rows.push({
      player,
      normalizedPlayer: normalize(player),
      basePlayer: baseName(player),
      teamCode,
      age,
      currentApy: apy,
      freeAgencyYear: Number(freeAgencyMatch[1]),
      freeAgencyType: freeAgencyMatch[2] ?? null,
      sourceFamily,
      gmPosition,
    });
  }
  return rows;
}

async function fetchPage(slug) {
  const url = `https://overthecap.com/position/${slug}`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Octagon-HQ-GM-Mode-Contract-Audit/1.0",
    },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`OTC ${slug} returned HTTP ${response.status}`);
  return { url, html: await response.text() };
}

function curatedIdentities(priority) {
  const rows = [];
  for (const [teamCode, team] of Object.entries(priority.teams)) {
    for (const family of FAMILY_KEYS) {
      for (const player of team[family] ?? []) {
        rows.push({ teamCode, sourceFamily: family, player });
      }
    }
  }
  return rows;
}

function chooseMatch(identity, candidates) {
  const wanted = identityName(identity.player);
  const wantedBase = baseName(identity.player);

  const exact = candidates.filter((row) =>
    row.teamCode === identity.teamCode
    && row.sourceFamily === identity.sourceFamily
    && row.normalizedPlayer === wanted
  );
  if (exact.length === 1) return exact[0];

  const suffixSafe = candidates.filter((row) =>
    row.teamCode === identity.teamCode
    && row.sourceFamily === identity.sourceFamily
    && row.basePlayer === wantedBase
  );
  if (suffixSafe.length === 1) return suffixSafe[0];

  const sameTeamAnyContractPosition = candidates.filter((row) =>
    row.teamCode === identity.teamCode
    && (row.normalizedPlayer === wanted || row.basePlayer === wantedBase)
  );
  if (sameTeamAnyContractPosition.length === 1) return sameTeamAnyContractPosition[0];

  const familyOnly = candidates.filter((row) =>
    row.sourceFamily === identity.sourceFamily
    && row.basePlayer === wantedBase
  );
  if (familyOnly.length === 1) return familyOnly[0];

  const uniqueAnyTeam = candidates.filter((row) =>
    row.normalizedPlayer === wanted || row.basePlayer === wantedBase
  );
  if (uniqueAnyTeam.length === 1) return uniqueAnyTeam[0];

  return null;
}

function gmPositionFor(identity, match) {
  if (identity.sourceFamily === "QB") return "QB";
  if (identity.sourceFamily === "RB") return "RB";
  if (identity.sourceFamily === "WR") return "WR";
  if (identity.sourceFamily === "TE") return "TE";
  if (identity.sourceFamily === "Secondary") return "DB";

  const overrideKey = `${identity.teamCode}|${identity.sourceFamily}|${normalize(identity.player)}`;
  const override = GM_POSITION_OVERRIDES[overrideKey];
  if (override) return override;
  if (identity.sourceFamily === "Front Seven" && (match.gmPosition === "DL" || match.gmPosition === "LB")) {
    return match.gmPosition;
  }
  return null;
}

const priority = JSON.parse(await readFile(PRIORITY_PATH, "utf8"));
const scraped = [];
const sourceUrls = [];
for (const [sourceFamily, gmPosition, slug] of POSITION_PAGES) {
  const { url, html } = await fetchPage(slug);
  sourceUrls.push(url);
  const rows = parsePositionPage(html, sourceFamily, gmPosition);
  if (rows.length < 20) throw new Error(`OTC ${slug} parsed only ${rows.length} contract rows`);
  scraped.push(...rows);
}

const identities = curatedIdentities(priority);
const records = [];
const missing = [];
for (const identity of identities) {
  const match = chooseMatch(identity, scraped);
  if (!match) {
    missing.push(identity);
    continue;
  }
  const gmPosition = gmPositionFor(identity, match);
  if (!gmPosition) {
    missing.push({ ...identity, reason: `contract position ${match.gmPosition} needs explicit GM mapping` });
    continue;
  }
  records.push({
    team: identity.teamCode,
    player: identity.player,
    sourceFamily: identity.sourceFamily,
    gmPosition,
    age: match.age,
    currentApyMillions: match.currentApy / 1_000_000,
    freeAgencyYear: match.freeAgencyYear,
    freeAgencyType: match.freeAgencyType,
    gmTerm: match.freeAgencyYear >= 2029 ? "3YR" : "1YR",
  });
}

const duplicateKeys = records
  .map((row) => `${row.team}|${row.sourceFamily}|${normalize(row.player)}`)
  .filter((key, index, all) => all.indexOf(key) !== index);

if (missing.length || duplicateKeys.length || records.length !== identities.length) {
  const details = [
    `Expected ${identities.length}; resolved ${records.length}; missing ${missing.length}; duplicates ${duplicateKeys.length}.`,
    missing.length ? `Missing:\n${missing.map((row) => `- ${row.teamCode} ${row.sourceFamily}: ${row.player}${row.reason ? ` (${row.reason})` : ""}`).join("\n")}` : "",
    duplicateKeys.length ? `Duplicates:\n${duplicateKeys.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
  throw new Error(details);
}

records.sort((left, right) =>
  left.team.localeCompare(right.team)
  || left.sourceFamily.localeCompare(right.sourceFamily)
  || left.player.localeCompare(right.player)
);

const counts = records.reduce((acc, row) => {
  acc[row.gmPosition] = (acc[row.gmPosition] ?? 0) + 1;
  acc[row.gmTerm] = (acc[row.gmTerm] ?? 0) + 1;
  return acc;
}, {});

const payload = {
  schemaVersion: 1,
  version: "gm-mode-nfl-contracts-2026-v1",
  status: "calibration-not-runtime",
  generatedAt: new Date().toISOString(),
  source: "OverTheCap current position contract tables",
  sourceUrls,
  notes: [
    "Current salary is contract APY, not NFL cap hit.",
    "GM Mode has only 1YR and 3YR terms.",
    "Free agency in 2027 or 2028 is treated as 1YR and repriced in the single offseason.",
    "Free agency in 2029 or later is treated as 3YR and salary-locked for the game window.",
    "Flex is derived from the canonical RB/WR/TE identities and is not duplicated in this artifact.",
    "Head coaches are intentionally excluded from GM Mode.",
  ],
  expectedCanonicalPlayerIdentities: identities.length,
  counts,
  records,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Wrote ${records.length} GM Mode contract records to ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log(JSON.stringify(counts));
