-- Upgrade the one event-level Spotlight object into an unlimited per-fight
-- collection while preserving the same staged-event mutation and publication owners.

alter table public.pick_event_drafts
  drop constraint if exists pick_event_draft_spotlight_object;
alter table public.pick_events
  drop constraint if exists pick_event_spotlight_object;

update public.pick_event_drafts
set spotlight = jsonb_build_array(spotlight)
where spotlight is not null
  and jsonb_typeof(spotlight) = 'object';
update public.pick_events
set spotlight = jsonb_build_array(spotlight)
where spotlight is not null
  and jsonb_typeof(spotlight) = 'object';

alter table public.pick_event_drafts rename column spotlight to spotlights;
alter table public.pick_events rename column spotlight to spotlights;

alter table public.pick_event_drafts
  add constraint pick_event_draft_spotlights_array check (
    spotlights is null or jsonb_typeof(spotlights) = 'array'
  );
alter table public.pick_events
  add constraint pick_event_spotlights_array check (
    spotlights is null or jsonb_typeof(spotlights) = 'array'
  );

comment on column public.pick_event_drafts.spotlights is
  'Owner-reviewed full fight Spotlight packages keyed by included staged bout.';
comment on column public.pick_events.spotlights is
  'Published full fight Spotlight packages keyed by active Picks bout.';

create or replace function private.pick_event_draft_spotlight_is_valid(
  p_draft_id uuid,
  p_spotlight jsonb
)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_bout_id text;
  v_watch jsonb;
  v_watch_item jsonb;
  v_edges jsonb;
  v_red_slug text;
  v_blue_slug text;
  v_fighter_slug text;
  v_url text;
  v_seen_bouts text[] := array[]::text[];
  v_seen_watch text[];
begin
  if p_spotlight is null or p_spotlight = 'null'::jsonb then
    return true;
  end if;
  if jsonb_typeof(p_spotlight) <> 'array' then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_spotlight)
  loop
    if jsonb_typeof(v_item) <> 'object' then return false; end if;
    v_bout_id := nullif(trim(v_item->>'bout_id'), '');
    if v_bout_id is null or v_bout_id = any(v_seen_bouts) then return false; end if;
    v_seen_bouts := array_append(v_seen_bouts, v_bout_id);

    select bout.red_fighter_slug, bout.blue_fighter_slug
    into v_red_slug, v_blue_slug
    from public.pick_event_draft_bouts bout
    where bout.draft_id = p_draft_id
      and bout.bout_id = v_bout_id
      and bout.included;
    if not found then return false; end if;

    if length(trim(coalesce(v_item->>'preview', ''))) < 20
      or v_item->>'source' <> 'UFCStats'
      or length(trim(coalesce(v_item->>'generated_at', ''))) < 10 then
      return false;
    end if;

    if jsonb_typeof(v_item->'red') <> 'object'
      or jsonb_typeof(v_item->'blue') <> 'object'
      or lower(trim(v_item#>>'{red,fighter_slug}')) <> v_red_slug
      or lower(trim(v_item#>>'{blue,fighter_slug}')) <> v_blue_slug then
      return false;
    end if;

    if length(trim(coalesce(v_item#>>'{red,record}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{red,age}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{red,height}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{red,reach}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{red,stance}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{blue,record}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{blue,age}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{blue,height}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{blue,reach}', ''))) = 0
      or length(trim(coalesce(v_item#>>'{blue,stance}', ''))) = 0 then
      return false;
    end if;

    v_edges := v_item#>'{red,edges}';
    if jsonb_typeof(v_edges) <> 'array'
      or jsonb_array_length(v_edges) < 1
      or jsonb_array_length(v_edges) > 3 then
      return false;
    end if;
    if exists (
      select 1 from jsonb_array_elements_text(v_edges) edge
      where length(trim(edge)) < 3
    ) then return false; end if;

    v_edges := v_item#>'{blue,edges}';
    if jsonb_typeof(v_edges) <> 'array'
      or jsonb_array_length(v_edges) < 1
      or jsonb_array_length(v_edges) > 3 then
      return false;
    end if;
    if exists (
      select 1 from jsonb_array_elements_text(v_edges) edge
      where length(trim(edge)) < 3
    ) then return false; end if;

    v_watch := coalesce(v_item->'watch_spotlights', '[]'::jsonb);
    if jsonb_typeof(v_watch) <> 'array' or jsonb_array_length(v_watch) > 2 then return false; end if;
    v_seen_watch := array[]::text[];
    for v_watch_item in select value from jsonb_array_elements(v_watch)
    loop
      if jsonb_typeof(v_watch_item) <> 'object' then return false; end if;
      v_fighter_slug := nullif(lower(trim(v_watch_item->>'fighter_slug')), '');
      v_url := nullif(trim(v_watch_item->>'url'), '');
      if v_fighter_slug is null
        or v_fighter_slug not in (v_red_slug, v_blue_slug)
        or v_fighter_slug = any(v_seen_watch)
        or v_url is null
        or v_url !~* '^https?://[^[:space:]]+$' then
        return false;
      end if;
      v_seen_watch := array_append(v_seen_watch, v_fighter_slug);
    end loop;
  end loop;

  return true;
end;
$$;
revoke all on function private.pick_event_draft_spotlight_is_valid(uuid,jsonb)
  from public, anon, authenticated;

create or replace function private.pick_event_spotlight_is_valid(
  p_event_id text,
  p_spotlight jsonb
)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_bout_id text;
  v_watch jsonb;
  v_watch_item jsonb;
  v_edges jsonb;
  v_red_slug text;
  v_blue_slug text;
  v_fighter_slug text;
  v_url text;
  v_seen_bouts text[] := array[]::text[];
  v_seen_watch text[];
begin
  if p_spotlight is null or p_spotlight = 'null'::jsonb then return true; end if;
  if jsonb_typeof(p_spotlight) <> 'array' then return false; end if;

  for v_item in select value from jsonb_array_elements(p_spotlight)
  loop
    if jsonb_typeof(v_item) <> 'object' then return false; end if;
    v_bout_id := nullif(trim(v_item->>'bout_id'), '');
    if v_bout_id is null or v_bout_id = any(v_seen_bouts) then return false; end if;
    v_seen_bouts := array_append(v_seen_bouts, v_bout_id);

    select bout.red_fighter_slug, bout.blue_fighter_slug
    into v_red_slug, v_blue_slug
    from public.pick_bouts bout
    where bout.event_id = lower(trim(p_event_id))
      and bout.bout_id = v_bout_id
      and coalesce(bout.included_in_picks, true)
      and coalesce(bout.result_status, 'pending') <> 'cancelled';
    if not found then return false; end if;

    if length(trim(coalesce(v_item->>'preview', ''))) < 20
      or v_item->>'source' <> 'UFCStats'
      or jsonb_typeof(v_item->'red') <> 'object'
      or jsonb_typeof(v_item->'blue') <> 'object'
      or lower(trim(v_item#>>'{red,fighter_slug}')) <> v_red_slug
      or lower(trim(v_item#>>'{blue,fighter_slug}')) <> v_blue_slug then
      return false;
    end if;

    v_edges := v_item#>'{red,edges}';
    if jsonb_typeof(v_edges) <> 'array' or jsonb_array_length(v_edges) < 1 or jsonb_array_length(v_edges) > 3 then return false; end if;
    v_edges := v_item#>'{blue,edges}';
    if jsonb_typeof(v_edges) <> 'array' or jsonb_array_length(v_edges) < 1 or jsonb_array_length(v_edges) > 3 then return false; end if;

    v_watch := coalesce(v_item->'watch_spotlights', '[]'::jsonb);
    if jsonb_typeof(v_watch) <> 'array' or jsonb_array_length(v_watch) > 2 then return false; end if;
    v_seen_watch := array[]::text[];
    for v_watch_item in select value from jsonb_array_elements(v_watch)
    loop
      v_fighter_slug := nullif(lower(trim(v_watch_item->>'fighter_slug')), '');
      v_url := nullif(trim(v_watch_item->>'url'), '');
      if v_fighter_slug is null
        or v_fighter_slug not in (v_red_slug, v_blue_slug)
        or v_fighter_slug = any(v_seen_watch)
        or v_url is null
        or v_url !~* '^https?://[^[:space:]]+$' then
        return false;
      end if;
      v_seen_watch := array_append(v_seen_watch, v_fighter_slug);
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function private.pick_event_spotlight_is_valid(text,jsonb)
  from public, anon, authenticated;

-- Keep the existing public mutation name as the single browser write owner. Its
-- JSON argument is now the complete per-fight Spotlight collection.
create or replace function public.set_pick_event_draft_spotlight(
  p_draft_id uuid,
  p_spotlight jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if not exists (
    select 1 from public.pick_event_drafts draft
    where draft.draft_id = p_draft_id and draft.state = 'staged'
  ) then
    raise exception 'staged event draft not found';
  end if;

  if p_spotlight is not null
    and p_spotlight <> 'null'::jsonb
    and not private.pick_event_draft_spotlight_is_valid(p_draft_id, p_spotlight) then
    raise exception 'Fight Spotlights must be complete, unique, and match current included fights';
  end if;

  update public.pick_event_drafts
  set spotlights = case
        when p_spotlight is null or p_spotlight = 'null'::jsonb or p_spotlight = '[]'::jsonb then null
        else p_spotlight
      end,
      updated_at = now()
  where draft_id = p_draft_id;
end;
$$;
revoke all on function public.set_pick_event_draft_spotlight(uuid,jsonb) from public, anon;
grant execute on function public.set_pick_event_draft_spotlight(uuid,jsonb) to authenticated;

create or replace function public.get_pick_event_setup()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_draft_id uuid;
  v_spotlights jsonb;
begin
  v_value := private.get_pick_event_setup_spotlight_core();
  if v_value is null then return null; end if;
  v_draft_id := (v_value->>'draft_id')::uuid;
  select draft.spotlights into v_spotlights
  from public.pick_event_drafts draft
  where draft.draft_id = v_draft_id;

  v_value := jsonb_set(v_value, '{spotlights}', coalesce(v_spotlights, '[]'::jsonb), true);
  if v_spotlights is not null
    and not private.pick_event_draft_spotlight_is_valid(v_draft_id, v_spotlights) then
    v_value := jsonb_set(
      v_value,
      '{warnings}',
      coalesce(v_value->'warnings', '[]'::jsonb) || '["FIGHT SPOTLIGHTS NEED REVIEW"]'::jsonb,
      true
    );
    v_value := jsonb_set(v_value, '{can_publish}', 'false'::jsonb, true);
  end if;
  return v_value;
end;
$$;
revoke all on function public.get_pick_event_setup() from public, anon;
grant execute on function public.get_pick_event_setup() to authenticated;

create or replace function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_spotlights jsonb;
  v_event public.pick_events;
begin
  select draft.spotlights into v_spotlights
  from public.pick_event_drafts draft
  where draft.draft_id = p_draft_id;

  if v_spotlights is not null
    and not private.pick_event_draft_spotlight_is_valid(p_draft_id, v_spotlights) then
    raise exception 'Fight Spotlights need review before this card can publish';
  end if;

  v_event := private.publish_pick_event_draft_spotlight_core(p_draft_id);
  update public.pick_events event
  set spotlights = v_spotlights
  where event.event_id = v_event.event_id;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event.event_id;
  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

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
begin
  v_value := private.get_current_pick_event_spotlight_core();
  if v_value is null then return null; end if;
  v_event_id := v_value->>'event_id';
  select event.spotlights into v_spotlights
  from public.pick_events event
  where event.event_id = v_event_id;

  select coalesce(jsonb_agg(item), '[]'::jsonb)
  into v_valid_spotlights
  from jsonb_array_elements(coalesce(v_spotlights, '[]'::jsonb)) item
  where private.pick_event_spotlight_is_valid(v_event_id, jsonb_build_array(item));

  return jsonb_set(v_value, '{spotlights}', coalesce(v_valid_spotlights, '[]'::jsonb), true);
end;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

notify pgrst, 'reload schema';
