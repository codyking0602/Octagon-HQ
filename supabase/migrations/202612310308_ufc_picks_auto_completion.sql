-- UFC Picks closes through the same canonical result/event lifecycle as Football.
-- ESPN already records decisive UFC outcomes via record_pick_bout_live_states.
-- A YouTube recap is optional editorial content, never a publication gate.

-- Release the currently open MMA event(s) from the prior video-only gate.
update public.pick_events
set recap_video_required = false,
    updated_at = now()
where sport = 'mma'
  and status in ('upcoming', 'locked')
  and recap_video_required;

-- Keep the established Event Setup publication owner, without opting future
-- MMA events into the retired video-release requirement.
create or replace function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
begin
  v_event := private.publish_pick_event_draft_ufc_recap_core(p_draft_id);

  if v_event.sport = 'mma' and v_event.recap_video_required then
    update public.pick_events event
    set recap_video_required = false,
        updated_at = now()
    where event.event_id = v_event.event_id
    returning event.* into v_event;
  end if;

  return v_event;
end;
$$;

revoke all on function public.publish_pick_event_draft(uuid)
  from public, anon;
grant execute on function public.publish_pick_event_draft(uuid)
  to authenticated;

-- The existing hourly monitoring wake invokes this once before its card/odds
-- work. It catches already-graded events even when ESPN's bounded live polling
-- window has ended, without a new cron or a parallel grading implementation.
-- No guesses: a single included pending fight prevents completion.
create or replace function public.finalize_resolved_ufc_pick_events()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_completed integer := 0;
  v_event_ids text[] := '{}'::text[];
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to finalize UFC Picks events';
  end if;

  for v_event in
    select event.*
    from public.pick_events event
    where event.sport = 'mma'
      and event.status in ('upcoming', 'locked')
      and event.locks_at <= now()
      and exists (
        select 1 from public.pick_bouts bout
        where bout.event_id = event.event_id
          and bout.included_in_picks
      )
      and not exists (
        select 1 from public.pick_bouts bout
        where bout.event_id = event.event_id
          and bout.included_in_picks
          and bout.result_status = 'pending'
      )
    order by event.starts_at
    for update of event skip locked
  loop
    if v_event.status = 'upcoming' then
      perform public.transition_pick_event(v_event.event_id, 'locked');
    end if;

    -- Canonical completion still owns standings, history, champion,
    -- whats-new and member recap notifications.
    perform public.transition_pick_event(v_event.event_id, 'complete');
    v_completed := v_completed + 1;
    v_event_ids := array_append(v_event_ids, v_event.event_id);
  end loop;

  return jsonb_build_object(
    'completed', v_completed,
    'event_ids', to_jsonb(v_event_ids)
  );
end;
$$;

revoke all on function public.finalize_resolved_ufc_pick_events()
  from public, anon, authenticated;
grant execute on function public.finalize_resolved_ufc_pick_events()
  to service_role;

-- Preserve the previous optional watch-moment API for editorial use. Its
-- existing auto-completion branch no longer applies to future MMA cards
-- because recap_video_required is now false.
comment on column public.pick_events.recap_video_required is
  'Legacy MMA video-release flag. New and active MMA Picks events do not require a video to publish final standings.';

notify pgrst, 'reload schema';
