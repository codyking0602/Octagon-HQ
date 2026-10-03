const ESPN_CORE_HOST = "https://sports.core.api.espn.com";
const WHEEL_SEASON = 2026;
const teams = {
  ARI: 22, ATL: 1, BAL: 33, BUF: 2, CAR: 29, CHI: 3, CIN: 4, CLE: 5,
  DAL: 6, DEN: 7, DET: 8, GB: 9, HOU: 34, IND: 11, JAX: 30, KC: 12,
  LAC: 24, LAR: 14, LV: 13, MIA: 15, MIN: 16, NE: 17, NO: 18, NYG: 19,
  NYJ: 20, PHI: 21, PIT: 23, SEA: 26, SF: 25, TB: 27, TEN: 10, WSH: 28,
};

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function positionAbbreviation(key, row) {
  const position = asObject(row?.position);
  const explicit = typeof position?.abbreviation === "string" ? position.abbreviation.trim().toUpperCase() : "";
  if (explicit) return explicit;
  const normalized = key.toUpperCase();
  const aliases = {
    QUARTERBACK: "QB",
    RUNNINGBACK: "RB",
    RUNNING_BACK: "RB",
    WIDERECEIVER: "WR",
    WIDE_RECEIVER: "WR",
    TIGHTEND: "TE",
    TIGHT_END: "TE",
    LEFTDEFENSIVEEND: "DE",
    RIGHTDEFENSIVEEND: "DE",
    DEFENSIVEEND: "DE",
    DEFENSIVETACKLE: "DT",
    NOSETACKLE: "NT",
    LINEBACKER: "LB",
    INSIDELINEBACKER: "ILB",
    OUTSIDELINEBACKER: "OLB",
    CORNERBACK: "CB",
    SAFETY: "S",
    FREESAFETY: "FS",
    STRONGSAFETY: "SS",
  };
  return aliases[normalized.replace(/[^A-Z]/g, "")] ?? normalized;
}

function starterAthletes(payload) {
  const depthCharts = Array.isArray(payload?.depthCharts)
    ? payload.depthCharts
    : Array.isArray(payload?.items)
      ? payload.items
      : [];
  const rows = [];
  for (const chartValue of depthCharts) {
    const chart = asObject(chartValue);
    const rawPositions = chart?.positions;
    const positionEntries = Array.isArray(rawPositions)
      ? rawPositions.map((value, index) => [String(index), value])
      : Object.entries(asObject(rawPositions) ?? {});
    for (const [key, positionValue] of positionEntries) {
      const position = asObject(positionValue);
      const athletes = Array.isArray(position?.athletes) ? position.athletes : [];
      for (let index = 0; index < athletes.length; index += 1) {
        const athleteEntry = asObject(athletes[index]);
        if (!athleteEntry) continue;
        const athlete = asObject(athleteEntry.athlete) ?? athleteEntry;
        const rankValue = athleteEntry.rank;
        const rank = Number.isFinite(rankValue) ? Math.max(1, Math.floor(rankValue)) : index + 1;
        const id = typeof athlete?.id === "string" ? athlete.id : null;
        const name = typeof athlete?.displayName === "string"
          ? athlete.displayName
          : typeof athlete?.fullName === "string"
            ? athlete.fullName
            : null;
        if (!id && !name) continue;
        rows.push({
          position: positionAbbreviation(key, position),
          rank,
          id,
          name,
        });
      }
    }
  }
  return rows;
}

async function fetchDepthChart(code, teamId) {
  const url = `${ESPN_CORE_HOST}/v2/sports/football/leagues/nfl/seasons/${WHEEL_SEASON}/teams/${teamId}/depthcharts`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Octagon-HQ-wheel-depth-audit/1",
      },
    });
    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 3) {
      const body = await response.text().catch(() => "");
      throw new Error(`${code} depth chart failed HTTP ${response.status}: ${body.slice(0, 180)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw new Error(`${code} depth chart unavailable`);
}

const FRONT = new Set(["DE", "DT", "NT", "DL", "LB", "ILB", "OLB", "EDGE"]);
const SECONDARY = new Set(["CB", "S", "FS", "SS", "DB"]);
const failures = [];
const summaries = [];

for (const [code, teamId] of Object.entries(teams)) {
  const payload = await fetchDepthChart(code, teamId);
  const rows = starterAthletes(payload);
  const starters = rows.filter((row) => row.rank === 1);
  const qb = starters.filter((row) => row.position === "QB");
  const rb = starters.filter((row) => row.position === "RB");
  const wr = starters.filter((row) => row.position === "WR");
  const front = starters.filter((row) => FRONT.has(row.position));
  const secondary = starters.filter((row) => SECONDARY.has(row.position));

  const chartRows = Array.isArray(payload?.depthCharts)
    ? payload.depthCharts
    : Array.isArray(payload?.items)
      ? payload.items
      : [];
  if (chartRows.length === 0) {
    failures.push(`${code}: no depth-chart rows`);
  }
  if (qb.length < 1) failures.push(`${code}: no QB1`);
  if (rb.length < 1) failures.push(`${code}: no RB1`);
  if (wr.length < 2) failures.push(`${code}: fewer than two WR starters`);
  if (front.length < 3) failures.push(`${code}: fewer than three front-seven starters`);
  if (secondary.length < 3) failures.push(`${code}: fewer than three secondary starters`);

  summaries.push({
    code,
    qb1: qb[0]?.name ?? qb[0]?.id ?? "missing",
    wr1: wr.slice(0, 3).map((row) => row.name ?? row.id).join(" / "),
    front: front.length,
    secondary: secondary.length,
  });
}

if (failures.length) {
  throw new Error(`Wheel NFL depth-chart audit failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

console.log(`PASS: Wheel NFL depth-chart audit validated all ${summaries.length} teams with QB/RB/WR/front-seven/secondary starter coverage.`);
console.log(
  summaries.map((row) => `${row.code}: QB1=${row.qb1}; WR=${row.wr1}; front=${row.front}; secondary=${row.secondary}`).join("\n"),
);
