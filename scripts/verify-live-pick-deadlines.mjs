const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;

if (!accessToken || !projectId) {
  throw new Error("Live Picks deadline verification is not configured.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;

async function readJson(stage, url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${stage}: response was not valid JSON.`);
  }
  if (!response.ok) {
    const message = body?.message ?? body?.error ?? `HTTP ${response.status}`;
    throw new Error(`${stage}: ${message}`);
  }
  return body;
}

const keys = await readJson(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!secretKey) throw new Error("Project key lookup did not return a service credential.");

const headers = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
};

const eventUrl = new URL(`${supabaseOrigin}/rest/v1/pick_events`);
eventUrl.searchParams.set(
  "select",
  "event_id,name,subtitle,status,starts_at,prelims_starts_at,locks_at",
);
eventUrl.searchParams.set("status", "eq.upcoming");
eventUrl.searchParams.set("order", "starts_at.asc,event_id.asc");
eventUrl.searchParams.set("limit", "2");
const events = await readJson("Current Picks event lookup", eventUrl, { headers });
if (!Array.isArray(events) || events.length !== 1) {
  throw new Error("Current Picks event lookup did not return exactly one upcoming event.");
}
const event = events[0];

const boutsUrl = new URL(`${supabaseOrigin}/rest/v1/pick_bouts`);
boutsUrl.searchParams.set(
  "select",
  "bout_id,position,card_segment,segment_sequence,locks_at,red_fighter_name,blue_fighter_name,included_in_picks,result_status",
);
boutsUrl.searchParams.set("event_id", `eq.${event.event_id}`);
boutsUrl.searchParams.set("order", "position.asc,bout_id.asc");
const bouts = await readJson("Current Picks bout lookup", boutsUrl, { headers });
if (!Array.isArray(bouts) || bouts.length === 0) {
  throw new Error("Current Picks bout lookup returned no fights.");
}

const actionsUrl = new URL(`${supabaseOrigin}/rest/v1/pick_card_change_actions`);
actionsUrl.searchParams.set(
  "select",
  "action_id,bout_id,action_type,after_state,approved_at",
);
actionsUrl.searchParams.set("event_id", `eq.${event.event_id}`);
actionsUrl.searchParams.set("order", "action_id.desc");
const actions = await readJson("Current Picks canonical change audit lookup", actionsUrl, { headers });
if (!Array.isArray(actions)) {
  throw new Error("Current Picks canonical change audit lookup did not return an array.");
}

const latestDeadlineActionByBout = new Map();
for (const action of actions) {
  if (
    action.bout_id
    && (action.action_type === "adjust_bout_lock_time" || action.action_type === "add_bout")
    && !latestDeadlineActionByBout.has(action.bout_id)
  ) {
    latestDeadlineActionByBout.set(action.bout_id, action);
  }
}
const auditedDeadlineBoutIds = new Set();
const hasLiveOrderMutation = actions.some((action) => (
  action.action_type === "add_bout" || action.action_type === "reorder_card"
));

function timestamp(value, label) {
  const parsed = Date.parse(value ?? "");
  if (!Number.isFinite(parsed)) throw new Error(`${label} is missing or invalid.`);
  return parsed;
}

function auditedCanonicalDeadlineMatches(bout) {
  const action = latestDeadlineActionByBout.get(bout.bout_id);
  if (!action) return false;
  const audited = action.action_type === "adjust_bout_lock_time"
    ? action.after_state?.effective_locks_at ?? action.after_state?.locks_at
    : action.after_state?.locks_at;
  if (timestamp(audited, `${bout.bout_id} audited deadline`) !== timestamp(bout.locks_at, `${bout.bout_id} deadline`)) {
    return false;
  }
  auditedDeadlineBoutIds.add(bout.bout_id);
  return true;
}

function verifySegment(segment, anchorValue) {
  const segmentBouts = bouts
    .filter((bout) => bout.card_segment === segment)
    .sort((left, right) => left.segment_sequence - right.segment_sequence);
  if (segmentBouts.length === 0) return [];

  const anchor = timestamp(anchorValue, `${segment} segment anchor`);
  const seenSequences = new Set();
  for (const bout of segmentBouts) {
    if (!Number.isInteger(bout.segment_sequence) || bout.segment_sequence < 1) {
      throw new Error(`${segment} segment sequence is invalid at ${bout.bout_id}.`);
    }
    if (seenSequences.has(bout.segment_sequence)) {
      throw new Error(`${segment} segment sequence is duplicated at ${bout.bout_id}.`);
    }
    seenSequences.add(bout.segment_sequence);

    const expected = anchor + (bout.segment_sequence - 1) * 30 * 60 * 1000;
    const actual = timestamp(bout.locks_at, `${bout.bout_id} deadline`);
    if (actual !== expected && !auditedCanonicalDeadlineMatches(bout)) {
      throw new Error(
        `${bout.red_fighter_name} vs. ${bout.blue_fighter_name} expected ${new Date(expected).toISOString()}, received ${new Date(actual).toISOString()} without a matching canonical deadline audit.`,
      );
    }
  }
  return segmentBouts;
}

const prelims = verifySegment("prelim", event.prelims_starts_at);
const mainCard = verifySegment("main", event.starts_at);
if (prelims.length + mainCard.length !== bouts.length) {
  throw new Error("The production card contains an unsupported or missing card segment.");
}
if (mainCard.length < 2) {
  throw new Error("The production main card did not contain enough fights to prove progressive deadlines.");
}

const chronologicalMain = [...mainCard].sort(
  (left, right) => left.segment_sequence - right.segment_sequence,
);
const opener = chronologicalMain[0];
const mainEvent = chronologicalMain.at(-1);
const positionOne = bouts.find((bout) => bout.position === 1);
if (!positionOne || positionOne.card_segment !== "main") {
  throw new Error("The production card does not have a main-card headline fight in position one.");
}

// On an untouched published card, chronological sequence owns the headline and
// the initial 30-minute schedule. The canonical live add/reorder owner deliberately
// moves presentation slots without reassigning existing fight deadlines, so once
// that audited history exists, current position must not be used to recalculate them.
if (!hasLiveOrderMutation && positionOne.bout_id !== mainEvent.bout_id) {
  throw new Error("The headline main event is not the latest chronological main-card fight.");
}
if (
  !hasLiveOrderMutation
  && !auditedDeadlineBoutIds.has(opener.bout_id)
  && timestamp(opener.locks_at, "main-card opener deadline") !== timestamp(event.starts_at, "main-card start")
) {
  throw new Error("The first chronological main-card fight does not lock at the official main-card start.");
}
if (
  !hasLiveOrderMutation
  && !auditedDeadlineBoutIds.has(opener.bout_id)
  && !auditedDeadlineBoutIds.has(mainEvent.bout_id)
  && timestamp(mainEvent.locks_at, "main-event deadline") <= timestamp(opener.locks_at, "main-card opener deadline")
) {
  throw new Error("The main event does not hold the latest main-card deadline.");
}

const centralFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const schedule = chronologicalMain.map((bout) => (
  `${bout.segment_sequence}. ${bout.red_fighter_name} vs. ${bout.blue_fighter_name} — ${centralFormatter.format(new Date(bout.locks_at))}${auditedDeadlineBoutIds.has(bout.bout_id) ? " (canonical audited change)" : ""}`
));

console.log(
  [
    `PASS: ${event.name} · ${event.subtitle} keeps canonical progressive deadlines, with every live deviation explained by the audited fight-change owner.`,
    hasLiveOrderMutation ? "Audited live add/reorder history detected; stable bout deadlines remain authoritative across presentation-order changes." : "Published chronological order remains authoritative.",
    ...schedule,
    prelims.length ? `Preliminary fights verified: ${prelims.length}.` : "Main-card-only event verified.",
  ].join("\n"),
);