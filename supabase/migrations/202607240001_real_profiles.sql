create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  normalized_name text not null,
  initials text not null,
  avatar_path text,
  avatar_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 24),
  constraint profiles_normalized_name_length check (char_length(normalized_name) between 2 and 24),
  constraint profiles_initials_length check (char_length(initials) between 1 and 2)
);

create unique index if not exists profiles_normalized_name_unique
  on public.profiles (normalized_name);

alter table public.profiles enable row level security;

grant select on public.profiles to authenticated;

drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated
  on public.profiles
  for select
  to authenticated
  using (true);

create table if not exists private.profile_pin_credentials (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  internal_email text not null unique,
  pin_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  last_failed_at timestamptz,
  pin_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint profile_pin_failed_attempts_nonnegative check (failed_attempts >= 0)
);

alter table private.profile_pin_credentials enable row level security;

create or replace function public.set_octagon_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_octagon_profile_updated_at();

create or replace function public.register_pin_profile(
  p_profile_id uuid,
  p_display_name text,
  p_initials text,
  p_internal_email text,
  p_pin text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text := upper(regexp_replace(trim(p_display_name), '\s+', ' ', 'g'));
  v_initials text := upper(trim(p_initials));
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

  if p_pin !~ '^\d{4}$' then
    raise exception 'invalid pin';
  end if;

  insert into public.profiles (id, display_name, normalized_name, initials)
  values (p_profile_id, v_display_name, v_display_name, v_initials)
  returning * into v_profile;

  insert into private.profile_pin_credentials (profile_id, internal_email, pin_hash)
  values (
    p_profile_id,
    lower(trim(p_internal_email)),
    extensions.crypt(p_pin, extensions.gen_salt('bf', 12))
  );

  return v_profile;
end;
$$;

revoke all on function public.register_pin_profile(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_pin_profile(uuid, text, text, text, text) to service_role;

create or replace function public.verify_profile_pin(
  p_display_name text,
  p_pin text
)
returns table (profile_id uuid, internal_email text)
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
    return;
  end if;

  if v_locked_until is not null and v_locked_until > now() then
    return;
  end if;

  if v_locked_until is not null and v_locked_until <= now() then
    v_failed_attempts := 0;
  end if;

  if p_pin !~ '^\d{4}$' or v_pin_hash <> extensions.crypt(p_pin, v_pin_hash) then
    v_failed_attempts := v_failed_attempts + 1;
    update private.profile_pin_credentials
    set failed_attempts = v_failed_attempts,
        last_failed_at = now(),
        locked_until = case
          when v_failed_attempts >= 5 then now() + interval '5 minutes'
          else null
        end
    where profile_pin_credentials.profile_id = v_profile_id;
    return;
  end if;

  update private.profile_pin_credentials
  set failed_attempts = 0,
      locked_until = null,
      last_failed_at = null
  where profile_pin_credentials.profile_id = v_profile_id;

  return query select v_profile_id, v_internal_email;
end;
$$;

revoke all on function public.verify_profile_pin(text, text) from public, anon, authenticated;
grant execute on function public.verify_profile_pin(text, text) to service_role;
