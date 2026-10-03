import { readFile, writeFile, mkdir } from "node:fs/promises";

const BASELINE_PATH = "data/generated/football/cfb/wheel-football-current-priorities-2026.json";
const OUT_JSON = "tmp/cfb-wheel-audit-evidence.json";
const OUT_MD = "tmp/cfb-wheel-audit-evidence.md";
const SEASON = 2026;

const baseline = JSON.parse(await readFile(BASELINE_PATH, "utf8"));

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned || cleaned === "--") return 0;
  if (/^-?\d+(?:\.\d+)?$/.test(cleaned)) return Number(cleaned);
  return 0;
}

function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "OctagonHQ/1.0" },
  });
  if (!response.ok) throw new Error("Fetch failed " + response.status + " " + url);
  return response.json();
}

function playerName(raw) {
  return raw?.displayName ?? raw?.fullName ?? [raw?.firstName, raw?.lastName].filter(Boolean).join(" ");
}

function rosterMap(payload) {
  const out = new Map();
  for (const group of payload?.athletes ?? []) {
    for (const item of group?.items ?? []) {
      const name = playerName(item);
      if (!name) continue;
      out.set(norm(name), {
        name,
        position: item?.position?.abbreviation ?? item?.position?.displayName ?? "",
      });
    }
  }
  return out;
}

function eventIds(schedule, espnId) {
  const ids = [];
  for (const event of schedule?.events ?? []) {
    const competition = event?.competitions?.[0];
    if (!competition?.status?.type?.completed) continue;
    const hasTeam = (competition?.competitors ?? []).some((c) => String(c?.team?.id) === String(espnId));
    if (!hasTeam) continue;
    ids.push(String(event.id));
  }
  return [...new Set(ids)];
}

function ensurePlayer(map, rawAthlete, roster) {
  const name = playerName(rawAthlete);
  if (!name) return null;
  const key = norm(name);
  if (!map.has(key)) {
    const rosterEntry = roster.get(key);
    map.set(key, {
      name: rosterEntry?.name ?? name,
      position: rosterEntry?.position ?? rawAthlete?.position?.abbreviation ?? "",
      games: 0,
      groups: {},
      totals: {
        passYds: 0, passTd: 0, interceptionsThrown: 0,
        rushYds: 0, rushTd: 0, receptions: 0, recYds: 0, recTd: 0,
        tackles: 0, solo: 0, sacks: 0, tfl: 0, interceptions: 0,
        passesDefended: 0, forcedFumbles: 0, fumbleRecoveries: 0, qbHits: 0,
      },
    });
  }
  return map.get(key);
}

function labelIndex(labels, aliases) {
  const normalized = labels.map((x) => String(x).toUpperCase().replace(/[^A-Z0-9]/g, ""));
  for (const alias of aliases) {
    const target = alias.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const idx = normalized.indexOf(target);
    if (idx >= 0) return idx;
  }
  return -1;
}

function add(player, field, value) {
  player.totals[field] += asNumber(value);
}

function collectStats(player, groupName, labels, stats) {
  const upper = String(groupName ?? "").toLowerCase();
  player.groups[upper] = player.groups[upper] ?? [];
  player.groups[upper].push({ labels, stats });

  const at = (aliases) => {
    const idx = labelIndex(labels, aliases);
    return idx >= 0 ? stats[idx] : undefined;
  };

  if (upper.includes("passing")) {
    add(player, "passYds", at(["YDS", "YARDS"]));
    add(player, "passTd", at(["TD", "TDS"]));
    add(player, "interceptionsThrown", at(["INT", "INTS"]));
  } else if (upper.includes("rushing")) {
    add(player, "rushYds", at(["YDS", "YARDS"]));
    add(player, "rushTd", at(["TD", "TDS"]));
  } else if (upper.includes("receiving")) {
    add(player, "receptions", at(["REC", "RECEPTIONS"]));
    add(player, "recYds", at(["YDS", "YARDS"]));
    add(player, "recTd", at(["TD", "TDS"]));
  } else if (upper.includes("defens")) {
    add(player, "tackles", at(["TOT", "TOTAL", "TACKLES"]));
    add(player, "solo", at(["SOLO"]));
    add(player, "sacks", at(["SACKS", "SACK"]));
    add(player, "tfl", at(["TFL"]));
    add(player, "passesDefended", at(["PD", "PDEF"]));
    add(player, "qbHits", at(["QBH", "QBHITS"]));
    add(player, "forcedFumbles", at(["FF"]));
    add(player, "fumbleRecoveries", at(["FR"]));
  } else if (upper.includes("interception")) {
    add(player, "interceptions", at(["INT", "INTS"]));
    add(player, "passesDefended", at(["PD", "PDEF"]));
  } else if (upper.includes("fumble")) {
    add(player, "forcedFumbles", at(["FF"]));
    add(player, "fumbleRecoveries", at(["REC", "FR"]));
  }
}

function parseSummary(summary, espnId, roster, map) {
  const teamBlock = (summary?.boxscore?.players ?? []).find((block) => String(block?.team?.id) === String(espnId));
  if (!teamBlock) return;
  const seen = new Set();
  for (const group of teamBlock.statistics ?? []) {
    const labels = group?.labels ?? group?.names ?? [];
    for (const row of group?.athletes ?? []) {
      const player = ensurePlayer(map, row?.athlete, roster);
      if (!player) continue;
      const key = norm(player.name);
      seen.add(key);
      collectStats(player, group?.name ?? group?.displayName ?? "", labels, row?.stats ?? []);
    }
  }
  for (const key of seen) map.get(key).games += 1;
}

function offenseScore(p) {
  return p.totals.rushYds
    + p.totals.recYds
    + (p.totals.rushTd + p.totals.recTd) * 55
    + p.totals.receptions * 2;
}

function defenseScore(p) {
  return p.totals.tackles * 1.5
    + p.totals.solo * 0.5
    + p.totals.sacks * 14
    + p.totals.tfl * 6
    + p.totals.interceptions * 18
    + p.totals.passesDefended * 5
    + p.totals.forcedFumbles * 12
    + p.totals.fumbleRecoveries * 8
    + p.totals.qbHits * 3;
}

function compactPlayer(p) {
  return {
    name: p.name,
    position: p.position,
    games: p.games,
    offenseScore: Math.round(offenseScore(p) * 10) / 10,
    defenseScore: Math.round(defenseScore(p) * 10) / 10,
    totals: p.totals,
  };
}

const result = {
  generatedAt: new Date().toISOString(),
  season: SEASON,
  source: "ESPN completed-game boxscores + current roster, for human audit evidence only",
  teams: {},
};

for (const [schoolId, team] of Object.entries(baseline.teams)) {
  const scheduleUrl = "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/" + team.espnId + "/schedule?season=" + SEASON;
  const rosterUrl = "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/" + team.espnId + "/roster";
  const [schedule, rosterPayload] = await Promise.all([getJson(scheduleUrl), getJson(rosterUrl)]);
  const roster = rosterMap(rosterPayload);
  const players = new Map();
  const ids = eventIds(schedule, team.espnId);

  for (const eventId of ids) {
    const summary = await getJson("https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=" + eventId);
    parseSummary(summary, team.espnId, roster, players);
  }

  const all = [...players.values()].map(compactPlayer);
  const offense = all.filter((p) => ["RB", "HB", "FB", "WR", "TE"].includes(String(p.position).toUpperCase()))
    .sort((a,b) => b.offenseScore - a.offenseScore || a.name.localeCompare(b.name));
  const defense = all.filter((p) => !["QB", "RB", "HB", "FB", "WR", "TE", "OL", "OT", "OG", "C", "K", "P", "LS"].includes(String(p.position).toUpperCase()))
    .sort((a,b) => b.defenseScore - a.defenseScore || a.name.localeCompare(b.name));

  const baselineNames = new Set([
    ...team.QB, ...team.RB, ...team.WR, ...team.TE, ...team.Flex,
    ...team["Front Seven"], ...team.Secondary,
  ].map(norm));

  result.teams[schoolId] = {
    school: team.school,
    conference: team.conference,
    espnId: team.espnId,
    completedGames: ids.length,
    baseline: {
      QB: team.QB, RB: team.RB, WR: team.WR, TE: team.TE, Flex: team.Flex,
      "Front Seven": team["Front Seven"], Secondary: team.Secondary,
      "Head Coach": team["Head Coach"],
    },
    warnings: team.reconciliationWarnings,
    offenseTop: offense.slice(0, 12),
    defenseTop: defense.slice(0, 16),
    productiveMissing: [
      ...offense.filter((p) => !baselineNames.has(norm(p.name))).slice(0, 6),
      ...defense.filter((p) => !baselineNames.has(norm(p.name))).slice(0, 8),
    ],
  };

  console.log("PASS " + team.school + " games=" + ids.length + " offense=" + offense.slice(0,4).map(p => p.name).join(" | ") + " defense=" + defense.slice(0,5).map(p => p.name).join(" | "));
}

await mkdir("tmp", { recursive: true });
await writeFile(OUT_JSON, JSON.stringify(result, null, 2) + "\n");

const lines = [
  "# 2026 CFB Wheel audit evidence",
  "",
  "Generated from ESPN completed-game boxscores/current rosters. This is evidence for human curation, not an automatic ranking authority.",
  "",
];
for (const conference of ["SEC", "Big Ten", "Big 12", "ACC", "Independent"]) {
  lines.push("## " + conference, "");
  for (const team of Object.values(result.teams).filter((x) => x.conference === conference)) {
    lines.push("### " + team.school);
    lines.push("Completed games: " + team.completedGames);
    lines.push("Baseline QB: " + team.baseline.QB.join(" / "));
    lines.push("Baseline RB: " + team.baseline.RB.join(" / "));
    lines.push("Baseline WR: " + team.baseline.WR.join(" / "));
    lines.push("Baseline Front Seven: " + team.baseline["Front Seven"].join(" / "));
    lines.push("Baseline Secondary: " + team.baseline.Secondary.join(" / "));
    lines.push("Offense production: " + team.offenseTop.slice(0,8).map((p) => p.name + " [" + p.position + "] " + p.offenseScore).join("; "));
    lines.push("Defense production: " + team.defenseTop.slice(0,10).map((p) => p.name + " [" + p.position + "] " + p.defenseScore).join("; "));
    lines.push("Productive missing: " + (team.productiveMissing.length ? team.productiveMissing.map((p) => p.name + " [" + p.position + "]").join("; ") : "none"));
    lines.push("Warnings: " + (team.warnings.length ? team.warnings.map((w) => w.sourceName).join("; ") : "none"));
    lines.push("");
  }
}
await writeFile(OUT_MD, lines.join("\n") + "\n");
console.log("Wrote " + OUT_JSON + " and " + OUT_MD);
