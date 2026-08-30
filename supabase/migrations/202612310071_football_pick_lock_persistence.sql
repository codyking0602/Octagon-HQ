drop function if exists public.save_my_event_pick(text,text,text);

create function public.save_my_event_pick(
  p_event_id text,
  p_bout_id text,
  p_fighter_slug text,
  p_is_lock boolean default false
)
returns public.profile_event_picks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_existing public.profile_event_picks;
  v_slug text := lower(trim(p_fighter_slug));
  v_is_lock boolean := coalesce(p_is_lock, false);
  v_row public.profile_event_picks;
begin
  if v_profile_id is null then raise exception 'sign in required'; end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id))
  for share;
  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;
  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;
  if v_is_lock and v_event.sport <> 'football' then
    raise exception 'football locks are only available for football picks';
  end if;

  select * into v_existing
  from public.profile_event_picks
  where profile_id = v_profile_id
    and event_id = v_event.event_id
    and bout_id = v_bout.bout_id;

  if private.pick_bout_is_locked(v_event, v_bout) then
    if found
      and v_existing.fighter_slug = v_slug
      and v_existing.is_lock = v_is_lock then
      return v_existing;
    end if;
    raise exception 'pick is locked for this fight';
  end if;

  insert into public.profile_event_picks(
    profile_id,event_id,bout_id,fighter_slug,is_lock,picked_at,updated_at
  )
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_slug,v_is_lock,now(),now())
  on conflict (profile_id,event_id,bout_id) do update
    set fighter_slug = excluded.fighter_slug,
        is_lock = excluded.is_lock,
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.save_my_event_pick(text,text,text,boolean) from public, anon;
grant execute on function public.save_my_event_pick(text,text,text,boolean) to authenticated;

notify pgrst, 'reload schema';
