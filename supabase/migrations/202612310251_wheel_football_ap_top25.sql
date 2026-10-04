-- Wheel of Football AP Top 25 mode + Boise State bridge.
-- The active AP pool is private server authority. Scheduled sync only replaces it
-- after all 25 schools resolve to supported, fully graded Wheel teams.

alter table private.wheel_football_teams
  drop constraint if exists wheel_football_teams_conference_check;

alter table private.wheel_football_teams
  add constraint wheel_football_teams_conference_check
  check (conference in ('AFC', 'NFC', 'SEC', 'Big Ten', 'Big 12', 'ACC', 'Independent', 'Pac-12'));

alter table private.wheel_football_teams
  drop constraint if exists wheel_football_teams_division_check;

alter table private.wheel_football_teams
  add constraint wheel_football_teams_division_check
  check (
    (conference in ('AFC', 'NFC') and division in ('East', 'North', 'South', 'West'))
    or (conference in ('SEC', 'Big Ten', 'Big 12', 'ACC', 'Independent', 'Pac-12') and division is null)
  );

insert into private.wheel_football_teams (code, name, conference, division)
values ('boise-state', 'Boise State', 'Pac-12', null)
on conflict (code) do update
set name = excluded.name,
    conference = excluded.conference,
    division = excluded.division;

insert into private.wheel_football_grade_authority (
  team_code,
  position_group,
  name_key,
  display_name,
  hidden_grade,
  effective_date,
  grade_version,
  source_artifact
) values
  ('boise-state', 'QB', private.wheel_football_grade_name_key('Maddux Madsen'), 'Maddux Madsen', 85.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'QB', private.wheel_football_grade_name_key('Max Cutforth'), 'Max Cutforth', 74.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Dylan Riley'), 'Dylan Riley', 92.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Sire Gaines'), 'Sire Gaines', 83.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Juelz Goff'), 'Juelz Goff', 77.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Rasean Jones'), 'Rasean Jones', 87.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Akeem Wright'), 'Akeem Wright', 83.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Cam Bates'), 'Cam Bates', 80.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Ben Ford'), 'Ben Ford', 76.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'TE', private.wheel_football_grade_name_key('Matt Wagner'), 'Matt Wagner', 85.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'TE', private.wheel_football_grade_name_key('Troy Grizzle'), 'Troy Grizzle', 76.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Jayden Virgin-Morgan'), 'Jayden Virgin-Morgan', 90.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Boen Phelps'), 'Boen Phelps', 87.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Max Stege'), 'Max Stege', 84.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('David Latu'), 'David Latu', 83.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Jake Ripp'), 'Jake Ripp', 84.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Mikaio Edward'), 'Mikaio Edward', 81.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('JeRico Washington Jr.'), 'JeRico Washington Jr.', 84.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Jaden Mickey'), 'Jaden Mickey', 89.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Derek Ganter Jr.'), 'Derek Ganter Jr.', 84.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Travis Anderson'), 'Travis Anderson', 82.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Sherrod Smith'), 'Sherrod Smith', 81.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Roman Tillmon'), 'Roman Tillmon', 80.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit'),
  ('boise-state', 'Head Coach', private.wheel_football_grade_name_key('Spencer Danielson'), 'Spencer Danielson', 90.0, '2026-10-03', 'cfb-wheel-ap-bridge-2026-10-03-v1', 'Ourlads 2026 Boise State depth chart + current 2026 production audit')
on conflict (team_code, position_group, name_key, effective_date) do update
set display_name = excluded.display_name,
    hidden_grade = excluded.hidden_grade,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;

alter table private.wheel_football_matches
  drop constraint if exists wheel_football_matches_pool_scope_check;

alter table private.wheel_football_matches
  add constraint wheel_football_matches_pool_scope_check
  check (pool_scope in (
    'NFL', 'AFC', 'NFC', 'DIVISION',
    'CFB', 'AP_TOP_25', 'SEC', 'BIG_TEN', 'BIG_12', 'ACC'
  ));

create table if not exists private.wheel_football_ap_top25 (
  rank integer primary key check (rank between 1 and 25),
  team_code text not null unique references private.wheel_football_teams(code) on delete restrict,
  poll_date date not null,
  updated_at timestamptz not null default now()
);

alter table private.wheel_football_ap_top25 enable row level security;
revoke all on private.wheel_football_ap_top25 from public, anon, authenticated;

insert into private.wheel_football_ap_top25 (rank, team_code, poll_date) values
  (1, 'texas', '2026-09-27'),
  (2, 'georgia', '2026-09-27'),
  (3, 'notre-dame', '2026-09-27'),
  (4, 'miami', '2026-09-27'),
  (5, 'ohio-state', '2026-09-27'),
  (6, 'indiana', '2026-09-27'),
  (7, 'alabama', '2026-09-27'),
  (8, 'florida', '2026-09-27'),
  (9, 'ole-miss', '2026-09-27'),
  (10, 'byu', '2026-09-27'),
  (11, 'lsu', '2026-09-27'),
  (12, 'texas-tech', '2026-09-27'),
  (13, 'utah', '2026-09-27'),
  (14, 'iowa', '2026-09-27'),
  (15, 'oregon', '2026-09-27'),
  (16, 'mississippi-state', '2026-09-27'),
  (17, 'tennessee', '2026-09-27'),
  (18, 'usc', '2026-09-27'),
  (19, 'oklahoma-state', '2026-09-27'),
  (20, 'houston', '2026-09-27'),
  (21, 'smu', '2026-09-27'),
  (22, 'boise-state', '2026-09-27'),
  (23, 'ucla', '2026-09-27'),
  (24, 'kentucky', '2026-09-27'),
  (25, 'missouri', '2026-09-27')
on conflict (rank) do update
set team_code = excluded.team_code,
    poll_date = excluded.poll_date,
    updated_at = now();

create or replace function public.get_wheel_football_ap_top25()
returns table(
  rank integer,
  team_code text,
  team_name text,
  poll_date date
)
language sql
stable
security definer
set search_path = ''
as $$
  select ranked.rank, ranked.team_code, team.name, ranked.poll_date
  from private.wheel_football_ap_top25 ranked
  join private.wheel_football_teams team on team.code = ranked.team_code
  order by ranked.rank;
$$;

revoke all on function public.get_wheel_football_ap_top25() from public;
grant execute on function public.get_wheel_football_ap_top25() to anon, authenticated;

create or replace function public.sync_wheel_football_ap_top25(
  p_poll_date date,
  p_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_distinct_ranks integer;
  v_distinct_teams integer;
  v_min_rank integer;
  v_max_rank integer;
  v_current_poll_date date;
  v_unsupported text[];
  v_incomplete text[];
begin
  if p_poll_date is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'AP Top 25 sync requires a poll date and rows array';
  end if;

  select
    count(*),
    count(distinct row.rank),
    count(distinct row.team_code),
    min(row.rank),
    max(row.rank)
  into
    v_count,
    v_distinct_ranks,
    v_distinct_teams,
    v_min_rank,
    v_max_rank
  from jsonb_to_recordset(p_rows) as row(rank integer, team_code text);

  if v_count <> 25
    or v_distinct_ranks <> 25
    or v_distinct_teams <> 25
    or v_min_rank <> 1
    or v_max_rank <> 25 then
    return jsonb_build_object(
      'updated', false,
      'status', 'invalid-poll',
      'row_count', v_count
    );
  end if;

  select array_agg(row.team_code order by row.rank)
    into v_unsupported
  from jsonb_to_recordset(p_rows) as row(rank integer, team_code text)
  left join private.wheel_football_teams team on team.code = row.team_code
  where team.code is null
    or team.conference in ('AFC', 'NFC');

  if coalesce(cardinality(v_unsupported), 0) > 0 then
    return jsonb_build_object(
      'updated', false,
      'status', 'unsupported-team',
      'teams', to_jsonb(v_unsupported)
    );
  end if;

  select array_agg(row.team_code order by row.rank)
    into v_incomplete
  from jsonb_to_recordset(p_rows) as row(rank integer, team_code text)
  where (
    select count(distinct grade.position_group)
    from private.wheel_football_grade_authority grade
    where grade.team_code = row.team_code
      and grade.effective_date <= current_date
  ) < 7;

  if coalesce(cardinality(v_incomplete), 0) > 0 then
    return jsonb_build_object(
      'updated', false,
      'status', 'incomplete-grading',
      'teams', to_jsonb(v_incomplete)
    );
  end if;

  select max(ranked.poll_date)
    into v_current_poll_date
  from private.wheel_football_ap_top25 ranked;

  if v_current_poll_date is not null and p_poll_date < v_current_poll_date then
    return jsonb_build_object(
      'updated', false,
      'status', 'stale-poll',
      'active_poll_date', v_current_poll_date
    );
  end if;

  delete from private.wheel_football_ap_top25;

  insert into private.wheel_football_ap_top25 (rank, team_code, poll_date)
  select row.rank, row.team_code, p_poll_date
  from jsonb_to_recordset(p_rows) as row(rank integer, team_code text)
  order by row.rank;

  return jsonb_build_object(
    'updated', true,
    'status', 'ok',
    'poll_date', p_poll_date,
    'team_count', 25
  );
end;
$$;

revoke all on function public.sync_wheel_football_ap_top25(date,jsonb) from public, anon, authenticated;
grant execute on function public.sync_wheel_football_ap_top25(date,jsonb) to service_role;

create or replace function private.create_wheel_football_challenge(
  p_recipient_id uuid,
  p_pool_scope text,
  p_division text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_creator_name text;
  v_scope text := upper(trim(coalesce(p_pool_scope, '')));
  v_division text;
  v_code text;
  v_attempt integer := 0;
  v_challenge_id uuid;
  v_created_at timestamptz;
  v_summary text;
  v_is_cfb boolean;
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;

  if not exists (select 1 from public.profiles where id = p_recipient_id) then
    raise exception 'profile not found';
  end if;

  if v_scope not in (
    'NFL', 'AFC', 'NFC', 'DIVISION',
    'CFB', 'AP_TOP_25', 'SEC', 'BIG_TEN', 'BIG_12', 'ACC'
  ) then
    raise exception 'invalid Wheel of Football pool';
  end if;

  v_is_cfb := v_scope in ('CFB', 'AP_TOP_25', 'SEC', 'BIG_TEN', 'BIG_12', 'ACC');

  if v_scope = 'DIVISION' then
    v_division := case upper(trim(coalesce(p_division, '')))
      when 'AFC EAST' then 'AFC East'
      when 'AFC NORTH' then 'AFC North'
      when 'AFC SOUTH' then 'AFC South'
      when 'AFC WEST' then 'AFC West'
      when 'NFC EAST' then 'NFC East'
      when 'NFC NORTH' then 'NFC North'
      when 'NFC SOUTH' then 'NFC South'
      when 'NFC WEST' then 'NFC West'
      else null
    end;
    if v_division is null then
      raise exception 'choose an NFL division';
    end if;
  else
    v_division := null;
  end if;

  select profile.display_name
    into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

  v_summary := case
    when v_is_cfb then 'Current CFB · ' || case v_scope
      when 'CFB' then 'National'
      when 'AP_TOP_25' then 'AP Top 25'
      when 'BIG_TEN' then 'Big Ten'
      when 'BIG_12' then 'Big 12'
      else v_scope
    end
    else 'Current NFL · ' || case
      when v_scope = 'NFL' then 'Full NFL'
      when v_scope = 'DIVISION' then v_division
      else v_scope
    end
  end;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code,
        game_id,
        game_version,
        game_title,
        summary,
        creator_id,
        recipient_id,
        play_url,
        setup,
        creator_result
      ) values (
        v_code,
        'wheel-football',
        'football-wheel-v3',
        'Wheel of Football',
        v_summary,
        v_creator_id,
        p_recipient_id,
        '/football/wheel?match=' || v_code,
        jsonb_build_object(
          'league', case when v_is_cfb then 'CFB' else 'NFL' end,
          'poolScope', v_scope,
          'division', v_division,
          'currentOnly', true,
          'rosterSlots', jsonb_build_array('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach')
        ),
        jsonb_build_object('status', 'in-progress')
      )
      returning id, created_at into v_challenge_id, v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  insert into private.wheel_football_matches (
    challenge_id,
    pool_scope,
    division
  ) values (
    v_challenge_id,
    v_scope,
    v_division
  );

  perform private.publish_notification_to_profile(
    p_recipient_id,
    'wheel-football:received:' || v_code || ':' || p_recipient_id::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    v_creator_name || ' challenged you to Wheel of Football.',
    '/football/wheel?match=' || v_code,
    'PLAY',
    v_created_at
  );

  return v_code;
end;
$$;

create or replace function private.spin_wheel_football(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_last_team text;
  v_team_code text;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-football'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);

  if not found then
    raise exception 'Wheel of Football match not found';
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge.id
  for update;

  if v_challenge.declined_at is not null or v_challenge.completed_at is not null then
    raise exception 'This Wheel of Football match is closed';
  end if;

  if v_challenge.opened_at is null then
    raise exception 'The challenge must be accepted before the first spin';
  end if;

  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'spin' then
    raise exception 'It is not your spin';
  end if;

  v_last_team := case
    when v_user_id = v_challenge.creator_id then v_match.creator_last_team_code
    else v_match.recipient_last_team_code
  end;

  select team.code
    into v_team_code
  from private.wheel_football_teams team
  where (
      (v_match.pool_scope = 'NFL' and team.conference in ('AFC', 'NFC'))
      or (v_match.pool_scope in ('AFC', 'NFC') and team.conference = v_match.pool_scope)
      or (
        v_match.pool_scope = 'DIVISION'
        and team.conference || ' ' || team.division = v_match.division
      )
      or (
        v_match.pool_scope = 'CFB'
        and team.conference in ('SEC', 'Big Ten', 'Big 12', 'ACC', 'Independent')
      )
      or (
        v_match.pool_scope = 'AP_TOP_25'
        and exists (
          select 1
          from private.wheel_football_ap_top25 ranked
          where ranked.team_code = team.code
        )
      )
      or (v_match.pool_scope = 'SEC' and team.conference = 'SEC')
      or (v_match.pool_scope = 'BIG_TEN' and team.conference = 'Big Ten')
      or (v_match.pool_scope = 'BIG_12' and team.conference = 'Big 12')
      or (v_match.pool_scope = 'ACC' and team.conference = 'ACC')
    )
    and (v_last_team is null or team.code <> v_last_team)
  order by random()
  limit 1;

  if v_team_code is null then
    raise exception 'No team is available for this wheel';
  end if;

  update private.wheel_football_matches match
  set phase = 'pick',
      pending_team_code = v_team_code,
      updated_at = now()
  where match.challenge_id = v_challenge.id;

  return private.wheel_football_state_json(v_challenge.id);
end;
$$;

comment on table private.wheel_football_ap_top25 is
  'Authoritative current AP Top 25 Wheel pool. Replaced only after a complete supported poll passes grading validation.';
comment on function public.get_wheel_football_ap_top25() is
  'Returns the currently active AP Top 25 Wheel pool and poll date without exposing private grades.';
comment on function public.sync_wheel_football_ap_top25(date,jsonb) is
  'Service-role AP poll sync. Fails closed and preserves the prior pool when a poll is invalid, unsupported, stale, or incompletely graded.';
