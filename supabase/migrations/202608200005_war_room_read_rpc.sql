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
  order by message.created_at desc, message.id desc
  limit 1;

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
    'next_cursor', case when v_has_more then v_next_cursor else null end,
    'unread_count', private.war_room_unread_count(v_member.profile_id),
    'latest_message_id', v_latest_message_id
  );
end;
$$;

create or replace function public.mark_war_room_read(p_message_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member record;
  v_target private.war_room_messages;
  v_current private.war_room_messages;
  v_last_read_message_id uuid;
begin
  select * into v_member from private.war_room_current_member();
  if not found then
    raise exception 'War Room access required';
  end if;

  select message.*
    into v_target
  from private.war_room_messages message
  where message.id = p_message_id;

  if not found then
    raise exception 'War Room read target was not found';
  end if;

  select membership.last_read_message_id
    into v_last_read_message_id
  from private.war_room_memberships membership
  where membership.profile_id = v_member.profile_id
  for update;

  if v_last_read_message_id is not null then
    select message.*
      into v_current
    from private.war_room_messages message
    where message.id = v_last_read_message_id;
  end if;

  if v_last_read_message_id is null
    or not found
    or (v_target.created_at, v_target.id) > (v_current.created_at, v_current.id)
  then
    update private.war_room_memberships
    set last_read_message_id = v_target.id,
        updated_at = now()
    where profile_id = v_member.profile_id;
  end if;

  select membership.last_read_message_id
    into v_last_read_message_id
  from private.war_room_memberships membership
  where membership.profile_id = v_member.profile_id;

  return jsonb_build_object(
    'unread_count', private.war_room_unread_count(v_member.profile_id),
    'last_read_message_id', v_last_read_message_id
  );
end;
$$;

