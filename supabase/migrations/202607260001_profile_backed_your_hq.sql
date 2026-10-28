create table if not exists public.find_leader_history (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  official_score smallint not null,
  best_score smallint not null,
  attempts integer not null default 1,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, day),
  constraint find_leader_official_score_range check (official_score between 1 and 10),
  constraint find_leader_best_score_range check (best_score between 1 and 10),
  constraint find_leader_best_not_below_official check (best_score >= official_score),
  constraint find_leader_attempts_positive check (attempts >= 1)
);

alter table public.find_leader_history enable row level security;
grant select on public.find_leader_history to authenticated;

drop policy if exists find_leader_history_read_own on public.find_leader_history;
create policy find_leader_history_read_own
  on public.find_leader_history
  for select
  to authenticated
  using (auth.uid() = profile_id);

create table if not exists public.profile_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  favorite_fighter_slug text,
  updated_at timestamptz not null default now(),
  constraint favorite_fighter_slug_format check (
    favorite_fighter_slug is null
    or (
      char_length(favorite_fighter_slug) between 1 and 80
      and favorite_fighter_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    )
  )
);

alter table public.profile_preferences enable row level security;
grant select on public.profile_preferences to authenticated;

drop policy if exists profile_preferences_read_own on public.profile_preferences;
create policy profile_preferences_read_own
  on public.profile_preferences
  for select
  to authenticated
  using (auth.uid() = profile_id);

create or replace function public.list_my_find_leader_history()
returns setof public.find_leader_history
language sql
stable
security definer
set search_path = ''
as $$
  select history.*
  from public.find_leader_history history
  where history.profile_id = auth.uid()
  order by history.day desc
  limit 180;
$$;

revoke all on function public.list_my_find_leader_history() from public, anon;
grant execute on function public.list_my_find_leader_history() to authenticated;

create or replace function public.record_my_find_leader_attempt(
  p_day date,
  p_score integer,
  p_completed_at timestamptz default now()
)
returns public.find_leader_history
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_row public.find_leader_history;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if p_day is null or p_score < 1 or p_score > 10 then
    raise exception 'invalid Find the Leader result';
  end if;

  insert into public.find_leader_history (
    profile_id,
    day,
    official_score,
    best_score,
    attempts,
    completed_at,
    updated_at
  )
  values (
    v_profile_id,
    p_day,
    p_score,
    p_score,
    1,
    coalesce(p_completed_at, now()),
    now()
  )
  on conflict (profile_id, day) do update
  set best_score = greatest(public.find_leader_history.best_score, excluded.best_score),
      attempts = public.find_leader_history.attempts + 1,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.record_my_find_leader_attempt(date, integer, timestamptz) from public, anon;
grant execute on function public.record_my_find_leader_attempt(date, integer, timestamptz) to authenticated;

create or replace function public.get_my_profile_preferences()
returns public.profile_preferences
language sql
stable
security definer
set search_path = ''
as $$
  select preferences.*
  from public.profile_preferences preferences
  where preferences.profile_id = auth.uid();
$$;

revoke all on function public.get_my_profile_preferences() from public, anon;
grant execute on function public.get_my_profile_preferences() to authenticated;

create or replace function public.set_my_favorite_fighter(p_fighter_slug text)
returns public.profile_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_slug text := nullif(lower(trim(p_fighter_slug)), '');
  v_row public.profile_preferences;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if v_slug is not null and (
    char_length(v_slug) > 80
    or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) then
    raise exception 'invalid fighter';
  end if;

  insert into public.profile_preferences (profile_id, favorite_fighter_slug, updated_at)
  values (v_profile_id, v_slug, now())
  on conflict (profile_id) do update
  set favorite_fighter_slug = excluded.favorite_fighter_slug,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.set_my_favorite_fighter(text) from public, anon;
grant execute on function public.set_my_favorite_fighter(text) to authenticated;
