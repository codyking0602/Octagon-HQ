-- Surface the trusted Fight Night provider state through the existing owner
-- control-event RPC. This is presentation-only: lock, result, grading, and
-- event-finalization ownership remain unchanged.

alter function public.get_pick_control_event(text)
  rename to get_pick_control_event_live_state_core;
alter function public.get_pick_control_event_live_state_core(text)
  set schema private;

create or replace function public.get_pick_control_event(
  p_event_id text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
  v_bouts jsonb;
begin
  v_event := private.get_pick_control_event_live_state_core(p_event_id);
  if v_event is null then return null; end if;

  select coalesce(
    jsonb_agg(
      item.payload || jsonb_build_object('live_status', bout.live_status)
      order by item.ordinality
    ),
    '[]'::jsonb
  )
  into v_bouts
  from jsonb_array_elements(coalesce(v_event->'bouts', '[]'::jsonb))
    with ordinality as item(payload, ordinality)
  join public.pick_bouts bout
    on bout.event_id = v_event->>'event_id'
   and bout.bout_id = item.payload->>'bout_id';

  return jsonb_set(v_event, '{bouts}', v_bouts, true);
end;
$$;
revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

comment on function public.get_pick_control_event(text) is
  'Canonical Fight Night owner control payload, including trusted scheduled/live/final provider state per bout.';

notify pgrst, 'reload schema';
