import fs from "node:fs";

const ESPN_RANKINGS_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";
const baselinePath =
  "data/generated/football/cfb/wheel-football-current-priorities-2026.json";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function pollDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const supportedByEspnId = new Map(
  Object.entries(baseline.teams).map(([teamCode, team]) => [
    String(team.espnId),
    { team_code: teamCode, team_name: team.school },
  ]),
);
supportedByEspnId.set("68", {
  team_code: "boise-state",
  team_name: "Boise State",
});

const rankingsResponse = await fetch(ESPN_RANKINGS_URL, {
  headers: {
    Accept: "application/json",
    "User-Agent": "OctagonHQ/1.0",
  },
});
if (!rankingsResponse.ok) {
  throw new Error(`ESPN rankings returned HTTP ${rankingsResponse.status}.`);
}
const payload = await rankingsResponse.json();
const polls = Array.isArray(payload?.rankings) ? payload.rankings : [];
const apPoll = polls.find((poll) => /ap\s+top\s*25/i.test(String(poll?.name ?? "")));
if (!apPoll || !Array.isArray(apPoll.ranks)) {
  throw new Error("ESPN did not return an AP Top 25 poll.");
}

const rankings = apPoll.ranks
  .map((row) => {
    const rank = Number(row?.current);
    const espnId = String(row?.team?.id ?? "").trim();
    const supported = supportedByEspnId.get(espnId);
    return rank >= 1 && rank <= 25 && supported
      ? {
          rank,
          ...supported,
          espn_id: espnId,
        }
      : {
          rank,
          team_code: "",
          team_name: String(row?.team?.displayName ?? row?.team?.location ?? "").trim(),
          espn_id: espnId,
        };
  })
  .filter((row) => row.rank >= 1 && row.rank <= 25)
  .sort((left, right) => left.rank - right.rank);

const unsupported = rankings.filter((row) => !row.team_code);
const ranks = new Set(rankings.map((row) => row.rank));
if (rankings.length !== 25 || ranks.size !== 25) {
  throw new Error("AP Top 25 did not contain exactly 25 unique ranked teams.");
}
if (unsupported.length) {
  throw new Error(
    "AP Top 25 includes unsupported Wheel team(s): "
      + unsupported.map((row) => `#${row.rank} ${row.team_name || row.espn_id}`).join(", ")
      + ". The previous complete poll remains live until those teams are graded.",
  );
}

const supabaseUrl = requiredEnv("SUPABASE_URL").replace(/\/$/, "");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const source = "ESPN AP Top 25 · " + ESPN_RANKINGS_URL;
const date = pollDate(apPoll.date);

const syncResponse = await fetch(
  `${supabaseUrl}/rest/v1/rpc/sync_wheel_football_ap_top25`,
  {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      p_rankings: rankings,
      p_poll_date: date,
      p_source: source,
    }),
  },
);
if (!syncResponse.ok) {
  throw new Error(
    `AP Top 25 Supabase sync returned HTTP ${syncResponse.status}: ${await syncResponse.text()}`,
  );
}

console.log(
  `Synchronized Wheel of Football AP Top 25 for ${date}: `
    + rankings.map((row) => `#${row.rank} ${row.team_name}`).join(", "),
);
