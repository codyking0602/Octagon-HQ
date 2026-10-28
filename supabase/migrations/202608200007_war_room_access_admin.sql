create or replace function private.war_room_current_admin()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select membership.profile_id
  from private.war_room_memberships membership
  where membership.profile_id = auth.uid()
    and membership.status = 'active'
    and membership.role = 'admin'
  limit 1;
$$;

revoke all on function private.war_room_current_admin() from public, anon, authenticated;

create or replace function public.get_war_room_access_roster()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_roster jsonb;
begin
  select private.war_room_current_admin() into v_admin_id;
  if v_admin_id is null then
    raise exception 'War Room admin access required';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', profile.id,
      'display_name', profile.display_name,
      'initials', profile.initials,
      'avatar_photo_data', preferences.avatar_photo_data,
      'has_access', coalesce(membership.status = 'active', false),
      'role', membership.role
    )
    order by profile.display_name
  ), '[]'::jsonb)
    into v_roster
  from public.profiles profile
  left join public.profile_preferences preferences
    on preferences.profile_id = profile.id
  left join private.war_room_memberships membership
    on membership.profile_id = profile.id;

  return v_roster;
end;
$$;

create or replace function public.set_war_room_profile_access(
  p_profile_id uuid,
  p_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_latest_message_id uuid;
  v_result jsonb;
begin
  select private.war_room_current_admin() into v_admin_id;
  if v_admin_id is null then
    raise exception 'War Room admin access required';
  end if;

  if not exists (
    select 1 from public.profiles profile where profile.id = p_profile_id
  ) then
    raise exception 'Octagon HQ profile not found';
  end if;

  if p_profile_id = v_admin_id and not p_enabled then
    raise exception 'You cannot remove your own War Room access';
  end if;

  select message.id
    into v_latest_message_id
  from private.war_room_messages message
  order by message.created_at desc, message.id desc
  limit 1;

  if p_enabled then
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
      'member',
      'active',
      now(),
      null,
      now(),
      v_latest_message_id
    )
    on conflict (profile_id) do update
      set status = 'active',
          revoked_at = null,
          updated_at = now(),
          last_read_message_id = v_latest_message_id;
  else
    update private.war_room_memberships membership
    set status = 'revoked',
        revoked_at = now(),
        updated_at = now()
    where membership.profile_id = p_profile_id
      and membership.status = 'active';
  end if;

  select jsonb_build_object(
    'id', profile.id,
    'display_name', profile.display_name,
    'initials', profile.initials,
    'avatar_photo_data', preferences.avatar_photo_data,
    'has_access', coalesce(membership.status = 'active', false),
    'role', membership.role
  )
    into v_result
  from public.profiles profile
  left join public.profile_preferences preferences
    on preferences.profile_id = profile.id
  left join private.war_room_memberships membership
    on membership.profile_id = profile.id
  where profile.id = p_profile_id;

  return v_result;
end;
$$;

revoke all on function public.get_war_room_access_roster() from public, anon;
revoke all on function public.set_war_room_profile_access(uuid, boolean) from public, anon;
grant execute on function public.get_war_room_access_roster() to authenticated;
grant execute on function public.set_war_room_profile_access(uuid, boolean) to authenticated;

drop policy if exists war_room_profile_receives_access_broadcast on realtime.messages;
create policy war_room_profile_receives_access_broadcast
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'war-room-access:' || auth.uid()::text
  and extension = 'broadcast'
);

create or replace function private.broadcast_war_room_access_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'profile_id', new.profile_id,
      'status', new.status,
      'role', new.role
    ),
    'war_room_access_changed',
    'war-room-access:' || new.profile_id::text,
    true
  );
  return null;
end;
$$;

revoke all on function private.broadcast_war_room_access_change() from public, anon, authenticated;

drop trigger if exists war_room_membership_access_broadcast on private.war_room_memberships;
create trigger war_room_membership_access_broadcast
after insert or update of status, role on private.war_room_memberships
for each row execute function private.broadcast_war_room_access_change();

comment on function public.get_war_room_access_roster() is 'Returns every Octagon HQ profile and War Room access state to an active War Room admin.';
comment on function public.set_war_room_profile_access(uuid, boolean) is 'Allows an active War Room admin to grant or revoke one profile without exposing private membership tables.';
