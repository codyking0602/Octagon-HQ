drop function if exists public.inspect_profile_pin_state(text);

create function public.inspect_profile_pin_state(p_display_name text)
returns table (
  profile_exists boolean,
  credential_exists boolean,
  auth_user_exists boolean,
  internal_email_matches_auth boolean,
  email_confirmed boolean,
  banned boolean,
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
    u.id is not null,
    coalesce(lower(c.internal_email) = lower(u.email), false),
    u.email_confirmed_at is not null,
    coalesce(u.banned_until > now(), false),
    coalesce(c.failed_attempts, 0),
    coalesce(c.locked_until > now(), false),
    case
      when c.locked_until is not null and c.locked_until > now()
        then greatest(1, ceil(extract(epoch from (c.locked_until - now())))::integer)
      else 0
    end
  from (select 1) seed
  left join public.profiles p on p.normalized_name = v_normalized_name
  left join private.profile_pin_credentials c on c.profile_id = p.id
  left join auth.users u on u.id = p.id;
end;
$$;

revoke all on function public.inspect_profile_pin_state(text) from public, anon, authenticated;
grant execute on function public.inspect_profile_pin_state(text) to service_role;
