create table if not exists public.pick_events (
  event_id text primary key,
  name text not null,
  subtitle text not null,
  venue text not null,
  location text not null,
  starts_at timestamptz not null,
  locks_at timestamptz not null,
  season smallint not null,
  status text not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pick_event_id_format check (event_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint pick_event_season_range check (season between 1993 and 2200),
  constraint pick_event_status check (status in ('upcoming', 'locked', 'complete')),
  constraint pick_event_lock_before_start check (locks_at <= starts_at)
);

create table if not exists public.pick_bouts (
  event_id text not null references public.pick_events(event_id) on delete cascade,
  bout_id text not null,
  position smallint not null,
  weight_class text not null,
  red_fighter_slug text not null,
  red_fighter_name text not null,
  blue_fighter_slug text not null,
  blue_fighter_name text not null,
  winner_fighter_slug text,
  primary key (event_id, bout_id),
  unique (event_id, position),
  constraint pick_bout_id_format check (bout_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint pick_bout_position_positive check (position >= 1),
  constraint pick_bout_distinct_fighters check (red_fighter_slug <> blue_fighter_slug),
  constraint pick_bout_winner_is_option check (
    winner_fighter_slug is null
    or winner_fighter_slug in (red_fighter_slug, blue_fighter_slug)
  )
);

create table if not exists public.profile_event_picks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null,
  bout_id text not null,
  fighter_slug text not null,
  picked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, event_id, bout_id),
  foreign key (event_id, bout_id) references public.pick_bouts(event_id, bout_id) on delete cascade
);

alter table public.pick_events enable row level security;
alter table public.pick_bouts enable row level security;
alter table public.profile_event_picks enable row level security;

grant select on public.pick_events, public.pick_bouts to anon, authenticated;
grant select on public.profile_event_picks to authenticated;

drop policy if exists pick_events_public_read on public.pick_events;
create policy pick_events_public_read
  on public.pick_events
  for select
  to anon, authenticated
  using (true);

drop policy if exists pick_bouts_public_read on public.pick_bouts;
create policy pick_bouts_public_read
  on public.pick_bouts
  for select
  to anon, authenticated
  using (true);

drop policy if exists profile_event_picks_read_own on public.profile_event_picks;
create policy profile_event_picks_read_own
  on public.profile_event_picks
  for select
  to authenticated
  using (auth.uid() = profile_id);

insert into public.pick_events (
  event_id,
  name,
  subtitle,
  venue,
  location,
  starts_at,
  locks_at,
  season,
  status,
  updated_at
)
values (
  'ufc-fight-night-ankalaev-guskov-2026-07-25',
  'UFC Fight Night',
  'Ankalaev vs. Guskov',
  'Etihad Arena',
  'Abu Dhabi, United Arab Emirates',
  '2026-07-25T16:00:00Z',
  '2026-07-25T16:00:00Z',
  2026,
  'upcoming',
  now()
)
on conflict (event_id) do update
set name = excluded.name,
    subtitle = excluded.subtitle,
    venue = excluded.venue,
    location = excluded.location,
    starts_at = excluded.starts_at,
    locks_at = excluded.locks_at,
    season = excluded.season,
    status = excluded.status,
    updated_at = now();

insert into public.pick_bouts (
  event_id,
  bout_id,
  position,
  weight_class,
  red_fighter_slug,
  red_fighter_name,
  blue_fighter_slug,
  blue_fighter_name
)
values
  ('ufc-fight-night-ankalaev-guskov-2026-07-25', 'ankalaev-guskov', 1, 'Light Heavyweight', 'magomed-ankalaev', 'Magomed Ankalaev', 'bogdan-guskov', 'Bogdan Guskov'),
  ('ufc-fight-night-ankalaev-guskov-2026-07-25', 'erceg-temirov', 2, 'Flyweight', 'steve-erceg', 'Steve Erceg', 'ramazan-temirov', 'Ramazan Temirov'),
  ('ufc-fight-night-ankalaev-guskov-2026-07-25', 'dulatov-turman', 3, 'Welterweight', 'islam-dulatov', 'Islam Dulatov', 'wellington-turman', 'Wellington Turman'),
  ('ufc-fight-night-ankalaev-guskov-2026-07-25', 'zaynukov-rzepecki', 4, 'Lightweight', 'magomed-zaynukov', 'Magomed Zaynukov', 'damian-rzepecki', 'Damian Rzepecki'),
  ('ufc-fight-night-ankalaev-guskov-2026-07-25', 'kuniev-fortune', 5, 'Heavyweight', 'rizvan-kuniev', 'Rizvan Kuniev', 'tyrell-fortune', 'Tyrell Fortune'),
  ('ufc-fight-night-ankalaev-guskov-2026-07-25', 'bonfim-sola', 6, 'Lightweight', 'ismael-bonfim', 'Ismael Bonfim', 'axel-sola', 'Axel Sola')
on conflict (event_id, bout_id) do update
set position = excluded.position,
    weight_class = excluded.weight_class,
    red_fighter_slug = excluded.red_fighter_slug,
    red_fighter_name = excluded.red_fighter_name,
    blue_fighter_slug = excluded.blue_fighter_slug,
    blue_fighter_name = excluded.blue_fighter_name;

create or replace function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', case
      when event.status = 'complete' then 'complete'
      when now() >= event.locks_at then 'locked'
      else 'upcoming'
    end,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'winner_fighter_slug', bout.winner_fighter_slug
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from public.pick_events event
  where event.status in ('upcoming', 'locked')
  order by event.starts_at asc
  limit 1;
$$;

revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

create or replace function public.list_my_event_picks(p_event_id text)
returns setof public.profile_event_picks
language sql
stable
security definer
set search_path = ''
as $$
  select pick.*
  from public.profile_event_picks pick
  where pick.profile_id = auth.uid()
    and pick.event_id = p_event_id
  order by pick.bout_id;
$$;

revoke all on function public.list_my_event_picks(text) from public, anon;
grant execute on function public.list_my_event_picks(text) to authenticated;

create or replace function public.save_my_event_pick(
  p_event_id text,
  p_bout_id text,
  p_fighter_slug text
)
returns public.profile_event_picks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_slug text := lower(trim(p_fighter_slug));
  v_row public.profile_event_picks;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = p_event_id;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = 'complete' or now() >= v_event.locks_at then
    raise exception 'picks are locked';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = p_event_id
    and bout_id = p_bout_id;

  if not found then
    raise exception 'bout not found';
  end if;

  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;

  insert into public.profile_event_picks (
    profile_id,
    event_id,
    bout_id,
    fighter_slug,
    picked_at,
    updated_at
  )
  values (
    v_profile_id,
    p_event_id,
    p_bout_id,
    v_slug,
    now(),
    now()
  )
  on conflict (profile_id, event_id, bout_id) do update
  set fighter_slug = excluded.fighter_slug,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.save_my_event_pick(text, text, text) from public, anon;
grant execute on function public.save_my_event_pick(text, text, text) to authenticated;

create or replace function public.get_my_pick_summary(p_season integer default null)
returns table (
  correct integer,
  incorrect integer,
  pending integer,
  events_entered integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (
      where bout.winner_fighter_slug is not null
        and bout.winner_fighter_slug = pick.fighter_slug
    )::integer as correct,
    count(*) filter (
      where bout.winner_fighter_slug is not null
        and bout.winner_fighter_slug <> pick.fighter_slug
    )::integer as incorrect,
    count(*) filter (where bout.winner_fighter_slug is null)::integer as pending,
    count(distinct pick.event_id)::integer as events_entered
  from public.profile_event_picks pick
  join public.pick_events event on event.event_id = pick.event_id
  join public.pick_bouts bout
    on bout.event_id = pick.event_id
   and bout.bout_id = pick.bout_id
  where pick.profile_id = auth.uid()
    and (p_season is null or event.season = p_season);
$$;

revoke all on function public.get_my_pick_summary(integer) from public, anon;
grant execute on function public.get_my_pick_summary(integer) to authenticated;
