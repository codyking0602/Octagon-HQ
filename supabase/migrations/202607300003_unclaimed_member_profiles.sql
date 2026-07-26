create or replace function public.register_unclaimed_pin_profile(
  p_profile_id uuid,
  p_display_name text,
  p_initials text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text := upper(regexp_replace(trim(p_display_name), '\s+', ' ', 'g'));
  v_initials text := upper(trim(p_initials));
  v_existing_id uuid;
  v_profile public.profiles;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if char_length(v_display_name) < 2 or char_length(v_display_name) > 24 then
    raise exception 'invalid display name';
  end if;
  if v_initials !~ '^[A-Z0-9]{1,2}$' then
    raise exception 'invalid initials';
  end if;
  if not exists (select 1 from auth.users where id = p_profile_id) then
    raise exception 'auth user missing';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('octagon-profile:' || v_display_name, 0));

  select profile.id
    into v_existing_id
  from public.profiles profile
  where profile.normalized_name = v_display_name;

  if v_existing_id is not null and v_existing_id <> p_profile_id then
    raise exception 'profile name already exists' using errcode = '23505';
  end if;

  insert into public.profiles (id, display_name, normalized_name, initials)
  values (p_profile_id, v_display_name, v_display_name, v_initials)
  on conflict (id) do update
    set display_name = excluded.display_name,
        normalized_name = excluded.normalized_name,
        initials = excluded.initials
  returning * into v_profile;

  if exists (
    select 1
    from private.profile_pin_credentials credential
    where credential.profile_id = p_profile_id
  ) then
    raise exception 'profile already has credentials';
  end if;

  return v_profile;
end;
$$;

create or replace function public.claim_unclaimed_pin_profile(
  p_display_name text,
  p_pin text
)
returns table (
  profile_id uuid,
  internal_email text,
  claim_result text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text := upper(regexp_replace(trim(p_display_name), '\s+', ' ', 'g'));
  v_profile_id uuid;
  v_internal_email text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;
  if p_pin !~ '^\d{4}$' then
    raise exception 'invalid pin';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('octagon-profile:' || v_display_name, 0));

  select profile.id, auth_user.email
    into v_profile_id, v_internal_email
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  left join private.profile_pin_credentials credential on credential.profile_id = profile.id
  where profile.normalized_name = v_display_name
    and credential.profile_id is null
  for update of profile;

  if not found or nullif(v_internal_email, '') is null then
    return;
  end if;

  insert into private.profile_pin_credentials (
    profile_id,
    internal_email,
    pin_hash,
    failed_attempts,
    locked_until,
    last_failed_at,
    pin_updated_at
  ) values (
    v_profile_id,
    lower(v_internal_email),
    extensions.crypt(p_pin, extensions.gen_salt('bf', 12)),
    0,
    null,
    null,
    now()
  );

  return query select v_profile_id, lower(v_internal_email), 'claimed'::text;
end;
$$;

revoke all on function public.register_unclaimed_pin_profile(uuid, text, text) from public, anon, authenticated;
revoke all on function public.claim_unclaimed_pin_profile(text, text) from public, anon, authenticated;
grant execute on function public.register_unclaimed_pin_profile(uuid, text, text) to service_role;
grant execute on function public.claim_unclaimed_pin_profile(text, text) to service_role;
