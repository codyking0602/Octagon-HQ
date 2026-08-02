-- Complete archived Picks recaps with owner-managed watch moments while preserving
-- the existing history and Fight Night Control owners.
alter table public.pick_events
  add column if not exists watch_moments jsonb not null default '[]'::jsonb;

alter table public.pick_events
  drop constraint if exists pick_event_watch_moments_shape;
alter table public.pick_events
  add constraint pick_event_watch_moments_shape check (
    jsonb_typeof(watch_moments) = 'array'
    and jsonb_array_length(watch_moments) <= 5
  );

create or replace function private.normalize_pick_event_watch_moments(p_moments jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_title text;
  v_url text;
  v_result jsonb := '[]'::jsonb;
begin
  if p_moments is null or jsonb_typeof(p_moments) <> 'array' then
    raise exception 'watch moments must be an array';
  end if;
  if jsonb_array_length(p_moments) > 5 then
    raise exception 'an event can have at most five watch moments';
  end if;

  for v_item in select value from jsonb_array_elements(p_moments)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'each watch moment must be an object';
    end if;
    v_title := trim(coalesce(v_item->>'title', ''));
    v_url := trim(coalesce(v_item->>'url', ''));
    if length(v_title) < 3 or length(v_title) > 120 then
      raise exception 'watch moment title must be between 3 and 120 characters';
    end if;
    if length(v_url) > 500
      or v_url !~* '^https://(www\.)?(youtube\.com|youtu\.be)/' then
      raise exception 'watch moment must use a secure YouTube URL';
    end if;
    v_result := v_result || jsonb_build_array(jsonb_build_object(
      'title', v_title,
      'url', v_url
    ));
  end loop;

  return v_result;
end;
$$;

revoke all on function private.normalize_pick_event_watch_moments(jsonb)
  from public, anon, authenticated;

create or replace function public.set_pick_event_watch_moments(
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
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  v_moments := private.normalize_pick_event_watch_moments(p_moments);

  update public.pick_events
  set watch_moments = v_moments,
      updated_at = now()
  where event_id = v_event_id;

  if not found then raise exception 'event not found'; end if;
  return v_moments;
end;
$$;

revoke all on function public.set_pick_event_watch_moments(text,jsonb)
  from public, anon, authenticated;
grant execute on function public.set_pick_event_watch_moments(text,jsonb)
  to authenticated, service_role;

-- Seed the supplied highlight through the same canonical event field used by all
-- future cards. The event identity is resolved from canonical metadata rather
-- than a hard-coded event ID.
update public.pick_events
set watch_moments = jsonb_build_array(jsonb_build_object(
      'title', 'Uroš Medić vs. Daniel Rodriguez — Must-Watch Moment',
      'url', 'https://youtu.be/9Gm3-DqFwHU?is=qew5ZTS2wIM1ubK-'
    )),
    updated_at = now()
where season = 2026
  and lower(subtitle) like '%med%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

-- Keep get_my_pick_history(integer) as the one browser query path. Its existing
-- implementation becomes a private core and the public owner adds only the new
-- event-owned recap field.
alter function public.get_my_pick_history(integer)
  rename to get_my_pick_history_core;
alter function public.get_my_pick_history_core(integer)
  set schema private;
revoke all on function private.get_my_pick_history_core(integer)
  from public, anon, authenticated;

create function public.get_my_pick_history(p_season integer default null)
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
      'watch_moments', coalesce(event.watch_moments, '[]'::jsonb)
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

-- Keep get_pick_control_event(text) as the sole owner projection and expose the
-- same canonical field for owner review and future updates.
alter function public.get_pick_control_event(text)
  rename to get_pick_control_event_core;
alter function public.get_pick_control_event_core(text)
  set schema private;
revoke all on function private.get_pick_control_event_core(text)
  from public, anon, authenticated;

create function public.get_pick_control_event(p_event_id text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
  v_moments jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  v_event := private.get_pick_control_event_core(p_event_id);
  if v_event is null then return null; end if;

  select watch_moments
  into v_moments
  from public.pick_events
  where event_id = v_event->>'event_id';

  return v_event || jsonb_build_object(
    'watch_moments', coalesce(v_moments, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

notify pgrst, 'reload schema';
