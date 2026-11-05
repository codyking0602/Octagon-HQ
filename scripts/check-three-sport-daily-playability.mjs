// Read-only production check. No player profile, game submission, or mutation.
// The existing five-minute Supabase scheduler still owns publication.
const SQL = `
with sports(sport) as (
  values ('football'::text), ('ufc'::text), ('nba'::text)
), expected as (
  select sport, public.get_daily_challenge_materialization_request(sport, now()) as request
  from sports
)
select
  e.sport,
  e.request->>'central_day' as day,
  (now() at time zone 'America/Chicago')::date::text as central_today,
  e.request->>'expected_game' as expected_game,
  e.request->>'published_game' as published_game,
  coalesce((e.request->>'required')::boolean, true) as required,
  (e.request->>'daily_challenge_id') is not null as has_challenge,
  c.game_type as stored_game,
  c.scoring_version,
  (jsonb_typeof(s.public_setup)='object'
    and jsonb_typeof(s.public_setup->'initial_state')='object'
    and jsonb_typeof(s.private_setup_evidence)='object'
    and jsonb_typeof(s.private_grading_evidence)='object') as valid_setup,
  case when c.scoring_version = 'daily-two-game-average-score-v1' then (
    jsonb_typeof(s.public_setup->'rounds')='array'
    and case when jsonb_typeof(s.public_setup->'rounds')='array'
      then jsonb_array_length(s.public_setup->'rounds')=2 else false end
    and jsonb_typeof(s.public_setup->'initial_state'->'active_round')='object'
  ) else true end as valid_two_game,
  case when c.game_type='higher_lower' then
    coalesce(s.public_setup->'initial_state'->'active_round'->'current_question'->>'id',
             s.public_setup->'initial_state'->'current_question'->>'id','') <> ''
  else true end as valid_higher_lower_question,
  extract(epoch from ((now() at time zone 'America/Chicago')
    - date_trunc('day', now() at time zone 'America/Chicago'))) / 60 as central_minutes
from expected e
left join private.daily_challenges c on c.id = nullif(e.request->>'daily_challenge_id','')::uuid
left join private.daily_challenge_setups s on s.id=c.setup_id
order by e.sport;
`;

export function validateDailyPlayability(rows) {
  if (!Array.isArray(rows) || rows.length !== 3) {
    throw new Error("Production Daily monitor did not return exactly three sport records.");
  }
  const failures = [];
  const summaries = [];
  const seen = new Set();
  for (const row of rows) {
    const sport = row?.sport;
    if (!["football", "ufc", "nba"].includes(sport) || seen.has(sport)) {
      throw new Error("Daily monitor returned a duplicate or invalid sport.");
    }
    seen.add(sport);
    const game = row.expected_game;
    const day = row.day;
    if (!game) {
      if (sport !== "nba") failures.push(`${sport}: missing an active canonical schedule`);
      else summaries.push(`nba: outside the released NBA season`);
      continue;
    }
    if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      failures.push(`${sport}: missing a valid Central publication day`);
      continue;
    }
    const waitingForScheduler = row.required === true && Number(row.central_minutes) < 15
      && day === row.central_today;
    // The first scheduler invocation occurs shortly after Central midnight.
    // After the 15-minute grace window, missing publication is an incident.
    if (waitingForScheduler) {
      summaries.push(`${sport} ${day} ${game}: scheduler grace window`);
      continue;
    }
    if (row.required !== false || row.has_challenge !== true) {
      failures.push(`${sport} ${day} ${game}: no published Daily challenge`);
    } else if (row.published_game !== game || row.stored_game !== game) {
      failures.push(`${sport} ${day}: published ${row.published_game} does not match scheduled ${game}`);
    } else if (row.valid_setup !== true || row.valid_two_game !== true ||
      row.valid_higher_lower_question !== true) {
      failures.push(`${sport} ${day} ${game}: published board is missing required playable evidence`);
    } else {
      summaries.push(`${sport} ${day} ${game}: published and validated`);
    }
  }
  return { failures, summaries };
}

export async function checkEdgeRuntimeReachable(ref, client = fetch) {
  // A real HTTP request catches a stopped/broken runtime even when an old
  // immutable Daily setup still exists in Postgres. This mode neither signs
  // in a player nor creates/advances a challenge.
  const response = await client(
    `https://${ref}.supabase.co/functions/v1/daily-challenge-runtime`,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "deployment-info" }),
      signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw new Error(`Daily Edge runtime health returned HTTP ${response.status}`);
  const payload = await response.json();
  if (typeof payload?.deployment_sha !== "string" || !payload.deployment_sha) {
    throw new Error("Daily Edge runtime did not return a valid deployment identity.");
  }
}

function unwrapRows(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.rows)) return body.rows;
  throw new Error("Management API did not return SQL result rows.");
}

async function run() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = process.env.SUPABASE_PROJECT_ID;
  if (!token || !/^[a-z0-9]{20}$/.test(ref ?? "")) {
    throw new Error("Daily health monitor lacks valid Supabase management credentials.");
  }
  const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`;
  let body;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: SQL, read_only: true }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        // Database query errors are diagnostic, never player data. Do not echo
        // tokens or request headers. The plain HTTP code hid the first failure.
        const details = (await response.text()).slice(0, 900).replace(/[\\r\\n]+/g, " ");
        throw new Error(`Management SQL query returned HTTP ${response.status}: ${details || "no diagnostic body"}`);
      }
      body = await response.json();
      break;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  if (!body) throw lastError ?? new Error("Management SQL query failed.");
  const { failures, summaries } = validateDailyPlayability(unwrapRows(body));
  try {
    await checkEdgeRuntimeReachable(ref);
    summaries.push("Shared Daily Edge HTTP runtime: reachable");
  } catch (error) {
    failures.push(`Shared Daily Edge HTTP runtime: ${error instanceof Error ? error.message : String(error)}`);
  }
  const output = [...summaries, ...failures.map(f => "FAIL " + f)].join("\n");
  console.log(output);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      "### Three-sport Daily playability\n" + [...summaries, ...failures]
        .map(item => "- " + item).join("\n") + "\n");
  }
  if (failures.length) throw new Error(`Daily monitor found ${failures.length} production incident(s).`);
}

if (process.argv[1] && import.meta.url === (await import("node:url")).pathToFileURL((await import("node:path")).resolve(process.argv[1])).href) {
  run().catch(error => { console.error(error.message); process.exitCode = 1; });
}
