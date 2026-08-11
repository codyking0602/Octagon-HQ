-- Expose the persisted Picks event header through the existing current-event and history RPCs.
-- Those RPCs remain the browser read owners; no second header query exists.

create or replace function public.get_current_pick_event()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_event_id text;
  v_spotlights jsonb;
  v_valid_spotlights jsonb;
  v_header_storage_path text;
  v_header_natural_width integer;
  v_header_natural_height integer;
begin
  v_value := private.get_current_pick_event_spotlight_core();
  if v_value is null then return null; end if;
  v_event_id := v_value->>'event_id';

  select
    event.spotlights,
    event.header_storage_path,
    event.header_natural_width,
    event.header_natural_height
  into
    v_spotlights,
    v_header_storage_path,
    v_header_natural_width,
    v_header_natural_height
  from public.pick_events event
  where event.event_id = v_event_id;

  select coalesce(jsonb_agg(item), '[]'::jsonb)
  into v_valid_spotlights
  from jsonb_array_elements(coalesce(v_spotlights, '[]'::jsonb)) item
  where private.pick_event_spotlight_is_valid(v_event_id, jsonb_build_array(item));

  return jsonb_set(
    v_value,
    '{spotlights}',
    coalesce(v_valid_spotlights, '[]'::jsonb),
    true
  ) || jsonb_build_object(
    'header_storage_path', v_header_storage_path,
    'header_natural_width', v_header_natural_width,
    'header_natural_height', v_header_natural_height
  );
end;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

-- Preserve get_my_pick_history(integer) as the single browser history path while
-- projecting the same persisted event header into completed-event recaps.
create or replace function public.get_my_pick_history(p_season integer default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_history jsonb;
  v_events jsonb;
begin
  v_history := private.get_my_pick_history_core(p_season);

  select coalesce(jsonb_agg(
    item.value || jsonb_build_object(
      'watch_moments', coalesce(event.watch_moments, '[]'::jsonb),
      'header_storage_path', event.header_storage_path,
      'header_natural_width', event.header_natural_width,
      'header_natural_height', event.header_natural_height
    )
    order by item.ordinality
  ), '[]'::jsonb)
  into v_events
  from jsonb_array_elements(coalesce(v_history->'events', '[]'::jsonb))
    with ordinality as item(value, ordinality)
  left join public.pick_events event
    on event.event_id = item.value->>'event_id';

  return jsonb_set(v_history, '{events}', v_events, true);
end;
$$;
revoke all on function public.get_my_pick_history(integer) from public, anon;
grant execute on function public.get_my_pick_history(integer) to authenticated;

notify pgrst, 'reload schema';
