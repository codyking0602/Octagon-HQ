drop function if exists public.verify_profile_pin(text, text);

create function public.verify_profile_pin(
  p_display_name text,
  p_pin text
)
returns table (
  profile_id uuid,
  internal_email text,
  auth_result text,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_normalized_name text := upper(regexp_replace(trim(p_display_name), '\s+', ' ', 'g'));
  v_profile_id uuid;
  v_internal_email text;
  v_pin_hash text;
  v_failed_attempts integer;
  v_locked_until timestamptz;
  v_next_locked_until timestamptz;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  select p.id, c.internal_email, c.pin_hash, c.failed_attempts, c.locked_until
    into v_profile_id, v_internal_email, v_pin_hash, v_failed_attempts, v_locked_until
  from public.profiles p
  join private.profile_pin_credentials c on c.profile_id = p.id
  where p.normalized_name = v_normalized_name
  for update of c;

  if not found then
    perform pg_sleep(0.2);
    return query select null::uuid, null::text, 'invalid'::text, 0;
    return;
  end if;

  if v_locked_until is not null and v_locked_until > now() then
    return query select
      v_profile_id,
      null::text,
      'locked'::text,
      greatest(1, ceil(extract(epoch from (v_locked_until - now())))::integer);
    return;
  end if;

  if v_locked_until is not null and v_locked_until <= now() then
    v_failed_attempts := 0;
  end if;

  if p_pin !~ '^\d{4}$' or v_pin_hash <> extensions.crypt(p_pin, v_pin_hash) then
    v_failed_attempts := coalesce(v_failed_attempts, 0) + 1;
    v_next_locked_until := case
      when v_failed_attempts >= 5 then now() + interval '5 minutes'
      else null
    end;

    update private.profile_pin_credentials
    set failed_attempts = v_failed_attempts,
        last_failed_at = now(),
        locked_until = v_next_locked_until
    where profile_pin_credentials.profile_id = v_profile_id;

    if v_next_locked_until is not null then
      return query select v_profile_id, null::text, 'locked'::text, 300;
    else
      return query select v_profile_id, null::text, 'invalid'::text, 0;
    end if;
    return;
  end if;

  update private.profile_pin_credentials
  set failed_attempts = 0,
      locked_until = null,
      last_failed_at = null
  where profile_pin_credentials.profile_id = v_profile_id;

  return query select v_profile_id, v_internal_email, 'ok'::text, 0;
end;
$$;

revoke all on function public.verify_profile_pin(text, text) from public, anon, authenticated;
grant execute on function public.verify_profile_pin(text, text) to service_role;

create or replace function public.inspect_profile_pin_state(p_display_name text)
returns table (
  profile_exists boolean,
  credential_exists boolean,
  failed_attempts integer,
  locked boolean,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_normalized_name text := upper(regexp_replace(trim(p_display_name), '\s+', ' ', 'g'));
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  return query
  select
    p.id is not null,
    c.profile_id is not null,
    coalesce(c.failed_attempts, 0),
    coalesce(c.locked_until > now(), false),
    case
      when c.locked_until is not null and c.locked_until > now()
        then greatest(1, ceil(extract(epoch from (c.locked_until - now())))::integer)
      else 0
    end
  from (select 1) seed
  left join public.profiles p on p.normalized_name = v_normalized_name
  left join private.profile_pin_credentials c on c.profile_id = p.id;
end;
$$;

revoke all on function public.inspect_profile_pin_state(text) from public, anon, authenticated;
grant execute on function public.inspect_profile_pin_state(text) to service_role;
