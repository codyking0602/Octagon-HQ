-- Follow the existing ESPN live-fight ownership and canonical official-result RPC.
-- ESPN's winner flags alone cannot distinguish a draw from a no contest.
-- Settle a nonwinner final only when the trusted observation includes an
-- explicit "draw" or "no_contest" verdict. Absent that field, fail closed.
-- This does not change the owner's manual-open selection override.

create or replace function public.record_pick_bout_live_states(
  p_event_id text,
  p_observations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event_id text := lower(trim(p_event_id));
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_observation jsonb;
  v_explicit_status text;
  v_applied integer := 0;
  v_result jsonb;
begin
  -- Reuse the original service-role authority, event/bout matching, monotonic
  -- live-state writes, decisive results, and idempotency checks.
  v_result := private.record_pick_bout_live_states_ufc_recap_core(
    v_event_id,
    p_observations
  );

  -- Match the canonical event-then-bout lock order used by results writers.
  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event_id
  for update;

  if v_event.sport = 'mma' and v_event.status in ('upcoming', 'locked') then
    for v_observation in
      select value from jsonb_array_elements(p_observations)
    loop
      v_explicit_status := lower(trim(coalesce(v_observation->>'explicit_result_status', '')));
      if v_explicit_status not in ('draw', 'no_contest')
        or v_observation->>'state' <> 'final'
        or v_observation->>'provider' <> 'espn'
        or nullif(trim(coalesce(v_observation->>'winner_fighter_slug', '')), '') is not null
      then
        continue;
      end if;

      -- A verified provider match must have been stored by the existing core.
      -- Never classify an unrelated fight based on client-supplied names.
      select bout.* into v_bout
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and bout.bout_id = lower(trim(coalesce(v_observation->>'bout_id', '')))
        and bout.included_in_picks
        and bout.result_status = 'pending'
        and bout.live_status = 'final'
        and bout.live_status_provider = 'espn'
        and bout.live_source_event_id = v_observation->>'source_event_id'
        and bout.live_source_competition_id = v_observation->>'source_competition_id'
        and bout.live_detected_winner_fighter_slug is null
        and bout.winner_fighter_slug is null
      for update;
      if not found then
        continue;
      end if;

      perform public.record_official_pick_bout_result(
        v_event.event_id,
        v_bout.bout_id,
        v_explicit_status
      );
      v_applied := v_applied + 1;
    end loop;
  end if;

  -- Preserve the previous automatic lock transition exactly.
  if v_event.status = 'upcoming' and now() >= v_event.locks_at then
    perform public.transition_pick_event(v_event.event_id, 'locked');
  end if;

  return v_result || jsonb_build_object(
    'explicit_nonwinner_results_applied', v_applied
  );
end;
$function$;

revoke all on function public.record_pick_bout_live_states(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_pick_bout_live_states(text, jsonb)
  to service_role;

notify pgrst, 'reload schema';
