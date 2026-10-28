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
  v_author_name text;
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

  select profile.display_name
    into v_author_name
  from public.profiles profile
  where profile.id = v_member.profile_id;

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

  if p_parent_message_id is not null
    and v_parent.author_profile_id <> v_member.profile_id
    and exists (
      select 1
      from private.war_room_memberships membership
      where membership.profile_id = v_parent.author_profile_id
        and membership.status = 'active'
    )
  then
    perform private.publish_notification_to_profile(
      v_parent.author_profile_id,
      'war-room:reply:' || v_message.id::text || ':' || v_parent.author_profile_id::text,
      'war-room:replies',
      'war_room_reply',
      'Someone replied to your message',
      v_author_name || ' replied to your message in War Room.',
      '/war-room',
      'OPEN WAR ROOM',
      v_message.created_at
    );
  end if;

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

    if v_mention_id <> v_member.profile_id
      and (
        p_parent_message_id is null
        or v_mention_id <> v_parent.author_profile_id
      )
    then
      perform private.publish_notification_to_profile(
        v_mention_id,
        'war-room:mention:' || v_message.id::text || ':' || v_mention_id::text,
        'war-room:mentions',
        'war_room_mention',
        'You were mentioned',
        v_author_name || ' mentioned you in War Room.',
        '/war-room',
        'OPEN WAR ROOM',
        v_message.created_at
      );
    end if;
  end loop;

  return private.war_room_message_json(v_message.id, v_member.profile_id);
end;
$$;

comment on function public.post_war_room_message(text, uuid, uuid[]) is
  'Posts one guarded War Room message and emits aggregated mention or reply notifications through the canonical notification owner.';
