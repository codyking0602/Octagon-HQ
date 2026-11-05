// Production Daily read-only watchdog. The existing five-minute scheduler tries
// to publish; this independent check must detect a missing or malformed board
// across Football, UFC and NBA, even if the Edge request returned HTTP 200.
// Only board metadata is queried; player identities and answers stay private.
import { fileURLToPath } from "node:url";

export const DAILY_HEALTH_QUERY = String.raw\`
with target as (
  select sport, public.get_daily_challenge_materialization_request(sport, now()) as request
  from (values ('football'), ('ufc'), ('nba')) as s(sport)
), board as (
  select t.sport, t.request, d.game_type as saved_game,
    d.scoring_version as saved_scoring, s.public_setup as setup
  from target t
  left join private.daily_challenges d
    on d.id = nullif(t.request->>'daily_challenge_id', '')::uuid
  left join private.daily_challenge_setups s on s.id = d.setup_id
)
select sport, request->>'central_day' as central_day,
  request->>'expected_game' as expected_game,
  request->>'published_game' as published_game,
  request->>'required' as required,
  saved_game, saved_scoring,
  case
    when setup is null then false
    when jsonb_typeof(setup->'initial_state') <> 'object' then false
    when setup->'initial_state' = '{}'::jsonb then false
    when setup->>'format_version' in ('daily-two-game-average-v1', 'who-am-i-two-round-v1') then
      jsonb_typeof(setup->'rounds') = 'array'
      and jsonb_array_length(setup->'rounds') = 2
      and jsonb_typeof(setup->'initial_state'->'active_round') = 'object'
      and jsonb_typeof(setup->'rounds'->0->'initial_state') = 'object'
    when saved_game = 'average_fan' then
      jsonb_typeof(setup->'board') = 'array'
      and jsonb_array_length(setup->'board') >= 8
    when saved_game = 'bar_trivia' then
      jsonb_typeof(setup->'initial_state'->'current_question') = 'object'
    when saved_game = 'millionaire' then
      jsonb_typeof(setup->'questions') = 'array'
      and jsonb_array_length(setup->'questions') > 0
    when saved_game = 'sports_feud' then
      jsonb_typeof(setup->'main_boards') = 'array'
      and jsonb_array_length(setup->'main_boards') > 0
    else true
  end as board_ready
from board order by sport
\`;

export function extractDailyHealthRows(payload) {
  const rows = Array.isArray(payload) ? payload
    : Array.isArray(payload?.result) ? payload.result
      : Array.isArray(payload?.data) ? payload.data : null;
  if (!rows || rows.length !== 3) {
    throw new Error("The production Daily health query did not return all three sports.");
  }
  const sports = rows.map(row => row?.sport).sort();
  if (JSON.stringify(sports) !== JSON.stringify(["football", "nba", "ufc"])) {
    throw new Error("The production Daily health query omitted or duplicated a sport.");
  }
  return rows;
}

export function evaluateDailyHealth(rows) {
  const failures = [];
  const ready = [];
  for (const row of rows) {
    const label = \`\${row.sport} \${row.central_day || "unknown date"}\`;
    // NBA has a real offseason. Never demand a board outside its schedule.
    if (!row.expected_game) {
      if (row.sport !== "nba") failures.push(\`\${label}: no active Daily schedule\`);
      continue;
    }
    if (row.required !== "false" && row.required !== false) {
      failures.push(\`\${label}: \${row.expected_game} has not been published\`);
    } else if (row.published_game !== row.expected_game || row.saved_game !== row.expected_game) {
      failures.push(\`\${label}: published game does not match the approved schedule\`);
    } else if (!row.saved_scoring || row.board_ready !== true) {
      failures.push(\`\${label}: published \${row.expected_game} is missing its playable board\`);
    } else {
      ready.push(\`\${label}: \${row.expected_game}\`);
    }
  }
  return { failures, ready };
}

export async function checkLiveDailyHealth({
  token = process.env.SUPABASE_ACCESS_TOKEN,
  projectId = process.env.SUPABASE_PROJECT_ID,
  fetcher = fetch,
} = {}) {
  if (!token || !/^[a-z0-9-]+$/.test(projectId ?? "")) {
    throw new Error("Daily health monitor is missing configured Supabase credentials.");
  }
  const url = \`https://api.supabase.com/v1/projects/\${projectId}/database/query\`;
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${token}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: DAILY_HEALTH_QUERY, read_only: true }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(\`Daily health read-only database query failed (HTTP \${response.status}).\`);
  }
  const rows = extractDailyHealthRows(await response.json());
  return evaluateDailyHealth(rows);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(\`file://\${process.argv[1]}\`))) {
  try {
    // One retry filters transient Management API failures without masking an
    // enduring broken Daily. The job still fails and triggers Actions alerts.
    let result;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        result = await checkLiveDailyHealth();
        if (!result.failures.length || attempt === 2) break;
      } catch (error) {
        if (attempt === 2) throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    for (const ready of result.ready) console.log(\`PASS: \${ready}\`);
    if (result.failures.length) throw new Error(result.failures.join("; "));
    console.log("PASS: all three live Daily sports are on schedule with playable public boards.");
  } catch (error) {
    // Deliberately never log access tokens, response payloads, grading
    // evidence, player data or any secret-bearing URL.
    console.error(\`DAILY HEALTH ALERT: \${error.message}\`);
    process.exitCode = 1;
  }
}
