-- Fight Night live-state foundation.
--
-- The canonical pick_bouts row remains the sole bout owner. These fields record
-- ESPN's observed fight state only. They deliberately do not change locks,
-- official results, grading, event status, Watch Moment, or event finalization.

alter table public.pick_bouts
  add column if not exists live_status text not null default 'scheduled',
  add column if not exists live_status_provider text,
  add column if not exists live_source_event_id text,
  add column if not exists live_source_competition_id text,
  add column if not exists live_detected_winner_fighter_slug text,
  add column if not exists live_status_observed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pick_bouts_live_status_valid'
  ) then
    alter table public.pick_bouts
      add constraint pick_bouts_live_status_valid
      check (live_status in ('scheduled', 'live', 'final'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pick_bouts_live_provider_valid'
  ) then
    alter table public.pick_bouts
      add constraint pick_bouts_live_provider_valid
      check (live_status_provider is null or live_status_provider = 'espn');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pick_bouts_live_winner_valid'
  ) then
    alter table public.pick_bouts
      add constraint pick_bouts_live_winner_valid
      check (
        live_detected_winner_fighter_slug is null
        or live_detected_winner_fighter_slug in (red_fighter_slug, blue_fighter_slug)
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pick_bouts_live_source_shape'
  ) then
    alter table public.pick_bouts
      add constraint pick_bouts_live_source_shape
      check (
        (
          live_status_provider is null
          and live_source_event_id is null
          and live_source_competition_id is null
          and live_status_observed_at is null
          and live_detected_winner_fighter_slug is null
          and live_status = 'scheduled'
        )
        or (
          live_status_provider = 'espn'
          and length(trim(coalesce(live_source_event_id, ''))) > 0
          and length(trim(coalesce(live_source_competition_id, ''))) > 0
          and live_status_observed_at is not null
        )
      );
  end if;
end;
$$;

comment on column public.pick_bouts.live_status is
  'Latest trusted provider observation only: scheduled, live, or final. Does not itself lock Picks or record an official result.';
comment on column public.pick_bouts.live_detected_winner_fighter_slug is
  'Provider-detected winner evidence for a final bout. NULL is valid for draws, no contests, or incomplete provider evidence; it is not the official result owner.';

-- The existing run-pick-monitoring Edge Function is the sole caller. This RPC
-- owns live-state persistence and intentionally cannot touch any other bout or
-- event lifecycle field. Later observations may refresh winner evidence while
-- same-competition state cannot regress from final/live back to scheduled.
create or replace function public.record_pick_bout_live_states(
  p_event_id text,
  p_observations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_observation jsonb;
  v_bout public.pick_bouts;
  v_bout_id text;
  v_state text;
  v_provider text;
  v_source_event_id text;
  v_source_competition_id text;
  v_winner_slug text;
  v_observed_at timestamptz;
  v_updated integer := 0;
  v_existing_rank integer;
  v_new_rank integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record live fight state';
  end if;
  if jsonb_typeof(p_observations) <> 'array' then
    raise exception 'live fight observations must be an array';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for share;
  if not found then raise exception 'event not found'; end if;
  if v_event.status not in ('upcoming', 'locked') then
    raise exception 'live fight state requires an active event';
  end if;

  for v_observation in select value from jsonb_array_elements(p_observations)
  loop
    v_bout_id := lower(trim(coalesce(v_observation->>'bout_id', '')));
    v_state := lower(trim(coalesce(v_observation->>'state', '')));
    v_provider := lower(trim(coalesce(v_observation->>'provider', '')));
    v_source_event_id := trim(coalesce(v_observation->>'source_event_id', ''));
    v_source_competition_id := trim(coalesce(v_observation->>'source_competition_id', ''));
    v_winner_slug := nullif(lower(trim(coalesce(v_observation->>'winner_fighter_slug', ''))), '');
    v_observed_at := nullif(v_observation->>'observed_at', '')::timestamptz;

    if v_bout_id = ''
      or v_state not in ('scheduled', 'live', 'final')
      or v_provider <> 'espn'
      or v_source_event_id = ''
      or v_source_competition_id = ''
      or v_observed_at is null then
      raise exception 'invalid live fight observation';
    end if;

    select * into v_bout
    from public.pick_bouts
    where event_id = v_event.event_id
      and bout_id = v_bout_id
    for update;
    if not found then raise exception 'bout not found'; end if;

    if v_winner_slug is not null
      and v_winner_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
      raise exception 'detected live winner is not in this bout';
    end if;
    if v_state <> 'final' and v_winner_slug is not null then
      raise exception 'only a final live observation may include a winner';
    end if;

    v_existing_rank := case v_bout.live_status
      when 'scheduled' then 1
      when 'live' then 2
      when 'final' then 3
      else 0
    end;
    v_new_rank := case v_state
      when 'scheduled' then 1
      when 'live' then 2
      when 'final' then 3
      else 0
    end;

    if (v_bout.live_status_observed_at is null or v_observed_at >= v_bout.live_status_observed_at)
      and (
        v_bout.live_source_competition_id is distinct from v_source_competition_id
        or v_new_rank >= v_existing_rank
      ) then
      update public.pick_bouts
      set live_status = v_state,
          live_status_provider = v_provider,
          live_source_event_id = v_source_event_id,
          live_source_competition_id = v_source_competition_id,
          live_detected_winner_fighter_slug = v_winner_slug,
          live_status_observed_at = v_observed_at
      where event_id = v_event.event_id
        and bout_id = v_bout.bout_id;
      v_updated := v_updated + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'event_id', v_event.event_id,
    'observations_received', jsonb_array_length(p_observations),
    'bouts_updated', v_updated
  );
end;
$$;

revoke all on function public.record_pick_bout_live_states(text,jsonb)
  from public, anon, authenticated;
grant execute on function public.record_pick_bout_live_states(text,jsonb)
  to service_role;

notify pgrst, 'reload schema';
