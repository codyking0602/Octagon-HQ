-- Wheel of Football multiplayer: 2-4 participants in one canonical room.
-- Existing 1v1 rooms are backfilled into the participant model without changing
-- their picks, grades, or turn ownership.

alter table private.wheel_football_matches
  drop constraint if exists wheel_football_matches_turn_count_check;

alter table private.wheel_football_matches
  add constraint wheel_football_matches_turn_count_check
  check (turn_count between 0 and 28);

alter table private.wheel_football_picks
  drop constraint if exists wheel_football_picks_turn_number_check;

alter table private.wheel_football_picks
  add constraint wheel_football_picks_turn_number_check
  check (turn_number between 1 and 28);

alter table private.wheel_football_matches
  add column if not exists started_at timestamptz,
  add column if not exists resolved_by_forfeit boolean not null default false;

create table if not exists private.wheel_football_participants (
  challenge_id uuid not null references private.wheel_football_matches(challenge_id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  invite_challenge_id uuid not null references public.play_challenges(id) on delete cascade,
  seat_order smallint not null check (seat_order between 0 and 3),
  accepted_at timestamptz,
  forfeited_at timestamptz,
  last_team_code text references private.wheel_football_teams(code),
  grade_total numeric,
  final_grade numeric,
  final_rank smallint check (final_rank is null or final_rank between 1 and 4),
  created_at timestamptz not null default now(),
  primary key (challenge_id, profile_id),
  unique (challenge_id, seat_order)
);

create index if not exists wheel_football_participants_profile_idx
  on private.wheel_football_participants (profile_id, challenge_id);

create index if not exists wheel_football_participants_invite_idx
  on private.wheel_football_participants (invite_challenge_id, profile_id);

alter table private.wheel_football_participants enable row level security;
revoke all on private.wheel_football_participants from public, anon, authenticated;

-- Adopt every existing Wheel room as a two-player room. The creator is already
-- accepted; the recipient is accepted only if the legacy room had been opened.
insert into private.wheel_football_participants (
  challenge_id,
  profile_id,
  invite_challenge_id,
  seat_order,
  accepted_at,
  forfeited_at,
  last_team_code
)
select
  challenge.id,
  challenge.creator_id,
  challenge.id,
  0,
  challenge.created_at,
  case when match.forfeited_by_profile_id = challenge.creator_id then match.forfeited_at else null end,
  match.creator_last_team_code
from public.play_challenges challenge
join private.wheel_football_matches match on match.challenge_id = challenge.id
where challenge.game_id = 'wheel-football'
on conflict (challenge_id, profile_id) do update
set invite_challenge_id = excluded.invite_challenge_id,
    seat_order = excluded.seat_order,
    accepted_at = coalesce(private.wheel_football_participants.accepted_at, excluded.accepted_at),
    forfeited_at = coalesce(private.wheel_football_participants.forfeited_at, excluded.forfeited_at),
    last_team_code = coalesce(private.wheel_football_participants.last_team_code, excluded.last_team_code);

insert into private.wheel_football_participants (
  challenge_id,
  profile_id,
  invite_challenge_id,
  seat_order,
  accepted_at,
  forfeited_at,
  last_team_code
)
select
  challenge.id,
  challenge.recipient_id,
  challenge.id,
  1,
  challenge.opened_at,
  case when match.forfeited_by_profile_id = challenge.recipient_id then match.forfeited_at else null end,
  match.recipient_last_team_code
from public.play_challenges challenge
join private.wheel_football_matches match on match.challenge_id = challenge.id
where challenge.game_id = 'wheel-football'
on conflict (challenge_id, profile_id) do update
set invite_challenge_id = excluded.invite_challenge_id,
    seat_order = excluded.seat_order,
    accepted_at = coalesce(private.wheel_football_participants.accepted_at, excluded.accepted_at),
    forfeited_at = coalesce(private.wheel_football_participants.forfeited_at, excluded.forfeited_at),
    last_team_code = coalesce(private.wheel_football_participants.last_team_code, excluded.last_team_code);

update private.wheel_football_matches match
set started_at = coalesce(match.started_at, challenge.opened_at),
    resolved_by_forfeit = match.resolved_by_forfeit or match.forfeited_at is not null
from public.play_challenges challenge
where challenge.id = match.challenge_id
  and challenge.game_id = 'wheel-football';

-- Preserve final grades/ranks for every already-completed 1v1 room. The
-- multiplayer state becomes canonical immediately, so legacy results must be
-- copied into participant rows before the state projection changes.
update private.wheel_football_participants participant
set grade_total = case
      when match.forfeited_at is null
        then private.wheel_football_grade_total(participant.challenge_id, participant.profile_id)
      else null
    end,
    final_grade = case
      when match.forfeited_at is not null then null
      when participant.profile_id = challenge.creator_id
        and coalesce(challenge.creator_result ? 'finalGrade', false)
        then (challenge.creator_result ->> 'finalGrade')::numeric
      when participant.profile_id = challenge.recipient_id
        and coalesce(challenge.responder_result ? 'finalGrade', false)
        then (challenge.responder_result ->> 'finalGrade')::numeric
      else null
    end
from private.wheel_football_matches match
join public.play_challenges challenge on challenge.id = match.challenge_id
where participant.challenge_id = match.challenge_id
  and match.phase = 'complete'
  and match.completed_at is not null;

with ranked as (
  select
    participant.challenge_id,
    participant.profile_id,
    dense_rank() over (
      partition by participant.challenge_id
      order by participant.grade_total desc
    )::smallint as final_rank
  from private.wheel_football_participants participant
  join private.wheel_football_matches match on match.challenge_id = participant.challenge_id
  where match.phase = 'complete'
    and match.forfeited_at is null
    and participant.grade_total is not null
)
update private.wheel_football_participants participant
set final_rank = ranked.final_rank
from ranked
where participant.challenge_id = ranked.challenge_id
  and participant.profile_id = ranked.profile_id;

update private.wheel_football_participants participant
set final_rank = 1
from private.wheel_football_matches match
where participant.challenge_id = match.challenge_id
  and match.phase = 'complete'
  and match.forfeited_at is not null
  and participant.forfeited_at is null;

create or replace function private.wheel_football_primary_challenge_id(
  p_code text,
  p_user_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select participant.challenge_id
  from private.wheel_football_participants participant
  join public.play_challenges room on room.id = participant.challenge_id
  join public.play_challenges invite on invite.id = participant.invite_challenge_id
  where participant.profile_id = p_user_id
    and (
      room.code = upper(trim(p_code))
      or invite.code = upper(trim(p_code))
    )
  order by case when room.code = upper(trim(p_code)) then 0 else 1 end
  limit 1;
$$;

create or replace function private.wheel_football_max_turns(p_challenge_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*)::integer
     from private.wheel_football_picks pick
     where pick.challenge_id = p_challenge_id)
    +
    coalesce((
      select sum(greatest(
        0,
        7 - (
          select count(*)::integer
          from private.wheel_football_picks pick
          where pick.challenge_id = participant.challenge_id
            and pick.profile_id = participant.profile_id
        )
      ))::integer
      from private.wheel_football_participants participant
      where participant.challenge_id = p_challenge_id
        and participant.forfeited_at is null
    ), 0);
$$;

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
    'max_turns', private.wheel_football_max_turns(challenge.id),
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team', case when pending.code is null then null else jsonb_build_object(
      'code', pending.code,
      'name', pending.name,
      'conference', pending.conference,
      'division', pending.division
    ) end,
    'eligible_team_codes', case
      when match.current_turn_profile_id is null then '[]'::jsonb
      else to_jsonb(private.wheel_football_eligible_team_codes(
        challenge.id,
        match.current_turn_profile_id,
        match.pool_scope,
        match.division
      ))
    end,
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', participant.profile_id,
          'display_name', profile.display_name,
          'seat_order', participant.seat_order,
          'accepted', participant.accepted_at is not null,
          'forfeited_at', participant.forfeited_at,
          'roster', coalesce((
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
            where pick.challenge_id = participant.challenge_id
              and pick.profile_id = participant.profile_id
          ), '[]'::jsonb),
          'final_grade', case when match.phase = 'complete' then participant.final_grade else null end,
          'rank', case when match.phase = 'complete' then participant.final_rank else null end
        )
        order by participant.seat_order
      )
      from private.wheel_football_participants participant
      join public.profiles profile on profile.id = participant.profile_id
      where participant.challenge_id = challenge.id
    ), '[]'::jsonb),
    -- Keep the original two identities in state for result/share compatibility.
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
    'result', case
      when match.phase = 'complete' and challenge.declined_at is null then jsonb_build_object(
        'standings', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'profile_id', participant.profile_id,
              'final_grade', participant.final_grade,
              'rank', participant.final_rank,
              'forfeited', participant.forfeited_at is not null
            )
            order by participant.final_rank nulls last,
                     (participant.forfeited_at is not null),
                     participant.seat_order
          )
          from private.wheel_football_participants participant
          where participant.challenge_id = challenge.id
        ), '[]'::jsonb),
        'winner_profile_ids', to_jsonb(coalesce((
          select array_agg(participant.profile_id order by participant.seat_order)
          from private.wheel_football_participants participant
          where participant.challenge_id = challenge.id
            and participant.final_rank = 1
        ), '{}'::uuid[])),
        'is_tie', (
          select count(*) > 1
          from private.wheel_football_participants participant
          where participant.challenge_id = challenge.id
            and participant.final_rank = 1
        ),
        'resolved_by_forfeit', match.resolved_by_forfeit,
        'creator_final_grade', (
          select participant.final_grade
          from private.wheel_football_participants participant
          where participant.challenge_id = challenge.id
            and participant.profile_id = challenge.creator_id
        ),
        'recipient_final_grade', (
          select participant.final_grade
          from private.wheel_football_participants participant
          where participant.challenge_id = challenge.id
            and participant.profile_id = challenge.recipient_id
        ),
        'winner_profile_id', case
          when (
            select count(*)
            from private.wheel_football_participants participant
            where participant.challenge_id = challenge.id
              and participant.final_rank = 1
          ) = 1 then (
            select participant.profile_id
            from private.wheel_football_participants participant
            where participant.challenge_id = challenge.id
              and participant.final_rank = 1
            limit 1
          )
          else null
        end
      )
      else null
    end,
    'opened_at', match.started_at,
    'completed_at', match.completed_at,
    'declined_at', challenge.declined_at
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

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'Wheel of Football match not found';
  end if;

  return private.wheel_football_state_json(v_challenge_id);
end;
$$;

create or replace function private.create_wheel_football_challenge(
  p_recipient_ids uuid[],
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
  v_is_cfb boolean;
  v_recipient_count integer;
  v_distinct_count integer;
  v_index integer;
  v_recipient_id uuid;
  v_code text;
  v_invite_code text;
  v_attempt integer;
  v_challenge_id uuid;
  v_invite_id uuid;
  v_created_at timestamptz;
  v_summary text;
  v_setup jsonb;
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;

  v_recipient_count := coalesce(cardinality(p_recipient_ids), 0);
  if v_recipient_count < 1 or v_recipient_count > 3 then
    raise exception 'choose between one and three opponents';
  end if;

  select count(distinct recipient_id)::integer
    into v_distinct_count
  from unnest(p_recipient_ids) as recipient(recipient_id);

  if v_distinct_count <> v_recipient_count
    or v_creator_id = any(p_recipient_ids)
    or exists (
      select 1
      from unnest(p_recipient_ids) as recipient(recipient_id)
      where recipient_id is null
        or not exists (select 1 from public.profiles profile where profile.id = recipient_id)
    ) then
    raise exception 'choose distinct valid opponents';
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
  end || ' · ' || (v_recipient_count + 1)::text || ' players';

  v_setup := jsonb_build_object(
    'league', case when v_is_cfb then 'CFB' else 'NFL' end,
    'poolScope', v_scope,
    'division', v_division,
    'participantCount', v_recipient_count + 1,
    'currentOnly', true,
    'rosterSlots', jsonb_build_array('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach')
  );

  v_recipient_id := p_recipient_ids[1];
  v_attempt := 0;
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
        'football-wheel-v3-multiplayer',
        'Wheel of Football',
        v_summary,
        v_creator_id,
        v_recipient_id,
        '/football/wheel?match=' || v_code,
        v_setup,
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

  insert into private.wheel_football_participants (
    challenge_id,
    profile_id,
    invite_challenge_id,
    seat_order,
    accepted_at
  ) values (
    v_challenge_id,
    v_creator_id,
    v_challenge_id,
    0,
    v_created_at
  ), (
    v_challenge_id,
    p_recipient_ids[1],
    v_challenge_id,
    1,
    null
  );

  perform private.publish_notification_to_profile(
    p_recipient_ids[1],
    'wheel-football:received:' || v_code || ':' || p_recipient_ids[1]::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    v_creator_name || ' invited you to a ' || (v_recipient_count + 1)::text || '-player Wheel of Football match.',
    '/football/wheel?match=' || v_code,
    'PLAY',
    v_created_at
  );

  if v_recipient_count > 1 then
    for v_index in 2..v_recipient_count loop
      v_recipient_id := p_recipient_ids[v_index];
      v_attempt := 0;
      loop
        v_attempt := v_attempt + 1;
        v_invite_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
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
            creator_result,
            creator_hidden_at
          ) values (
            v_invite_code,
            'wheel-football',
            'football-wheel-v3-multiplayer',
            'Wheel of Football',
            v_summary,
            v_creator_id,
            v_recipient_id,
            '/football/wheel?match=' || v_invite_code,
            v_setup,
            jsonb_build_object('status', 'in-progress'),
            v_created_at
          )
          returning id into v_invite_id;
          exit;
        exception when unique_violation then
          if v_attempt >= 5 then raise; end if;
        end;
      end loop;

      insert into private.wheel_football_participants (
        challenge_id,
        profile_id,
        invite_challenge_id,
        seat_order
      ) values (
        v_challenge_id,
        v_recipient_id,
        v_invite_id,
        v_index
      );

      perform private.publish_notification_to_profile(
        v_recipient_id,
        'wheel-football:received:' || v_invite_code || ':' || v_recipient_id::text,
        'play-challenges:received',
        'game_challenge_received',
        'You were challenged',
        v_creator_name || ' invited you to a ' || (v_recipient_count + 1)::text || '-player Wheel of Football match.',
        '/football/wheel?match=' || v_invite_code,
        'PLAY',
        v_created_at
      );
    end loop;
  end if;

  return v_code;
end;
$$;

-- Preserve older clients that still call the one-recipient signature.
create or replace function private.create_wheel_football_challenge(
  p_recipient_id uuid,
  p_pool_scope text,
  p_division text
)
returns text
language sql
security definer
set search_path = ''
as $$
  select private.create_wheel_football_challenge(
    array[p_recipient_id]::uuid[],
    p_pool_scope,
    p_division
  );
$$;

create or replace function private.open_wheel_football_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.wheel_football_matches%rowtype;
  v_participant private.wheel_football_participants%rowtype;
  v_first_turn uuid;
  v_now timestamptz := now();
  v_unaccepted integer;
  v_first_name text;
  v_row record;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    return false;
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if not found or v_match.phase = 'complete' then
    return false;
  end if;

  select participant.*
    into v_participant
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id
  for update;

  if v_participant.forfeited_at is not null then
    return false;
  end if;

  if v_participant.accepted_at is null then
    update private.wheel_football_participants participant
    set accepted_at = v_now
    where participant.challenge_id = v_challenge_id
      and participant.profile_id = v_user_id;

    update public.play_challenges invite
    set opened_at = coalesce(invite.opened_at, v_now)
    where invite.id = v_participant.invite_challenge_id
      and invite.declined_at is null;
  end if;

  select count(*)::integer
    into v_unaccepted
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.accepted_at is null
    and participant.forfeited_at is null;

  if v_unaccepted = 0 and v_match.phase = 'waiting' then
    select participant.profile_id
      into v_first_turn
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.forfeited_at is null
    order by random()
    limit 1;

    update private.wheel_football_matches match
    set phase = 'spin',
        current_turn_profile_id = v_first_turn,
        pending_team_code = null,
        started_at = v_now,
        updated_at = v_now
    where match.challenge_id = v_challenge_id;

    update public.play_challenges invite
    set opened_at = coalesce(invite.opened_at, v_now)
    where invite.id in (
      select distinct participant.invite_challenge_id
      from private.wheel_football_participants participant
      where participant.challenge_id = v_challenge_id
    )
      and invite.declined_at is null;

    select profile.display_name
      into v_first_name
    from public.profiles profile
    where profile.id = v_first_turn;

    for v_row in
      select participant.profile_id
      from private.wheel_football_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      perform private.publish_notification_to_profile(
        v_row.profile_id,
        'wheel-football:start:' || v_challenge_id::text || ':' || v_row.profile_id::text,
        'play-challenges:accepted',
        'game_challenge_accepted',
        case when v_row.profile_id = v_first_turn
          then 'Your turn in Wheel of Football'
          else 'Wheel of Football is ready'
        end,
        case when v_row.profile_id = v_first_turn
          then 'Everyone joined. You have the first spin.'
          else 'Everyone joined. ' || coalesce(v_first_name, 'Another player') || ' has the first spin.'
        end,
        '/football/wheel?match=' || (
          select challenge.code from public.play_challenges challenge where challenge.id = v_challenge_id
        ),
        case when v_row.profile_id = v_first_turn then 'TAKE YOUR TURN' else 'OPEN MATCH' end,
        v_now
      );
    end loop;
  end if;

  return true;
end;
$$;

create or replace function private.decline_wheel_football_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.wheel_football_matches%rowtype;
  v_actor_name text;
  v_now timestamptz := now();
  v_row record;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    return false;
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if not found or v_match.phase <> 'waiting' or v_match.completed_at is not null then
    return false;
  end if;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  update private.wheel_football_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_team_code = null,
      completed_at = v_now,
      updated_at = v_now
  where match.challenge_id = v_challenge_id;

  update public.play_challenges invite
  set declined_at = coalesce(invite.declined_at, v_now)
  where invite.id in (
    select distinct participant.invite_challenge_id
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
  );

  for v_row in
    select participant.profile_id
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.profile_id <> v_user_id
  loop
    perform private.publish_notification_to_profile(
      v_row.profile_id,
      'wheel-football:declined:' || v_challenge_id::text || ':' || v_row.profile_id::text,
      'play-challenges:received',
      'game_challenge_received',
      'Wheel of Football was canceled',
      coalesce(v_actor_name, 'A player') || ' declined the multiplayer match.',
      '/football/wheel',
      'OPEN FOOTBALL HQ',
      v_now
    );
  end loop;

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
  v_challenge_id uuid;
  v_match private.wheel_football_matches%rowtype;
  v_last_team text;
  v_team_code text;
  v_eligible_team_codes text[];
  v_dead_pending boolean := false;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'Wheel of Football match not found';
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase = 'complete' or v_match.completed_at is not null then
    raise exception 'This Wheel of Football match is closed';
  end if;

  if v_match.started_at is null then
    raise exception 'Everyone must accept before the first spin';
  end if;

  if not exists (
    select 1
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.profile_id = v_user_id
      and participant.accepted_at is not null
      and participant.forfeited_at is null
  ) then
    raise exception 'You are not an active player in this match';
  end if;

  if v_match.current_turn_profile_id <> v_user_id then
    raise exception 'It is not your spin';
  end if;

  if v_match.phase = 'pick' and v_match.pending_team_code is not null then
    v_dead_pending := not private.wheel_football_team_has_eligible_pick(
      v_challenge_id,
      v_user_id,
      v_match.pending_team_code
    );
  end if;

  if v_match.phase <> 'spin' and not v_dead_pending then
    raise exception 'It is not your spin';
  end if;

  select participant.last_team_code
    into v_last_team
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  v_eligible_team_codes := private.wheel_football_eligible_team_codes(
    v_challenge_id,
    v_user_id,
    v_match.pool_scope,
    v_match.division
  );

  if coalesce(cardinality(v_eligible_team_codes), 0) = 0 then
    raise exception 'No eligible team is available for your remaining Superteam spots';
  end if;

  select eligible.code
    into v_team_code
  from unnest(v_eligible_team_codes) as eligible(code)
  order by
    case
      when eligible.code = v_last_team
        and cardinality(v_eligible_team_codes) > 1 then 1
      else 0
    end,
    random()
  limit 1;

  update private.wheel_football_matches match
  set phase = 'pick',
      pending_team_code = v_team_code,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  return private.wheel_football_state_json(v_challenge_id);
end;
$$;

create or replace function private.finish_wheel_football(
  p_challenge_id uuid,
  p_resolved_by_forfeit boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_room public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_active_count integer;
  v_row record;
  v_creator_result jsonb;
begin
  select challenge.*
    into v_room
  from public.play_challenges challenge
  where challenge.id = p_challenge_id
  for update;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = p_challenge_id
  for update;

  update private.wheel_football_participants participant
  set grade_total = null,
      final_grade = null,
      final_rank = null
  where participant.challenge_id = p_challenge_id;

  select count(*)::integer
    into v_active_count
  from private.wheel_football_participants participant
  where participant.challenge_id = p_challenge_id
    and participant.forfeited_at is null;

  if p_resolved_by_forfeit then
    if v_active_count = 1 then
      update private.wheel_football_participants participant
      set final_rank = 1
      where participant.challenge_id = p_challenge_id
        and participant.forfeited_at is null;
    end if;
  else
    update private.wheel_football_participants participant
    set grade_total = private.wheel_football_grade_total(p_challenge_id, participant.profile_id),
        final_grade = private.wheel_football_final_grade_v2(
          private.wheel_football_raw_grade(p_challenge_id, participant.profile_id)
        )
    where participant.challenge_id = p_challenge_id
      and participant.forfeited_at is null
      and (
        select count(*)
        from private.wheel_football_picks pick
        where pick.challenge_id = p_challenge_id
          and pick.profile_id = participant.profile_id
      ) = 7;

    with ranked as (
      select
        participant.profile_id,
        dense_rank() over (order by participant.grade_total desc)::smallint as final_rank
      from private.wheel_football_participants participant
      where participant.challenge_id = p_challenge_id
        and participant.forfeited_at is null
        and participant.grade_total is not null
    )
    update private.wheel_football_participants participant
    set final_rank = ranked.final_rank
    from ranked
    where participant.challenge_id = p_challenge_id
      and participant.profile_id = ranked.profile_id;
  end if;

  update private.wheel_football_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_team_code = null,
      completed_at = v_now,
      resolved_by_forfeit = p_resolved_by_forfeit,
      updated_at = v_now
  where match.challenge_id = p_challenge_id;

  select jsonb_build_object(
      'complete', true,
      'finalGrade', participant.final_grade,
      'rank', participant.final_rank,
      'forfeited', participant.forfeited_at is not null,
      'resolvedByForfeit', p_resolved_by_forfeit
    )
    into v_creator_result
  from private.wheel_football_participants participant
  where participant.challenge_id = p_challenge_id
    and participant.profile_id = v_room.creator_id;

  update public.play_challenges challenge
  set creator_result = coalesce(v_creator_result, jsonb_build_object('complete', true)),
      responder_result = coalesce((
        select jsonb_build_object(
          'complete', true,
          'finalGrade', participant.final_grade,
          'rank', participant.final_rank,
          'forfeited', participant.forfeited_at is not null,
          'resolvedByForfeit', p_resolved_by_forfeit
        )
        from private.wheel_football_participants participant
        where participant.challenge_id = p_challenge_id
          and participant.profile_id = v_room.recipient_id
      ), jsonb_build_object('complete', true)),
      completed_at = v_now,
      opened_at = coalesce(challenge.opened_at, v_match.started_at, v_now)
  where challenge.id = p_challenge_id;

  update public.play_challenges invite
  set creator_result = coalesce(v_creator_result, jsonb_build_object('complete', true)),
      responder_result = jsonb_build_object(
        'complete', true,
        'finalGrade', participant.final_grade,
        'rank', participant.final_rank,
        'forfeited', participant.forfeited_at is not null,
        'resolvedByForfeit', p_resolved_by_forfeit
      ),
      completed_at = v_now,
      opened_at = coalesce(invite.opened_at, v_match.started_at, v_now)
  from private.wheel_football_participants participant
  where participant.challenge_id = p_challenge_id
    and participant.invite_challenge_id = invite.id
    and invite.id <> p_challenge_id;

  for v_row in
    select participant.profile_id
    from private.wheel_football_participants participant
    where participant.challenge_id = p_challenge_id
  loop
    perform private.publish_notification_to_profile(
      v_row.profile_id,
      'wheel-football:complete:' || p_challenge_id::text || ':' || v_row.profile_id::text,
      'play-challenges:results-ready',
      'game_challenge_result_ready',
      'Wheel of Football is complete',
      case when p_resolved_by_forfeit
        then 'The multiplayer match ended by forfeit.'
        else 'Every active Superteam is locked. Final standings are ready.'
      end,
      '/football/wheel?match=' || v_room.code,
      'VIEW STANDINGS',
      v_now
    );
  end loop;
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
  v_challenge_id uuid;
  v_room public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_abbreviation text := upper(trim(coalesce(p_position_abbreviation, '')));
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_actor_seat integer;
  v_seat_count integer;
  v_incomplete_count integer;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'Wheel of Football match not found';
  end if;

  select challenge.*
    into v_room
  from public.play_challenges challenge
  where challenge.id = v_challenge_id;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase = 'complete' or v_match.completed_at is not null then
    raise exception 'This Wheel of Football match is closed';
  end if;

  if v_match.current_turn_profile_id <> v_user_id
    or v_match.phase <> 'pick'
    or v_match.pending_team_code is null then
    raise exception 'It is not your pick';
  end if;

  if not exists (
    select 1
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.profile_id = v_user_id
      and participant.accepted_at is not null
      and participant.forfeited_at is null
  ) then
    raise exception 'You are not an active player in this match';
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
    where pick.challenge_id = v_challenge_id
      and pick.profile_id = v_user_id
      and pick.roster_slot = v_slot
  ) then
    raise exception 'That Superteam slot is already filled';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks drafted
    where drafted.challenge_id = v_challenge_id
      and drafted.team_code = v_match.pending_team_code
      and private.wheel_football_position_group(
        drafted.roster_slot,
        drafted.position_abbreviation
      ) = private.wheel_football_position_group(v_slot, v_abbreviation)
      and private.wheel_football_grade_base_name_key(drafted.display_name)
        = private.wheel_football_grade_base_name_key(trim(p_display_name))
  ) then
    raise exception 'That player or coach was already drafted in this match';
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
    v_challenge_id,
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

  update private.wheel_football_participants participant
  set last_team_code = v_match.pending_team_code
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  update private.wheel_football_matches match
  set turn_count = v_next_turn_count,
      pending_team_code = null,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  select count(*)::integer
    into v_incomplete_count
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.forfeited_at is null
    and (
      select count(*)
      from private.wheel_football_picks pick
      where pick.challenge_id = v_challenge_id
        and pick.profile_id = participant.profile_id
    ) < 7;

  if v_incomplete_count = 0 then
    perform private.finish_wheel_football(v_challenge_id, false);
    return private.wheel_football_state_json(v_challenge_id);
  end if;

  select participant.seat_order
    into v_actor_seat
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select count(*)::integer
    into v_seat_count
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id;

  select participant.profile_id
    into v_next_profile
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.forfeited_at is null
    and (
      select count(*)
      from private.wheel_football_picks pick
      where pick.challenge_id = v_challenge_id
        and pick.profile_id = participant.profile_id
    ) < 7
  order by case
    when participant.seat_order > v_actor_seat
      then participant.seat_order - v_actor_seat
    else participant.seat_order + v_seat_count - v_actor_seat
  end
  limit 1;

  update private.wheel_football_matches match
  set phase = 'spin',
      current_turn_profile_id = v_next_profile,
      pending_team_code = null,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  perform private.publish_notification_to_profile(
    v_next_profile,
    'wheel-football:turn:' || v_room.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
    'play-challenges:received',
    'game_challenge_received',
    'Your turn in Wheel of Football',
    coalesce(v_actor_name, 'Another player') || ' made a pick. Spin for your next team.',
    '/football/wheel?match=' || v_room.code,
    'TAKE YOUR TURN',
    now()
  );

  return private.wheel_football_state_json(v_challenge_id);
end;
$$;

create or replace function private.forfeit_wheel_football(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_room public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_actor_name text;
  v_actor_seat integer;
  v_seat_count integer;
  v_remaining integer;
  v_incomplete_count integer;
  v_next_profile uuid;
  v_now timestamptz := now();
  v_row record;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'Wheel of Football match not found';
  end if;

  select challenge.*
    into v_room
  from public.play_challenges challenge
  where challenge.id = v_challenge_id;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.started_at is null then
    raise exception 'match has not started';
  end if;

  if v_match.phase = 'complete' or v_match.completed_at is not null then
    raise exception 'match has already ended';
  end if;

  select participant.seat_order
    into v_actor_seat
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id
    and participant.forfeited_at is null;

  if v_actor_seat is null then
    raise exception 'You are not an active player in this match';
  end if;

  update private.wheel_football_participants participant
  set forfeited_at = v_now
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  update private.wheel_football_matches match
  set forfeited_by_profile_id = v_user_id,
      forfeited_at = v_now,
      updated_at = v_now
  where match.challenge_id = v_challenge_id;

  select count(*)::integer
    into v_remaining
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.forfeited_at is null;

  if v_remaining <= 1 then
    perform private.finish_wheel_football(v_challenge_id, true);
    return private.wheel_football_state_json(v_challenge_id);
  end if;

  select count(*)::integer
    into v_incomplete_count
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.forfeited_at is null
    and (
      select count(*)
      from private.wheel_football_picks pick
      where pick.challenge_id = v_challenge_id
        and pick.profile_id = participant.profile_id
    ) < 7;

  if v_incomplete_count = 0 then
    perform private.finish_wheel_football(v_challenge_id, false);
    return private.wheel_football_state_json(v_challenge_id);
  end if;

  if v_match.current_turn_profile_id = v_user_id then
    select count(*)::integer
      into v_seat_count
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id;

    select participant.profile_id
      into v_next_profile
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.forfeited_at is null
      and (
        select count(*)
        from private.wheel_football_picks pick
        where pick.challenge_id = v_challenge_id
          and pick.profile_id = participant.profile_id
      ) < 7
    order by case
      when participant.seat_order > v_actor_seat
        then participant.seat_order - v_actor_seat
      else participant.seat_order + v_seat_count - v_actor_seat
    end
    limit 1;

    update private.wheel_football_matches match
    set phase = 'spin',
        current_turn_profile_id = v_next_profile,
        pending_team_code = null,
        updated_at = v_now
    where match.challenge_id = v_challenge_id;
  end if;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  for v_row in
    select participant.profile_id
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.profile_id <> v_user_id
  loop
    perform private.publish_notification_to_profile(
      v_row.profile_id,
      'wheel-football:forfeit:' || v_room.code || ':' || v_user_id::text || ':' || v_row.profile_id::text,
      'play-challenges:received',
      'game_challenge_received',
      'Wheel of Football update',
      coalesce(v_actor_name, 'A player') || ' forfeited. The remaining players continue.',
      '/football/wheel?match=' || v_room.code,
      'OPEN MATCH',
      v_now
    );
  end loop;

  if v_next_profile is not null then
    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:turn-after-forfeit:' || v_room.code || ':' || v_next_profile::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in Wheel of Football',
      'A player forfeited. Spin for your next team.',
      '/football/wheel?match=' || v_room.code,
      'TAKE YOUR TURN',
      v_now
    );
  end if;

  return private.wheel_football_state_json(v_challenge_id);
end;
$$;

create or replace function public.create_wheel_football_challenge(
  p_recipient_ids uuid[],
  p_pool_scope text,
  p_division text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_wheel_football_challenge(p_recipient_ids, p_pool_scope, p_division);
$$;

create or replace function public.decline_wheel_football_challenge(p_code text)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.decline_wheel_football_challenge(p_code);
$$;

revoke all on function private.wheel_football_primary_challenge_id(text,uuid) from public, anon, authenticated;
revoke all on function private.wheel_football_max_turns(uuid) from public, anon, authenticated;
revoke all on function private.finish_wheel_football(uuid,boolean) from public, anon, authenticated;

revoke all on function private.create_wheel_football_challenge(uuid[],text,text) from public, anon;
revoke all on function private.create_wheel_football_challenge(uuid,text,text) from public, anon;
revoke all on function private.get_my_wheel_football_match(text) from public, anon;
revoke all on function private.open_wheel_football_challenge(text) from public, anon;
revoke all on function private.decline_wheel_football_challenge(text) from public, anon;
revoke all on function private.spin_wheel_football(text) from public, anon;
revoke all on function private.pick_wheel_football(text,text,text,text,text,text,text) from public, anon;
revoke all on function private.forfeit_wheel_football(text) from public, anon;

grant execute on function private.create_wheel_football_challenge(uuid[],text,text) to authenticated;
grant execute on function private.create_wheel_football_challenge(uuid,text,text) to authenticated;
grant execute on function private.get_my_wheel_football_match(text) to authenticated;
grant execute on function private.open_wheel_football_challenge(text) to authenticated;
grant execute on function private.decline_wheel_football_challenge(text) to authenticated;
grant execute on function private.spin_wheel_football(text) to authenticated;
grant execute on function private.pick_wheel_football(text,text,text,text,text,text,text) to authenticated;
grant execute on function private.forfeit_wheel_football(text) to authenticated;

revoke all on function public.create_wheel_football_challenge(uuid[],text,text) from public, anon;
revoke all on function public.decline_wheel_football_challenge(text) from public, anon;

grant execute on function public.create_wheel_football_challenge(uuid[],text,text) to authenticated;
grant execute on function public.decline_wheel_football_challenge(text) to authenticated;

comment on table private.wheel_football_participants is
  'Canonical 2-4 player Wheel room membership, invite acceptance, per-player last spin, elimination state, and final team standing.';
comment on function public.create_wheel_football_challenge(uuid[],text,text) is
  'Creates one Wheel of Football room for the signed-in creator plus one to three distinct opponents.';
comment on function public.decline_wheel_football_challenge(text) is
  'Cancels a waiting multiplayer Wheel room for all invitees before the first spin.';
comment on function public.forfeit_wheel_football(text) is
  'Eliminates one active player; three- and four-player rooms continue until the remaining Superteams finish or only one player remains.';
