-- Connect the existing monitoring evidence owner to the existing canonical Picks odds.
-- This migration adds one service-role-only boundary. It never changes card structure,
-- event timing, publication state, picks, results, or scoring rules.

create or replace function public.record_pick_monitoring_run_and_apply_odds(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run_id uuid;
  v_event_id text := nullif(lower(trim(p_payload->>'event_id')), '');
  v_snapshots jsonb := coalesce(p_payload->'odds_snapshots', '[]'::jsonb);
  v_snapshot jsonb;
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_bout_id text;
  v_red_slug text;
  v_blue_slug text;
  v_red_identity text;
  v_blue_identity text;
  v_red_odds integer;
  v_blue_odds integer;
  v_source_event_id text;
  v_provider_event_identity text;
  v_commence_time timestamptz;
  v_sportsbook text;
  v_sportsbook_title text;
  v_sportsbook_updated_at timestamptz;
  v_fetched_at timestamptz;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record and apply pick monitoring odds';
  end if;
  if jsonb_typeof(v_snapshots) <> 'array' then
    raise exception 'pick monitoring odds snapshots must be an array';
  end if;

  -- Preserve record_pick_monitoring_run(jsonb) as the sole evidence writer. Calling it
  -- here keeps evidence and any eligible canonical odds mutations in one transaction.
  v_run_id := public.record_pick_monitoring_run(p_payload);

  -- Staged-only monitoring remains evidence-only because it has no canonical event ID.
  if v_event_id is null then
    return v_run_id;
  end if;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event_id
  for update;

  if not found then
    raise exception 'canonical pick event not found for live odds application';
  end if;

  -- The clock remains the mutation boundary. Provider movement observed at or after
  -- Picks lock is retained as evidence but can never replace the last valid line.
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at then
    return v_run_id;
  end if;

  for v_snapshot in select value from jsonb_array_elements(v_snapshots)
  loop
    v_bout_id := nullif(lower(trim(v_snapshot->>'bout_id')), '');
    v_red_slug := nullif(lower(trim(v_snapshot->>'canonical_red_fighter_slug')), '');
    v_blue_slug := nullif(lower(trim(v_snapshot->>'canonical_blue_fighter_slug')), '');
    v_red_identity := nullif(trim(v_snapshot->>'canonical_red_fighter_identity'), '');
    v_blue_identity := nullif(trim(v_snapshot->>'canonical_blue_fighter_identity'), '');
    v_source_event_id := nullif(trim(v_snapshot->>'source_event_id'), '');
    v_provider_event_identity := nullif(trim(v_snapshot->>'source_event_identity'), '');
    v_sportsbook := nullif(lower(trim(v_snapshot->>'sportsbook')), '');
    v_sportsbook_title := nullif(trim(v_snapshot->>'sportsbook_title'), '');

    -- Only snapshots explicitly oriented against one canonical bout are eligible.
    if v_bout_id is null
      or v_red_slug is null
      or v_blue_slug is null
      or v_red_identity is null
      or v_blue_identity is null
      or v_source_event_id is null
      or v_provider_event_identity is distinct from concat('mma_mixed_martial_arts:', v_source_event_id)
      or v_red_slug = v_blue_slug
      or v_red_identity = v_blue_identity
      or coalesce(v_snapshot->>'canonical_red_american_odds', '') !~ '^-?[0-9]+$'
      or coalesce(v_snapshot->>'canonical_blue_american_odds', '') !~ '^-?[0-9]+$'
      or v_sportsbook not in ('draftkings', 'fanduel')
      or v_sportsbook_title is null
      or v_snapshot->>'provider' is distinct from 'the-odds-api'
      or v_snapshot->>'sport_key' is distinct from 'mma_mixed_martial_arts'
      or nullif(v_snapshot->>'commence_time', '') is null
      or nullif(v_snapshot->>'sportsbook_updated_at', '') is null
      or nullif(v_snapshot->>'fetched_at', '') is null then
      continue;
    end if;

    v_red_odds := (v_snapshot->>'canonical_red_american_odds')::integer;
    v_blue_odds := (v_snapshot->>'canonical_blue_american_odds')::integer;
    v_commence_time := (v_snapshot->>'commence_time')::timestamptz;
    v_sportsbook_updated_at := (v_snapshot->>'sportsbook_updated_at')::timestamptz;
    v_fetched_at := (v_snapshot->>'fetched_at')::timestamptz;

    if not (v_red_odds <= -100 or v_red_odds >= 100)
      or not (v_blue_odds <= -100 or v_blue_odds >= 100)
      or abs(extract(epoch from (v_commence_time - v_event.starts_at))) > 64800
      or v_fetched_at >= v_event.locks_at
      or v_sportsbook_updated_at > v_fetched_at then
      continue;
    end if;

    select bout.* into v_bout
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.bout_id = v_bout_id
    for update;

    if not found
      or v_bout.red_fighter_slug is distinct from v_red_slug
      or v_bout.blue_fighter_slug is distinct from v_blue_slug then
      continue;
    end if;

    -- Prove the oriented values came from the append-only snapshot recorded by this
    -- exact run. This prevents a caller from supplying a second, unrecorded odds shape.
    if not exists (
      select 1
      from public.pick_monitoring_odds_snapshots snapshot
      where snapshot.run_id = v_run_id
        and snapshot.event_id = v_event_id
        and snapshot.bout_id = v_bout_id
        and snapshot.source_event_id = v_source_event_id
        and snapshot.source_event_identity = v_provider_event_identity
        and snapshot.commence_time = v_commence_time
        and snapshot.sportsbook = v_sportsbook
        and snapshot.sportsbook_title = v_sportsbook_title
        and snapshot.sportsbook_updated_at = v_sportsbook_updated_at
        and snapshot.fetched_at = v_fetched_at
        and (
          (
            snapshot.fighter_one_identity = v_red_identity
            and snapshot.fighter_one_american_odds = v_red_odds
            and snapshot.fighter_two_identity = v_blue_identity
            and snapshot.fighter_two_american_odds = v_blue_odds
          )
          or (
            snapshot.fighter_two_identity = v_red_identity
            and snapshot.fighter_two_american_odds = v_red_odds
            and snapshot.fighter_one_identity = v_blue_identity
            and snapshot.fighter_one_american_odds = v_blue_odds
          )
        )
    ) then
      continue;
    end if;

    -- Older provider timestamps never overwrite a newer valid line. A conflicting
    -- payload with the same provider timestamp also fails closed; an identical replay
    -- remains idempotent.
    if v_bout.odds_updated_at is not null
      and (
        v_sportsbook_updated_at < v_bout.odds_updated_at
        or (
          v_sportsbook_updated_at = v_bout.odds_updated_at
          and (
            v_bout.red_american_odds is distinct from v_red_odds
            or v_bout.blue_american_odds is distinct from v_blue_odds
            or v_bout.odds_source is distinct from v_sportsbook_title
          )
        )
      ) then
      continue;
    end if;

    update public.pick_bouts
    set red_american_odds = v_red_odds,
        blue_american_odds = v_blue_odds,
        odds_source = v_sportsbook_title,
        odds_updated_at = v_sportsbook_updated_at
    where event_id = v_event_id
      and bout_id = v_bout_id
      and (
        red_american_odds is distinct from v_red_odds
        or blue_american_odds is distinct from v_blue_odds
        or odds_source is distinct from v_sportsbook_title
        or odds_updated_at is distinct from v_sportsbook_updated_at
      );
  end loop;

  return v_run_id;
end;
$$;
revoke all on function public.record_pick_monitoring_run_and_apply_odds(jsonb)
  from public, anon, authenticated;
grant execute on function public.record_pick_monitoring_run_and_apply_odds(jsonb)
  to service_role;

-- Scheduled monitoring keeps evidence, eligible odds, and cadence completion in one
-- transaction while preserving the existing scheduler wrapper as the schedule owner.
create or replace function public.record_scheduled_pick_monitoring_run(
  p_payload jsonb,
  p_claimed_at timestamptz,
  p_next_eligible_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_event_identity text := trim(coalesce(p_payload->>'source_event_identity', ''));
  v_run_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record scheduled pick monitoring evidence';
  end if;
  if p_payload->>'trigger_kind' is distinct from 'scheduled'
    or length(v_source_event_identity) = 0
    or p_next_eligible_at <= p_claimed_at then
    raise exception 'invalid scheduled pick monitoring completion';
  end if;

  v_run_id := public.record_pick_monitoring_run_and_apply_odds(p_payload);

  update public.pick_monitoring_schedule_state
  set next_eligible_at = p_next_eligible_at,
      lease_until = null,
      updated_at = now()
  where source_event_identity = v_source_event_identity
    and last_claimed_at = p_claimed_at
    and lease_until is not null;

  if not found then
    raise exception 'scheduled pick monitoring claim is missing or stale';
  end if;

  return v_run_id;
end;
$$;
revoke all on function public.record_scheduled_pick_monitoring_run(jsonb, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.record_scheduled_pick_monitoring_run(jsonb, timestamptz, timestamptz)
  to service_role;

-- Keep the existing player projection as the single read path and expose only the
-- already-canonical sportsbook provenance and source update time.
create or replace function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'event_id',event.event_id,
    'name',event.name,
    'subtitle',event.subtitle,
    'venue',event.venue,
    'location',event.location,
    'starts_at',event.starts_at,
    'locks_at',event.locks_at,
    'season',event.season,
    'status',case when now()>=event.locks_at then 'locked' else event.status end,
    'can_control',public.is_pick_control_owner(auth.uid()),
    'bouts',coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id',bout.bout_id,
        'position',bout.position,
        'weight_class',bout.weight_class,
        'red_fighter_slug',bout.red_fighter_slug,
        'red_fighter_name',bout.red_fighter_name,
        'blue_fighter_slug',bout.blue_fighter_slug,
        'blue_fighter_name',bout.blue_fighter_name,
        'red_american_odds',bout.red_american_odds,
        'blue_american_odds',bout.blue_american_odds,
        'odds_source',bout.odds_source,
        'odds_updated_at',bout.odds_updated_at,
        'winner_fighter_slug',bout.winner_fighter_slug,
        'result_status',bout.result_status,
        'result_recorded_at',bout.result_recorded_at,
        'group_picks',public.resolved_bout_group_picks(bout.event_id,bout.bout_id)
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id=event.event_id
    ),'[]'::jsonb)
  )
  from public.pick_events event
  where event.status in ('upcoming','locked')
  order by event.starts_at
  limit 1;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

notify pgrst, 'reload schema';
