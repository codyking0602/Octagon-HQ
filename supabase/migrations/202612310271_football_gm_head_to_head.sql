-- The GM head-to-head runtime.
-- Two GMs alternate draft picks, then the worse Year 1 finisher owns the first
-- full offseason. The second GM receives the remaining shared player market.

create table if not exists private.football_gm_matches (
  challenge_id uuid primary key references public.play_challenges(id) on delete cascade,
  seed text not null,
  phase text not null default 'waiting'
    check (phase in ('waiting', 'draft', 'year1', 'offseason', 'complete')),
  current_turn_profile_id uuid references public.profiles(id) on delete set null,
  pending_team_code text,
  offseason_first_profile_id uuid references public.profiles(id) on delete set null,
  turn_count integer not null default 0 check (turn_count between 0 and 14),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists private.football_gm_participants (
  challenge_id uuid not null references private.football_gm_matches(challenge_id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  seat_order smallint not null check (seat_order in (0, 1)),
  accepted_at timestamptz,
  run_state jsonb not null default '{}'::jsonb,
  year1_result jsonb,
  offseason_completed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (challenge_id, profile_id),
  unique (challenge_id, seat_order)
);

create index if not exists football_gm_participants_profile_idx
  on private.football_gm_participants (profile_id, challenge_id);

alter table private.football_gm_matches enable row level security;
alter table private.football_gm_participants enable row level security;
revoke all on private.football_gm_matches from public, anon, authenticated;
revoke all on private.football_gm_participants from public, anon, authenticated;

create or replace function private.football_gm_primary_challenge_id(
  p_code text,
  p_user_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select challenge.id
  from public.play_challenges challenge
  join private.football_gm_participants participant
    on participant.challenge_id = challenge.id
   and participant.profile_id = p_user_id
  where challenge.game_id = 'gm-football'
    and challenge.code = upper(trim(p_code))
  limit 1;
$$;

create or replace function private.football_gm_roster_count(p_run_state jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(p_run_state -> 'roster') = 'array'
      then jsonb_array_length(p_run_state -> 'roster')
    else 0
  end;
$$;

create or replace function private.football_gm_final_roster_count(p_run_state jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(p_run_state -> 'finalRoster') = 'array'
      then jsonb_array_length(p_run_state -> 'finalRoster')
    else 0
  end;
$$;

create or replace function private.football_gm_held_player_ids(p_run_state jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  with active_roster as (
    select case
      when private.football_gm_final_roster_count(p_run_state) > 0
        then p_run_state -> 'finalRoster'
      else coalesce(p_run_state -> 'roster', '[]'::jsonb)
    end as roster
  ),
  roster_ids as (
    select nullif(trim(entry ->> 'playerId'), '') as player_id
    from active_roster, jsonb_array_elements(active_roster.roster) entry
  ),
  chip_ids as (
    select nullif(trim(value), '') as player_id
    from jsonb_array_elements_text(
      case
        when jsonb_typeof(p_run_state -> 'tradeChipPlayerIds') = 'array'
          then p_run_state -> 'tradeChipPlayerIds'
        else '[]'::jsonb
      end
    ) value
  )
  select coalesce(array_agg(distinct player_id) filter (where player_id is not null), '{}'::text[])
  from (
    select player_id from roster_ids
    union all
    select player_id from chip_ids
  ) ids;
$$;

create or replace function private.football_gm_finish_rank(p_result jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case coalesce(p_result ->> 'finish', '')
    when 'Missed Playoffs' then 0
    when 'Wild Card' then 1
    when 'Divisional' then 2
    when 'Conference Championship' then 3
    when 'Super Bowl Loss' then 4
    when 'Champion' then 5
    else 99
  end;
$$;

create or replace function private.football_gm_state_json(p_challenge_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'seed', match.seed,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team_code', match.pending_team_code,
    'offseason_first_profile_id', match.offseason_first_profile_id,
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', participant.profile_id,
          'display_name', profile.display_name,
          'seat_order', participant.seat_order,
          'accepted', participant.accepted_at is not null,
          'run_state', participant.run_state,
          'year1_result', participant.year1_result,
          'offseason_complete', participant.offseason_completed_at is not null
        )
        order by participant.seat_order
      )
      from private.football_gm_participants participant
      join public.profiles profile on profile.id = participant.profile_id
      where participant.challenge_id = challenge.id
    ), '[]'::jsonb),
    'opened_at', match.started_at,
    'completed_at', match.completed_at,
    'declined_at', challenge.declined_at
  )
  from public.play_challenges challenge
  join private.football_gm_matches match on match.challenge_id = challenge.id
  where challenge.id = p_challenge_id;
$$;

create or replace function private.create_football_gm_challenge(p_recipient_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_creator_name text;
  v_code text;
  v_attempt integer := 0;
  v_challenge_id uuid;
  v_created_at timestamptz;
  v_seed text := replace(extensions.gen_random_uuid()::text, '-', '');
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;
  if p_recipient_id is null
    or p_recipient_id = v_creator_id
    or not exists (select 1 from public.profiles profile where profile.id = p_recipient_id) then
    raise exception 'choose a valid opponent';
  end if;

  select profile.display_name into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

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
        'gm-football',
        'football-gm-v8-head-to-head',
        'The GM',
        'NFL · 1v1 · 3 years · $150M cap',
        v_creator_id,
        p_recipient_id,
        '/football/gm-mode?match=' || v_code,
        jsonb_build_object(
          'version', 'football-gm-v8-head-to-head',
          'seed', v_seed,
          'cap', 150000000,
          'rosterSlots', jsonb_build_array('QB','RB','WR','FLEX','DL','LB','DB')
        ),
        jsonb_build_object('status', 'in-progress')
      )
      returning id, created_at into v_challenge_id, v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  insert into private.football_gm_matches (challenge_id, seed)
  values (v_challenge_id, v_seed);

  insert into private.football_gm_participants (
    challenge_id, profile_id, seat_order, accepted_at
  ) values
    (v_challenge_id, v_creator_id, 0, v_created_at),
    (v_challenge_id, p_recipient_id, 1, null);

  perform private.publish_notification_to_profile(
    p_recipient_id,
    'gm-football:received:' || v_code || ':' || p_recipient_id::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    coalesce(v_creator_name, 'Another GM') || ' challenged you to The GM.',
    '/football/gm-mode?match=' || v_code,
    'PLAY',
    v_created_at
  );

  return v_code;
end;
$$;

create or replace function private.get_my_football_gm_match(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'The GM match not found';
  end if;
  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.open_football_gm_challenge(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_now timestamptz := now();
  v_first uuid;
  v_unaccepted integer;
  v_first_name text;
  v_row record;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  update private.football_gm_participants participant
  set accepted_at = coalesce(participant.accepted_at, v_now)
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, v_now)
  where challenge.id = v_challenge_id
    and challenge.recipient_id = v_user_id
    and challenge.declined_at is null;

  select count(*)::integer into v_unaccepted
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.accepted_at is null;

  if v_unaccepted = 0 and exists (
    select 1 from private.football_gm_matches match
    where match.challenge_id = v_challenge_id and match.phase = 'waiting'
    for update
  ) then
    select participant.profile_id into v_first
    from private.football_gm_participants participant
    where participant.challenge_id = v_challenge_id
    order by random()
    limit 1;

    update private.football_gm_matches match
    set phase = 'draft',
        current_turn_profile_id = v_first,
        started_at = coalesce(match.started_at, v_now),
        updated_at = v_now
    where match.challenge_id = v_challenge_id
      and match.phase = 'waiting';

    select profile.display_name into v_first_name
    from public.profiles profile where profile.id = v_first;

    for v_row in
      select participant.profile_id
      from private.football_gm_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      perform private.publish_notification_to_profile(
        v_row.profile_id,
        'gm-football:start:' || v_challenge_id::text || ':' || v_row.profile_id::text,
        'play-challenges:accepted',
        'game_challenge_accepted',
        case when v_row.profile_id = v_first then 'Your turn in The GM' else 'The GM is ready' end,
        case when v_row.profile_id = v_first
          then 'The draft is live. You have the first spin.'
          else coalesce(v_first_name, 'Your opponent') || ' has the first spin.'
        end,
        '/football/gm-mode?match=' || (
          select challenge.code from public.play_challenges challenge where challenge.id = v_challenge_id
        ),
        case when v_row.profile_id = v_first then 'TAKE YOUR TURN' else 'OPEN MATCH' end,
        v_now
      );
    end loop;
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.spin_football_gm(
  p_code text,
  p_eligible_team_codes text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.football_gm_matches%rowtype;
  v_previous text;
  v_team text;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase <> 'draft'
    or v_match.current_turn_profile_id <> v_user_id
    or v_match.pending_team_code is not null then
    raise exception 'It is not your spin';
  end if;
  if coalesce(cardinality(p_eligible_team_codes), 0) = 0 then
    raise exception 'No eligible team is available';
  end if;

  select nullif(participant.run_state ->> 'previousTeam', '') into v_previous
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select eligible.team into v_team
  from unnest(p_eligible_team_codes) eligible(team)
  order by
    case when eligible.team = v_previous and cardinality(p_eligible_team_codes) > 1 then 1 else 0 end,
    random()
  limit 1;

  update private.football_gm_matches match
  set pending_team_code = v_team,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.pick_football_gm(
  p_code text,
  p_player_id text,
  p_slot text,
  p_run_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.football_gm_matches%rowtype;
  v_old_count integer;
  v_new_count integer;
  v_other_id uuid;
  v_other_count integer;
  v_actor_name text;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase <> 'draft'
    or v_match.current_turn_profile_id <> v_user_id
    or v_match.pending_team_code is null then
    raise exception 'It is not your pick';
  end if;
  if p_slot not in ('QB','RB','WR','FLEX','DL','LB','DB') then
    raise exception 'invalid GM roster slot';
  end if;

  select private.football_gm_roster_count(participant.run_state)
    into v_old_count
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id
  for update;

  v_new_count := private.football_gm_roster_count(p_run_state);
  if v_new_count <> v_old_count + 1 or v_new_count > 7 then
    raise exception 'invalid GM draft state';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(p_run_state -> 'roster') entry
    where entry ->> 'playerId' = p_player_id
      and entry ->> 'slot' = p_slot
  ) then
    raise exception 'draft state does not contain that pick';
  end if;

  if exists (
    select 1
    from private.football_gm_participants participant,
         unnest(private.football_gm_held_player_ids(participant.run_state)) held(player_id)
    where participant.challenge_id = v_challenge_id
      and participant.profile_id <> v_user_id
      and held.player_id = p_player_id
  ) then
    raise exception 'That player was already drafted in this match';
  end if;

  update private.football_gm_participants participant
  set run_state = p_run_state
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select participant.profile_id,
         private.football_gm_roster_count(participant.run_state)
    into v_other_id, v_other_count
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id <> v_user_id
  limit 1;

  update private.football_gm_matches match
  set turn_count = match.turn_count + 1,
      pending_team_code = null,
      phase = case when v_new_count = 7 and v_other_count = 7 then 'year1' else 'draft' end,
      current_turn_profile_id = case when v_new_count = 7 and v_other_count = 7 then null else v_other_id end,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  if not (v_new_count = 7 and v_other_count = 7) then
    select profile.display_name into v_actor_name from public.profiles profile where profile.id = v_user_id;
    perform private.publish_notification_to_profile(
      v_other_id,
      'gm-football:turn:' || v_challenge_id::text || ':' || (v_match.turn_count + 1)::text || ':' || v_other_id::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in The GM',
      coalesce(v_actor_name, 'Your opponent') || ' made a pick. Spin for your next team.',
      '/football/gm-mode?match=' || p_code,
      'TAKE YOUR TURN',
      now()
    );
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.submit_football_gm_year1(
  p_code text,
  p_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_ready integer;
  v_first uuid;
  v_first_name text;
  v_row record;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  perform 1 from private.football_gm_matches match
  where match.challenge_id = v_challenge_id and match.phase in ('year1','offseason')
  for update;
  if not found then raise exception 'Year 1 is not ready'; end if;

  update private.football_gm_participants participant
  set year1_result = coalesce(participant.year1_result, p_result)
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select count(*)::integer into v_ready
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.year1_result is not null;

  if v_ready = 2 and exists (
    select 1 from private.football_gm_matches match
    where match.challenge_id = v_challenge_id and match.phase = 'year1'
  ) then
    select participant.profile_id into v_first
    from private.football_gm_participants participant
    where participant.challenge_id = v_challenge_id
    order by
      private.football_gm_finish_rank(participant.year1_result) asc,
      md5((
        select match.seed from private.football_gm_matches match where match.challenge_id = v_challenge_id
      ) || ':' || participant.profile_id::text) asc
    limit 1;

    update private.football_gm_matches match
    set phase = 'offseason',
        current_turn_profile_id = v_first,
        offseason_first_profile_id = v_first,
        updated_at = now()
    where match.challenge_id = v_challenge_id
      and match.phase = 'year1';

    select profile.display_name into v_first_name from public.profiles profile where profile.id = v_first;

    for v_row in
      select participant.profile_id
      from private.football_gm_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      perform private.publish_notification_to_profile(
        v_row.profile_id,
        'gm-football:offseason:' || v_challenge_id::text || ':' || v_row.profile_id::text,
        'play-challenges:received',
        'game_challenge_received',
        case when v_row.profile_id = v_first then 'Your offseason starts now' else 'The offseason is underway' end,
        case when v_row.profile_id = v_first
          then 'The lower Year 1 finisher gets first access to the shared market.'
          else coalesce(v_first_name, 'Your opponent') || ' has first offseason priority.'
        end,
        '/football/gm-mode?match=' || p_code,
        case when v_row.profile_id = v_first then 'OPEN FRONT OFFICE' else 'OPEN MATCH' end,
        now()
      );
    end loop;
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.save_football_gm_offseason(
  p_code text,
  p_run_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.football_gm_matches%rowtype;
  v_overlap text;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase <> 'offseason' or v_match.current_turn_profile_id <> v_user_id then
    raise exception 'It is not your offseason';
  end if;

  select mine.player_id into v_overlap
  from unnest(private.football_gm_held_player_ids(p_run_state)) mine(player_id)
  join private.football_gm_participants opponent
    on opponent.challenge_id = v_challenge_id
   and opponent.profile_id <> v_user_id
  join unnest(private.football_gm_held_player_ids(opponent.run_state)) theirs(player_id)
    on theirs.player_id = mine.player_id
  limit 1;

  if v_overlap is not null then
    raise exception 'That player is already held by the other GM';
  end if;

  update private.football_gm_participants participant
  set run_state = p_run_state
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.finish_football_gm_offseason(
  p_code text,
  p_run_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.football_gm_matches%rowtype;
  v_other_id uuid;
  v_other_done boolean;
  v_overlap text;
  v_now timestamptz := now();
  v_actor_name text;
  v_code text;
  v_row record;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase <> 'offseason' or v_match.current_turn_profile_id <> v_user_id then
    raise exception 'It is not your offseason';
  end if;
  if private.football_gm_final_roster_count(p_run_state) <> 7 then
    raise exception 'Finish the seven-player core first';
  end if;
  if jsonb_typeof(p_run_state -> 'tradeChipPlayerIds') = 'array'
    and jsonb_array_length(p_run_state -> 'tradeChipPlayerIds') > 0 then
    raise exception 'Resolve displaced assets first';
  end if;

  select mine.player_id into v_overlap
  from unnest(private.football_gm_held_player_ids(p_run_state)) mine(player_id)
  join private.football_gm_participants opponent
    on opponent.challenge_id = v_challenge_id
   and opponent.profile_id <> v_user_id
  join unnest(private.football_gm_held_player_ids(opponent.run_state)) theirs(player_id)
    on theirs.player_id = mine.player_id
  limit 1;
  if v_overlap is not null then
    raise exception 'That player is already held by the other GM';
  end if;

  update private.football_gm_participants participant
  set run_state = p_run_state,
      offseason_completed_at = coalesce(participant.offseason_completed_at, v_now)
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select participant.profile_id,
         participant.offseason_completed_at is not null
    into v_other_id, v_other_done
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id <> v_user_id
  limit 1;

  select challenge.code into v_code
  from public.play_challenges challenge where challenge.id = v_challenge_id;

  if v_other_done then
    update private.football_gm_matches match
    set phase = 'complete',
        current_turn_profile_id = null,
        pending_team_code = null,
        completed_at = v_now,
        updated_at = v_now
    where match.challenge_id = v_challenge_id;

    update public.play_challenges challenge
    set completed_at = v_now,
        creator_result = jsonb_build_object('status', 'complete'),
        responder_result = jsonb_build_object('status', 'complete')
    where challenge.id = v_challenge_id;

    for v_row in
      select participant.profile_id
      from private.football_gm_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      perform private.publish_notification_to_profile(
        v_row.profile_id,
        'gm-football:complete:' || v_challenge_id::text || ':' || v_row.profile_id::text,
        'play-challenges:completed',
        'game_challenge_completed',
        'The GM is complete',
        'Both front offices are locked. See the three-year result.',
        '/football/gm-mode?match=' || v_code,
        'SEE RESULT',
        v_now
      );
    end loop;
  else
    update private.football_gm_matches match
    set current_turn_profile_id = v_other_id,
        updated_at = v_now
    where match.challenge_id = v_challenge_id;

    select profile.display_name into v_actor_name
    from public.profiles profile where profile.id = v_user_id;

    perform private.publish_notification_to_profile(
      v_other_id,
      'gm-football:offseason-turn:' || v_challenge_id::text || ':' || v_other_id::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your offseason starts now',
      coalesce(v_actor_name, 'Your opponent') || ' finished the offseason. The remaining market is yours.',
      '/football/gm-mode?match=' || v_code,
      'OPEN FRONT OFFICE',
      v_now
    );
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function public.create_football_gm_challenge(p_recipient_id uuid)
returns text language sql security invoker set search_path = ''
as $$ select private.create_football_gm_challenge(p_recipient_id); $$;

create or replace function public.get_my_football_gm_match(p_code text)
returns jsonb language sql security invoker set search_path = '' stable
as $$ select private.get_my_football_gm_match(p_code); $$;

create or replace function public.open_football_gm_challenge(p_code text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.open_football_gm_challenge(p_code); $$;

create or replace function public.spin_football_gm(p_code text, p_eligible_team_codes text[])
returns jsonb language sql security invoker set search_path = ''
as $$ select private.spin_football_gm(p_code, p_eligible_team_codes); $$;

create or replace function public.pick_football_gm(
  p_code text, p_player_id text, p_slot text, p_run_state jsonb
)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.pick_football_gm(p_code, p_player_id, p_slot, p_run_state); $$;

create or replace function public.submit_football_gm_year1(p_code text, p_result jsonb)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.submit_football_gm_year1(p_code, p_result); $$;

create or replace function public.save_football_gm_offseason(p_code text, p_run_state jsonb)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.save_football_gm_offseason(p_code, p_run_state); $$;

create or replace function public.finish_football_gm_offseason(p_code text, p_run_state jsonb)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.finish_football_gm_offseason(p_code, p_run_state); $$;

grant usage on schema private to authenticated;

revoke all on function private.football_gm_primary_challenge_id(text, uuid) from public, anon;
revoke all on function private.football_gm_state_json(uuid) from public, anon;
revoke all on function private.create_football_gm_challenge(uuid) from public, anon;
revoke all on function private.get_my_football_gm_match(text) from public, anon;
revoke all on function private.open_football_gm_challenge(text) from public, anon;
revoke all on function private.spin_football_gm(text, text[]) from public, anon;
revoke all on function private.pick_football_gm(text, text, text, jsonb) from public, anon;
revoke all on function private.submit_football_gm_year1(text, jsonb) from public, anon;
revoke all on function private.save_football_gm_offseason(text, jsonb) from public, anon;
revoke all on function private.finish_football_gm_offseason(text, jsonb) from public, anon;

grant execute on function private.create_football_gm_challenge(uuid) to authenticated;
grant execute on function private.get_my_football_gm_match(text) to authenticated;
grant execute on function private.open_football_gm_challenge(text) to authenticated;
grant execute on function private.spin_football_gm(text, text[]) to authenticated;
grant execute on function private.pick_football_gm(text, text, text, jsonb) to authenticated;
grant execute on function private.submit_football_gm_year1(text, jsonb) to authenticated;
grant execute on function private.save_football_gm_offseason(text, jsonb) to authenticated;
grant execute on function private.finish_football_gm_offseason(text, jsonb) to authenticated;

revoke all on function public.create_football_gm_challenge(uuid) from public, anon;
revoke all on function public.get_my_football_gm_match(text) from public, anon;
revoke all on function public.open_football_gm_challenge(text) from public, anon;
revoke all on function public.spin_football_gm(text, text[]) from public, anon;
revoke all on function public.pick_football_gm(text, text, text, jsonb) from public, anon;
revoke all on function public.submit_football_gm_year1(text, jsonb) from public, anon;
revoke all on function public.save_football_gm_offseason(text, jsonb) from public, anon;
revoke all on function public.finish_football_gm_offseason(text, jsonb) from public, anon;

grant execute on function public.create_football_gm_challenge(uuid) to authenticated;
grant execute on function public.get_my_football_gm_match(text) to authenticated;
grant execute on function public.open_football_gm_challenge(text) to authenticated;
grant execute on function public.spin_football_gm(text, text[]) to authenticated;
grant execute on function public.pick_football_gm(text, text, text, jsonb) to authenticated;
grant execute on function public.submit_football_gm_year1(text, jsonb) to authenticated;
grant execute on function public.save_football_gm_offseason(text, jsonb) to authenticated;
grant execute on function public.finish_football_gm_offseason(text, jsonb) to authenticated;
