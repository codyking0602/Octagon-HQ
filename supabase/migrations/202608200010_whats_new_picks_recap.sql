-- Connect the canonical Picks completion transition to the existing What's New feed.
-- Completion and recap availability are the same transaction, so one recap-ready
-- item is published instead of two duplicate notifications.

create or replace function private.upsert_whats_new_item(
  p_source_key text,
  p_kind text,
  p_category text,
  p_origin text,
  p_title text,
  p_summary text,
  p_route text,
  p_action_label text,
  p_published_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item private.whats_new_items;
begin
  insert into private.whats_new_items (
    source_key,
    kind,
    category,
    origin,
    title,
    summary,
    route,
    action_label,
    published_at
  )
  values (
    trim(p_source_key),
    trim(p_kind),
    trim(p_category),
    trim(p_origin),
    trim(p_title),
    trim(p_summary),
    nullif(trim(p_route), ''),
    nullif(trim(p_action_label), ''),
    coalesce(p_published_at, now())
  )
  on conflict (source_key) do update
    set kind = excluded.kind,
        category = excluded.category,
        origin = excluded.origin,
        title = excluded.title,
        summary = excluded.summary,
        route = excluded.route,
        action_label = excluded.action_label,
        updated_at = now()
  returning * into v_item;

  return jsonb_build_object(
    'id', v_item.id,
    'source_key', v_item.source_key,
    'published_at', v_item.published_at
  );
end;
$$;

revoke all on function private.upsert_whats_new_item(
  text, text, text, text, text, text, text, text, timestamptz
) from public, anon, authenticated;

-- The existing public RPC remains the only externally callable publishing boundary.
-- It retains its service-role guard and delegates storage/idempotency to the private owner.
create or replace function public.publish_whats_new_item(
  p_source_key text,
  p_kind text,
  p_category text,
  p_origin text,
  p_title text,
  p_summary text,
  p_route text default null,
  p_action_label text default null,
  p_published_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  return private.upsert_whats_new_item(
    p_source_key,
    p_kind,
    p_category,
    p_origin,
    p_title,
    p_summary,
    p_route,
    p_action_label,
    p_published_at
  );
end;
$$;

revoke all on function public.publish_whats_new_item(
  text, text, text, text, text, text, text, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.publish_whats_new_item(
  text, text, text, text, text, text, text, text, timestamptz
) to service_role;

-- Preserve transition_pick_event as the sole lifecycle owner. The only addition is
-- one private, idempotent feed publication after a successful completion update.
create or replace function public.transition_pick_event(
  p_event_id text,
  p_target_status text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_target_status text := lower(trim(p_target_status));
  v_event public.pick_events;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_target_status not in ('locked', 'complete') then
    raise exception 'invalid event transition';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status = v_target_status then return v_event; end if;
  if v_event.status = 'complete' then raise exception 'completed event is immutable'; end if;
  if now() < v_event.locks_at then raise exception 'event cannot advance before Picks lock'; end if;

  if v_target_status = 'locked' then
    if v_event.status <> 'upcoming' then
      raise exception 'event cannot transition to locked';
    end if;

    update public.pick_events
    set status = 'locked',
        completed_at = null,
        updated_at = now()
    where event_id = v_event_id
    returning * into v_event;

    return v_event;
  end if;

  if v_event.status <> 'locked' then
    raise exception 'event must be locked before completion';
  end if;

  if not exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
  ) then
    raise exception 'event has no included Picks bouts';
  end if;

  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
      and bout.result_status = 'pending'
  ) then
    raise exception 'all included bout results must be resolved before completion';
  end if;

  update public.pick_events
  set status = 'complete',
      completed_at = now(),
      updated_at = now()
  where event_id = v_event_id
  returning * into v_event;

  perform private.upsert_whats_new_item(
    'picks:recap:' || v_event.event_id,
    'new_recap',
    'picks',
    'automatic',
    left(coalesce(nullif(trim(v_event.name), ''), 'Picks event') || ' recap is ready', 100),
    'The event is complete. Final standings and the full Picks recap are ready.',
    '/picks?view=latest-recap',
    'OPEN RECAP',
    v_event.completed_at
  );

  return v_event;
end;
$$;

revoke all on function public.transition_pick_event(text, text)
  from public, anon, authenticated;
grant execute on function public.transition_pick_event(text, text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
