-- Keep published Fight Spotlight maintenance on the existing Picks event, owner,
-- builder, and projection paths. This adds no second publication owner.

create or replace function public.set_pick_event_spotlights(
  p_event_id text,
  p_spotlights jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(coalesce(p_event_id, '')));
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if v_event_id = '' then
    raise exception 'published Picks event required';
  end if;
  if not exists (
    select 1
    from public.pick_events event
    where event.event_id = v_event_id
      and event.status = 'upcoming'
  ) then
    raise exception 'upcoming published Picks event not found';
  end if;

  if p_spotlights is not null
    and p_spotlights <> 'null'::jsonb
    and p_spotlights <> '[]'::jsonb
    and not private.pick_event_spotlight_is_valid(v_event_id, p_spotlights) then
    raise exception 'Fight Spotlights must be complete, unique, and match current included fights';
  end if;

  update public.pick_events event
  set spotlights = case
        when p_spotlights is null
          or p_spotlights = 'null'::jsonb
          or p_spotlights = '[]'::jsonb then null
        else p_spotlights
      end
  where event.event_id = v_event_id;
end;
$$;
revoke all on function public.set_pick_event_spotlights(text,jsonb) from public, anon;
grant execute on function public.set_pick_event_spotlights(text,jsonb) to authenticated;

-- Enrich the existing Fight Night Control projection rather than adding another
-- browser query path. Stale packages fail closed exactly like Player Picks.
alter function public.get_pick_control_event(text)
  rename to get_pick_control_event_published_spotlights_core;
alter function public.get_pick_control_event_published_spotlights_core(text)
  set schema private;
revoke all on function private.get_pick_control_event_published_spotlights_core(text)
  from public, anon, authenticated;

create function public.get_pick_control_event(p_event_id text default null)
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
begin
  v_value := private.get_pick_control_event_published_spotlights_core(p_event_id);
  if v_value is null then return null; end if;

  v_event_id := v_value->>'event_id';
  select event.spotlights into v_spotlights
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
  );
end;
$$;
revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

notify pgrst, 'reload schema';
