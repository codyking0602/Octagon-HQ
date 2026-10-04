-- Wheel of Football: AP Top 25 CFB pool.
-- Keeps the existing audited 68-school National pool unchanged while adding the
-- current AP Top 25 as a separate monitored pool. Boise State is added as the
-- current poll's only team outside the audited National scope.

alter table private.wheel_football_teams
  drop constraint if exists wheel_football_teams_conference_check;

alter table private.wheel_football_teams
  add constraint wheel_football_teams_conference_check
  check (conference in ('AFC', 'NFC', 'SEC', 'Big Ten', 'Big 12', 'ACC', 'Pac-12', 'Independent'));

alter table private.wheel_football_teams
  drop constraint if exists wheel_football_teams_division_check;

alter table private.wheel_football_teams
  add constraint wheel_football_teams_division_check
  check (
    (conference in ('AFC', 'NFC') and division in ('East', 'North', 'South', 'West'))
    or (conference in ('SEC', 'Big Ten', 'Big 12', 'ACC', 'Pac-12', 'Independent') and division is null)
  );

insert into private.wheel_football_teams (code, name, conference, division) values
  ('boise-state', 'Boise State', 'Pac-12', null)
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
  ('boise-state','QB',private.wheel_football_grade_name_key('Maddux Madsen'),'Maddux Madsen',86.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','RB',private.wheel_football_grade_name_key('Dylan Riley'),'Dylan Riley',90.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','RB',private.wheel_football_grade_name_key('Sire Gaines'),'Sire Gaines',85.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','RB',private.wheel_football_grade_name_key('Juelz Goff'),'Juelz Goff',76.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','WR',private.wheel_football_grade_name_key('Rasean Jones'),'Rasean Jones',83.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','WR',private.wheel_football_grade_name_key('Akeem Wright'),'Akeem Wright',80.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','WR',private.wheel_football_grade_name_key('Cam Bates'),'Cam Bates',79.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','WR',private.wheel_football_grade_name_key('Ben Ford'),'Ben Ford',78.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','TE',private.wheel_football_grade_name_key('Matt Wagner'),'Matt Wagner',79.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Front Seven',private.wheel_football_grade_name_key('Jayden Virgin-Morgan'),'Jayden Virgin-Morgan',88.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Front Seven',private.wheel_football_grade_name_key('Boen Phelps'),'Boen Phelps',84.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Front Seven',private.wheel_football_grade_name_key('Max Stege'),'Max Stege',82.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Front Seven',private.wheel_football_grade_name_key('David Latu'),'David Latu',81.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Front Seven',private.wheel_football_grade_name_key('Jake Ripp'),'Jake Ripp',80.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Front Seven',private.wheel_football_grade_name_key('Mikaio Edward'),'Mikaio Edward',78.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Secondary',private.wheel_football_grade_name_key('Jaden Mickey'),'Jaden Mickey',86.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Secondary',private.wheel_football_grade_name_key('Travis Anderson'),'Travis Anderson',82.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Secondary',private.wheel_football_grade_name_key('Derek Ganter Jr.'),'Derek Ganter Jr.',80.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Secondary',private.wheel_football_grade_name_key('Roman Tillmon'),'Roman Tillmon',79.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Secondary',private.wheel_football_grade_name_key('Sherrod Smith'),'Sherrod Smith',78.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Secondary',private.wheel_football_grade_name_key('Demetrius Freeney Jr.'),'Demetrius Freeney Jr.',77.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit'),
  ('boise-state','Head Coach',private.wheel_football_grade_name_key('Spencer Danielson'),'Spencer Danielson',86.0,'2026-10-03','cfb-wheel-boise-ap25-2026-10-03-v1','AP Top 25 Boise State bridge audit')
on conflict (team_code, position_group, name_key, effective_date) do update
set display_name = excluded.display_name,
    hidden_grade = excluded.hidden_grade,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;

create table if not exists private.wheel_football_ap_top25 (
  rank smallint primary key check (rank between 1 and 25),
  team_code text not null unique references private.wheel_football_teams(code) on delete restrict,
  poll_date date not null,
  source text not null,
  synced_at timestamptz not null default now()
);

alter table private.wheel_football_ap_top25 enable row level security;
revoke all on private.wheel_football_ap_top25 from public, anon, authenticated;

insert into private.wheel_football_ap_top25 (rank, team_code, poll_date, source) values
  (1,'texas','2026-09-27','Associated Press Top 25'),
  (2,'georgia','2026-09-27','Associated Press Top 25'),
  (3,'notre-dame','2026-09-27','Associated Press Top 25'),
  (4,'miami','2026-09-27','Associated Press Top 25'),
  (5,'ohio-state','2026-09-27','Associated Press Top 25'),
  (6,'indiana','2026-09-27','Associated Press Top 25'),
  (7,'alabama','2026-09-27','Associated Press Top 25'),
  (8,'florida','2026-09-27','Associated Press Top 25'),
  (9,'ole-miss','2026-09-27','Associated Press Top 25'),
  (10,'byu','2026-09-27','Associated Press Top 25'),
  (11,'lsu','2026-09-27','Associated Press Top 25'),
  (12,'texas-tech','2026-09-27','Associated Press Top 25'),
  (13,'utah','2026-09-27','Associated Press Top 25'),
  (14,'iowa','2026-09-27','Associated Press Top 25'),
  (15,'oregon','2026-09-27','Associated Press Top 25'),
  (16,'mississippi-state','2026-09-27','Associated Press Top 25'),
  (17,'tennessee','2026-09-27','Associated Press Top 25'),
  (18,'usc','2026-09-27','Associated Press Top 25'),
  (19,'oklahoma-state','2026-09-27','Associated Press Top 25'),
  (20,'houston','2026-09-27','Associated Press Top 25'),
  (21,'smu','2026-09-27','Associated Press Top 25'),
  (22,'boise-state','2026-09-27','Associated Press Top 25'),
  (23,'ucla','2026-09-27','Associated Press Top 25'),
  (24,'kentucky','2026-09-27','Associated Press Top 25'),
  (25,'missouri','2026-09-27','Associated Press Top 25')
on conflict (rank) do update
set team_code = excluded.team_code,
    poll_date = excluded.poll_date,
    source = excluded.source,
    synced_at = now();

create or replace function public.sync_wheel_football_ap_top25(
  p_rankings jsonb,
  p_poll_date date,
  p_source text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_distinct_ranks integer;
  v_min_rank integer;
  v_max_rank integer;
  v_unknown integer;
begin
  if p_rankings is null or jsonb_typeof(p_rankings) <> 'array' then
    raise exception 'AP Top 25 payload must be an array';
  end if;
  if p_poll_date is null then
    raise exception 'AP Top 25 poll date is required';
  end if;

  select count(*), count(distinct item.rank), min(item.rank), max(item.rank)
    into v_count, v_distinct_ranks, v_min_rank, v_max_rank
  from jsonb_to_recordset(p_rankings) as item(
    rank integer,
    team_code text,
    team_name text,
    espn_id text
  );

  if v_count <> 25 or v_distinct_ranks <> 25 or v_min_rank <> 1 or v_max_rank <> 25 then
    raise exception 'AP Top 25 payload must contain each rank 1 through 25 exactly once';
  end if;

  select count(*)
    into v_unknown
  from jsonb_to_recordset(p_rankings) as item(
    rank integer,
    team_code text,
    team_name text,
    espn_id text
  )
  left join private.wheel_football_teams team
    on team.code = trim(item.team_code)
  where team.code is null;

  if v_unknown <> 0 then
    raise exception 'AP Top 25 contains % unsupported Wheel team(s); keeping the last complete poll', v_unknown;
  end if;

  delete from private.wheel_football_ap_top25;

  insert into private.wheel_football_ap_top25 (
    rank,
    team_code,
    poll_date,
    source,
    synced_at
  )
  select item.rank,
         trim(item.team_code),
         p_poll_date,
         left(coalesce(nullif(trim(p_source), ''), 'Associated Press Top 25'), 240),
         now()
  from jsonb_to_recordset(p_rankings) as item(
    rank integer,
    team_code text,
    team_name text,
    espn_id text
  )
  order by item.rank;

  return 25;
end;
$$;

revoke all on function public.sync_wheel_football_ap_top25(jsonb,date,text)
from public, anon, authenticated;
grant execute on function public.sync_wheel_football_ap_top25(jsonb,date,text)
to service_role;

alter table private.wheel_football_matches
  drop constraint if exists wheel_football_matches_pool_scope_check;

alter table private.wheel_football_matches
  add constraint wheel_football_matches_pool_scope_check
  check (pool_scope in (
    'NFL', 'AFC', 'NFC', 'DIVISION',
    'CFB', 'AP_TOP_25', 'SEC', 'BIG_TEN', 'BIG_12', 'ACC'
  ));

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
          'rankingSource', case when v_scope = 'AP_TOP_25' then 'Associated Press Top 25' else null end,
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
          from private.wheel_football_ap_top25 ap
          where ap.team_code = team.code
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

revoke all on function private.create_wheel_football_challenge(uuid,text,text) from public, anon;
revoke all on function private.spin_wheel_football(text) from public, anon;
grant execute on function private.create_wheel_football_challenge(uuid,text,text) to authenticated;
grant execute on function private.spin_wheel_football(text) to authenticated;

comment on table private.wheel_football_ap_top25 is
  'Latest complete AP Top 25 snapshot used by the monitored Wheel of Football AP Top 25 pool.';
comment on function public.sync_wheel_football_ap_top25(jsonb,date,text) is
  'Service-role-only atomic AP Top 25 refresh. Rejects incomplete or unsupported polls so the last complete Wheel poll remains live.';
