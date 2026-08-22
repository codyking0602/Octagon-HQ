-- Fight Night automation behavior.
--
-- Keep the existing owners intact:
-- - private.pick_bout_is_locked remains the one player-mutation lock boundary.
-- - private.apply_pick_fight_change remains the one owner deadline mutation/audit owner.
-- - record_official_pick_bout_result remains the one initial official-result owner.
-- - Picks grading continues to derive from the canonical pick_bouts result state.
--
-- ESPN live evidence now participates in the canonical lock predicate and the
-- existing live-state recorder may dispatch an unambiguous final winner through
-- the existing official-result RPC. Event completion, Watch Moment, and final
-- event wrap-up remain manual owner actions.

comment on column public.pick_bouts.live_status is
  'Latest trusted provider fight state: scheduled, live, or final. Live/final participates in the canonical per-fight Picks lock boundary; event finalization remains manual.';
comment on column public.pick_bouts.live_detected_winner_fighter_slug is
  'Provider-detected winner evidence for a final bout. An unambiguous red/blue winner may be dispatched through the canonical official-result owner; NULL remains fail-closed for draws, no contests, or incomplete evidence.';

-- A trusted live/final transition locks ordinary players immediately, even when
-- a staged per-fight deadline was later than the actual bell. The owner can still
-- use the existing adjust_pick_bout_lock_time RPC: its canonical audit receipt,
-- when recorded after the live transition and still matching the current future
-- deadline, is the durable explicit reopen. A later final transition supersedes a
-- prior live reopen unless the owner explicitly adjusts again.
create or replace function private.pick_bout_is_locked(
  p_event public.pick_events,
  p_bout public.pick_bouts,
  p_now timestamptz default now()
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_event.status in ('locked', 'complete')
    or coalesce(p_bout.result_status, 'pending') <> 'pending'
    or (
      current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'on'
      and (
        p_now >= coalesce(p_bout.locks_at, p_event.locks_at)
        or (
          p_bout.live_status in ('live', 'final')
          and not exists (
            select 1
            from public.pick_card_change_actions action
            where action.event_id = p_event.event_id
              and action.bout_id = p_bout.bout_id
              and action.action_type = 'adjust_bout_lock_time'
              and p_bout.live_status_observed_at is not null
              and action.approved_at > p_bout.live_status_observed_at
              and nullif(action.after_state->>'locks_at', '')::timestamptz
                is not distinct from p_bout.locks_at
              and p_bout.locks_at is not null
              and p_now < p_bout.locks_at
          )
        )
      )
    );
$$;
revoke all on function private.pick_bout_is_locked(
  public.pick_events,public.pick_bouts,timestamptz
) from public, anon, authenticated;

-- Persist only monotonic provider state. Repeated observations may refresh source
-- identity or final winner evidence, but they do not move live_status_observed_at;
-- that timestamp remains the transition boundary used by the explicit owner
-- reopen audit above. A final observation with exactly one detected bout winner is
-- handed to record_official_pick_bout_result. Existing/corrected official results
-- are never overwritten here.
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
  v_existing_rank integer;
  v_new_rank integer;
  v_state_advanced boolean;
  v_should_update boolean;
  v_result_status text;
  v_updated integer := 0;
  v_stale integer := 0;
  v_results_applied integer := 0;
  v_results_already_recorded integer := 0;
  v_result_conflicts integer := 0;
  v_results_unresolved integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record live fight state';
  end if;
  if jsonb_typeof(p_observations) <> 'array' then
    raise exception 'live fight observations must be an array';
  end if;

  -- Match the canonical result owner lock order so live-state/result writes cannot
  -- deadlock each other when a scheduler wake overlaps an owner action.
  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;
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

    -- Never regress or accept evidence older than the trusted transition boundary.
    if (v_bout.live_status_observed_at is not null and v_observed_at < v_bout.live_status_observed_at)
      or v_new_rank < v_existing_rank then
      v_stale := v_stale + 1;
      continue;
    end if;

    v_state_advanced := v_bout.live_status_observed_at is null or v_new_rank > v_existing_rank;
    v_should_update := v_state_advanced
      or v_bout.live_source_event_id is distinct from v_source_event_id
      or v_bout.live_source_competition_id is distinct from v_source_competition_id
      or v_bout.live_detected_winner_fighter_slug is distinct from v_winner_slug;

    if v_should_update then
      update public.pick_bouts
      set live_status = v_state,
          live_status_provider = v_provider,
          live_source_event_id = v_source_event_id,
          live_source_competition_id = v_source_competition_id,
          live_detected_winner_fighter_slug = v_winner_slug,
          live_status_observed_at = case
            when v_state_advanced then v_observed_at
            else live_status_observed_at
          end
      where event_id = v_event.event_id
        and bout_id = v_bout.bout_id
      returning * into v_bout;
      v_updated := v_updated + 1;
    end if;

    if v_state = 'final' then
      v_result_status := case
        when v_winner_slug = v_bout.red_fighter_slug then 'red_win'
        when v_winner_slug = v_bout.blue_fighter_slug then 'blue_win'
        else null
      end;

      if v_result_status is null then
        -- ESPN's winner flag alone cannot safely distinguish a draw from a no
        -- contest. Keep the bout final/provider-backed but leave official result
        -- entry to the existing owner workflow instead of guessing.
        v_results_unresolved := v_results_unresolved + 1;
      elsif v_bout.result_status = 'pending' then
        perform public.record_official_pick_bout_result(
          v_event.event_id,
          v_bout.bout_id,
          v_result_status
        );
        v_results_applied := v_results_applied + 1;
      elsif v_bout.result_status = v_result_status
        and v_bout.winner_fighter_slug is not distinct from v_winner_slug then
        v_results_already_recorded := v_results_already_recorded + 1;
      else
        -- A provider correction or stale disagreement must never overwrite an
        -- official result. Cody retains the existing audited correction workflow.
        v_result_conflicts := v_result_conflicts + 1;
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'event_id', v_event.event_id,
    'observations_received', jsonb_array_length(p_observations),
    'bouts_updated', v_updated,
    'stale_observations_skipped', v_stale,
    'official_results_applied', v_results_applied,
    'official_results_already_recorded', v_results_already_recorded,
    'official_result_conflicts', v_result_conflicts,
    'final_results_unresolved', v_results_unresolved
  );
end;
$$;

revoke all on function public.record_pick_bout_live_states(text,jsonb)
  from public, anon, authenticated;
grant execute on function public.record_pick_bout_live_states(text,jsonb)
  to service_role;

-- One scheduler still owns run-pick-monitoring. Wake it every five minutes so the
-- already-bounded ESPN Fight Night window can observe the actual bell promptly.
-- The Edge runner performs ESPN live-state sync before the existing slower
-- provider schedule claim, so this does not create a second scheduler or make the
-- paid/general card-monitoring path a five-minute poller.
do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname = 'octagon-hq-pick-monitoring';

  if v_job_id is null then
    raise exception 'pick monitoring scheduler job is missing';
  end if;

  perform cron.alter_job(v_job_id, schedule := '*/5 * * * *');
end;
$$;

notify pgrst, 'reload schema';
