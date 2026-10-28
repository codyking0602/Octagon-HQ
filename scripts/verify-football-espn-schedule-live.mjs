const ESPN_HOST = "https://site.web.api.espn.com";
const leagues = [
  { name: "nfl", path: "football/nfl", group: null },
  { name: "college-football", path: "football/college-football", group: "80" },
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.valueOf()) || isoDate(date) !== value) throw new Error(`Invalid ISO date: ${value}`);
  return date;
}

function addDays(value, days) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

function mostRecentTuesday() {
  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceTuesday = (cursor.getUTCDay() - 2 + 7) % 7;
  cursor.setUTCDate(cursor.getUTCDate() - daysSinceTuesday);
  return isoDate(cursor);
}

function weekDateQueries(weekStart) {
  return Array.from({ length: 8 }, (_, index) => addDays(weekStart, index).replaceAll("-", ""));
}

async function fetchScoreboard(league, dateQuery) {
  const url = new URL(`${ESPN_HOST}/apis/site/v2/sports/${league.path}/scoreboard`);
  url.searchParams.set("dates", dateQuery);
  url.searchParams.set("limit", "200");
  if (league.group) url.searchParams.set("groups", league.group);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Octagon-HQ-football-provider-check/1",
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (!Array.isArray(payload?.events)) {
        throw new Error(`ESPN ${league.name} ${dateQuery} returned no events array.`);
      }
      return payload.events.length;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 3) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `ESPN ${league.name} ${dateQuery} failed HTTP ${response.status}: ${body.slice(0, 180)}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  return 0;
}

const currentWeek = mostRecentTuesday();
const weekStarts = [currentWeek, addDays(currentWeek, 7)];
let requests = 0;
let events = 0;

for (const weekStart of weekStarts) {
  for (const league of leagues) {
    for (const dateQuery of weekDateQueries(weekStart)) {
      events += await fetchScoreboard(league, dateQuery);
      requests += 1;
    }
  }
}

console.log(
  `PASS: ESPN Football schedule provider accepted ${requests} single-date requests across current/next Tuesday-Monday windows plus Monday-night UTC spillover; received ${events} total event rows.`,
);
