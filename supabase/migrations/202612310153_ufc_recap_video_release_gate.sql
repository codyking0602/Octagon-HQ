-- PR2: make the post-fight UFC YouTube recap the one final release gate.
-- Automatic ESPN grading remains separate. Final standings, champion declaration,
-- recap history, and recap notifications still release only through the canonical
-- transition_pick_event(..., 'complete') lifecycle.

alter table public.pick_events
  add column if not exists recap_video_required boolean not null default false;

comment on column public.pick_events.recap_video_required is
  'When true for an MMA Picks event, at least one canonical YouTube watch moment is required before the event may become complete.';

-- The currently published UFC card predates this gate. Opt it in without touching
-- completed history or Football.
update public.pick_events
set recap_video_required = true,
    updated_at = now()
where sport = 'mma'
  and status in ('upcoming', 'locked')
  and not recap_video_required;

-- Fail closed at the row owner so no alternate completion path can publish a
-- required UFC recap before its video exists.
create or replace function private.enforce_pick_event_recap_video_gate()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sport = 'mma'
    and new.recap_video_required
    and new.status = 'complete'
    and jsonb_array_length(coalesce(new.watch_moments, '[]'::jsonb)) = 0
  then
    raise exception 'UFC recap video is required before final standings can publish';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_pick_event_recap_video_gate()
  from public, anon, authenticated;

drop trigger if exists enforce_pick_event_recap_video_gate on public.pick_events;
create trigger enforce_pick_event_recap_video_gate
before insert or update on public.pick_events
for each row execute function private.enforce_pick_event_recap_video_gate();

-- Keep Event Setup as the only publication owner. Every newly published MMA card
-- is opted into the recap-video gate after the established publication checks pass.
alter function public.publish_pick_event_draft(uuid)
  rename to publish_pick_event_draft_ufc_recap_core;
alter function public.publish_pick_event_draft_ufc_recap_core(uuid)
  set schema private;
revoke all on function private.publish_pick_event_draft_ufc_recap_core(uuid)
  from public, anon, authenticated, service_role;

create function public.publish_pick_event_draft(p_draft_id uuid)
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
    set recap_video_required = true,
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

-- The trusted live-state monitor also owns the automatic move from the legacy
-- stored "upcoming" state to "locked" once the canonical event lock has passed.
-- Per-fight ESPN locking still applies earlier when needed; this only removes the
-- obsolete owner step and makes the post-fight recap release surface reachable.
alter function public.record_pick_bout_live_states(text,jsonb)
  rename to record_pick_bout_live_states_ufc_recap_core;
alter function public.record_pick_bout_live_states_ufc_recap_core(text,jsonb)
  set schema private;
revoke all on function private.record_pick_bout_live_states_ufc_recap_core(text,jsonb)
  from public, anon, authenticated, service_role;

create function public.record_pick_bout_live_states(
  p_event_id text,
  p_observations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $
declare
  v_event_id text := lower(trim(p_event_id));
  v_result jsonb;
  v_event public.pick_events;
begin
  v_result := private.record_pick_bout_live_states_ufc_recap_core(
    v_event_id,
    p_observations
  );

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event_id;

  if v_event.status = 'upcoming'
    and now() >= v_event.locks_at
  then
    perform public.transition_pick_event(v_event.event_id, 'locked');
  end if;

  return v_result;
end;
$;

revoke all on function public.record_pick_bout_live_states(text,jsonb)
  from public, anon, authenticated;
grant execute on function public.record_pick_bout_live_states(text,jsonb)
  to service_role;

-- Saving the canonical YouTube recap is the final owner action. Once every
-- included fight is resolved, this wrapper advances the existing lifecycle:
-- upcoming -> locked (when needed) -> complete. That existing completion owner
-- remains responsible for standings/history/notifications.
alter function public.set_pick_event_watch_moments(text,jsonb)
  rename to set_pick_event_watch_moments_ufc_recap_core;
alter function public.set_pick_event_watch_moments_ufc_recap_core(text,jsonb)
  set schema private;
revoke all on function private.set_pick_event_watch_moments_ufc_recap_core(text,jsonb)
  from public, anon, authenticated, service_role;

create function public.set_pick_event_watch_moments(
  p_event_id text,
  p_moments jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_moments jsonb;
  v_event public.pick_events;
begin
  v_moments := private.set_pick_event_watch_moments_ufc_recap_core(
    v_event_id,
    p_moments
  );

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event_id;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.sport = 'mma'
    and v_event.recap_video_required
    and v_event.status in ('upcoming', 'locked')
    and jsonb_array_length(v_moments) > 0
    and exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and bout.included_in_picks
    )
    and not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and bout.included_in_picks
        and bout.result_status = 'pending'
    )
  then
    if v_event.status = 'upcoming' then
      perform public.transition_pick_event(v_event.event_id, 'locked');
    end if;
    perform public.transition_pick_event(v_event.event_id, 'complete');
  end if;

  return v_moments;
end;
$$;

revoke all on function public.set_pick_event_watch_moments(text,jsonb)
  from public, anon;
grant execute on function public.set_pick_event_watch_moments(text,jsonb)
  to authenticated, service_role;

-- Preserve monitoring evidence, but routine odds changes that were already
-- applied automatically are not owner work and no longer appear as dismissible
-- receipts in the Monitoring Inbox.
alter function public.get_pick_monitoring_inbox()
  rename to get_pick_monitoring_inbox_ufc_recap_core;
alter function public.get_pick_monitoring_inbox_ufc_recap_core()
  set schema private;
revoke all on function private.get_pick_monitoring_inbox_ufc_recap_core()
  from public, anon, authenticated;

create function public.get_pick_monitoring_inbox()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_new jsonb;
  v_reviewed jsonb;
begin
  v_value := private.get_pick_monitoring_inbox_ufc_recap_core();

  select coalesce(jsonb_agg(item.value order by item.ordinality), '[]'::jsonb)
    into v_new
  from jsonb_array_elements(coalesce(v_value->'new_findings', '[]'::jsonb))
    with ordinality as item(value, ordinality)
  where not (
    item.value->>'finding_type' in ('odds_available', 'odds_change')
    and item.value #>> '{source_details,automatically_applied}' = 'true'
  );

  select coalesce(jsonb_agg(item.value order by item.ordinality), '[]'::jsonb)
    into v_reviewed
  from jsonb_array_elements(coalesce(v_value->'reviewed_findings', '[]'::jsonb))
    with ordinality as item(value, ordinality)
  where not (
    item.value->>'finding_type' in ('odds_available', 'odds_change')
    and item.value #>> '{source_details,automatically_applied}' = 'true'
  );

  v_value := jsonb_set(v_value, '{new_findings}', v_new, true);
  v_value := jsonb_set(v_value, '{reviewed_findings}', v_reviewed, true);
  return jsonb_set(
    v_value,
    '{unresolved_count}',
    to_jsonb(jsonb_array_length(v_new)),
    true
  );
end;
$$;

revoke all on function public.get_pick_monitoring_inbox()
  from public, anon;
grant execute on function public.get_pick_monitoring_inbox()
  to authenticated;

-- The former "COMPLETE EVENT" prompt is obsolete. The required YouTube recap is
-- now the final action, so suppress only that producer while preserving draft,
-- provider-failure, card-change, member, and recap-ready notifications.
alter function private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)
  rename to publish_notification_to_profile_ufc_recap_core;

revoke all on function private.publish_notification_to_profile_ufc_recap_core(uuid,text,text,text,text,text,text,text,timestamptz)
  from public, anon, authenticated;

create function private.publish_notification_to_profile(
  p_recipient_profile_id uuid,
  p_source_key text,
  p_aggregation_key text,
  p_kind text,
  p_title text,
  p_summary text,
  p_route text default null,
  p_action_label text default null,
  p_occurred_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if trim(coalesce(p_kind, '')) = 'event_ready_to_complete'
    or trim(coalesce(p_source_key, '')) like 'event-ready-to-complete:%'
  then
    return jsonb_build_object(
      'id', null,
      'aggregate_count', 0,
      'created', false,
      'suppressed', true
    );
  end if;

  return private.publish_notification_to_profile_ufc_recap_core(
    p_recipient_profile_id,
    p_source_key,
    p_aggregation_key,
    p_kind,
    p_title,
    p_summary,
    p_route,
    p_action_label,
    p_occurred_at
  );
end;
$$;

revoke all on function private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)
  from public, anon, authenticated;

notify pgrst, 'reload schema';
