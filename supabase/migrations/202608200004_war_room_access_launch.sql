create or replace function public.get_my_war_room_access(p_invite_code text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_membership private.war_room_memberships;
  v_invite private.war_room_invites;
  v_code text := nullif(trim(p_invite_code), '');
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not exists (
    select 1 from public.profiles profile where profile.id = v_profile_id
  ) then
    raise exception 'Octagon HQ profile required';
  end if;

  select membership.*
    into v_membership
  from private.war_room_memberships membership
  where membership.profile_id = v_profile_id;

  if found and v_membership.status = 'active' then
    return jsonb_build_object(
      'mode', 'eligible',
      'eligible', true,
      'role', v_membership.role,
      'unread_count', private.war_room_unread_count(v_profile_id)
    );
  end if;

  if found and v_membership.status = 'revoked' then
    return jsonb_build_object(
      'mode', 'locked',
      'eligible', false
    );
  end if;

  if v_code is null or char_length(v_code) < 12 or char_length(v_code) > 80 then
    return jsonb_build_object(
      'mode', 'locked',
      'eligible', false
    );
  end if;

  select invite.*
    into v_invite
  from private.war_room_invites invite
  where invite.code_hash = private.war_room_invite_hash(v_code)
    and invite.revoked_at is null
    and invite.expires_at > now()
    and invite.use_count < invite.max_uses;

  if not found then
    return jsonb_build_object(
      'mode', 'locked',
      'eligible', false
    );
  end if;

  return jsonb_build_object(
    'mode', 'invite',
    'eligible', false,
    'invite_expires_at', v_invite.expires_at,
    'invite_uses_remaining', v_invite.max_uses - v_invite.use_count
  );
end;
$$;

create or replace function public.join_war_room_with_invite(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_code text := nullif(trim(p_invite_code), '');
  v_membership private.war_room_memberships;
  v_invite private.war_room_invites;
  v_latest_message_id uuid;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  perform 1
  from public.profiles profile
  where profile.id = v_profile_id
  for update;

  if not found then
    raise exception 'Octagon HQ profile required';
  end if;

  select membership.*
    into v_membership
  from private.war_room_memberships membership
  where membership.profile_id = v_profile_id
  for update;

  if found and v_membership.status = 'active' then
    return jsonb_build_object(
      'mode', 'eligible',
      'eligible', true,
      'role', v_membership.role,
      'unread_count', private.war_room_unread_count(v_profile_id),
      'joined', false
    );
  end if;

  if found and v_membership.status = 'revoked' then
    raise exception 'War Room access is not available for this profile';
  end if;

  if v_code is null or char_length(v_code) < 12 or char_length(v_code) > 80 then
    raise exception 'invalid or expired War Room invite';
  end if;

  select invite.*
    into v_invite
  from private.war_room_invites invite
  where invite.code_hash = private.war_room_invite_hash(v_code)
  for update;

  if not found
    or v_invite.revoked_at is not null
    or v_invite.expires_at <= now()
    or v_invite.use_count >= v_invite.max_uses
  then
    raise exception 'invalid or expired War Room invite';
  end if;

  select message.id
    into v_latest_message_id
  from private.war_room_messages message
  order by message.created_at desc, message.id desc
  limit 1;

  insert into private.war_room_memberships (
    profile_id,
    role,
    status,
    invite_id,
    joined_at,
    revoked_at,
    updated_at,
    last_read_message_id
  )
  values (
    v_profile_id,
    'member',
    'active',
    v_invite.id,
    now(),
    null,
    now(),
    v_latest_message_id
  );

  update private.war_room_invites
  set use_count = use_count + 1,
      last_used_at = now()
  where id = v_invite.id;

  return jsonb_build_object(
    'mode', 'eligible',
    'eligible', true,
    'role', 'member',
    'unread_count', 0,
    'joined', true
  );
end;
$$;

create or replace function public.set_war_room_membership(
  p_profile_id uuid,
  p_active boolean,
  p_role text default 'member'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := lower(trim(p_role));
  v_latest_message_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if p_profile_id is null or not exists (
    select 1 from public.profiles profile where profile.id = p_profile_id
  ) then
    raise exception 'War Room profile not found';
  end if;

  if p_active is null then
    raise exception 'War Room membership state required';
  end if;

  if v_role not in ('member', 'admin') then
    raise exception 'invalid War Room role';
  end if;

  if p_active then
    select message.id
      into v_latest_message_id
    from private.war_room_messages message
    order by message.created_at desc, message.id desc
    limit 1;
  end if;

  insert into private.war_room_memberships (
    profile_id,
    role,
    status,
    joined_at,
    revoked_at,
    updated_at,
    last_read_message_id
  )
  values (
    p_profile_id,
    v_role,
    case when p_active then 'active' else 'revoked' end,
    now(),
    case when p_active then null else now() end,
    now(),
    case when p_active then v_latest_message_id else null end
  )
  on conflict (profile_id) do update
  set role = excluded.role,
      status = excluded.status,
      revoked_at = excluded.revoked_at,
      updated_at = now(),
      last_read_message_id = case
        when p_active and private.war_room_memberships.status = 'revoked'
          then v_latest_message_id
        else private.war_room_memberships.last_read_message_id
      end;

  return jsonb_build_object(
    'profile_id', p_profile_id,
    'eligible', p_active,
    'role', v_role
  );
end;
$$;

