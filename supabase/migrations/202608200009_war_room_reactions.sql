create table if not exists private.war_room_reactions (
  message_id uuid not null references private.war_room_messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  reaction_type text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id, reaction_type),
  constraint war_room_reactions_type_check check (
    reaction_type in ('like', 'dislike', 'exclaim', 'laugh')
  )
);

alter table private.war_room_reactions enable row level security;
revoke all on private.war_room_reactions from public, anon, authenticated;

create index if not exists war_room_reactions_message_idx
  on private.war_room_reactions(message_id, reaction_type, created_at);

create index if not exists war_room_reactions_profile_idx
  on private.war_room_reactions(profile_id, created_at desc);

create or replace function private.war_room_reactions_json(
  p_message_id uuid,
  p_viewer_profile_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'type', reaction_type.reaction_type,
      'count', (
        select count(*)::integer
        from private.war_room_reactions reaction
        where reaction.message_id = p_message_id
          and reaction.reaction_type = reaction_type.reaction_type
      ),
      'reacted', exists (
        select 1
        from private.war_room_reactions viewer_reaction
        where viewer_reaction.message_id = p_message_id
          and viewer_reaction.profile_id = p_viewer_profile_id
          and viewer_reaction.reaction_type = reaction_type.reaction_type
      )
    )
    order by reaction_type.position
  ), '[]'::jsonb)
  from (values
    ('like'::text, 1),
    ('dislike'::text, 2),
    ('exclaim'::text, 3),
    ('laugh'::text, 4)
  ) reaction_type(reaction_type, position);
$$;

revoke all on function private.war_room_reactions_json(uuid, uuid) from public, anon, authenticated;

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
      when parent.id is null or parent.deleted_at is not null then null
      else jsonb_build_object(
        'id', parent.id,
        'body', parent.body,
        'deleted', false,
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
    'reactions', case
      when message.deleted_at is null
        then private.war_room_reactions_json(message.id, p_viewer_profile_id)
      else '[]'::jsonb
    end,
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
  v_latest_message_id uuid := null;
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  if (p_before_created_at is null) <> (p_before_id is null) then
    raise exception 'War Room cursor is incomplete';
  end if;

  select message.id
    into v_latest_message_id
  from private.war_room_messages message
  where message.deleted_at is null
  order by message.created_at desc, message.id desc
  limit 1;

  select count(*) > v_limit
    into v_has_more
  from (
    select message.id
    from private.war_room_messages message
    where message.deleted_at is null
      and (
        p_before_created_at is null
        or (message.created_at, message.id) < (p_before_created_at, p_before_id)
      )
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
    where message.deleted_at is null
      and (
        p_before_created_at is null
        or (message.created_at, message.id) < (p_before_created_at, p_before_id)
      )
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
      where message.deleted_at is null
        and (
          p_before_created_at is null
          or (message.created_at, message.id) < (p_before_created_at, p_before_id)
        )
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
    'next_cursor', case when v_has_more then v_next_cursor else null end,
    'unread_count', private.war_room_unread_count(v_member.profile_id),
    'latest_message_id', v_latest_message_id
  );
end;
$$;

create or replace function public.get_war_room_message(p_message_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_member record;
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  if not exists (
    select 1
    from private.war_room_messages message
    where message.id = p_message_id
  ) then
    return null;
  end if;

  return private.war_room_message_json(p_message_id, v_member.profile_id);
end;
$$;

create or replace function public.toggle_war_room_reaction(
  p_message_id uuid,
  p_reaction_type text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member record;
  v_message private.war_room_messages;
  v_reaction_type text := lower(trim(coalesce(p_reaction_type, '')));
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  if v_reaction_type not in ('like', 'dislike', 'exclaim', 'laugh') then
    raise exception 'Unsupported War Room reaction';
  end if;

  select message.*
    into v_message
  from private.war_room_messages message
  where message.id = p_message_id
  for update;

  if not found or v_message.deleted_at is not null then
    raise exception 'That War Room message is not available';
  end if;

  if exists (
    select 1
    from private.war_room_reactions reaction
    where reaction.message_id = p_message_id
      and reaction.profile_id = v_member.profile_id
      and reaction.reaction_type = v_reaction_type
  ) then
    delete from private.war_room_reactions reaction
    where reaction.message_id = p_message_id
      and reaction.profile_id = v_member.profile_id
      and reaction.reaction_type = v_reaction_type;
  else
    insert into private.war_room_reactions (
      message_id,
      profile_id,
      reaction_type
    )
    values (
      p_message_id,
      v_member.profile_id,
      v_reaction_type
    );
  end if;

  return private.war_room_message_json(p_message_id, v_member.profile_id);
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
    delete from private.war_room_reactions reaction
    where reaction.message_id = p_message_id;

    update private.war_room_messages
    set deleted_at = now(),
        deleted_by_profile_id = v_member.profile_id
    where id = p_message_id;
  end if;

  return private.war_room_message_json(p_message_id, v_member.profile_id);
end;
$$;

create or replace function private.broadcast_war_room_reaction_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_message_id uuid;
begin
  v_message_id := case when tg_op = 'DELETE' then old.message_id else new.message_id end;

  perform realtime.send(
    jsonb_build_object(
      'message_id', v_message_id,
      'operation', 'reaction'
    ),
    'war_room_changed',
    'war-room:conversation',
    true
  );
  return null;
end;
$$;

revoke all on function private.broadcast_war_room_reaction_change() from public, anon, authenticated;

drop trigger if exists war_room_reactions_broadcast on private.war_room_reactions;
create trigger war_room_reactions_broadcast
after insert or delete on private.war_room_reactions
for each row execute function private.broadcast_war_room_reaction_change();

revoke all on function public.get_war_room_snapshot(timestamptz, uuid, integer) from public, anon;
revoke all on function public.get_war_room_message(uuid) from public, anon;
revoke all on function public.toggle_war_room_reaction(uuid, text) from public, anon;
revoke all on function public.delete_war_room_message(uuid) from public, anon;

grant execute on function public.get_war_room_snapshot(timestamptz, uuid, integer) to authenticated;
grant execute on function public.get_war_room_message(uuid) to authenticated;
grant execute on function public.toggle_war_room_reaction(uuid, text) to authenticated;
grant execute on function public.delete_war_room_message(uuid) to authenticated;

comment on table private.war_room_reactions is 'Private per-profile War Room message reactions. Browser access is RPC-only.';
comment on function public.get_war_room_message(uuid) is 'Returns one guarded War Room message for targeted Realtime reconciliation.';
comment on function public.toggle_war_room_reaction(uuid, text) is 'Toggles one independent Like, Dislike, Exclaim, or Laugh reaction for the current War Room member.';
