-- Preserve picks and verified odds when UFC corrects a fighter's display identity
-- without changing the actual person in the bout. True opponent replacements keep
-- using the existing repick/odds-clear path.

create table if not exists private.ufc_fighter_identity_aliases (
  alias_key text primary key,
  canonical_key text not null
);

revoke all on table private.ufc_fighter_identity_aliases from public, anon, authenticated;

insert into private.ufc_fighter_identity_aliases(alias_key, canonical_key)
values
  ('valesca machado', 'tina black'),
  ('tina black', 'tina black'),
  ('mehemmedeli osmanli', 'mahammadali osmanli'),
  ('mahammadali osmanli', 'mahammadali osmanli')
on conflict (alias_key) do update
set canonical_key = excluded.canonical_key;

create or replace function private.pick_fighter_person_key(p_name text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_key text;
  v_alias text;
begin
  v_key := lower(trim(regexp_replace(coalesce(p_name, ''), '[^a-zA-Z0-9]+', ' ', 'g')));
  if v_key = '' then
    return '';
  end if;

  select alias.canonical_key
    into v_alias
  from private.ufc_fighter_identity_aliases alias
  where alias.alias_key = v_key;

  return coalesce(v_alias, v_key);
end;
$$;

revoke all on function private.pick_fighter_person_key(text)
  from public, anon, authenticated;

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_type;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_type check (
    action_type = any (array[
      'cancel_bout'::text,
      'restore_bout'::text,
      'replace_fighter'::text,
      'correct_fighter_identity'::text,
      'reorder_card'::text,
      'sync_card_segments'::text,
      'remove_bout_from_picks'::text,
      'restore_bout_to_picks'::text,
      'adjust_lock_time'::text,
      'update_event_metadata'::text,
      'update_bout_weight_class'::text,
      'add_bout'::text,
      'adjust_bout_lock_time'::text
    ])
  );

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_subject;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_subject check (
    (
      action_type = any (array[
        'reorder_card'::text,
        'sync_card_segments'::text,
        'adjust_lock_time'::text,
        'update_event_metadata'::text
      ])
      and bout_id is null
    )
    or
    (
      action_type = any (array[
        'cancel_bout'::text,
        'restore_bout'::text,
        'replace_fighter'::text,
        'correct_fighter_identity'::text,
        'remove_bout_from_picks'::text,
        'restore_bout_to_picks'::text,
        'update_bout_weight_class'::text,
        'add_bout'::text,
        'adjust_bout_lock_time'::text
      ])
      and bout_id is not null
    )
  );

create or replace function private.apply_pick_fighter_identity_correction(
  p_event_id text,
  p_payload jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(coalesce(p_event_id, '')));
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_reason text := trim(coalesce(p_reason, ''));
  v_bout_id text := lower(trim(coalesce(v_payload->>'bout_id', '')));
  v_corner text := lower(trim(coalesce(v_payload->>'corner', '')));
  v_expected_red text := lower(trim(coalesce(v_payload->>'expected_red_fighter_slug', '')));
  v_expected_blue text := lower(trim(coalesce(v_payload->>'expected_blue_fighter_slug', '')));
  v_replacement_slug text := lower(trim(coalesce(v_payload->>'replacement_fighter_slug', '')));
  v_replacement_name text := trim(coalesce(v_payload->>'replacement_fighter_name', ''));
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_old_slug text;
  v_old_name text;
  v_before jsonb;
  v_after jsonb;
  v_action_id bigint;
  v_approved_at timestamptz;
  v_preserved_picks integer := 0;
  v_preserved_locks integer := 0;
  v_receipt jsonb;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'UNAUTHORIZED: pick control owner required';
  end if;

  if v_event_id = '' or v_bout_id = '' or jsonb_typeof(v_payload) <> 'object' then
    raise exception 'STALE_STATE: complete identity-correction payload required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'STALE_STATE: fighter identity correction reason required';
  end if;
  if v_corner not in ('red', 'blue')
    or v_replacement_slug = ''
    or v_replacement_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or v_replacement_name = ''
    or length(v_replacement_name) > 120 then
    raise exception 'STALE_STATE: valid corrected fighter identity required';
  end if;

  select * into v_event
  from public.pick_events event
  where event.event_id = v_event_id
  for update;

  if not found then
    raise exception 'STALE_STATE: event not found';
  end if;
  if v_event.status = 'complete' then
    raise exception 'PROHIBITED: completed event is immutable';
  end if;

  select * into v_bout
  from public.pick_bouts bout
  where bout.event_id = v_event_id
    and bout.bout_id = v_bout_id
  for update;

  if not found then
    raise exception 'STALE_STATE: bout not found';
  end if;
  if not v_bout.included_in_picks or v_bout.result_status <> 'pending' then
    raise exception 'PROHIBITED: only a pending included fight can correct fighter identity';
  end if;
  if v_bout.red_fighter_slug is distinct from v_expected_red
    or v_bout.blue_fighter_slug is distinct from v_expected_blue then
    raise exception 'STALE_STATE: matchup changed; refresh Picks control';
  end if;

  v_old_slug := case when v_corner = 'red' then v_bout.red_fighter_slug else v_bout.blue_fighter_slug end;
  v_old_name := case when v_corner = 'red' then v_bout.red_fighter_name else v_bout.blue_fighter_name end;

  if v_replacement_slug = v_old_slug and v_replacement_name = v_old_name then
    raise exception 'STALE_STATE: corrected fighter identity is unchanged';
  end if;
  -- A stable UFC athlete profile slug is the strongest same-person evidence.
  -- The alias table is the fallback for legacy cards that were staged before
  -- source-owned athlete slugs were preserved.
  if v_replacement_slug is distinct from v_old_slug
    and private.pick_fighter_person_key(v_old_name)
      is distinct from private.pick_fighter_person_key(v_replacement_name) then
    raise exception 'PROHIBITED: fighter identity correction must resolve to the same person';
  end if;
  if exists (
    select 1
    from public.pick_bouts booked
    where booked.event_id = v_event_id
      and booked.bout_id <> v_bout_id
      and v_replacement_slug in (booked.red_fighter_slug, booked.blue_fighter_slug)
  ) then
    raise exception 'PROHIBITED: corrected fighter identity is already booked on this event';
  end if;

  select count(*)::integer
    into v_preserved_picks
  from public.profile_event_picks pick
  where pick.event_id = v_event_id
    and pick.bout_id = v_bout_id;

  select count(*)::integer
    into v_preserved_locks
  from public.profile_event_underdog_locks lock_row
  where lock_row.event_id = v_event_id
    and lock_row.bout_id = v_bout_id;

  v_before := to_jsonb(v_bout)
    || jsonb_build_object(
      'preserved_pick_count', v_preserved_picks,
      'preserved_lock_count', v_preserved_locks
    );

  update public.profile_event_picks pick
  set fighter_slug = v_replacement_slug,
      updated_at = now()
  where pick.event_id = v_event_id
    and pick.bout_id = v_bout_id
    and pick.fighter_slug = v_old_slug;

  update public.profile_event_underdog_locks lock_row
  set fighter_slug = v_replacement_slug
  where lock_row.event_id = v_event_id
    and lock_row.bout_id = v_bout_id
    and lock_row.fighter_slug = v_old_slug;

  update public.pick_bouts bout
  set red_fighter_slug = case when v_corner = 'red' then v_replacement_slug else bout.red_fighter_slug end,
      red_fighter_name = case when v_corner = 'red' then v_replacement_name else bout.red_fighter_name end,
      blue_fighter_slug = case when v_corner = 'blue' then v_replacement_slug else bout.blue_fighter_slug end,
      blue_fighter_name = case when v_corner = 'blue' then v_replacement_name else bout.blue_fighter_name end
  where bout.event_id = v_event_id
    and bout.bout_id = v_bout_id
  returning * into v_bout;

  v_after := to_jsonb(v_bout)
    || jsonb_build_object(
      'preserved_pick_count', v_preserved_picks,
      'preserved_lock_count', v_preserved_locks
    );

  insert into public.pick_card_change_actions (
    event_id,
    bout_id,
    action_type,
    reason,
    before_state,
    after_state,
    approved_by,
    receipt
  ) values (
    v_event_id,
    v_bout_id,
    'correct_fighter_identity',
    v_reason,
    v_before,
    v_after,
    auth.uid(),
    '{}'::jsonb
  )
  returning action_id, approved_at
  into v_action_id, v_approved_at;

  v_receipt := jsonb_build_object(
    'decision', 'applied',
    'action', 'correct_fighter_identity',
    'event_id', v_event_id,
    'bout_id', v_bout_id,
    'audit_id', v_action_id,
    'approved_at', v_approved_at,
    'before_value', v_before,
    'after_value', v_after,
    'picks_preserved', v_preserved_picks,
    'locks_preserved', v_preserved_locks,
    'picks_invalidated', 0,
    'repicks_required', false,
    'player_action_required', false,
    'notification_recorded', false,
    'notification_count', 0,
    'mutation_occurred', true,
    'remains_pending', true
  );

  update public.pick_card_change_actions action
  set receipt = v_receipt
  where action.action_id = v_action_id;

  return v_receipt;
end;
$$;

revoke all on function private.apply_pick_fighter_identity_correction(text,jsonb,text)
  from public, anon, authenticated;

create or replace function private.apply_pick_fight_change(
  p_action text,
  p_event_id text,
  p_payload jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text := lower(trim(coalesce(p_action, '')));
  v_event_id text := lower(trim(coalesce(p_event_id, '')));
  v_bout_id text := lower(trim(coalesce(p_payload->>'bout_id', '')));
  v_invalidated_picks jsonb := '[]'::jsonb;
  v_before jsonb;
  v_after jsonb;
  v_receipt jsonb;
  v_audit_id bigint;
begin
  if v_action = 'replace_fighter'
    and coalesce((p_payload->>'identity_correction')::boolean, false) then
    return private.apply_pick_fighter_identity_correction(
      p_event_id,
      p_payload - 'identity_correction',
      p_reason
    );
  end if;

  if v_action = 'replace_fighter' then
    select coalesce(
      jsonb_agg(to_jsonb(pick) order by pick.profile_id),
      '[]'::jsonb
    )
    into v_invalidated_picks
    from public.profile_event_picks pick
    where pick.event_id = v_event_id
      and pick.bout_id = v_bout_id;
  end if;

  v_receipt := private.apply_pick_fight_change_repick_evidence_core(
    p_action,
    p_event_id,
    p_payload,
    p_reason
  );

  if v_action <> 'replace_fighter' then
    return v_receipt;
  end if;

  v_audit_id := nullif(v_receipt->>'audit_id', '')::bigint;
  if v_audit_id is null then
    raise exception 'replacement audit receipt required';
  end if;

  update public.pick_card_change_actions action
  set before_state = coalesce(action.before_state, '{}'::jsonb)
        || jsonb_build_object('invalidated_picks', v_invalidated_picks),
      after_state = coalesce(action.after_state, '{}'::jsonb)
        || jsonb_build_object('invalidated_picks', v_invalidated_picks)
  where action.action_id = v_audit_id
  returning action.before_state, action.after_state
  into v_before, v_after;

  if not found then
    raise exception 'replacement audit action not found';
  end if;

  v_receipt := coalesce(v_receipt, '{}'::jsonb)
    || jsonb_build_object(
      'invalidated_picks', v_invalidated_picks,
      'before_value', v_before,
      'after_value', v_after
    );

  update public.pick_card_change_actions
  set receipt = v_receipt
  where action_id = v_audit_id;

  return v_receipt;
end;
$$;

revoke all on function private.apply_pick_fight_change(text,text,jsonb,text)
  from public, anon, authenticated;

create or replace function private.publish_pick_monitoring_finding_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_profile_id uuid;
  v_kind text;
  v_title text;
  v_event_key text;
  v_aggregation_key text;
begin
  if new.review_status <> 'new' then
    return new;
  end if;

  -- Same-person display corrections are auto-applied without player or owner action.
  if new.finding_type = 'card_change'
    and coalesce((new.source_details->'approval_proposal'->>'identity_correction')::boolean, false) then
    return new;
  end if;

  -- Ordinary line movement and newly available odds remain evidence-only.
  if new.finding_type in ('odds_change', 'odds_available') then
    return new;
  end if;

  if new.finding_type = 'card_change' then
    if new.summary = 'Fight order changed.' then
      v_kind := 'fight_order_changed';
      v_title := 'Fight order changed';
    elsif new.summary ~ '^Removed ' then
      v_kind := 'fight_moved_off_card';
      v_title := 'Fight moved off monitored card';
    else
      v_kind := 'card_change_detected';
      v_title := 'Card change detected';
    end if;
  elsif new.finding_type = 'unmatched_fight' then
    v_kind := 'odds_match_failed';
    v_title := 'Odds match failed';
  elsif new.finding_type = 'provider_error'
    and new.matchup_identity is not null
    and new.severity in ('warning', 'error') then
    v_kind := 'odds_match_failed';
    v_title := 'Odds match failed';
  elsif new.finding_type = 'quota_warning' then
    v_kind := 'provider_quota_low';
    v_title := case
      when lower(new.summary) like '%exhausted%' then 'Odds provider quota exhausted'
      else 'Odds provider quota is low'
    end;
  else
    return new;
  end if;

  select owner.profile_id
    into v_owner_profile_id
  from private.notification_owner owner
  where owner.singleton = true;

  if v_owner_profile_id is null then
    return new;
  end if;

  v_event_key := lower(regexp_replace(
    coalesce(
      nullif(trim(new.event_id), ''),
      nullif(trim(new.source_details->>'source_event_identity'), ''),
      new.run_id::text
    ),
    '[^a-z0-9:_-]+',
    '-',
    'g'
  ));
  v_aggregation_key := left(
    'pick-monitoring:' || v_kind || ':' || v_event_key,
    180
  );

  perform private.publish_notification_to_profile(
    v_owner_profile_id,
    'pick-monitoring-finding:' || new.finding_id::text,
    v_aggregation_key,
    v_kind,
    v_title,
    left(trim(new.summary), 280),
    '/picks/monitoring',
    'REVIEW',
    new.detected_at
  );

  return new;
end;
$$;

-- One-time correction for the Sep. 26 card. The original automatic replacement
-- audit preserved both the exact lines and the exact invalidated picks. Restore
-- only null odds and only missing picks, so any member who already repicked wins.
with corrections as (
  select
    action.action_id,
    action.event_id,
    action.bout_id,
    action.before_state,
    action.after_state
  from public.pick_card_change_actions action
  where action.event_id = 'ufc-fight-night-raul-rosas-jr-vs-raoni-barcelos-2026-09-26'
    and action.action_type = 'replace_fighter'
    and action.reason = 'Automatic UFC card sync from trusted official monitoring evidence.'
    and action.bout_id in (
      'main-melissa-amaya-valesca-machado',
      'main-mehemmedeli-osmanli-ilimbek-akylbek'
    )
    and (
      (
        private.pick_fighter_person_key(action.before_state->>'red_fighter_name')
          = private.pick_fighter_person_key(action.after_state->>'red_fighter_name')
        and private.pick_fighter_person_key(action.before_state->>'blue_fighter_name')
          = private.pick_fighter_person_key(action.after_state->>'blue_fighter_name')
      )
    )
)
update public.pick_bouts bout
set red_american_odds = (correction.before_state->>'red_american_odds')::integer,
    blue_american_odds = (correction.before_state->>'blue_american_odds')::integer,
    odds_source = correction.before_state->>'odds_source',
    odds_updated_at = (correction.before_state->>'odds_updated_at')::timestamptz
from corrections correction
where bout.event_id = correction.event_id
  and bout.bout_id = correction.bout_id
  and bout.red_american_odds is null
  and bout.blue_american_odds is null
  and correction.before_state->>'red_american_odds' is not null
  and correction.before_state->>'blue_american_odds' is not null
  and correction.before_state->>'odds_source' is not null
  and correction.before_state->>'odds_updated_at' is not null;

with corrections as (
  select
    action.event_id,
    action.bout_id,
    action.before_state,
    action.after_state
  from public.pick_card_change_actions action
  where action.event_id = 'ufc-fight-night-raul-rosas-jr-vs-raoni-barcelos-2026-09-26'
    and action.action_type = 'replace_fighter'
    and action.reason = 'Automatic UFC card sync from trusted official monitoring evidence.'
    and action.bout_id in (
      'main-melissa-amaya-valesca-machado',
      'main-mehemmedeli-osmanli-ilimbek-akylbek'
    )
    and private.pick_fighter_person_key(action.before_state->>'red_fighter_name')
      = private.pick_fighter_person_key(action.after_state->>'red_fighter_name')
    and private.pick_fighter_person_key(action.before_state->>'blue_fighter_name')
      = private.pick_fighter_person_key(action.after_state->>'blue_fighter_name')
),
invalidated as (
  select
    correction.event_id,
    correction.bout_id,
    correction.before_state,
    correction.after_state,
    pick.value as pick
  from corrections correction
  cross join lateral jsonb_array_elements(
    coalesce(correction.before_state->'invalidated_picks', '[]'::jsonb)
  ) pick(value)
)
insert into public.profile_event_picks (
  profile_id,
  event_id,
  bout_id,
  fighter_slug,
  picked_at,
  updated_at,
  is_lock
)
select
  (invalidated.pick->>'profile_id')::uuid,
  invalidated.event_id,
  invalidated.bout_id,
  case
    when invalidated.pick->>'fighter_slug' = invalidated.before_state->>'red_fighter_slug'
      then invalidated.after_state->>'red_fighter_slug'
    when invalidated.pick->>'fighter_slug' = invalidated.before_state->>'blue_fighter_slug'
      then invalidated.after_state->>'blue_fighter_slug'
    else invalidated.pick->>'fighter_slug'
  end,
  (invalidated.pick->>'picked_at')::timestamptz,
  (invalidated.pick->>'updated_at')::timestamptz,
  coalesce((invalidated.pick->>'is_lock')::boolean, false)
from invalidated
where not exists (
  select 1
  from public.profile_event_picks current_pick
  where current_pick.profile_id = (invalidated.pick->>'profile_id')::uuid
    and current_pick.event_id = invalidated.event_id
    and current_pick.bout_id = invalidated.bout_id
);

notify pgrst, 'reload schema';
