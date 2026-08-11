-- Expose the persisted Picks event header through the existing current-event RPC.
-- The current-event RPC remains the single browser read owner; no second header query exists.

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

notify pgrst, 'reload schema';
