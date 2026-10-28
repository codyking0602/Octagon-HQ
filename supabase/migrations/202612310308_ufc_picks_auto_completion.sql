-- UFC follows Football: trusted official results close the event, with no recap video gate.
-- Reuse canonical transitions for scoring, standings, history, and notifications.
-- The existing ESPN live-fight monitor already records official decisive results.

alter table public.pick_events
  alter column recap_video_required set default false;

-- Include the currently locked Fight Night and historical MMA cards.
update public.pick_events
set recap_video_required = false
where sport = 'mma'
  and recap_video_required;

-- Preserve Event Setup's existing publication core, without opting new MMA
-- events into the discontinued YouTube release requirement.
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

  if v_event.sport = 'mma' then
    update public.pick_events event
    set recap_video_required = false
    where event.event_id = v_event.event_id
    returning event.* into v_event;
  end if;

  return v_event;
end;
$$;

-- Service-only, idempotent completion sweep on the EXISTING hourly monitoring
-- wake. Never complete by elapsed time alone: every included bout must have a
-- resolved official result. Unmatched ESPN outcomes remain pending for review.
create or replace function public.finalize_ready_ufc_pick_events()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event record;
  v_completed_ids jsonb := '[]'::jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to finalize UFC Picks events';
  end if;

  for v_event in
    select event.event_id, event.status
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
        select 1 from public.pick_bouts pending
        where pending.event_id = event.event_id
          and pending.included_in_picks
          and pending.result_status = 'pending'
      )
    order by event.starts_at
    for update of event skip locked
  loop
    if v_event.status = 'upcoming' then
      perform public.transition_pick_event(v_event.event_id, 'locked');
    end if;
    perform public.transition_pick_event(v_event.event_id, 'complete');
    v_completed_ids := v_completed_ids || to_jsonb(v_event.event_id);
  end loop;

  return jsonb_build_object(
    'completed', jsonb_array_length(v_completed_ids),
    'event_ids', v_completed_ids
  );
end;
$$;

revoke all on function public.finalize_ready_ufc_pick_events()
  from public, anon, authenticated;
grant execute on function public.finalize_ready_ufc_pick_events()
  to service_role;

notify pgrst, 'reload schema';
