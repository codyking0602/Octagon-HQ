-- Football Weekly Auction: Tuesday-Monday communal sealed-bid game.
-- Launches with the 132 presentation-audited Best CFB Teams plus the 13 calibrated Wildcard seasons.
-- The remaining calibrated expansion grades are persisted now but held out of live boards until their card resumes are audited.

alter table private.draft_room_cfb_best_teams_pool
  drop constraint if exists draft_room_cfb_best_teams_pool_conference_bucket_check;

alter table private.draft_room_cfb_best_teams_pool
  add constraint draft_room_cfb_best_teams_pool_conference_bucket_check
  check (conference_bucket in ('SEC','Big Ten','Big 12','ACC','Notre Dame','Wildcard'));

insert into private.draft_room_cfb_best_teams_pool(
  season_reference, season_year, school, conference_bucket, display_label, hidden_grade
) values
  ('weekly-cfb-florida-2001', 2001, 'Florida', 'SEC', 'Florida · 2001', 93.5),
  ('weekly-cfb-tennessee-2001', 2001, 'Tennessee', 'SEC', 'Tennessee · 2001', 92.5),
  ('weekly-cfb-texas-2001', 2001, 'Texas', 'SEC', 'Texas · 2001', 92.0),
  ('weekly-cfb-oklahoma-2002', 2002, 'Oklahoma', 'SEC', 'Oklahoma · 2002', 92.5),
  ('weekly-cfb-georgia-2002', 2002, 'Georgia', 'SEC', 'Georgia · 2002', 93.5),
  ('weekly-cfb-oklahoma-2003', 2003, 'Oklahoma', 'SEC', 'Oklahoma · 2003', 93.5),
  ('weekly-cfb-georgia-2003', 2003, 'Georgia', 'SEC', 'Georgia · 2003', 91.5),
  ('weekly-cfb-oklahoma-2004', 2004, 'Oklahoma', 'SEC', 'Oklahoma · 2004', 94.0),
  ('weekly-cfb-lsu-2006', 2006, 'LSU', 'SEC', 'LSU · 2006', 93.0),
  ('weekly-cfb-florida-2007', 2007, 'Florida', 'SEC', 'Florida · 2007', 88.5),
  ('weekly-cfb-texas-2008', 2008, 'Texas', 'SEC', 'Texas · 2008', 95.0),
  ('weekly-cfb-florida-2009', 2009, 'Florida', 'SEC', 'Florida · 2009', 95.0),
  ('weekly-cfb-texas-2009', 2009, 'Texas', 'SEC', 'Texas · 2009', 94.5),
  ('weekly-cfb-alabama-2010', 2010, 'Alabama', 'SEC', 'Alabama · 2010', 90.5),
  ('weekly-cfb-oklahoma-2011', 2011, 'Oklahoma', 'SEC', 'Oklahoma · 2011', 89.5),
  ('weekly-cfb-georgia-2012', 2012, 'Georgia', 'SEC', 'Georgia · 2012', 92.5),
  ('weekly-cfb-florida-2012', 2012, 'Florida', 'SEC', 'Florida · 2012', 91.5),
  ('weekly-cfb-alabama-2013', 2013, 'Alabama', 'SEC', 'Alabama · 2013', 91.5),
  ('weekly-cfb-alabama-2014', 2014, 'Alabama', 'SEC', 'Alabama · 2014', 92.5),
  ('weekly-cfb-georgia-2014', 2014, 'Georgia', 'SEC', 'Georgia · 2014', 89.5),
  ('weekly-cfb-oklahoma-2015', 2015, 'Oklahoma', 'SEC', 'Oklahoma · 2015', 92.0),
  ('weekly-cfb-alabama-2017', 2017, 'Alabama', 'SEC', 'Alabama · 2017', 95.5),
  ('weekly-cfb-alabama-2018', 2018, 'Alabama', 'SEC', 'Alabama · 2018', 96.0),
  ('weekly-cfb-georgia-2018', 2018, 'Georgia', 'SEC', 'Georgia · 2018', 92.5),
  ('weekly-cfb-oklahoma-2018', 2018, 'Oklahoma', 'SEC', 'Oklahoma · 2018', 92.5),
  ('weekly-cfb-alabama-2019', 2019, 'Alabama', 'SEC', 'Alabama · 2019', 91.5),
  ('weekly-cfb-georgia-2019', 2019, 'Georgia', 'SEC', 'Georgia · 2019', 92.0),
  ('weekly-cfb-georgia-2020', 2020, 'Georgia', 'SEC', 'Georgia · 2020', 90.5),
  ('weekly-cfb-alabama-2021', 2021, 'Alabama', 'SEC', 'Alabama · 2021', 94.0),
  ('weekly-cfb-texas-2024', 2024, 'Texas', 'SEC', 'Texas · 2024', 91.5),
  ('weekly-cfb-ole-miss-2024', 2024, 'Ole Miss', 'SEC', 'Ole Miss · 2024', 89.5),
  ('weekly-cfb-nebraska-2000', 2000, 'Nebraska', 'Big Ten', 'Nebraska · 2000', 90.5),
  ('weekly-cfb-oregon-2001', 2001, 'Oregon', 'Big Ten', 'Oregon · 2001', 93.0),
  ('weekly-cfb-usc-2002', 2002, 'USC', 'Big Ten', 'USC · 2002', 93.5),
  ('weekly-cfb-ohio-state-2005', 2005, 'Ohio State', 'Big Ten', 'Ohio State · 2005', 92.0),
  ('weekly-cfb-usc-2006', 2006, 'USC', 'Big Ten', 'USC · 2006', 93.0),
  ('weekly-cfb-usc-2007', 2007, 'USC', 'Big Ten', 'USC · 2007', 92.0),
  ('weekly-cfb-oregon-2007', 2007, 'Oregon', 'Big Ten', 'Oregon · 2007', 87.5),
  ('weekly-cfb-penn-state-2008', 2008, 'Penn State', 'Big Ten', 'Penn State · 2008', 91.5),
  ('weekly-cfb-ohio-state-2008', 2008, 'Ohio State', 'Big Ten', 'Ohio State · 2008', 90.5),
  ('weekly-cfb-penn-state-2009', 2009, 'Penn State', 'Big Ten', 'Penn State · 2009', 90.5),
  ('weekly-cfb-oregon-2011', 2011, 'Oregon', 'Big Ten', 'Oregon · 2011', 92.0),
  ('weekly-cfb-oregon-2013', 2013, 'Oregon', 'Big Ten', 'Oregon · 2013', 91.0),
  ('weekly-cfb-ohio-state-2015', 2015, 'Ohio State', 'Big Ten', 'Ohio State · 2015', 93.0),
  ('weekly-cfb-ohio-state-2016', 2016, 'Ohio State', 'Big Ten', 'Ohio State · 2016', 91.5),
  ('weekly-cfb-michigan-2016', 2016, 'Michigan', 'Big Ten', 'Michigan · 2016', 89.5),
  ('weekly-cfb-ohio-state-2017', 2017, 'Ohio State', 'Big Ten', 'Ohio State · 2017', 92.0),
  ('weekly-cfb-penn-state-2017', 2017, 'Penn State', 'Big Ten', 'Penn State · 2017', 90.5),
  ('weekly-cfb-ohio-state-2018', 2018, 'Ohio State', 'Big Ten', 'Ohio State · 2018', 92.5),
  ('weekly-cfb-michigan-2018', 2018, 'Michigan', 'Big Ten', 'Michigan · 2018', 89.0),
  ('weekly-cfb-wisconsin-2019', 2019, 'Wisconsin', 'Big Ten', 'Wisconsin · 2019', 89.5),
  ('weekly-cfb-ohio-state-2021', 2021, 'Ohio State', 'Big Ten', 'Ohio State · 2021', 91.5),
  ('weekly-cfb-ohio-state-2022', 2022, 'Ohio State', 'Big Ten', 'Ohio State · 2022', 92.5),
  ('weekly-cfb-penn-state-2022', 2022, 'Penn State', 'Big Ten', 'Penn State · 2022', 90.5),
  ('weekly-cfb-ohio-state-2023', 2023, 'Ohio State', 'Big Ten', 'Ohio State · 2023', 90.5),
  ('weekly-cfb-oregon-2023', 2023, 'Oregon', 'Big Ten', 'Oregon · 2023', 92.0),
  ('weekly-cfb-oregon-2025', 2025, 'Oregon', 'Big Ten', 'Oregon · 2025', 92.0),
  ('weekly-cfb-ohio-state-2025', 2025, 'Ohio State', 'Big Ten', 'Ohio State · 2025', 92.5),
  ('weekly-cfb-tcu-2009', 2009, 'TCU', 'Big 12', 'TCU · 2009', 91.5),
  ('weekly-cfb-byu-2009', 2009, 'BYU', 'Big 12', 'BYU · 2009', 89.5),
  ('weekly-cfb-oklahoma-state-2010', 2010, 'Oklahoma State', 'Big 12', 'Oklahoma State · 2010', 89.5),
  ('weekly-cfb-baylor-2015', 2015, 'Baylor', 'Big 12', 'Baylor · 2015', 89.0),
  ('weekly-cfb-tcu-2015', 2015, 'TCU', 'Big 12', 'TCU · 2015', 91.0),
  ('weekly-cfb-west-virginia-2016', 2016, 'West Virginia', 'Big 12', 'West Virginia · 2016', 88.5),
  ('weekly-cfb-tcu-2017', 2017, 'TCU', 'Big 12', 'TCU · 2017', 90.0),
  ('weekly-cfb-ucf-2018', 2018, 'UCF', 'Big 12', 'UCF · 2018', 90.0),
  ('weekly-cfb-cincinnati-2020', 2020, 'Cincinnati', 'Big 12', 'Cincinnati · 2020', 90.5),
  ('weekly-cfb-byu-2021', 2021, 'BYU', 'Big 12', 'BYU · 2021', 88.0),
  ('weekly-cfb-kansas-2023', 2023, 'Kansas', 'Big 12', 'Kansas · 2023', 87.5),
  ('weekly-cfb-colorado-2024', 2024, 'Colorado', 'Big 12', 'Colorado · 2024', 87.0),
  ('weekly-cfb-virginia-tech-2000', 2000, 'Virginia Tech', 'ACC', 'Virginia Tech · 2000', 92.0),
  ('weekly-cfb-florida-state-2003', 2003, 'Florida State', 'ACC', 'Florida State · 2003', 89.5),
  ('weekly-cfb-virginia-tech-2006', 2006, 'Virginia Tech', 'ACC', 'Virginia Tech · 2006', 88.5),
  ('weekly-cfb-virginia-tech-2009', 2009, 'Virginia Tech', 'ACC', 'Virginia Tech · 2009', 90.5),
  ('weekly-cfb-stanford-2013', 2013, 'Stanford', 'ACC', 'Stanford · 2013', 90.0),
  ('weekly-cfb-clemson-2017', 2017, 'Clemson', 'ACC', 'Clemson · 2017', 92.0),
  ('weekly-cfb-clemson-2020', 2020, 'Clemson', 'ACC', 'Clemson · 2020', 92.0),
  ('weekly-cfb-north-carolina-2020', 2020, 'North Carolina', 'ACC', 'North Carolina · 2020', 87.5),
  ('weekly-cfb-clemson-2022', 2022, 'Clemson', 'ACC', 'Clemson · 2022', 89.5),
  ('weekly-cfb-louisville-2023', 2023, 'Louisville', 'ACC', 'Louisville · 2023', 88.0),
  ('weekly-cfb-miami-2024', 2024, 'Miami', 'ACC', 'Miami · 2024', 88.5),
  ('weekly-cfb-notre-dame-2005', 2005, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2005', 89.5),
  ('weekly-cfb-notre-dame-2006', 2006, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2006', 88.0),
  ('weekly-cfb-notre-dame-2015', 2015, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2015', 90.0),
  ('weekly-cfb-notre-dame-2021', 2021, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2021', 91.0),
  ('weekly-cfb-notre-dame-2022', 2022, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2022', 87.5),
  ('weekly-cfb-notre-dame-2023', 2023, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2023', 89.0),
  ('weekly-cfb-notre-dame-2025', 2025, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2025', 91.5),
  ('weekly-cfb-boise-state-2006', 2006, 'Boise State', 'Wildcard', 'Boise State · 2006', 90.5),
  ('weekly-cfb-hawaii-2007', 2007, 'Hawaii', 'Wildcard', 'Hawaii · 2007', 87.0),
  ('weekly-cfb-boise-state-2009', 2009, 'Boise State', 'Wildcard', 'Boise State · 2009', 91.0),
  ('weekly-cfb-boise-state-2010', 2010, 'Boise State', 'Wildcard', 'Boise State · 2010', 91.0),
  ('weekly-cfb-boise-state-2011', 2011, 'Boise State', 'Wildcard', 'Boise State · 2011', 90.5),
  ('weekly-cfb-northern-illinois-2012', 2012, 'Northern Illinois', 'Wildcard', 'Northern Illinois · 2012', 86.0),
  ('weekly-cfb-fresno-state-2013', 2013, 'Fresno State', 'Wildcard', 'Fresno State · 2013', 87.5),
  ('weekly-cfb-western-michigan-2016', 2016, 'Western Michigan', 'Wildcard', 'Western Michigan · 2016', 88.5),
  ('weekly-cfb-coastal-carolina-2020', 2020, 'Coastal Carolina', 'Wildcard', 'Coastal Carolina · 2020', 88.5),
  ('weekly-cfb-liberty-2020', 2020, 'Liberty', 'Wildcard', 'Liberty · 2020', 86.0),
  ('weekly-cfb-tulane-2022', 2022, 'Tulane', 'Wildcard', 'Tulane · 2022', 90.5),
  ('weekly-cfb-liberty-2023', 2023, 'Liberty', 'Wildcard', 'Liberty · 2023', 86.0),
  ('weekly-cfb-boise-state-2024', 2024, 'Boise State', 'Wildcard', 'Boise State · 2024', 89.5)
on conflict (season_reference) do nothing;

create table private.football_weekly_auction_weeks (
  week_start date primary key,
  rules_version text not null default 'football-weekly-auction-2026-09-v1',
  created_at timestamptz not null default now(),
  finalized_at timestamptz,
  check (extract(isodow from week_start) = 2)
);

create table private.football_weekly_auction_board (
  week_start date not null references private.football_weekly_auction_weeks(week_start) on delete cascade,
  day_index integer not null check (day_index between 1 and 7),
  theme text not null check (theme in ('SEC','Big Ten','Big 12','ACC','Wildcard')),
  hidden_shape text not null check (hidden_shape in ('Wide','Compressed','TopHeavy','MiddleHeavy','Trap','Chaotic')),
  slot integer not null check (slot between 1 and 3),
  season_reference text not null references private.draft_room_cfb_best_teams_pool(season_reference),
  lock_at timestamptz not null,
  primary key (week_start, day_index, slot),
  unique (week_start, season_reference)
);

create table private.football_weekly_auction_daily_entries (
  week_start date not null references private.football_weekly_auction_weeks(week_start) on delete cascade,
  day_index integer not null check (day_index between 1 and 7),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (week_start, day_index, profile_id)
);

create table private.football_weekly_auction_bids (
  week_start date not null,
  day_index integer not null,
  profile_id uuid not null,
  slot integer not null check (slot between 1 and 3),
  amount integer not null check (amount between 0 and 40),
  updated_at timestamptz not null default now(),
  primary key (week_start, day_index, profile_id, slot),
  foreign key (week_start, day_index, profile_id)
    references private.football_weekly_auction_daily_entries(week_start, day_index, profile_id)
    on delete cascade,
  foreign key (week_start, day_index, slot)
    references private.football_weekly_auction_board(week_start, day_index, slot)
    on delete cascade
);

create table private.football_weekly_auction_awards (
  week_start date not null,
  day_index integer not null,
  slot integer not null,
  profile_id uuid references public.profiles(id) on delete set null,
  winning_bid integer not null check (winning_bid between 0 and 40),
  resolved_at timestamptz not null default now(),
  primary key (week_start, day_index, slot),
  foreign key (week_start, day_index, slot)
    references private.football_weekly_auction_board(week_start, day_index, slot)
    on delete cascade
);

create table private.football_weekly_auction_results (
  week_start date not null references private.football_weekly_auction_weeks(week_start) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  owned_count integer not null check (owned_count >= 0),
  final_score numeric(5,2),
  scoring_cost integer,
  scoring_refs text[] not null default array[]::text[],
  tie_random double precision not null,
  final_rank integer,
  is_winner boolean not null default false,
  calculated_at timestamptz not null default now(),
  primary key (week_start, profile_id)
);

create table private.football_weekly_auction_final_views (
  week_start date not null references private.football_weekly_auction_weeks(week_start) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (week_start, profile_id)
);

create index football_weekly_auction_board_lock_idx
  on private.football_weekly_auction_board(lock_at, week_start, day_index);
create index football_weekly_auction_awards_profile_idx
  on private.football_weekly_auction_awards(profile_id, week_start, day_index);
create index football_weekly_auction_entries_profile_idx
  on private.football_weekly_auction_daily_entries(profile_id, week_start, day_index);

revoke all on private.football_weekly_auction_weeks from public, anon, authenticated;
revoke all on private.football_weekly_auction_board from public, anon, authenticated;
revoke all on private.football_weekly_auction_daily_entries from public, anon, authenticated;
revoke all on private.football_weekly_auction_bids from public, anon, authenticated;
revoke all on private.football_weekly_auction_awards from public, anon, authenticated;
revoke all on private.football_weekly_auction_results from public, anon, authenticated;
revoke all on private.football_weekly_auction_final_views from public, anon, authenticated;

create or replace function private.football_weekly_auction_week_start(p_at timestamptz default now())
returns date
language sql
stable
set search_path = ''
as $$
  with central as (
    select (p_at at time zone 'America/Chicago')::date as day
  )
  select day - ((extract(isodow from day)::integer + 5) % 7)
  from central;
$$;

create or replace function private.football_weekly_auction_day_index(
  p_at timestamptz,
  p_week_start date
)
returns integer
language sql
stable
set search_path = ''
as $$
  select ((p_at at time zone 'America/Chicago')::date - p_week_start)::integer + 1;
$$;

create or replace function private.materialize_football_weekly_auction_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_themes text[];
  v_theme text;
  v_day integer;
  v_slot integer;
  v_attempt integer;
  v_shape text;
  v_shape_roll double precision;
  v_prev_shape text;
  v_two_back_shape text;
  v_targets numeric[];
  v_target numeric;
  v_pick private.draft_room_cfb_best_teams_pool;
  v_used_refs text[];
  v_used_schools text[];
  v_elites integer;
  v_lock_at timestamptz;
begin
  if p_week_start < date '2026-09-15' then
    return;
  end if;
  if extract(isodow from p_week_start) <> 2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start)
  values (p_week_start)
  on conflict (week_start) do nothing;

  if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21 then
    return;
  end if;

  <<attempt_loop>>
  for v_attempt in 1..80 loop
    delete from private.football_weekly_auction_board where week_start = p_week_start;
    v_used_refs := array[]::text[];
    v_used_schools := array[]::text[];
    v_elites := 0;
    v_prev_shape := null;
    v_two_back_shape := null;

    select array_agg(theme order by random())
    into v_themes
    from unnest(array['SEC','SEC','Big Ten','Big Ten','Big 12','ACC','Wildcard']::text[]) as theme;

    for v_day in 1..7 loop
      v_theme := v_themes[v_day];
      v_shape_roll := random() * 100;
      v_shape := case
        when v_shape_roll < 19 then 'Wide'
        when v_shape_roll < 37 then 'Compressed'
        when v_shape_roll < 54 then 'TopHeavy'
        when v_shape_roll < 74 then 'MiddleHeavy'
        when v_shape_roll < 88 then 'Trap'
        else 'Chaotic'
      end;
      if v_shape = v_prev_shape and v_shape = v_two_back_shape then
        v_shape := case when v_shape = 'Chaotic' then 'Wide' else 'Chaotic' end;
      end if;

      v_targets := case v_shape
        when 'Wide' then array[96.0, 91.0, 87.0]::numeric[]
        when 'Compressed' then array[90.5, 91.0, 91.5]::numeric[]
        when 'TopHeavy' then array[96.0, 94.0, 89.0]::numeric[]
        when 'MiddleHeavy' then array[89.5, 91.0, 93.0]::numeric[]
        when 'Trap' then array[90.0, 93.0, 89.0]::numeric[]
        else array[(86 + random()*14)::numeric, (86 + random()*14)::numeric, (86 + random()*14)::numeric]
      end;

      for v_slot in 1..3 loop
        v_target := v_targets[v_slot];
        v_pick := null;

        select pool.*
        into v_pick
        from private.draft_room_cfb_best_teams_pool pool
        where (
            pool.season_reference like 'cfb-best-%'
            or pool.conference_bucket = 'Wildcard'
          )
          and (
            (v_theme = 'Wildcard' and pool.conference_bucket in ('Notre Dame','Wildcard'))
            or pool.conference_bucket = v_theme
          )
          and not (pool.season_reference = any(v_used_refs))
          and not (pool.school = any(v_used_schools))
          and not exists (
            select 1
            from private.football_weekly_auction_board prior
            where prior.week_start >= p_week_start - 28
              and prior.week_start < p_week_start
              and prior.season_reference = pool.season_reference
          )
        order by abs(pool.hidden_grade - v_target), random(), pool.season_reference
        limit 1;

        if v_pick.season_reference is null then
          select pool.*
          into v_pick
          from private.draft_room_cfb_best_teams_pool pool
          where (
              pool.season_reference like 'cfb-best-%'
              or pool.conference_bucket = 'Wildcard'
            )
            and (
              (v_theme = 'Wildcard' and pool.conference_bucket in ('Notre Dame','Wildcard'))
              or pool.conference_bucket = v_theme
            )
            and not (pool.season_reference = any(v_used_refs))
            and not (pool.school = any(v_used_schools))
          order by abs(pool.hidden_grade - v_target), random(), pool.season_reference
          limit 1;
        end if;

        if v_pick.season_reference is null then
          continue attempt_loop;
        end if;

        v_used_refs := array_append(v_used_refs, v_pick.season_reference);
        v_used_schools := array_append(v_used_schools, v_pick.school);
        if v_pick.hidden_grade >= 96 then
          v_elites := v_elites + 1;
        end if;

        v_lock_at := ((p_week_start + v_day)::timestamp at time zone 'America/Chicago');
        insert into private.football_weekly_auction_board(
          week_start, day_index, theme, hidden_shape, slot, season_reference, lock_at
        ) values (
          p_week_start, v_day, v_theme, v_shape, v_slot, v_pick.season_reference, v_lock_at
        );
      end loop;

      v_two_back_shape := v_prev_shape;
      v_prev_shape := v_shape;
    end loop;

    if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21
      and v_elites between 1 and 6
      and (
        select count(distinct pool.school)
        from private.football_weekly_auction_board board
        join private.draft_room_cfb_best_teams_pool pool using (season_reference)
        where board.week_start = p_week_start
      ) = 21
    then
      return;
    end if;
  end loop;

  raise exception 'Unable to materialize a valid Football Weekly Auction board';
end;
$$;

create or replace function private.resolve_football_weekly_auction_day(
  p_week_start date,
  p_day_index integer,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot integer;
  v_winner uuid;
  v_amount integer;
  v_lock_at timestamptz;
begin
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start = p_week_start and day_index = p_day_index;

  if v_lock_at is null then
    raise exception 'Weekly Auction day is not materialized';
  end if;
  if p_at < v_lock_at then
    return;
  end if;

  for v_slot in 1..3 loop
    if exists (
      select 1 from private.football_weekly_auction_awards
      where week_start = p_week_start and day_index = p_day_index and slot = v_slot
    ) then
      continue;
    end if;

    v_winner := null;
    v_amount := 0;

    select bid.profile_id, bid.amount
    into v_winner, v_amount
    from private.football_weekly_auction_bids bid
    where bid.week_start = p_week_start
      and bid.day_index = p_day_index
      and bid.slot = v_slot
      and bid.amount > 0
    order by
      bid.amount desc,
      (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start = p_week_start
          and award.profile_id = bid.profile_id
          and award.day_index < p_day_index
      ) asc,
      (
        select coalesce(sum(award.winning_bid), 0)
        from private.football_weekly_auction_awards award
        where award.week_start = p_week_start
          and award.profile_id = bid.profile_id
          and award.day_index < p_day_index
      ) asc,
      random()
    limit 1;

    insert into private.football_weekly_auction_awards(
      week_start, day_index, slot, profile_id, winning_bid, resolved_at
    ) values (
      p_week_start, p_day_index, v_slot, v_winner, coalesce(v_amount, 0), p_at
    );
  end loop;
end;
$$;

create or replace function private.finalize_football_weekly_auction_week(
  p_week_start date,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from private.football_weekly_auction_weeks
    where week_start = p_week_start and finalized_at is not null
  ) then
    return;
  end if;
  if (select count(*) from private.football_weekly_auction_awards where week_start = p_week_start) <> 21 then
    return;
  end if;

  delete from private.football_weekly_auction_results where week_start = p_week_start;

  insert into private.football_weekly_auction_results(
    week_start, profile_id, owned_count, final_score, scoring_cost, scoring_refs, tie_random
  )
  with participants as (
    select distinct profile_id
    from private.football_weekly_auction_daily_entries
    where week_start = p_week_start
  ),
  owned as (
    select
      award.profile_id,
      board.season_reference,
      pool.hidden_grade,
      award.winning_bid,
      row_number() over (
        partition by award.profile_id
        order by pool.hidden_grade desc, award.winning_bid asc, board.season_reference
      ) as scoring_order
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start = award.week_start
     and board.day_index = award.day_index
     and board.slot = award.slot
    join private.draft_room_cfb_best_teams_pool pool
      on pool.season_reference = board.season_reference
    where award.week_start = p_week_start
      and award.profile_id is not null
  ),
  summarized as (
    select
      participant.profile_id,
      count(owned.season_reference)::integer as owned_count,
      case when count(owned.season_reference) >= 3
        then round(avg(owned.hidden_grade) filter (where owned.scoring_order <= 3), 2)
        else null end as final_score,
      case when count(owned.season_reference) >= 3
        then sum(owned.winning_bid) filter (where owned.scoring_order <= 3)::integer
        else null end as scoring_cost,
      coalesce(
        array_agg(owned.season_reference order by owned.scoring_order)
          filter (where owned.scoring_order <= 3),
        array[]::text[]
      ) as scoring_refs
    from participants participant
    left join owned on owned.profile_id = participant.profile_id
    group by participant.profile_id
  )
  select
    p_week_start,
    profile_id,
    owned_count,
    final_score,
    scoring_cost,
    scoring_refs,
    random()
  from summarized;

  with ranked as (
    select
      profile_id,
      row_number() over (
        order by
          (final_score is not null) desc,
          final_score desc nulls last,
          scoring_cost asc nulls last,
          tie_random,
          profile_id
      )::integer as final_rank
    from private.football_weekly_auction_results
    where week_start = p_week_start
  )
  update private.football_weekly_auction_results result
  set final_rank = ranked.final_rank,
      is_winner = ranked.final_rank = 1
  from ranked
  where result.week_start = p_week_start
    and result.profile_id = ranked.profile_id;

  update private.football_weekly_auction_weeks
  set finalized_at = p_at
  where week_start = p_week_start;
end;
$$;

create or replace function private.maintain_football_weekly_auction(p_at timestamptz default now())
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date;
  v_due record;
  v_week record;
begin
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    return;
  end if;

  v_week_start := private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);

  for v_due in
    select board.week_start, board.day_index
    from private.football_weekly_auction_board board
    group by board.week_start, board.day_index
    having min(board.lock_at) <= p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start = board.week_start
           and award.day_index = board.day_index
       ) < 3
    order by board.week_start, board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(v_due.week_start, v_due.day_index, p_at);
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start = week.week_start
      ) = 21
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start, p_at);
  end loop;
end;
$$;

create or replace function private.football_weekly_auction_final_payload(
  p_week_start date,
  p_profile_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with standings as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'rank', result.final_rank,
      'profile_id', result.profile_id,
      'display_name', profile.display_name,
      'final_score', result.final_score,
      'scoring_cost', result.scoring_cost,
      'owned_count', result.owned_count,
      'is_winner', result.is_winner,
      'is_current_user', result.profile_id = p_profile_id
    ) order by result.final_rank, profile.display_name), '[]'::jsonb) as payload
    from private.football_weekly_auction_results result
    join public.profiles profile on profile.id = result.profile_id
    where result.week_start = p_week_start
  ),
  my_owned as (
    select
      board.season_reference,
      pool.school,
      pool.season_year,
      pool.display_label,
      pool.hidden_grade,
      award.winning_bid,
      result.scoring_refs
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start = award.week_start
     and board.day_index = award.day_index
     and board.slot = award.slot
    join private.draft_room_cfb_best_teams_pool pool using (season_reference)
    join private.football_weekly_auction_results result
      on result.week_start = award.week_start
     and result.profile_id = award.profile_id
    where award.week_start = p_week_start
      and award.profile_id = p_profile_id
  ),
  collection as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'season_reference', season_reference,
      'school', school,
      'season_year', season_year,
      'display_label', display_label,
      'grade', hidden_grade,
      'winning_bid', winning_bid,
      'counts', season_reference = any(scoring_refs)
    ) order by hidden_grade desc, winning_bid asc, season_reference), '[]'::jsonb) as payload
    from my_owned
  ),
  all_teams as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index', board.day_index,
      'slot', board.slot,
      'theme', board.theme,
      'season_reference', board.season_reference,
      'school', pool.school,
      'season_year', pool.season_year,
      'display_label', pool.display_label,
      'grade', pool.hidden_grade,
      'winning_bid', award.winning_bid,
      'winner_profile_id', award.profile_id,
      'winner_display_name', profile.display_name
    ) order by board.day_index, board.slot), '[]'::jsonb) as payload
    from private.football_weekly_auction_board board
    join private.draft_room_cfb_best_teams_pool pool using (season_reference)
    left join private.football_weekly_auction_awards award
      on award.week_start = board.week_start
     and award.day_index = board.day_index
     and award.slot = board.slot
    left join public.profiles profile on profile.id = award.profile_id
    where board.week_start = p_week_start
  ),
  mine as (
    select to_jsonb(result) as payload
    from private.football_weekly_auction_results result
    where result.week_start = p_week_start and result.profile_id = p_profile_id
  )
  select jsonb_build_object(
    'week_start', p_week_start,
    'standings', standings.payload,
    'collection', collection.payload,
    'all_teams', all_teams.payload,
    'my_result', coalesce(mine.payload, '{}'::jsonb)
  )
  from standings, collection, all_teams
  left join mine on true;
$$;

create or replace function public.run_football_weekly_auction_maintenance(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.maintain_football_weekly_auction(p_at);
  return jsonb_build_object(
    'week_start', private.football_weekly_auction_week_start(p_at),
    'status', 'ok'
  );
end;
$$;

revoke all on function public.run_football_weekly_auction_maintenance(timestamptz)
  from public, anon, authenticated;
grant execute on function public.run_football_weekly_auction_maintenance(timestamptz)
  to service_role;

create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date;
  v_day_index integer;
  v_required boolean;
begin
  if p_profile_id is null then
    raise exception 'profile required';
  end if;
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    return jsonb_build_object('required', false, 'available', false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);

  select not exists (
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start
      and entry.day_index = v_day_index
      and entry.profile_id = p_profile_id
  ) into v_required;

  return jsonb_build_object(
    'required', v_required,
    'available', true,
    'week_start', v_week_start,
    'day_index', v_day_index
  );
end;
$$;

revoke all on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  from public, anon, authenticated;
grant execute on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  to service_role;

create or replace function public.get_my_football_weekly_auction(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_week_start date;
  v_day_index integer;
  v_previous_week date;
  v_bankroll integer;
  v_owned integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_previous_final jsonb := null;
  v_teams jsonb;
  v_bids jsonb;
  v_prior_results jsonb := '[]'::jsonb;
  v_collection jsonb;
  v_theme text;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    return jsonb_build_object(
      'available', false,
      'starts_on', date '2026-09-15'
    );
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);
  v_previous_week := v_week_start - 7;

  if exists (
    select 1
    from private.football_weekly_auction_results result
    where result.week_start = v_previous_week and result.profile_id = v_profile
  ) and not exists (
    select 1
    from private.football_weekly_auction_final_views view
    where view.week_start = v_previous_week and view.profile_id = v_profile
  ) then
    v_previous_final := private.football_weekly_auction_final_payload(v_previous_week, v_profile);
  end if;

  select 40 - coalesce(sum(award.winning_bid),0)::integer,
         count(*)::integer
  into v_bankroll, v_owned
  from private.football_weekly_auction_awards award
  where award.week_start = v_week_start
    and award.profile_id = v_profile;


  select exists (
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start and entry.day_index = v_day_index and entry.profile_id = v_profile
  ) into v_submitted;

  select not exists (
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start and entry.profile_id = v_profile
  ) into v_show_intro;

  select min(board.theme),
         coalesce(jsonb_agg(jsonb_build_object(
           'slot', board.slot,
           'season_reference', board.season_reference,
           'school', pool.school,
           'season_year', pool.season_year,
           'display_label', pool.display_label,
           'lock_at', board.lock_at
         ) order by board.slot), '[]'::jsonb)
  into v_theme, v_teams
  from private.football_weekly_auction_board board
  join private.draft_room_cfb_best_teams_pool pool using (season_reference)
  where board.week_start = v_week_start and board.day_index = v_day_index;

  select coalesce(jsonb_object_agg(bid.slot::text, bid.amount), '{}'::jsonb)
  into v_bids
  from private.football_weekly_auction_bids bid
  where bid.week_start = v_week_start
    and bid.day_index = v_day_index
    and bid.profile_id = v_profile;

  if v_day_index > 1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot), '[]'::jsonb)
    into v_prior_results
    from (
      select
        board.slot,
        jsonb_build_object(
          'slot', board.slot,
          'season_reference', board.season_reference,
          'school', pool.school,
          'season_year', pool.season_year,
          'display_label', pool.display_label,
          'winning_bid', award.winning_bid,
          'winner_profile_id', award.profile_id,
          'winner_display_name', winner.display_name,
          'bids', coalesce((
            select jsonb_agg(jsonb_build_object(
              'profile_id', entry.profile_id,
              'display_name', bidder.display_name,
              'amount', coalesce(bid.amount,0)
            ) order by coalesce(bid.amount,0) desc, bidder.display_name)
            from private.football_weekly_auction_daily_entries entry
            join public.profiles bidder on bidder.id = entry.profile_id
            left join private.football_weekly_auction_bids bid
              on bid.week_start = entry.week_start
             and bid.day_index = entry.day_index
             and bid.profile_id = entry.profile_id
             and bid.slot = board.slot
            where entry.week_start = v_week_start
              and entry.day_index = v_day_index - 1
          ), '[]'::jsonb)
        ) as payload
      from private.football_weekly_auction_board board
      join private.draft_room_cfb_best_teams_pool pool using (season_reference)
      join private.football_weekly_auction_awards award
        on award.week_start = board.week_start
       and award.day_index = board.day_index
       and award.slot = board.slot
      left join public.profiles winner on winner.id = award.profile_id
      where board.week_start = v_week_start
        and board.day_index = v_day_index - 1
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'season_reference', board.season_reference,
    'school', pool.school,
    'season_year', pool.season_year,
    'display_label', pool.display_label,
    'winning_bid', award.winning_bid
  ) order by award.day_index, award.slot), '[]'::jsonb)
  into v_collection
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start = award.week_start
   and board.day_index = award.day_index
   and board.slot = award.slot
  join private.draft_room_cfb_best_teams_pool pool using (season_reference)
  where award.week_start = v_week_start
    and award.profile_id = v_profile;

  return jsonb_build_object(
    'available', true,
    'week_start', v_week_start,
    'week_end', v_week_start + 6,
    'day_index', v_day_index,
    'theme', v_theme,
    'bankroll', v_bankroll,
    'owned_count', v_owned,
    'reserve_floor', 0,
    'max_commit', v_bankroll,
    'submitted_today', v_submitted,
    'show_intro', v_show_intro,
    'teams', v_teams,
    'bids', v_bids,
    'prior_results', v_prior_results,
    'collection', v_collection,
    'previous_final', v_previous_final
  );
end;
$$;

revoke all on function public.get_my_football_weekly_auction(timestamptz)
  from public, anon;
grant execute on function public.get_my_football_weekly_auction(timestamptz)
  to authenticated;

create or replace function public.submit_my_football_weekly_auction_bids(
  p_bids jsonb,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_week_start date;
  v_day_index integer;
  v_lock_at timestamptz;
  v_owned integer;
  v_bankroll integer;
  v_max integer;
  v_bid1 integer;
  v_bid2 integer;
  v_bid3 integer;
  v_total integer;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    raise exception 'Football Weekly Auction has not started';
  end if;
  if jsonb_typeof(p_bids) <> 'object' then
    raise exception 'bids must be an object';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);

  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start = v_week_start and day_index = v_day_index;

  if v_lock_at is null or p_at >= v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  begin
    v_bid1 := coalesce((p_bids ->> '1')::integer, 0);
    v_bid2 := coalesce((p_bids ->> '2')::integer, 0);
    v_bid3 := coalesce((p_bids ->> '3')::integer, 0);
  exception when others then
    raise exception 'Weekly Auction bids must be whole-dollar integers';
  end;

  if least(v_bid1,v_bid2,v_bid3) < 0 or greatest(v_bid1,v_bid2,v_bid3) > 40 then
    raise exception 'Weekly Auction bids must be between $0 and $40';
  end if;

  select 40 - coalesce(sum(award.winning_bid),0)::integer,
         count(*)::integer
  into v_bankroll, v_owned
  from private.football_weekly_auction_awards award
  where award.week_start = v_week_start
    and award.profile_id = v_profile;

  v_max := v_bankroll;
  v_total := v_bid1 + v_bid2 + v_bid3;

  if v_total > v_max then
    raise exception 'Today''s bids exceed the available Weekly Auction commitment of $%', v_max;
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start, day_index, profile_id, submitted_at, updated_at
  ) values (
    v_week_start, v_day_index, v_profile, p_at, p_at
  )
  on conflict (week_start, day_index, profile_id)
  do update set updated_at = excluded.updated_at;

  insert into private.football_weekly_auction_bids(
    week_start, day_index, profile_id, slot, amount, updated_at
  ) values
    (v_week_start, v_day_index, v_profile, 1, v_bid1, p_at),
    (v_week_start, v_day_index, v_profile, 2, v_bid2, p_at),
    (v_week_start, v_day_index, v_profile, 3, v_bid3, p_at)
  on conflict (week_start, day_index, profile_id, slot)
  do update set amount = excluded.amount, updated_at = excluded.updated_at;

  return public.get_my_football_weekly_auction(p_at);
end;
$$;

revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  from public, anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  to authenticated;

create or replace function public.acknowledge_my_football_weekly_auction_final(
  p_week_start date,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if not exists (
    select 1 from private.football_weekly_auction_results result
    where result.week_start = p_week_start and result.profile_id = v_profile
  ) then
    raise exception 'Weekly Auction final result is unavailable';
  end if;

  insert into private.football_weekly_auction_final_views(week_start, profile_id, seen_at)
  values (p_week_start, v_profile, p_at)
  on conflict (week_start, profile_id)
  do update set seen_at = excluded.seen_at;

  return public.get_my_football_weekly_auction(p_at);
end;
$$;

revoke all on function public.acknowledge_my_football_weekly_auction_final(date,timestamptz)
  from public, anon;
grant execute on function public.acknowledge_my_football_weekly_auction_final(date,timestamptz)
  to authenticated;

-- Move Football Daily weekly standings to the same Tuesday-Monday cadence.
-- Preserve UFC and add the Weekly Auction champion as one bonus Football Daily win.
do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_old_week_decl constant text :=
    'v_week_start date := v_today - (extract(isodow from v_today)::integer - 1);';
  v_new_week_decl constant text :=
    'v_week_start date := v_today - case when p_sport = ''football'' then ((extract(isodow from v_today)::integer + 5) % 7) else (extract(isodow from v_today)::integer - 1) end;';
  v_old_history_week constant text :=
    'source.central_day - (extract(isodow from source.central_day)::integer - 1) as week_start';
  v_new_history_week constant text :=
    'source.central_day - case when p_sport = ''football'' then ((extract(isodow from source.central_day)::integer + 5) % 7) else (extract(isodow from source.central_day)::integer - 1) end as week_start';
  v_old_weekly_wins constant text := $old$
      count(*) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
$old$;
  v_new_weekly_wins constant text := $new$
      (
        count(*) filter (
          where history.normalized_score = daily_winners.winning_score
        )
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          where auction_result.profile_id = history.profile_id
            and auction_result.week_start = history.week_start
            and auction_result.is_winner
        ) else 0 end
      )::integer as wins,
$new$;
  v_old_member_wins constant text := $old$
      count(history.central_day) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
$old$;
  v_new_member_wins constant text := $new$
      (
        count(history.central_day) filter (
          where history.normalized_score = daily_winners.winning_score
        )
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          where auction_result.profile_id = profile.id
            and auction_result.is_winner
        ) else 0 end
      )::integer as wins,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('((extract(isodow from v_today)::integer + 5) % 7)' in v_definition) = 0 then
    if position(v_old_week_decl in v_definition) = 0
      or position(v_old_history_week in v_definition) = 0 then
      raise exception 'canonical Daily standings week calculation changed unexpectedly';
    end if;
    v_definition := replace(v_definition, v_old_week_decl, v_new_week_decl);
    v_definition := replace(v_definition, v_old_history_week, v_new_history_week);
  end if;

  if position('football_weekly_auction_results auction_result' in v_definition) = 0 then
    if position(v_old_weekly_wins in v_definition) = 0
      or position(v_old_member_wins in v_definition) = 0 then
      raise exception 'canonical Daily standings wins projection changed unexpectedly';
    end if;
    v_definition := replace(v_definition, v_old_weekly_wins, v_new_weekly_wins);
    v_definition := replace(v_definition, v_old_member_wins, v_new_member_wins);
  end if;

  v_definition := replace(
    v_definition,
    'v_football_championship_start date := date ''2026-09-07'';',
    'v_football_championship_start date := date ''2026-09-08'';'
  );

  execute v_definition;
end
$standings$;

-- Contract assertions.
do $weekly_auction_contract$
begin
  if (select count(*) from private.draft_room_cfb_best_teams_pool) <> 233 then
    raise exception 'Weekly Auction calibrated pool must contain 233 team-seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Wildcard') <> 13 then
    raise exception 'Weekly Auction Wildcard inventory must contain 13 calibrated seasons';
  end if;
  if private.football_weekly_auction_week_start('2026-09-15 12:00:00-05'::timestamptz) <> date '2026-09-15'
    or private.football_weekly_auction_week_start('2026-09-21 23:59:00-05'::timestamptz) <> date '2026-09-15' then
    raise exception 'Weekly Auction Tuesday-Monday cadence drifted';
  end if;
end
$weekly_auction_contract$;
