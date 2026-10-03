create table if not exists private.wheel_football_teams (
  code text primary key,
  name text not null,
  conference text not null check (conference in ('AFC', 'NFC')),
  division text not null check (division in ('East', 'North', 'South', 'West'))
);

insert into private.wheel_football_teams (code, name, conference, division) values
  ('ARI', 'Arizona Cardinals', 'NFC', 'West'),
  ('ATL', 'Atlanta Falcons', 'NFC', 'South'),
  ('BAL', 'Baltimore Ravens', 'AFC', 'North'),
  ('BUF', 'Buffalo Bills', 'AFC', 'East'),
  ('CAR', 'Carolina Panthers', 'NFC', 'South'),
  ('CHI', 'Chicago Bears', 'NFC', 'North'),
  ('CIN', 'Cincinnati Bengals', 'AFC', 'North'),
  ('CLE', 'Cleveland Browns', 'AFC', 'North'),
  ('DAL', 'Dallas Cowboys', 'NFC', 'East'),
  ('DEN', 'Denver Broncos', 'AFC', 'West'),
  ('DET', 'Detroit Lions', 'NFC', 'North'),
  ('GB', 'Green Bay Packers', 'NFC', 'North'),
  ('HOU', 'Houston Texans', 'AFC', 'South'),
  ('IND', 'Indianapolis Colts', 'AFC', 'South'),
  ('JAX', 'Jacksonville Jaguars', 'AFC', 'South'),
  ('KC', 'Kansas City Chiefs', 'AFC', 'West'),
  ('LAC', 'Los Angeles Chargers', 'AFC', 'West'),
  ('LAR', 'Los Angeles Rams', 'NFC', 'West'),
  ('LV', 'Las Vegas Raiders', 'AFC', 'West'),
  ('MIA', 'Miami Dolphins', 'AFC', 'East'),
  ('MIN', 'Minnesota Vikings', 'NFC', 'North'),
  ('NE', 'New England Patriots', 'AFC', 'East'),
  ('NO', 'New Orleans Saints', 'NFC', 'South'),
  ('NYG', 'New York Giants', 'NFC', 'East'),
  ('NYJ', 'New York Jets', 'AFC', 'East'),
  ('PHI', 'Philadelphia Eagles', 'NFC', 'East'),
  ('PIT', 'Pittsburgh Steelers', 'AFC', 'North'),
  ('SEA', 'Seattle Seahawks', 'NFC', 'West'),
  ('SF', 'San Francisco 49ers', 'NFC', 'West'),
  ('TB', 'Tampa Bay Buccaneers', 'NFC', 'South'),
  ('TEN', 'Tennessee Titans', 'AFC', 'South'),
  ('WSH', 'Washington Commanders', 'NFC', 'East')
on conflict (code) do update
set name = excluded.name,
    conference = excluded.conference,
    division = excluded.division;

create table if not exists private.wheel_football_matches (
  challenge_id uuid primary key references public.play_challenges(id) on delete cascade,
  pool_scope text not null check (pool_scope in ('NFL', 'AFC', 'NFC', 'DIVISION')),
  division text,
  current_turn_profile_id uuid references public.profiles(id) on delete restrict,
  turn_count integer not null default 0 check (turn_count between 0 and 14),
  phase text not null default 'spin' check (phase in ('spin', 'pick', 'complete')),
  pending_team_code text references private.wheel_football_teams(code),
  creator_last_team_code text references private.wheel_football_teams(code),
  recipient_last_team_code text references private.wheel_football_teams(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint wheel_football_division_scope_valid check (
    (pool_scope = 'DIVISION' and division in (
      'AFC East', 'AFC North', 'AFC South', 'AFC West',
      'NFC East', 'NFC North', 'NFC South', 'NFC West'
    ))
    or (pool_scope <> 'DIVISION' and division is null)
  ),
  constraint wheel_football_phase_state_valid check (
    (phase = 'complete' and current_turn_profile_id is null and pending_team_code is null and completed_at is not null)
    or (phase = 'spin' and current_turn_profile_id is not null and pending_team_code is null and completed_at is null)
    or (phase = 'pick' and current_turn_profile_id is not null and pending_team_code is not null and completed_at is null)
  )
);

create table if not exists private.wheel_football_picks (
  id bigint generated always as identity primary key,
  challenge_id uuid not null references private.wheel_football_matches(challenge_id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  turn_number integer not null check (turn_number between 1 and 14),
  team_code text not null references private.wheel_football_teams(code),
  roster_slot text not null check (roster_slot in ('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach')),
  athlete_id text not null,
  display_name text not null,
  position_label text not null,
  position_abbreviation text not null,
  headshot_url text,
  created_at timestamptz not null default now(),
  constraint wheel_football_pick_display_name_length check (char_length(display_name) between 1 and 120),
  constraint wheel_football_pick_athlete_id_length check (char_length(athlete_id) between 1 and 120),
  constraint wheel_football_pick_headshot_length check (headshot_url is null or char_length(headshot_url) <= 1000),
  unique (challenge_id, profile_id, roster_slot),
  unique (challenge_id, profile_id, athlete_id),
  unique (challenge_id, turn_number)
);

create index if not exists wheel_football_picks_match_profile_idx
  on private.wheel_football_picks (challenge_id, profile_id, turn_number);

alter table private.wheel_football_teams enable row level security;
alter table private.wheel_football_matches enable row level security;
alter table private.wheel_football_picks enable row level security;

revoke all on private.wheel_football_teams from public, anon, authenticated;
revoke all on private.wheel_football_matches from public, anon, authenticated;
revoke all on private.wheel_football_picks from public, anon, authenticated;

create or replace function private.wheel_football_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'pool_scope', match.pool_scope,
    'division', match.division,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team', case when pending.code is null then null else jsonb_build_object(
      'code', pending.code,
      'name', pending.name,
      'conference', pending.conference,
      'division', pending.division
    ) end,
    'creator', jsonb_build_object(
      'id', challenge.creator_id,
      'display_name', creator.display_name
    ),
    'recipient', jsonb_build_object(
      'id', challenge.recipient_id,
      'display_name', recipient.display_name
    ),
    'creator_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at
  )
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  where challenge.id = p_challenge_id;
$$;

create or replace function private.get_my_wheel_football_match(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.id
    into v_challenge_id
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-football'
    and (
      (challenge.creator_id = v_user_id and challenge.creator_hidden_at is null)
      or (challenge.recipient_id = v_user_id and challenge.recipient_hidden_at is null)
    );

  if v_challenge_id is null then
    raise exception 'Wheel of Football match not found';
  end if;

  return private.wheel_football_state_json(v_challenge_id);
end;
$$;

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
  v_first_turn uuid;
  v_created_at timestamptz;
  v_summary text;
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

  if v_scope not in ('NFL', 'AFC', 'NFC', 'DIVISION') then
    raise exception 'invalid Wheel of Football pool';
  end if;

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

  v_summary := 'Current NFL · ' || case
    when v_scope = 'NFL' then 'Full NFL'
    when v_scope = 'DIVISION' then v_division
    else v_scope
  end;

  v_first_turn := case when random() < 0.5 then v_creator_id else p_recipient_id end;

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
        'football-wheel-v1',
        'Wheel of Football',
        v_summary,
        v_creator_id,
        p_recipient_id,
        '/football/wheel?match=' || v_code,
        jsonb_build_object(
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
    division,
    current_turn_profile_id
  ) values (
    v_challenge_id,
    v_scope,
    v_division,
    v_first_turn
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

create or replace function private.open_wheel_football_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_recipient_name text;
  v_was_open boolean;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-football'
    and challenge.recipient_id = v_user_id
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  for update;

  if not found then
    return false;
  end if;

  v_was_open := v_challenge.opened_at is not null;

  if not v_was_open then
    update public.play_challenges challenge
    set opened_at = now()
    where challenge.id = v_challenge.id
    returning challenge.* into v_challenge;

    select profile.display_name
      into v_recipient_name
    from public.profiles profile
    where profile.id = v_challenge.recipient_id;

    perform private.publish_notification_to_profile(
      v_challenge.creator_id,
      'wheel-football:accepted:' || v_challenge.code || ':' || v_challenge.creator_id::text,
      'play-challenges:accepted',
      'game_challenge_accepted',
      'Your challenge was accepted',
      v_recipient_name || ' accepted your Wheel of Football challenge.',
      '/football/wheel?match=' || v_challenge.code,
      'OPEN MATCH',
      v_challenge.opened_at
    );
  end if;

  return true;
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
      v_match.pool_scope = 'NFL'
      or (v_match.pool_scope in ('AFC', 'NFC') and team.conference = v_match.pool_scope)
      or (
        v_match.pool_scope = 'DIVISION'
        and team.conference || ' ' || team.division = v_match.division
      )
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

create or replace function private.pick_wheel_football(
  p_code text,
  p_athlete_id text,
  p_display_name text,
  p_position_label text,
  p_position_abbreviation text,
  p_roster_slot text,
  p_headshot_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_abbreviation text := upper(trim(coalesce(p_position_abbreviation, '')));
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_creator_roster jsonb;
  v_recipient_roster jsonb;
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

  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'pick' or v_match.pending_team_code is null then
    raise exception 'It is not your pick';
  end if;

  if v_slot not in ('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach') then
    raise exception 'invalid Superteam roster slot';
  end if;

  if not (
    (v_slot = 'QB' and v_abbreviation = 'QB')
    or (v_slot = 'RB' and v_abbreviation = 'RB')
    or (v_slot = 'WR' and v_abbreviation = 'WR')
    or (v_slot = 'Flex' and v_abbreviation in ('RB', 'WR', 'TE'))
    or (v_slot = 'Front Seven' and v_abbreviation in ('DE', 'DT', 'NT', 'DL', 'LB', 'ILB', 'OLB', 'EDGE'))
    or (v_slot = 'Secondary' and v_abbreviation in ('CB', 'S', 'FS', 'SS', 'DB'))
    or (v_slot = 'Head Coach' and v_abbreviation = 'HC')
  ) then
    raise exception 'That player is not eligible for that Superteam slot';
  end if;

  if char_length(trim(coalesce(p_athlete_id, ''))) = 0
    or char_length(trim(coalesce(p_display_name, ''))) = 0
    or char_length(trim(coalesce(p_position_label, ''))) = 0 then
    raise exception 'invalid player selection';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_user_id
      and pick.roster_slot = v_slot
  ) then
    raise exception 'That Superteam slot is already filled';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_user_id
      and pick.athlete_id = trim(p_athlete_id)
  ) then
    raise exception 'You already used that player';
  end if;

  v_next_turn_count := v_match.turn_count + 1;

  insert into private.wheel_football_picks (
    challenge_id,
    profile_id,
    turn_number,
    team_code,
    roster_slot,
    athlete_id,
    display_name,
    position_label,
    position_abbreviation,
    headshot_url
  ) values (
    v_challenge.id,
    v_user_id,
    v_next_turn_count,
    v_match.pending_team_code,
    v_slot,
    trim(p_athlete_id),
    trim(p_display_name),
    trim(p_position_label),
    v_abbreviation,
    nullif(trim(coalesce(p_headshot_url, '')), '')
  );

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  if v_next_turn_count = 14 then
    update private.wheel_football_matches match
    set turn_count = 14,
        phase = 'complete',
        current_turn_profile_id = null,
        pending_team_code = null,
        creator_last_team_code = case when v_user_id = v_challenge.creator_id then v_match.pending_team_code else match.creator_last_team_code end,
        recipient_last_team_code = case when v_user_id = v_challenge.recipient_id then v_match.pending_team_code else match.recipient_last_team_code end,
        completed_at = now(),
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_creator_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.creator_id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_recipient_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.recipient_id;

    update public.play_challenges challenge
    set creator_result = jsonb_build_object('complete', true, 'roster', v_creator_roster),
        responder_result = jsonb_build_object('complete', true, 'roster', v_recipient_roster),
        completed_at = now(),
        opened_at = coalesce(challenge.opened_at, now())
    where challenge.id = v_challenge.id;

    v_next_profile := case
      when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
      else v_challenge.creator_id
    end;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:complete:' || v_challenge.code || ':' || v_next_profile::text,
      'play-challenges:results-ready',
      'game_challenge_result_ready',
      'Wheel of Football is complete',
      v_actor_name || ' made the final pick. Both Superteams are locked.',
      '/football/wheel?match=' || v_challenge.code,
      'VIEW SUPERTEAMS',
      now()
    );
  else
    v_next_profile := case
      when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
      else v_challenge.creator_id
    end;

    update private.wheel_football_matches match
    set turn_count = v_next_turn_count,
        phase = 'spin',
        current_turn_profile_id = v_next_profile,
        pending_team_code = null,
        creator_last_team_code = case when v_user_id = v_challenge.creator_id then v_match.pending_team_code else match.creator_last_team_code end,
        recipient_last_team_code = case when v_user_id = v_challenge.recipient_id then v_match.pending_team_code else match.recipient_last_team_code end,
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:turn:' || v_challenge.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in Wheel of Football',
      v_actor_name || ' made a pick. Spin for your next team.',
      '/football/wheel?match=' || v_challenge.code,
      'TAKE YOUR TURN',
      now()
    );
  end if;

  return private.wheel_football_state_json(v_challenge.id);
end;
$$;

create or replace function public.get_my_wheel_football_match(p_code text)
returns jsonb
language sql
security invoker
set search_path = ''
stable
as $$
  select private.get_my_wheel_football_match(p_code);
$$;

create or replace function public.create_wheel_football_challenge(
  p_recipient_id uuid,
  p_pool_scope text,
  p_division text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_wheel_football_challenge(p_recipient_id, p_pool_scope, p_division);
$$;

create or replace function public.open_wheel_football_challenge(p_code text)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.open_wheel_football_challenge(p_code);
$$;

create or replace function public.spin_wheel_football(p_code text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.spin_wheel_football(p_code);
$$;

create or replace function public.pick_wheel_football(
  p_code text,
  p_athlete_id text,
  p_display_name text,
  p_position_label text,
  p_position_abbreviation text,
  p_roster_slot text,
  p_headshot_url text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.pick_wheel_football(
    p_code,
    p_athlete_id,
    p_display_name,
    p_position_label,
    p_position_abbreviation,
    p_roster_slot,
    p_headshot_url
  );
$$;

grant usage on schema private to authenticated;

revoke all on function private.wheel_football_state_json(uuid) from public, anon;
revoke all on function private.get_my_wheel_football_match(text) from public, anon;
revoke all on function private.create_wheel_football_challenge(uuid, text, text) from public, anon;
revoke all on function private.open_wheel_football_challenge(text) from public, anon;
revoke all on function private.spin_wheel_football(text) from public, anon;
revoke all on function private.pick_wheel_football(text, text, text, text, text, text, text) from public, anon;

grant execute on function private.get_my_wheel_football_match(text) to authenticated;
grant execute on function private.create_wheel_football_challenge(uuid, text, text) to authenticated;
grant execute on function private.open_wheel_football_challenge(text) to authenticated;
grant execute on function private.spin_wheel_football(text) to authenticated;
grant execute on function private.pick_wheel_football(text, text, text, text, text, text, text) to authenticated;

revoke all on function public.get_my_wheel_football_match(text) from public, anon;
revoke all on function public.create_wheel_football_challenge(uuid, text, text) from public, anon;
revoke all on function public.open_wheel_football_challenge(text) from public, anon;
revoke all on function public.spin_wheel_football(text) from public, anon;
revoke all on function public.pick_wheel_football(text, text, text, text, text, text, text) from public, anon;

grant execute on function public.get_my_wheel_football_match(text) to authenticated;
grant execute on function public.create_wheel_football_challenge(uuid, text, text) to authenticated;
grant execute on function public.open_wheel_football_challenge(text) to authenticated;
grant execute on function public.spin_wheel_football(text) to authenticated;
grant execute on function public.pick_wheel_football(text, text, text, text, text, text, text) to authenticated;

comment on function public.create_wheel_football_challenge(uuid, text, text) is
  'Creates a challenge-only current-NFL Wheel of Football matchup and randomly assigns the first turn.';
comment on function public.spin_wheel_football(text) is
  'Server-owns the active player team spin and prevents that player from receiving the same team on consecutive personal spins.';
comment on function public.pick_wheel_football(text, text, text, text, text, text, text) is
  'Locks one eligible current NFL player or head coach into one open Superteam roster slot, then advances the turn.';
