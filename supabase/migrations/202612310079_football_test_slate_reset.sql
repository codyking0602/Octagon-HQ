-- Owner-only destructive reset for intentionally disposable Football test slates.
-- Normal publication protections remain unchanged; staged drafts are never touched.
create or replace function public.reset_current_football_pick_event()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text;
  v_pick_count integer;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select event.event_id
  into v_event_id
  from public.pick_events event
  where event.sport = 'football'
    and event.status = 'upcoming'
  for update;

  if v_event_id is null then
    raise exception 'current upcoming Football slate not found';
  end if;

  select count(*)
  into v_pick_count
  from public.profile_event_picks pick
  where pick.event_id = v_event_id;

  if v_pick_count = 0 then
    raise exception 'current Football slate has no picks; publish normally';
  end if;

  -- pick_bouts and profile_event_picks already belong to pick_events through
  -- ON DELETE CASCADE, so the canonical event owner remains the one delete path.
  delete from public.pick_events event
  where event.event_id = v_event_id
    and event.sport = 'football'
    and event.status = 'upcoming';

  return jsonb_build_object(
    'deleted', true,
    'event_id', v_event_id,
    'pick_count', v_pick_count
  );
end;
$$;

revoke all on function public.reset_current_football_pick_event() from public, anon;
grant execute on function public.reset_current_football_pick_event() to authenticated;

notify pgrst, 'reload schema';