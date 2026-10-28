-- Keep completed or elapsed event drafts out of the weekly setup workflow.
-- The existing setup projection and publish mutation remain the only owners.

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
      case when draft.locks_at is not null and draft.locks_at <= now() then 'PICKS LOCK TIME HAS PASSED' end,
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
      and draft.starts_at > now()
      and draft.locks_at is not null
      and draft.locks_at > now()
      and draft.locks_at <= draft.starts_at
      and nullif(trim(draft.venue),'') is not null
      and nullif(trim(draft.location),'') is not null
      and exists (
        select 1 from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      )
      and not exists (
        select 1
        from public.pick_events completed
        where completed.event_id = draft.event_id
          and completed.status = 'complete'
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
    and (draft.starts_at is null or draft.starts_at > now())
    and not exists (
      select 1
      from public.pick_events completed
      where completed.event_id = draft.event_id
        and completed.status = 'complete'
    )
  order by draft.synced_at desc
  limit 1;

  return v_result;
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
  if exists (
    select 1
    from public.pick_events completed
    where completed.event_id = v_draft.event_id
      and completed.status = 'complete'
  ) then
    raise exception 'completed event drafts cannot be republished';
  end if;
  if v_draft.starts_at <= now() then
    raise exception 'event draft start time has passed';
  end if;
  if v_draft.locks_at <= now() then
    raise exception 'Picks lock time has passed';
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

notify pgrst, 'reload schema';
