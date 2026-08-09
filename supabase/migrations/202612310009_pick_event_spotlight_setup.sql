-- Owner-assisted Picks Spotlight setup stays on the canonical staged-event and
-- publication owners. The browser saves one reviewed spotlight configuration on
-- the staged draft; the existing publish_pick_event_draft path copies it live.

alter table public.pick_event_drafts
  add column if not exists spotlight jsonb;
alter table public.pick_events
  add column if not exists spotlight jsonb;

alter table public.pick_event_drafts
  drop constraint if exists pick_event_draft_spotlight_object,
  add constraint pick_event_draft_spotlight_object check (
    spotlight is null or jsonb_typeof(spotlight) = 'object'
  );
alter table public.pick_events
  drop constraint if exists pick_event_spotlight_object,
  add constraint pick_event_spotlight_object check (
    spotlight is null or jsonb_typeof(spotlight) = 'object'
  );

comment on column public.pick_event_drafts.spotlight is
  'Owner-reviewed featured Picks matchup and fighter-specific Watch Spotlight URLs.';
comment on column public.pick_events.spotlight is
  'Published featured Picks matchup and fighter-specific Watch Spotlight URLs.';

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
  v_bout_id text;
  v_watch jsonb;
  v_item jsonb;
  v_red_slug text;
  v_blue_slug text;
  v_fighter_slug text;
  v_url text;
  v_seen text[] := array[]::text[];
begin
  if p_spotlight is null or p_spotlight = 'null'::jsonb then
    return true;
  end if;
  if jsonb_typeof(p_spotlight) <> 'object' then
    return false;
  end if;

  v_bout_id := nullif(trim(p_spotlight->>'bout_id'), '');
  if v_bout_id is null then
    return false;
  end if;

  select bout.red_fighter_slug, bout.blue_fighter_slug
  into v_red_slug, v_blue_slug
  from public.pick_event_draft_bouts bout
  where bout.draft_id = p_draft_id
    and bout.bout_id = v_bout_id
    and bout.included;
  if not found then
    return false;
  end if;

  v_watch := p_spotlight->'watch_spotlights';
  if jsonb_typeof(v_watch) <> 'array'
    or jsonb_array_length(v_watch) < 1
    or jsonb_array_length(v_watch) > 2 then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(v_watch)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      return false;
    end if;
    v_fighter_slug := nullif(lower(trim(v_item->>'fighter_slug')), '');
    v_url := nullif(trim(v_item->>'url'), '');
    if v_fighter_slug is null
      or v_fighter_slug not in (v_red_slug, v_blue_slug)
      or v_fighter_slug = any(v_seen)
      or v_url is null
      or v_url !~* '^https?://[^[:space:]]+$' then
      return false;
    end if;
    v_seen := array_append(v_seen, v_fighter_slug);
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
  v_bout_id text;
  v_watch jsonb;
  v_item jsonb;
  v_red_slug text;
  v_blue_slug text;
  v_fighter_slug text;
  v_url text;
  v_seen text[] := array[]::text[];
begin
  if p_spotlight is null or p_spotlight = 'null'::jsonb then
    return true;
  end if;
  if jsonb_typeof(p_spotlight) <> 'object' then
    return false;
  end if;

  v_bout_id := nullif(trim(p_spotlight->>'bout_id'), '');
  if v_bout_id is null then
    return false;
  end if;

  select bout.red_fighter_slug, bout.blue_fighter_slug
  into v_red_slug, v_blue_slug
  from public.pick_bouts bout
  where bout.event_id = lower(trim(p_event_id))
    and bout.bout_id = v_bout_id
    and coalesce(bout.included_in_picks, true)
    and coalesce(bout.result_status, 'pending') <> 'cancelled';
  if not found then
    return false;
  end if;

  v_watch := p_spotlight->'watch_spotlights';
  if jsonb_typeof(v_watch) <> 'array'
    or jsonb_array_length(v_watch) < 1
    or jsonb_array_length(v_watch) > 2 then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(v_watch)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      return false;
    end if;
    v_fighter_slug := nullif(lower(trim(v_item->>'fighter_slug')), '');
    v_url := nullif(trim(v_item->>'url'), '');
    if v_fighter_slug is null
      or v_fighter_slug not in (v_red_slug, v_blue_slug)
      or v_fighter_slug = any(v_seen)
      or v_url is null
      or v_url !~* '^https?://[^[:space:]]+$' then
      return false;
    end if;
    v_seen := array_append(v_seen, v_fighter_slug);
  end loop;

  return true;
end;
$$;
revoke all on function private.pick_event_spotlight_is_valid(text,jsonb)
  from public, anon, authenticated;

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
    select 1
    from public.pick_event_drafts draft
    where draft.draft_id = p_draft_id
      and draft.state = 'staged'
  ) then
    raise exception 'staged event draft not found';
  end if;

  if p_spotlight is not null
    and p_spotlight <> 'null'::jsonb
    and not private.pick_event_draft_spotlight_is_valid(p_draft_id, p_spotlight) then
    raise exception 'Spotlight must reference one included fight and one or two current fighters with valid http/https URLs';
  end if;

  update public.pick_event_drafts
  set spotlight = case
        when p_spotlight is null or p_spotlight = 'null'::jsonb then null
        else p_spotlight
      end,
      updated_at = now()
  where draft_id = p_draft_id;
end;
$$;
revoke all on function public.set_pick_event_draft_spotlight(uuid,jsonb)
  from public, anon;
grant execute on function public.set_pick_event_draft_spotlight(uuid,jsonb)
  to authenticated;

-- Enrich the existing owner setup projection rather than creating another read.
alter function public.get_pick_event_setup()
  rename to get_pick_event_setup_spotlight_core;
alter function public.get_pick_event_setup_spotlight_core()
  set schema private;
revoke all on function private.get_pick_event_setup_spotlight_core()
  from public, anon, authenticated;

create function public.get_pick_event_setup()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_draft_id uuid;
  v_spotlight jsonb;
begin
  v_value := private.get_pick_event_setup_spotlight_core();
  if v_value is null then return null; end if;

  v_draft_id := (v_value->>'draft_id')::uuid;
  select draft.spotlight into v_spotlight
  from public.pick_event_drafts draft
  where draft.draft_id = v_draft_id;

  v_value := jsonb_set(
    v_value,
    '{spotlight}',
    coalesce(v_spotlight, 'null'::jsonb),
    true
  );

  if v_spotlight is not null
    and not private.pick_event_draft_spotlight_is_valid(v_draft_id, v_spotlight) then
    v_value := jsonb_set(
      v_value,
      '{warnings}',
      coalesce(v_value->'warnings', '[]'::jsonb)
        || '["FEATURED SPOTLIGHT NEEDS REVIEW"]'::jsonb,
      true
    );
    v_value := jsonb_set(v_value, '{can_publish}', 'false'::jsonb, true);
  end if;

  return v_value;
end;
$$;
revoke all on function public.get_pick_event_setup() from public, anon;
grant execute on function public.get_pick_event_setup() to authenticated;

-- Wrap the one publication owner and copy the reviewed draft Spotlight only
-- after all established event/Picks safety checks succeed.
alter function public.publish_pick_event_draft(uuid)
  rename to publish_pick_event_draft_spotlight_core;
alter function public.publish_pick_event_draft_spotlight_core(uuid)
  set schema private;
revoke all on function private.publish_pick_event_draft_spotlight_core(uuid)
  from public, anon, authenticated, service_role;

create function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_spotlight jsonb;
  v_event public.pick_events;
begin
  select draft.spotlight into v_spotlight
  from public.pick_event_drafts draft
  where draft.draft_id = p_draft_id;

  if v_spotlight is not null
    and not private.pick_event_draft_spotlight_is_valid(p_draft_id, v_spotlight) then
    raise exception 'Featured Spotlight needs review before this card can publish';
  end if;

  v_event := private.publish_pick_event_draft_spotlight_core(p_draft_id);

  update public.pick_events event
  set spotlight = v_spotlight
  where event.event_id = v_event.event_id;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event.event_id;

  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

-- Enrich the existing current-event projection. If a later approved card change
-- replaces/removes the selected fighters, fail closed by omitting stale links.
alter function public.get_current_pick_event()
  rename to get_current_pick_event_spotlight_core;
alter function public.get_current_pick_event_spotlight_core()
  set schema private;
revoke all on function private.get_current_pick_event_spotlight_core()
  from public, anon, authenticated;

create function public.get_current_pick_event()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_event_id text;
  v_spotlight jsonb;
begin
  v_value := private.get_current_pick_event_spotlight_core();
  if v_value is null then return null; end if;

  v_event_id := v_value->>'event_id';
  select event.spotlight into v_spotlight
  from public.pick_events event
  where event.event_id = v_event_id;

  if v_spotlight is not null
    and not private.pick_event_spotlight_is_valid(v_event_id, v_spotlight) then
    v_spotlight := null;
  end if;

  return jsonb_set(
    v_value,
    '{spotlight}',
    coalesce(v_spotlight, 'null'::jsonb),
    true
  );
end;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

notify pgrst, 'reload schema';
