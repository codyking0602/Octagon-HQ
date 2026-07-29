create table if not exists private.whats_new_items (
  id uuid primary key default extensions.gen_random_uuid(),
  source_key text not null unique,
  kind text not null,
  category text not null,
  origin text not null,
  title text not null,
  summary text not null,
  route text,
  action_label text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whats_new_items_source_key_length check (char_length(trim(source_key)) between 3 and 160),
  constraint whats_new_items_kind_valid check (kind in (
    'new_fighter',
    'ranking_movement',
    'new_game',
    'picks_event_completed',
    'new_recap',
    'fighters_to_watch',
    'new_challenge',
    'major_ranking_update',
    'achievement',
    'app_announcement',
    'redesign',
    'featured_content',
    'poll',
    'community_prompt',
    'temporary_notice',
    'weekly_summary',
    'monthly_summary',
    'rule_change'
  )),
  constraint whats_new_items_category_valid check (category in (
    'rankings', 'fighters', 'picks', 'games', 'challenges', 'community', 'app'
  )),
  constraint whats_new_items_origin_valid check (origin in ('automatic', 'manual')),
  constraint whats_new_items_title_length check (char_length(trim(title)) between 1 and 100),
  constraint whats_new_items_summary_length check (char_length(trim(summary)) between 1 and 280),
  constraint whats_new_items_route_valid check (route is null or route ~ '^/'),
  constraint whats_new_items_action_length check (action_label is null or char_length(trim(action_label)) between 1 and 40)
);

create table if not exists private.whats_new_read_states (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen_published_at timestamptz not null,
  last_seen_item_id uuid not null references private.whats_new_items(id) on delete restrict,
  updated_at timestamptz not null default now()
);

alter table private.whats_new_items enable row level security;
alter table private.whats_new_read_states enable row level security;

revoke all on private.whats_new_items from public, anon, authenticated;
revoke all on private.whats_new_read_states from public, anon, authenticated;

create index if not exists whats_new_items_feed_idx
  on private.whats_new_items(published_at desc, id desc);

create or replace function public.get_whats_new_snapshot(p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_state private.whats_new_read_states;
  v_items jsonb := '[]'::jsonb;
  v_unread_count integer := 0;
  v_latest_item_id uuid := null;
begin
  if v_profile_id is not null then
    select state.*
      into v_state
    from private.whats_new_read_states state
    where state.profile_id = v_profile_id;
  end if;

  select item.id
    into v_latest_item_id
  from private.whats_new_items item
  where item.published_at >= now() - interval '15 days'
  order by item.published_at desc, item.id desc
  limit 1;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', visible.id,
      'source_key', visible.source_key,
      'kind', visible.kind,
      'category', visible.category,
      'origin', visible.origin,
      'title', visible.title,
      'summary', visible.summary,
      'route', visible.route,
      'action_label', visible.action_label,
      'published_at', visible.published_at,
      'lifecycle', case
        when visible.published_at >= now() - interval '7 days' then 'active'
        else 'archive'
      end,
      'is_read', case
        when v_profile_id is null then true
        when v_state.profile_id is null then false
        else (visible.published_at, visible.id) <= (v_state.last_seen_published_at, v_state.last_seen_item_id)
      end
    )
    order by visible.published_at desc, visible.id desc
  ), '[]'::jsonb)
    into v_items
  from (
    select item.*
    from private.whats_new_items item
    where item.published_at >= now() - interval '15 days'
    order by item.published_at desc, item.id desc
    limit v_limit
  ) visible;

  if v_profile_id is not null then
    select count(*)::integer
      into v_unread_count
    from private.whats_new_items item
    where item.published_at >= now() - interval '15 days'
      and (
        v_state.profile_id is null
        or (item.published_at, item.id) > (v_state.last_seen_published_at, v_state.last_seen_item_id)
      );
  end if;

  return jsonb_build_object(
    'items', v_items,
    'unread_count', coalesce(v_unread_count, 0),
    'latest_item_id', v_latest_item_id
  );
end;
$$;

create or replace function public.mark_whats_new_read(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_target private.whats_new_items;
  v_state private.whats_new_read_states;
  v_unread_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not exists (
    select 1 from public.profiles profile where profile.id = v_profile_id
  ) then
    raise exception 'Octagon HQ profile required';
  end if;

  select item.*
    into v_target
  from private.whats_new_items item
  where item.id = p_item_id
    and item.published_at >= now() - interval '15 days';

  if not found then
    raise exception 'What''s New item was not found';
  end if;

  insert into private.whats_new_read_states (
    profile_id,
    last_seen_published_at,
    last_seen_item_id,
    updated_at
  )
  values (
    v_profile_id,
    v_target.published_at,
    v_target.id,
    now()
  )
  on conflict (profile_id) do update
    set last_seen_published_at = excluded.last_seen_published_at,
        last_seen_item_id = excluded.last_seen_item_id,
        updated_at = now()
  where (excluded.last_seen_published_at, excluded.last_seen_item_id)
      > (private.whats_new_read_states.last_seen_published_at, private.whats_new_read_states.last_seen_item_id);

  select state.*
    into v_state
  from private.whats_new_read_states state
  where state.profile_id = v_profile_id;

  select count(*)::integer
    into v_unread_count
  from private.whats_new_items item
  where item.published_at >= now() - interval '15 days'
    and (item.published_at, item.id) > (v_state.last_seen_published_at, v_state.last_seen_item_id);

  return jsonb_build_object(
    'unread_count', coalesce(v_unread_count, 0),
    'last_seen_item_id', v_state.last_seen_item_id
  );
end;
$$;

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
declare
  v_item private.whats_new_items;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

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

revoke all on function public.get_whats_new_snapshot(integer) from public;
revoke all on function public.mark_whats_new_read(uuid) from public, anon;
revoke all on function public.publish_whats_new_item(text, text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;

grant execute on function public.get_whats_new_snapshot(integer) to anon, authenticated;
grant execute on function public.mark_whats_new_read(uuid) to authenticated;
grant execute on function public.publish_whats_new_item(text, text, text, text, text, text, text, text, timestamptz) to service_role;

insert into private.whats_new_items (
  source_key,
  kind,
  category,
  origin,
  title,
  summary,
  route,
  action_label
)
values (
  'manual:whats-new-launch',
  'app_announcement',
  'app',
  'manual',
  'What''s New is here',
  'Catch meaningful Octagon HQ updates without digging through every screen.',
  '/whats-new',
  'OPEN FEED'
)
on conflict (source_key) do nothing;

drop policy if exists whats_new_members_receive_broadcast on realtime.messages;
create policy whats_new_members_receive_broadcast
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'whats-new:feed'
  and extension = 'broadcast'
);

create or replace function private.broadcast_whats_new_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid := coalesce(new.id, old.id);
begin
  perform realtime.send(
    jsonb_build_object(
      'item_id', v_item_id,
      'operation', lower(tg_op)
    ),
    'whats_new_changed',
    'whats-new:feed',
    true
  );
  return null;
end;
$$;

revoke all on function private.broadcast_whats_new_change() from public, anon, authenticated;

drop trigger if exists whats_new_items_broadcast on private.whats_new_items;
create trigger whats_new_items_broadcast
after insert or update or delete on private.whats_new_items
for each row execute function private.broadcast_whats_new_change();

comment on table private.whats_new_items is 'Canonical Octagon HQ activity items. Browser access is RPC-only.';
comment on table private.whats_new_read_states is 'Cross-device per-profile read cursor for What''s New.';
comment on function public.publish_whats_new_item(text, text, text, text, text, text, text, text, timestamptz) is 'Idempotently publishes one meaningful automatic or manual What''s New item by source key.';
