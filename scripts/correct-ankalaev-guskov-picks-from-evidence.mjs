import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base = String(process.env.V2_SUPABASE_URL || '').replace(/\/$/, '');
const key = String(process.env.V2_SERVICE_ROLE_KEY || '');
const reportPath = String(process.env.CORRECTION_REPORT || '/tmp/ankalaev-guskov-evidence-correction.json');
const eventId = 'ufc-fight-night-ankalaev-guskov-2026-07-25';
if (!base || !key) throw new Error('V2 Supabase credentials are required.');

const headers = { apikey: key, authorization: `Bearer ${key}` };
const expectedResults = {
  'izagakhmaev-vagaev': 'blue_win',
  'zaynukov-rzepecki': 'red_win',
  'dulatov-turman': 'cancelled',
  'kuniev-fortune': 'red_win',
  'erceg-temirov': 'blue_win',
  'ankalaev-guskov': 'red_win',
};
const expectedPicks = {
  CODY: {
    'izagakhmaev-vagaev': 'abubakar-vagaev',
    'zaynukov-rzepecki': 'damian-rzepecki',
    'dulatov-turman': 'islam-dulatov',
    'kuniev-fortune': 'rizvan-kuniev',
    'erceg-temirov': 'steve-erceg',
    'ankalaev-guskov': 'magomed-ankalaev',
  },
  SHANE: {
    'izagakhmaev-vagaev': 'saygid-izagakhmaev',
    'zaynukov-rzepecki': 'magomed-zaynukov',
    'dulatov-turman': 'islam-dulatov',
    'kuniev-fortune': 'rizvan-kuniev',
    'erceg-temirov': 'steve-erceg',
    'ankalaev-guskov': 'magomed-ankalaev',
  },
};
const expectedLock = {
  member: 'CODY',
  boutId: 'zaynukov-rzepecki',
  fighterSlug: 'damian-rzepecki',
  frozenAmericanOdds: 212,
};

const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalize = (value) => String(value || '').trim().toUpperCase();

async function request(url, options = {}, label = 'request') {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body).slice(0, 500);
    throw new Error(`${label} failed (${response.status}): ${detail}`);
  }
  return body;
}

async function rows(table, params, label = table) {
  const url = new URL(`${base}/rest/v1/${table}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
  const body = await request(url, { headers: { ...headers, Range: '0-999', 'Range-Unit': 'items' } }, label);
  if (!Array.isArray(body)) throw new Error(`${label} did not return rows.`);
  return body;
}

async function mutate(method, table, params, body, label) {
  const url = new URL(`${base}/rest/v1/${table}`);
  for (const [name, value] of Object.entries(params || {})) url.searchParams.set(name, String(value));
  return request(url, {
    method,
    headers: { ...headers, 'content-type': 'application/json', Prefer: 'return=representation' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, label);
}

async function snapshot() {
  const [events, bouts, profiles, picks, locks] = await Promise.all([
    rows('pick_events', { select: 'event_id,name,subtitle,status,starts_at,locks_at,season,completed_at,updated_at', event_id: `eq.${eventId}` }, 'read target event'),
    rows('pick_bouts', { select: 'event_id,bout_id,position,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,result_status,winner_fighter_slug,result_recorded_at', event_id: `eq.${eventId}`, order: 'position.asc' }, 'read target bouts'),
    rows('profiles', { select: 'id,display_name,normalized_name', normalized_name: 'in.(CODY,SHANE)', order: 'normalized_name.asc' }, 'read Cody and Shane'),
    rows('profile_event_picks', { select: 'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at', event_id: `eq.${eventId}`, order: 'profile_id.asc,bout_id.asc' }, 'read target picks'),
    rows('profile_event_underdog_locks', { select: 'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at', event_id: `eq.${eventId}`, order: 'profile_id.asc' }, 'read target locks'),
  ]);
  if (events.length !== 1 || events[0].status !== 'complete' || !events[0].completed_at || normalize(events[0].subtitle) !== 'ANKALAEV VS. GUSKOV') {
    throw new Error('Target completed event identity failed.');
  }
  if (bouts.length !== 6 || new Set(bouts.map((bout) => bout.bout_id)).size !== 6) throw new Error('Target bout count failed.');
  for (const bout of bouts) {
    if (expectedResults[bout.bout_id] !== bout.result_status) throw new Error(`Official result mismatch for ${bout.bout_id}.`);
  }
  if (profiles.length !== 2 || JSON.stringify(profiles.map((p) => normalize(p.normalized_name)).sort()) !== JSON.stringify(['CODY', 'SHANE'])) {
    throw new Error('Cody and Shane profiles were not resolved exactly.');
  }
  const profileIds = new Set(profiles.map((profile) => profile.id));
  if (picks.length !== 12 || picks.some((pick) => !profileIds.has(pick.profile_id))) throw new Error('Expected exactly 12 Cody/Shane picks.');
  if (locks.some((lock) => !profileIds.has(lock.profile_id))) throw new Error('Unexpected entrant lock exists.');
  return { event: events[0], bouts, profiles, picks, locks };
}

async function protectedHash() {
  const data = await Promise.all([
    rows('pick_events', { select: 'event_id,name,subtitle,status,starts_at,locks_at,season,completed_at,updated_at', order: 'event_id.asc' }),
    rows('pick_bouts', { select: 'event_id,bout_id,position,red_fighter_slug,blue_fighter_slug,result_status,winner_fighter_slug,result_recorded_at', order: 'event_id.asc,bout_id.asc' }),
    rows('profile_event_picks', { select: 'profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at', event_id: `neq.${eventId}`, order: 'event_id.asc,profile_id.asc,bout_id.asc' }),
    rows('profile_event_underdog_locks', { select: 'profile_id,event_id,bout_id,fighter_slug,selected_at,frozen_american_odds,frozen_at', event_id: `neq.${eventId}`, order: 'event_id.asc,profile_id.asc' }),
  ]);
  return digest(data);
}

function expectedRows(state) {
  const profileByName = new Map(state.profiles.map((profile) => [normalize(profile.normalized_name), profile]));
  const picks = [];
  for (const [member, sheet] of Object.entries(expectedPicks)) {
    const profile = profileByName.get(member);
    for (const [boutId, fighterSlug] of Object.entries(sheet)) {
      picks.push({ member, profileId: profile.id, boutId, fighterSlug });
    }
  }
  const codyProfile = profileByName.get(expectedLock.member);
  const codyPick = state.picks.find((pick) => pick.profile_id === codyProfile.id && pick.bout_id === expectedLock.boutId);
  if (!codyPick) throw new Error('Cody lock pick row is missing.');
  return {
    picks,
    lock: {
      profile_id: codyProfile.id,
      event_id: eventId,
      bout_id: expectedLock.boutId,
      fighter_slug: expectedLock.fighterSlug,
      selected_at: codyPick.picked_at || state.event.locks_at,
      frozen_american_odds: expectedLock.frozenAmericanOdds,
      frozen_at: state.event.locks_at,
    },
  };
}

function score(state) {
  const bouts = new Map(state.bouts.map((bout) => [bout.bout_id, bout]));
  const profileName = new Map(state.profiles.map((profile) => [profile.id, normalize(profile.normalized_name)]));
  const lockByProfile = new Map(state.locks.map((lock) => [lock.profile_id, lock]));
  const totals = {};
  for (const member of ['CODY', 'SHANE']) totals[member] = { correct: 0, incorrect: 0, excluded: 0, basePoints: 0, lockBonus: 0, totalPoints: 0 };
  for (const pick of state.picks) {
    const member = profileName.get(pick.profile_id);
    const bout = bouts.get(pick.bout_id);
    if (!member || !bout) throw new Error('Score mapping failed.');
    if (['draw', 'no_contest', 'cancelled'].includes(bout.result_status)) totals[member].excluded += 1;
    else if (pick.fighter_slug === bout.winner_fighter_slug) totals[member].correct += 1;
    else totals[member].incorrect += 1;
  }
  for (const [profileId, lock] of lockByProfile.entries()) {
    const member = profileName.get(profileId);
    const bout = bouts.get(lock.bout_id);
    if (member && bout && lock.fighter_slug === bout.winner_fighter_slug) {
      const odds = Number(lock.frozen_american_odds);
      totals[member].lockBonus = odds >= 100 ? Math.min(7, Math.floor((odds - 100) / 50) + 1) : 0;
    }
  }
  for (const member of Object.keys(totals)) {
    totals[member].basePoints = totals[member].correct * 4;
    totals[member].totalPoints = totals[member].basePoints + totals[member].lockBonus;
  }
  return totals;
}

async function reconcile(label) {
  const before = await snapshot();
  const expected = expectedRows(before);
  const currentByKey = new Map(before.picks.map((pick) => [`${pick.profile_id}|${pick.bout_id}`, pick]));
  const changedPicks = [];
  for (const pick of expected.picks) {
    const current = currentByKey.get(`${pick.profileId}|${pick.boutId}`);
    if (!current) throw new Error(`Missing existing pick row for ${pick.member}/${pick.boutId}.`);
    if (current.fighter_slug !== pick.fighterSlug) {
      const result = await mutate('PATCH', 'profile_event_picks', {
        profile_id: `eq.${pick.profileId}`,
        event_id: `eq.${eventId}`,
        bout_id: `eq.${pick.boutId}`,
      }, { fighter_slug: pick.fighterSlug }, `correct ${pick.member} ${pick.boutId}`);
      if (!Array.isArray(result) || result.length !== 1) throw new Error(`Pick correction cardinality failed for ${pick.member}/${pick.boutId}.`);
      changedPicks.push({ member: pick.member, boutId: pick.boutId, from: current.fighter_slug, to: pick.fighterSlug });
    }
  }

  const lockMatches = before.locks.length === 1
    && before.locks[0].profile_id === expected.lock.profile_id
    && before.locks[0].bout_id === expected.lock.bout_id
    && before.locks[0].fighter_slug === expected.lock.fighter_slug
    && Number(before.locks[0].frozen_american_odds) === expected.lock.frozen_american_odds
    && Boolean(before.locks[0].frozen_at);
  let lockChanged = false;
  if (!lockMatches) {
    await mutate('DELETE', 'profile_event_underdog_locks', { event_id: `eq.${eventId}` }, undefined, 'remove incorrect target locks');
    const inserted = await mutate('POST', 'profile_event_underdog_locks', {}, [expected.lock], 'insert evidence-backed Cody lock');
    if (!Array.isArray(inserted) || inserted.length !== 1) throw new Error('Lock correction cardinality failed.');
    lockChanged = true;
  }

  const after = await snapshot();
  const finalExpected = expectedRows(after);
  const finalByKey = new Map(after.picks.map((pick) => [`${pick.profile_id}|${pick.bout_id}`, pick.fighter_slug]));
  for (const pick of finalExpected.picks) {
    if (finalByKey.get(`${pick.profileId}|${pick.boutId}`) !== pick.fighterSlug) throw new Error(`Final pick mismatch for ${pick.member}/${pick.boutId}.`);
  }
  if (after.locks.length !== 1 || after.locks[0].profile_id !== finalExpected.lock.profile_id || after.locks[0].bout_id !== finalExpected.lock.bout_id || after.locks[0].fighter_slug !== finalExpected.lock.fighter_slug || Number(after.locks[0].frozen_american_odds) !== 212) {
    throw new Error('Final lock mismatch.');
  }
  const totals = score(after);
  for (const member of ['CODY', 'SHANE']) {
    const row = totals[member];
    if (row.correct !== 3 || row.incorrect !== 2 || row.excluded !== 1 || row.basePoints !== 12 || row.lockBonus !== 0 || row.totalPoints !== 12) {
      throw new Error(`${member} corrected score mismatch: ${JSON.stringify(row)}`);
    }
  }
  return { label, changedPicks, lockChanged, totals, finalPicks: finalExpected.picks.map(({ member, boutId, fighterSlug }) => ({ member, boutId, fighterSlug })), finalLock: expectedLock };
}

const protectedBefore = await protectedHash();
const targetBefore = await snapshot();
const immutableBefore = digest({ event: targetBefore.event, bouts: targetBefore.bouts });
const first = await reconcile('first pass');
if (protectedBefore !== await protectedHash()) throw new Error('Unrelated V2 data changed.');
const targetAfterFirst = await snapshot();
if (immutableBefore !== digest({ event: targetAfterFirst.event, bouts: targetAfterFirst.bouts })) throw new Error('Official event or result data changed.');
const second = await reconcile('second pass');
if (second.changedPicks.length || second.lockChanged) throw new Error('Second pass was not idempotent.');
if (protectedBefore !== await protectedHash()) throw new Error('Unrelated V2 data changed on second pass.');

const output = {
  schemaVersion: 1,
  operation: 'ankalaev-guskov-evidence-correction',
  evidence: {
    codyScreenshot: 'Cody selected Vagaev, Rzepecki LOCK +212, Dulatov, Kuniev, Erceg, Ankalaev.',
    shaneText: 'I flipped the first 2 rest were the same.',
    interpretation: 'Shane selected Izagakhmaev and Zaynukov, then matched Cody on the final four. No Shane lock was evidenced.',
  },
  safety: { officialResultsChanged: false, eventStatusChanged: false, unrelatedRowsChanged: false, protectedHash: protectedBefore },
  first,
  second,
  generatedAt: new Date().toISOString(),
};
await writeFile(reportPath, `${JSON.stringify(output, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ status: 'corrected', changedPicks: first.changedPicks.length, lockChanged: first.lockChanged, totals: first.totals, secondPassMutations: second.changedPicks.length + Number(second.lockChanged) }));
