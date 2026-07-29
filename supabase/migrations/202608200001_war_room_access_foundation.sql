create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.war_room_invites (
  id uuid primary key default extensions.gen_random_uuid(),
  code_hash bytea not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  max_uses integer not null default 1,
  use_count integer not null default 0,
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint war_room_invites_max_uses_positive check (max_uses between 1 and 100),
  constraint war_room_invites_use_count_valid check (use_count between 0 and max_uses),
  constraint war_room_invites_expiry_after_creation check (expires_at > created_at)
);

create table if not exists private.war_room_memberships (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  invite_id uuid references private.war_room_invites(id) on delete set null,
  joined_at timestamptz not null default now(),
  revoked_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint war_room_memberships_role_valid check (role in ('member', 'admin')),
  constraint war_room_memberships_status_valid check (status in ('active', 'revoked')),
  constraint war_room_memberships_revocation_consistent check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

alter table private.war_room_invites enable row level security;
alter table private.war_room_memberships enable row level security;

revoke all on private.war_room_invites from public, anon, authenticated;
revoke all on private.war_room_memberships from public, anon, authenticated;

create or replace function private.war_room_invite_hash(p_invite_code text)
returns bytea
language sql
immutable
strict
set search_path = ''
as $$
  select extensions.digest(
    convert_to(upper(regexp_replace(trim(p_invite_code), '\s+', '', 'g')), 'UTF8'),
    'sha256'
  );
$$;

revoke all on function private.war_room_invite_hash(text) from public, anon, authenticated;

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
      'role', v_membership.role
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

  insert into private.war_room_memberships (
    profile_id,
    role,
    status,
    invite_id,
    joined_at,
    revoked_at,
    updated_at
  )
  values (
    v_profile_id,
    'member',
    'active',
    v_invite.id,
    now(),
    null,
    now()
  );

  update private.war_room_invites
  set use_count = use_count + 1,
      last_used_at = now()
  where id = v_invite.id;

  return jsonb_build_object(
    'mode', 'eligible',
    'eligible', true,
    'role', 'member',
    'joined', true
  );
end;
$$;

create or replace function public.create_war_room_invite(
  p_expires_at timestamptz,
  p_max_uses integer default 1,
  p_created_by uuid default null
)
returns table (
  invite_id uuid,
  invite_code text,
  expires_at timestamptz,
  max_uses integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite_id uuid := extensions.gen_random_uuid();
  v_invite_code text := 'WR-' || upper(encode(extensions.gen_random_bytes(12), 'hex'));
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if p_expires_at is null
    or p_expires_at <= now()
    or p_expires_at > now() + interval '90 days'
  then
    raise exception 'invalid War Room invite expiration';
  end if;

  if p_max_uses is null or p_max_uses < 1 or p_max_uses > 100 then
    raise exception 'invalid War Room invite use limit';
  end if;

  if p_created_by is not null and not exists (
    select 1 from public.profiles profile where profile.id = p_created_by
  ) then
    raise exception 'War Room invite creator profile not found';
  end if;

  insert into private.war_room_invites (
    id,
    code_hash,
    created_by,
    expires_at,
    max_uses
  )
  values (
    v_invite_id,
    private.war_room_invite_hash(v_invite_code),
    p_created_by,
    p_expires_at,
    p_max_uses
  );

  return query
  select v_invite_id, v_invite_code, p_expires_at, p_max_uses;
end;
$$;

create or replace function public.revoke_war_room_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  update private.war_room_invites
  set revoked_at = coalesce(revoked_at, now())
  where id = p_invite_id;

  if not found then
    raise exception 'War Room invite not found';
  end if;
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

  insert into private.war_room_memberships (
    profile_id,
    role,
    status,
    joined_at,
    revoked_at,
    updated_at
  )
  values (
    p_profile_id,
    v_role,
    case when p_active then 'active' else 'revoked' end,
    now(),
    case when p_active then null else now() end,
    now()
  )
  on conflict (profile_id) do update
  set role = excluded.role,
      status = excluded.status,
      revoked_at = excluded.revoked_at,
      updated_at = now();

  return jsonb_build_object(
    'profile_id', p_profile_id,
    'eligible', p_active,
    'role', v_role
  );
end;
$$;

-- Preserve existing V1 War Room eligibility when the legacy tables share this database.
do $$
begin
  if to_regclass('public.octagon_access') is not null
    and to_regclass('public.pick_group_members') is not null
    and to_regclass('public.pick_groups') is not null
  then
    execute $copy_legacy_access$
      insert into private.war_room_memberships (
        profile_id,
        role,
        status,
        joined_at,
        revoked_at,
        updated_at
      )
      select
        profile.id,
        case
          when coalesce(legacy.is_app_admin, false)
            or legacy_group.owner_member_id = legacy.id
          then 'admin'
          else 'member'
        end,
        'active',
        coalesce(access.enabled_at, access.created_at, now()),
        null,
        now()
      from public.octagon_access access
      join public.pick_group_members legacy on legacy.id = access.member_id
      join public.pick_groups legacy_group on legacy_group.id = access.group_id
      join public.profiles profile
        on profile.normalized_name = upper(regexp_replace(trim(legacy.display_name), '\s+', ' ', 'g'))
      where access.can_access
        and coalesce(legacy.is_active, true)
        and (coalesce(legacy_group.is_canonical, false) or legacy_group.code = 'GOAT26')
      on conflict (profile_id) do nothing
    $copy_legacy_access$;
  end if;
end;
$$;

insert into private.war_room_memberships (
  profile_id,
  role,
  status,
  joined_at,
  revoked_at,
  updated_at
)
select
  profile.id,
  'admin',
  'active',
  now(),
  null,
  now()
from public.profiles profile
where profile.normalized_name = 'CODY'
on conflict (profile_id) do update
set role = 'admin',
    status = 'active',
    revoked_at = null,
    updated_at = now();

revoke all on function public.get_my_war_room_access(text) from public, anon;
revoke all on function public.join_war_room_with_invite(text) from public, anon;
grant execute on function public.get_my_war_room_access(text) to authenticated;
grant execute on function public.join_war_room_with_invite(text) to authenticated;

revoke all on function public.create_war_room_invite(timestamptz, integer, uuid) from public, anon, authenticated;
revoke all on function public.revoke_war_room_invite(uuid) from public, anon, authenticated;
revoke all on function public.set_war_room_membership(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.create_war_room_invite(timestamptz, integer, uuid) to service_role;
grant execute on function public.revoke_war_room_invite(uuid) to service_role;
grant execute on function public.set_war_room_membership(uuid, boolean, text) to service_role;
