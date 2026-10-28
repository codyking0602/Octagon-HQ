-- Phase 2B: owner-only event setup and card review.
-- Imported data remains in private draft tables until one atomic publish action.

create table if not exists public.pick_event_drafts (
  draft_id uuid primary key default gen_random_uuid(),
  source text not null,
  source_event_key text not null,
  source_url text,
  event_id text not null,
  name text not null,
  subtitle text not null default '',
  venue text,
  location text,
  starts_at timestamptz,
  locks_at timestamptz,
  season smallint not null,
  state text not null default 'staged',
  synced_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (source, source_event_key),
  constraint pick_event_draft_event_id_format check (event_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint pick_event_draft_season_range check (season between 1993 and 2200),
  constraint pick_event_draft_state check (state in ('staged','published')),
  constraint pick_event_draft_lock_before_start check (
    starts_at is null or locks_at is null or locks_at <= starts_at
  )
);

create table if not exists public.pick_event_draft_bouts (
  draft_id uuid not null references public.pick_event_drafts(draft_id) on delete cascade,
  bout_id text not null,
  position smallint not null,
  weight_class text not null default '',
  red_fighter_slug text not null,
  red_fighter_name text not null,
  blue_fighter_slug text not null,
  blue_fighter_name text not null,
  included boolean not null default true,
  primary key (draft_id, bout_id),
  unique (draft_id, position),
  constraint pick_event_draft_bout_id_format check (bout_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint pick_event_draft_bout_position_positive check (position >= 1),
  constraint pick_event_draft_bout_distinct_fighters check (red_fighter_slug <> blue_fighter_slug)
);

alter table public.pick_event_drafts enable row level security;
alter table public.pick_event_draft_bouts enable row level security;
revoke all on table public.pick_event_drafts, public.pick_event_draft_bouts from public, anon, authenticated;

create or replace function public.slugify_pick_text(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p_value,'')), '[^a-z0-9]+', '-', 'g'));
$$;
revoke all on function public.slugify_pick_text(text) from public, anon, authenticated;

create or replace function public.stage_pick_event_draft(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source text := coalesce(nullif(trim(p_payload->>'source'),''), 'ufc.com');
  v_source_event_key text := trim(coalesce(p_payload->>'source_event_key',''));
  v_source_url text := nullif(trim(p_payload->>'source_url'),'');
  v_name text := trim(coalesce(p_payload->>'name',''));
  v_subtitle text := trim(coalesce(p_payload->>'subtitle',''));
  v_event_id text := public.slugify_pick_text(coalesce(nullif(p_payload->>'event_id',''), concat(v_name, '-', v_subtitle, '-', p_payload->>'season')));
  v_venue text := nullif(trim(p_payload->>'venue'),'');
  v_location text := nullif(trim(p_payload->>'location'),'');
  v_starts_at timestamptz := nullif(p_payload->>'starts_at','')::timestamptz;
  v_locks_at timestamptz := nullif(p_payload->>'locks_at','')::timestamptz;
  v_season smallint := (p_payload->>'season')::smallint;
  v_draft_id uuid;
  v_bouts jsonb := coalesce(p_payload->'bouts','[]'::jsonb);
  v_bout jsonb;
  v_position integer;
  v_red_name text;
  v_blue_name text;
  v_red_slug text;
  v_blue_slug text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to stage event data';
  end if;
  if v_source_event_key = '' or v_name = '' or v_event_id = '' then
    raise exception 'staged event identity is incomplete';
  end if;
  if v_season not between 1993 and 2200 then
    raise exception 'invalid staged event season';
  end if;
  if v_starts_at is not null and v_locks_at is not null and v_locks_at > v_starts_at then
    raise exception 'Picks lock must not follow event start';
  end if;
  if jsonb_typeof(v_bouts) <> 'array' then
    raise exception 'staged bouts must be an array';
  end if;

  insert into public.pick_event_drafts (
    source, source_event_key, source_url, event_id, name, subtitle,
    venue, location, starts_at, locks_at, season, state,
    synced_at, updated_at, published_at
  ) values (
    v_source, v_source_event_key, v_source_url, v_event_id, v_name, v_subtitle,
    v_venue, v_location, v_starts_at, v_locks_at, v_season, 'staged',
    now(), now(), null
  )
  on conflict (source, source_event_key) do update
  set source_url = excluded.source_url,
      event_id = excluded.event_id,
      name = excluded.name,
      subtitle = excluded.subtitle,
      venue = excluded.venue,
      location = excluded.location,
      starts_at = excluded.starts_at,
      locks_at = excluded.locks_at,
      season = excluded.season,
      state = 'staged',
      synced_at = now(),
      updated_at = now(),
      published_at = null
  returning draft_id into v_draft_id;

  delete from public.pick_event_draft_bouts where draft_id = v_draft_id;

  for v_bout, v_position in
    select value, ordinality::integer
    from jsonb_array_elements(v_bouts) with ordinality
  loop
    v_red_name := trim(coalesce(v_bout->>'red_fighter_name',''));
    v_blue_name := trim(coalesce(v_bout->>'blue_fighter_name',''));
    v_red_slug := public.slugify_pick_text(coalesce(nullif(v_bout->>'red_fighter_slug',''), v_red_name));
    v_blue_slug := public.slugify_pick_text(coalesce(nullif(v_bout->>'blue_fighter_slug',''), v_blue_name));
    if v_red_name = '' or v_blue_name = '' or v_red_slug = '' or v_blue_slug = '' or v_red_slug = v_blue_slug then
      raise exception 'staged bout % is invalid', v_position;
    end if;

    insert into public.pick_event_draft_bouts (
      draft_id, bout_id, position, weight_class,
      red_fighter_slug, red_fighter_name,
      blue_fighter_slug, blue_fighter_name, included
    ) values (
      v_draft_id,
      public.slugify_pick_text(coalesce(nullif(v_bout->>'bout_id',''), concat(v_red_slug, '-', v_blue_slug))),
      coalesce(nullif(v_bout->>'position','')::integer, v_position),
      trim(coalesce(v_bout->>'weight_class','')),
      v_red_slug, v_red_name, v_blue_slug, v_blue_name,
      coalesce((v_bout->>'included')::boolean, true)
    );
  end loop;

  return v_draft_id;
end;
$$;
revoke all on function public.stage_pick_event_draft(jsonb) from public, anon, authenticated;
grant execute on function public.stage_pick_event_draft(jsonb) to service_role;

create or replace function public.get_pick_event_setup()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select jsonb_build_object(
    'draft_id', draft.draft_id,
    'source', draft.source,
    'source_event_key', draft.source_event_key,
    'source_url', draft.source_url,
    'event_id', draft.event_id,
    'name', draft.name,
    'subtitle', draft.subtitle,
    'venue', draft.venue,
    'location', draft.location,
    'starts_at', draft.starts_at,
    'locks_at', draft.locks_at,
    'season', draft.season,
    'state', draft.state,
    'synced_at', draft.synced_at,
    'updated_at', draft.updated_at,
    'warnings', to_jsonb(array_remove(array[
      case when draft.starts_at is null then 'MISSING EVENT START TIME' end,
      case when draft.locks_at is null then 'MISSING PICKS LOCK TIME' end,
      case when nullif(trim(draft.venue),'') is null then 'MISSING VENUE' end,
      case when nullif(trim(draft.location),'') is null then 'MISSING LOCATION' end,
      case when not exists (
        select 1 from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      ) then 'NO INCLUDED FIGHTS' end,
      case when (
        select count(*) from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      ) < 4 then 'CARD HAS FEWER THAN FOUR FIGHTS' end,
      case when exists (
        select 1 from public.pick_events event where event.status = 'locked'
      ) then 'A LOCKED EVENT BLOCKS PUBLISHING' end,
      case when exists (
        select 1
        from public.pick_events event
        join public.profile_event_picks pick on pick.event_id = event.event_id
        where event.status = 'upcoming'
      ) then 'THE CURRENT UPCOMING CARD ALREADY HAS PICKS' end
    ], null)),
    'can_publish', draft.state = 'staged'
      and draft.starts_at is not null
      and draft.locks_at is not null
      and draft.locks_at <= draft.starts_at
      and nullif(trim(draft.venue),'') is not null
      and nullif(trim(draft.location),'') is not null
      and exists (
        select 1 from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      )
      and not exists (select 1 from public.pick_events event where event.status = 'locked')
      and not exists (
        select 1
        from public.pick_events event
        join public.profile_event_picks pick on pick.event_id = event.event_id
        where event.status = 'upcoming'
      ),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'included', bout.included
      ) order by bout.position)
      from public.pick_event_draft_bouts bout
      where bout.draft_id = draft.draft_id
    ), '[]'::jsonb)
  ) into v_result
  from public.pick_event_drafts draft
  where draft.state = 'staged'
  order by draft.synced_at desc
  limit 1;

  return v_result;
end;
$$;
revoke all on function public.get_pick_event_setup() from public, anon;
grant execute on function public.get_pick_event_setup() to authenticated;

create or replace function public.update_pick_event_draft(p_draft_id uuid, p_patch jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.pick_event_drafts;
  v_starts_at timestamptz;
  v_locks_at timestamptz;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  select * into v_draft from public.pick_event_drafts where draft_id = p_draft_id for update;
  if not found or v_draft.state <> 'staged' then
    raise exception 'staged event draft not found';
  end if;

  v_starts_at := case when p_patch ? 'starts_at' then nullif(p_patch->>'starts_at','')::timestamptz else v_draft.starts_at end;
  v_locks_at := case when p_patch ? 'locks_at' then nullif(p_patch->>'locks_at','')::timestamptz else v_draft.locks_at end;
  if v_starts_at is not null and v_locks_at is not null and v_locks_at > v_starts_at then
    raise exception 'Picks lock must not follow event start';
  end if;

  update public.pick_event_drafts
  set event_id = case when p_patch ? 'event_id' then public.slugify_pick_text(p_patch->>'event_id') else event_id end,
      name = case when p_patch ? 'name' then trim(p_patch->>'name') else name end,
      subtitle = case when p_patch ? 'subtitle' then trim(p_patch->>'subtitle') else subtitle end,
      venue = case when p_patch ? 'venue' then nullif(trim(p_patch->>'venue'),'') else venue end,
      location = case when p_patch ? 'location' then nullif(trim(p_patch->>'location'),'') else location end,
      starts_at = v_starts_at,
      locks_at = v_locks_at,
      season = case when p_patch ? 'season' then (p_patch->>'season')::smallint else season end,
      updated_at = now()
  where draft_id = p_draft_id;
end;
$$;
revoke all on function public.update_pick_event_draft(uuid,jsonb) from public, anon;
grant execute on function public.update_pick_event_draft(uuid,jsonb) to authenticated;

create or replace function public.upsert_pick_event_draft_bout(p_draft_id uuid, p_bout jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_red_name text := trim(coalesce(p_bout->>'red_fighter_name',''));
  v_blue_name text := trim(coalesce(p_bout->>'blue_fighter_name',''));
  v_red_slug text := public.slugify_pick_text(coalesce(nullif(p_bout->>'red_fighter_slug',''), v_red_name));
  v_blue_slug text := public.slugify_pick_text(coalesce(nullif(p_bout->>'blue_fighter_slug',''), v_blue_name));
  v_bout_id text := public.slugify_pick_text(coalesce(nullif(p_bout->>'bout_id',''), concat(v_red_slug, '-', v_blue_slug)));
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if not exists (select 1 from public.pick_event_drafts where draft_id = p_draft_id and state = 'staged') then
    raise exception 'staged event draft not found';
  end if;
  if v_red_name = '' or v_blue_name = '' or v_red_slug = '' or v_blue_slug = '' or v_red_slug = v_blue_slug then
    raise exception 'invalid staged bout';
  end if;

  insert into public.pick_event_draft_bouts (
    draft_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name, included
  ) values (
    p_draft_id, v_bout_id, (p_bout->>'position')::smallint,
    trim(coalesce(p_bout->>'weight_class','')),
    v_red_slug, v_red_name, v_blue_slug, v_blue_name,
    coalesce((p_bout->>'included')::boolean, true)
  )
  on conflict (draft_id, bout_id) do update
  set position = excluded.position,
      weight_class = excluded.weight_class,
      red_fighter_slug = excluded.red_fighter_slug,
      red_fighter_name = excluded.red_fighter_name,
      blue_fighter_slug = excluded.blue_fighter_slug,
      blue_fighter_name = excluded.blue_fighter_name,
      included = excluded.included;

  update public.pick_event_drafts set updated_at = now() where draft_id = p_draft_id;
end;
$$;
revoke all on function public.upsert_pick_event_draft_bout(uuid,jsonb) from public, anon;
grant execute on function public.upsert_pick_event_draft_bout(uuid,jsonb) to authenticated;

create or replace function public.delete_pick_event_draft_bout(p_draft_id uuid, p_bout_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if not exists (select 1 from public.pick_event_drafts where draft_id = p_draft_id and state = 'staged') then
    raise exception 'staged event draft not found';
  end if;
  delete from public.pick_event_draft_bouts where draft_id = p_draft_id and bout_id = lower(trim(p_bout_id));
  update public.pick_event_drafts set updated_at = now() where draft_id = p_draft_id;
end;
$$;
revoke all on function public.delete_pick_event_draft_bout(uuid,text) from public, anon;
grant execute on function public.delete_pick_event_draft_bout(uuid,text) to authenticated;

create or replace function public.reorder_pick_event_draft_bouts(p_draft_id uuid, p_bout_ids jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected integer;
  v_received integer;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if jsonb_typeof(p_bout_ids) <> 'array' then
    raise exception 'bout order must be an array';
  end if;
  select count(*) into v_expected from public.pick_event_draft_bouts where draft_id = p_draft_id;
  select count(distinct value) into v_received from jsonb_array_elements_text(p_bout_ids);
  if v_expected = 0 or v_received <> v_expected then
    raise exception 'bout order must include every staged bout once';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_bout_ids) item
    where not exists (
      select 1 from public.pick_event_draft_bouts bout
      where bout.draft_id = p_draft_id and bout.bout_id = item.value
    )
  ) then
    raise exception 'bout order contains an unknown bout';
  end if;

  update public.pick_event_draft_bouts set position = position + 100 where draft_id = p_draft_id;
  update public.pick_event_draft_bouts bout
  set position = ordered.ordinality::smallint
  from jsonb_array_elements_text(p_bout_ids) with ordinality ordered(value, ordinality)
  where bout.draft_id = p_draft_id and bout.bout_id = ordered.value;
  update public.pick_event_drafts set updated_at = now() where draft_id = p_draft_id;
end;
$$;
revoke all on function public.reorder_pick_event_draft_bouts(uuid,jsonb) from public, anon;
grant execute on function public.reorder_pick_event_draft_bouts(uuid,jsonb) to authenticated;

create or replace function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.pick_event_drafts;
  v_event public.pick_events;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  select * into v_draft from public.pick_event_drafts where draft_id = p_draft_id for update;
  if not found or v_draft.state <> 'staged' then
    raise exception 'staged event draft not found';
  end if;
  if v_draft.starts_at is null or v_draft.locks_at is null
    or nullif(trim(v_draft.venue),'') is null
    or nullif(trim(v_draft.location),'') is null then
    raise exception 'event draft is missing required metadata';
  end if;
  if v_draft.locks_at > v_draft.starts_at then
    raise exception 'Picks lock must not follow event start';
  end if;
  if not exists (
    select 1 from public.pick_event_draft_bouts bout
    where bout.draft_id = p_draft_id and bout.included
  ) then
    raise exception 'event draft has no included fights';
  end if;
  if exists (select 1 from public.pick_events event where event.status = 'locked') then
    raise exception 'a locked event already exists';
  end if;
  if exists (
    select 1
    from public.pick_events event
    join public.profile_event_picks pick on pick.event_id = event.event_id
    where event.status = 'upcoming'
  ) then
    raise exception 'the current upcoming card already has picks';
  end if;

  delete from public.pick_events where status = 'upcoming';

  insert into public.pick_events (
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, updated_at
  ) values (
    v_draft.event_id, v_draft.name, v_draft.subtitle,
    v_draft.venue, v_draft.location,
    v_draft.starts_at, v_draft.locks_at,
    v_draft.season, 'upcoming', now()
  ) returning * into v_event;

  insert into public.pick_bouts (
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name
  )
  select v_draft.event_id, bout.bout_id,
         row_number() over (order by bout.position)::smallint,
         bout.weight_class,
         bout.red_fighter_slug, bout.red_fighter_name,
         bout.blue_fighter_slug, bout.blue_fighter_name
  from public.pick_event_draft_bouts bout
  where bout.draft_id = p_draft_id and bout.included
  order by bout.position;

  update public.pick_event_drafts
  set state = 'published', published_at = now(), updated_at = now()
  where draft_id = p_draft_id;

  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

create or replace function public.discard_pick_event_draft(p_draft_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  delete from public.pick_event_drafts where draft_id = p_draft_id and state = 'staged';
end;
$$;
revoke all on function public.discard_pick_event_draft(uuid) from public, anon;
grant execute on function public.discard_pick_event_draft(uuid) to authenticated;

notify pgrst, 'reload schema';
