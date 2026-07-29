create table if not exists private.war_room_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  author_profile_id uuid not null references public.profiles(id) on delete restrict,
  parent_message_id uuid references private.war_room_messages(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by_profile_id uuid references public.profiles(id) on delete restrict,
  constraint war_room_messages_body_length check (char_length(trim(body)) between 1 and 500),
  constraint war_room_messages_not_self_reply check (parent_message_id is null or parent_message_id <> id),
  constraint war_room_messages_delete_pair check (
    (deleted_at is null and deleted_by_profile_id is null)
    or (deleted_at is not null and deleted_by_profile_id is not null)
  )
);

create table if not exists private.war_room_mentions (
  message_id uuid not null references private.war_room_messages(id) on delete cascade,
  mentioned_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (message_id, mentioned_profile_id)
);

alter table private.war_room_messages enable row level security;
alter table private.war_room_mentions enable row level security;

revoke all on private.war_room_messages from public, anon, authenticated;
revoke all on private.war_room_mentions from public, anon, authenticated;

create index if not exists war_room_messages_feed_idx
  on private.war_room_messages(created_at desc, id desc);

create index if not exists war_room_messages_parent_idx
  on private.war_room_messages(parent_message_id, created_at, id)
  where parent_message_id is not null;

create index if not exists war_room_messages_author_idx
  on private.war_room_messages(author_profile_id, created_at desc);

create index if not exists war_room_mentions_profile_idx
  on private.war_room_mentions(mentioned_profile_id, created_at desc, message_id);

create or replace function private.war_room_current_member()
returns table (
  profile_id uuid,
  role text
)
language sql
stable
security definer
set search_path = ''
as $$
  select membership.profile_id, membership.role
  from private.war_room_memberships membership
  where membership.profile_id = auth.uid()
    and membership.status = 'active'
  limit 1;
$$;

revoke all on function private.war_room_current_member() from public, anon, authenticated;

create or replace function private.war_room_validate_message_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent private.war_room_messages;
begin
  if tg_op = 'INSERT' then
    new.body := trim(new.body);
    new.created_at := coalesce(new.created_at, now());
  else
    if new.id <> old.id
      or new.author_profile_id <> old.author_profile_id
      or new.parent_message_id is distinct from old.parent_message_id
      or new.body <> old.body
      or new.created_at <> old.created_at
    then
      raise exception 'War Room messages cannot be edited after posting';
    end if;

    if old.deleted_at is not null and new.deleted_at is null then
      raise exception 'Deleted War Room messages cannot be restored directly';
    end if;
  end if;

  if char_length(trim(new.body)) not between 1 and 500 then
    raise exception 'War Room messages must contain between 1 and 500 characters';
  end if;

  if not exists (
    select 1
    from private.war_room_memberships membership
    where membership.profile_id = new.author_profile_id
      and membership.status = 'active'
  ) then
    raise exception 'War Room authors must have active access';
  end if;

  if new.parent_message_id is not null then
    select message.*
      into v_parent
    from private.war_room_messages message
    where message.id = new.parent_message_id;

    if not found then
      raise exception 'War Room reply target was not found';
    end if;

    if v_parent.parent_message_id is not null then
      raise exception 'War Room replies support one level only';
    end if;

    if v_parent.deleted_at is not null then
      raise exception 'Deleted War Room messages cannot receive replies';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.war_room_validate_message_row() from public, anon, authenticated;

drop trigger if exists war_room_messages_validate on private.war_room_messages;
create trigger war_room_messages_validate
before insert or update on private.war_room_messages
for each row execute function private.war_room_validate_message_row();

create or replace function private.war_room_message_json(
  p_message_id uuid,
  p_viewer_profile_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', message.id,
    'body', case when message.deleted_at is null then message.body else null end,
    'deleted', message.deleted_at is not null,
    'created_at', message.created_at,
    'author', jsonb_build_object(
      'id', author.id,
      'display_name', author.display_name,
      'initials', author.initials,
      'avatar_photo_data', author_preferences.avatar_photo_data
    ),
    'parent', case
      when parent.id is null then null
      else jsonb_build_object(
        'id', parent.id,
        'body', case when parent.deleted_at is null then parent.body else null end,
        'deleted', parent.deleted_at is not null,
        'author', jsonb_build_object(
          'id', parent_author.id,
          'display_name', parent_author.display_name,
          'initials', parent_author.initials,
          'avatar_photo_data', parent_author_preferences.avatar_photo_data
        )
      )
    end,
    'mentions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', mentioned.id,
          'display_name', mentioned.display_name,
          'initials', mentioned.initials,
          'avatar_photo_data', mentioned_preferences.avatar_photo_data
        )
        order by mentioned.display_name
      )
      from private.war_room_mentions mention
      join public.profiles mentioned on mentioned.id = mention.mentioned_profile_id
      left join public.profile_preferences mentioned_preferences
        on mentioned_preferences.profile_id = mentioned.id
      where mention.message_id = message.id
    ), '[]'::jsonb),
    'can_delete', message.deleted_at is null and (
      message.author_profile_id = p_viewer_profile_id
      or exists (
        select 1
        from private.war_room_memberships viewer_membership
        where viewer_membership.profile_id = p_viewer_profile_id
          and viewer_membership.status = 'active'
          and viewer_membership.role = 'admin'
      )
    )
  )
  from private.war_room_messages message
  join public.profiles author on author.id = message.author_profile_id
  left join public.profile_preferences author_preferences
    on author_preferences.profile_id = author.id
  left join private.war_room_messages parent on parent.id = message.parent_message_id
  left join public.profiles parent_author on parent_author.id = parent.author_profile_id
  left join public.profile_preferences parent_author_preferences
    on parent_author_preferences.profile_id = parent_author.id
  where message.id = p_message_id;
$$;

revoke all on function private.war_room_message_json(uuid, uuid) from public, anon, authenticated;

create or replace function public.get_war_room_snapshot(
  p_before_created_at timestamptz default null,
  p_before_id uuid default null,
  p_limit integer default 40
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_member record;
  v_limit integer := least(greatest(coalesce(p_limit, 40), 1), 100);
  v_messages jsonb := '[]'::jsonb;
  v_members jsonb := '[]'::jsonb;
  v_has_more boolean := false;
  v_next_cursor jsonb := null;
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  if (p_before_created_at is null) <> (p_before_id is null) then
    raise exception 'War Room cursor is incomplete';
  end if;

  select count(*) > v_limit
    into v_has_more
  from (
    select message.id
    from private.war_room_messages message
    where p_before_created_at is null
      or (message.created_at, message.id) < (p_before_created_at, p_before_id)
    order by message.created_at desc, message.id desc
    limit v_limit + 1
  ) candidate;

  select coalesce(
    jsonb_agg(
      private.war_room_message_json(page.id, v_member.profile_id)
      order by page.created_at, page.id
    ),
    '[]'::jsonb
  )
    into v_messages
  from (
    select message.id, message.created_at
    from private.war_room_messages message
    where p_before_created_at is null
      or (message.created_at, message.id) < (p_before_created_at, p_before_id)
    order by message.created_at desc, message.id desc
    limit v_limit
  ) page;

  if jsonb_array_length(v_messages) > 0 then
    select jsonb_build_object(
      'created_at', page.created_at,
      'id', page.id
    )
      into v_next_cursor
    from (
      select message.id, message.created_at
      from private.war_room_messages message
      where p_before_created_at is null
        or (message.created_at, message.id) < (p_before_created_at, p_before_id)
      order by message.created_at desc, message.id desc
      limit v_limit
    ) page
    order by page.created_at, page.id
    limit 1;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', profile.id,
      'display_name', profile.display_name,
      'initials', profile.initials,
      'avatar_photo_data', preferences.avatar_photo_data
    )
    order by profile.display_name
  ), '[]'::jsonb)
    into v_members
  from private.war_room_memberships membership
  join public.profiles profile on profile.id = membership.profile_id
  left join public.profile_preferences preferences on preferences.profile_id = profile.id
  where membership.status = 'active';

  return jsonb_build_object(
    'role', v_member.role,
    'messages', v_messages,
    'members', v_members,
    'has_more', v_has_more,
    'next_cursor', case when v_has_more then v_next_cursor else null end
  );
end;
$$;

create or replace function public.post_war_room_message(
  p_body text,
  p_parent_message_id uuid default null,
  p_mentioned_profile_ids uuid[] default '{}'::uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member record;
  v_body text := trim(coalesce(p_body, ''));
  v_parent private.war_room_messages;
  v_message private.war_room_messages;
  v_mention_id uuid;
  v_mention_name text;
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  if char_length(v_body) not between 1 and 500 then
    raise exception 'Messages must contain between 1 and 500 characters';
  end if;

  if cardinality(coalesce(p_mentioned_profile_ids, '{}'::uuid[])) > 20 then
    raise exception 'A War Room message may mention at most 20 profiles';
  end if;

  if p_parent_message_id is not null then
    select message.*
      into v_parent
    from private.war_room_messages message
    where message.id = p_parent_message_id
    for update;

    if not found or v_parent.deleted_at is not null then
      raise exception 'That War Room reply target is not available';
    end if;

    if v_parent.parent_message_id is not null then
      raise exception 'War Room replies support one level only';
    end if;
  end if;

  insert into private.war_room_messages (
    author_profile_id,
    parent_message_id,
    body
  )
  values (
    v_member.profile_id,
    p_parent_message_id,
    v_body
  )
  returning * into v_message;

  for v_mention_id in
    select distinct mention_id
    from unnest(coalesce(p_mentioned_profile_ids, '{}'::uuid[])) mention_id
  loop
    select profile.display_name
      into v_mention_name
    from public.profiles profile
    join private.war_room_memberships membership
      on membership.profile_id = profile.id
     and membership.status = 'active'
    where profile.id = v_mention_id;

    if not found then
      raise exception 'War Room mentions require an active member';
    end if;

    if position('@' || upper(v_mention_name) in upper(v_body)) = 0 then
      raise exception 'War Room mention does not match the message text';
    end if;

    insert into private.war_room_mentions(message_id, mentioned_profile_id)
    values (v_message.id, v_mention_id);
  end loop;

  return private.war_room_message_json(v_message.id, v_member.profile_id);
end;
$$;

create or replace function public.delete_war_room_message(p_message_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member record;
  v_message private.war_room_messages;
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  select message.*
    into v_message
  from private.war_room_messages message
  where message.id = p_message_id
  for update;

  if not found then
    raise exception 'War Room message not found';
  end if;

  if v_message.deleted_at is null
    and v_message.author_profile_id <> v_member.profile_id
    and v_member.role <> 'admin'
  then
    raise exception 'You cannot delete that War Room message';
  end if;

  if v_message.deleted_at is null then
    update private.war_room_messages
    set deleted_at = now(),
        deleted_by_profile_id = v_member.profile_id
    where id = p_message_id;
  end if;

  return private.war_room_message_json(p_message_id, v_member.profile_id);
end;
$$;

revoke all on function public.get_war_room_snapshot(timestamptz, uuid, integer) from public, anon;
revoke all on function public.post_war_room_message(text, uuid, uuid[]) from public, anon;
revoke all on function public.delete_war_room_message(uuid) from public, anon;

grant execute on function public.get_war_room_snapshot(timestamptz, uuid, integer) to authenticated;
grant execute on function public.post_war_room_message(text, uuid, uuid[]) to authenticated;
grant execute on function public.delete_war_room_message(uuid) to authenticated;

comment on table private.war_room_messages is 'Private continuous War Room conversation. Browser access is RPC-only.';
comment on table private.war_room_mentions is 'Resolved War Room mention relationships. Browser access is RPC-only.';
comment on function public.get_war_room_snapshot(timestamptz, uuid, integer) is 'Returns one guarded War Room page and active member identities.';
comment on function public.post_war_room_message(text, uuid, uuid[]) is 'Posts one guarded War Room message with optional one-level reply and resolved mentions.';
comment on function public.delete_war_room_message(uuid) is 'Soft-deletes an owned War Room message or any message for a War Room admin.';
