-- Wheel of Football eligibility-aware spins.
-- NFL and CFB now use the same server-owned rule: a team stays on the wheel only
-- while it has at least one undrafted canonical option for one of the active
-- participant's remaining Superteam slots. A dead pending team may be re-spun
-- for free as a failsafe, and the immediately previous personal team is avoided
-- whenever another eligible team exists.

create or replace function private.wheel_football_team_in_pool(
  p_team_code text,
  p_pool_scope text,
  p_division text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.wheel_football_teams team
    where team.code = p_team_code
      and (
        (upper(trim(coalesce(p_pool_scope, ''))) = 'NFL' and team.conference in ('AFC', 'NFC'))
        or (
          upper(trim(coalesce(p_pool_scope, ''))) in ('AFC', 'NFC')
          and team.conference = upper(trim(coalesce(p_pool_scope, '')))
        )
        or (
          upper(trim(coalesce(p_pool_scope, ''))) = 'DIVISION'
          and team.conference || ' ' || team.division = p_division
        )
        or (
          upper(trim(coalesce(p_pool_scope, ''))) = 'CFB'
          and team.conference in ('SEC', 'Big Ten', 'Big 12', 'ACC', 'Independent')
        )
        or (
          upper(trim(coalesce(p_pool_scope, ''))) = 'AP_TOP_25'
          and exists (
            select 1
            from private.wheel_football_ap_top_25 poll
            where poll.season = 2026
              and poll.poll_date = (
                select max(latest.poll_date)
                from private.wheel_football_ap_top_25 latest
                where latest.season = 2026
              )
              and poll.team_code = team.code
          )
        )
        or (upper(trim(coalesce(p_pool_scope, ''))) = 'SEC' and team.conference = 'SEC')
        or (upper(trim(coalesce(p_pool_scope, ''))) = 'BIG_TEN' and team.conference = 'Big Ten')
        or (upper(trim(coalesce(p_pool_scope, ''))) = 'BIG_12' and team.conference = 'Big 12')
        or (upper(trim(coalesce(p_pool_scope, ''))) = 'ACC' and team.conference = 'ACC')
      )
  );
$$;

create or replace function private.wheel_football_team_has_eligible_pick(
  p_challenge_id uuid,
  p_profile_id uuid,
  p_team_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with open_slots(slot) as (
    select candidate.slot
    from unnest(array[
      'QB',
      'RB',
      'WR',
      'Flex',
      'Front Seven',
      'Secondary',
      'Head Coach'
    ]::text[]) as candidate(slot)
    where not exists (
      select 1
      from private.wheel_football_picks filled
      where filled.challenge_id = p_challenge_id
        and filled.profile_id = p_profile_id
        and filled.roster_slot = candidate.slot
    )
  ),
  current_authority as (
    select distinct on (authority.position_group, authority.name_key)
      authority.position_group,
      authority.name_key,
      authority.display_name
    from private.wheel_football_grade_authority authority
    where authority.team_code = p_team_code
      and authority.effective_date <= current_date
    order by authority.position_group, authority.name_key, authority.effective_date desc
  )
  select exists (
    select 1
    from current_authority authority
    where (
      (authority.position_group = 'QB'
        and exists (select 1 from open_slots where slot = 'QB'))
      or (authority.position_group = 'RB'
        and exists (select 1 from open_slots where slot in ('RB', 'Flex')))
      or (authority.position_group = 'WR'
        and exists (select 1 from open_slots where slot in ('WR', 'Flex')))
      or (authority.position_group = 'TE'
        and exists (select 1 from open_slots where slot = 'Flex'))
      or (authority.position_group = 'Front Seven'
        and exists (select 1 from open_slots where slot = 'Front Seven'))
      or (authority.position_group = 'Secondary'
        and exists (select 1 from open_slots where slot = 'Secondary'))
      or (authority.position_group = 'Head Coach'
        and exists (select 1 from open_slots where slot = 'Head Coach'))
    )
    and not exists (
      select 1
      from private.wheel_football_picks drafted
      where drafted.challenge_id = p_challenge_id
        and drafted.team_code = p_team_code
        and private.wheel_football_position_group(
          drafted.roster_slot,
          drafted.position_abbreviation
        ) = authority.position_group
        and private.wheel_football_grade_base_name_key(drafted.display_name)
          = private.wheel_football_grade_base_name_key(authority.display_name)
    )
  );
$$;

create or replace function private.wheel_football_eligible_team_codes(
  p_challenge_id uuid,
  p_profile_id uuid,
  p_pool_scope text,
  p_division text
)
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(team.code order by team.code), '{}'::text[])
  from private.wheel_football_teams team
  where private.wheel_football_team_in_pool(
      team.code,
      p_pool_scope,
      p_division
    )
    and private.wheel_football_team_has_eligible_pick(
      p_challenge_id,
      p_profile_id,
      team.code
    );
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
      when match.phase = 'complete'
        and match.forfeited_at is null
        and coalesce(challenge.creator_result ? 'finalGrade', false)
        and coalesce(challenge.responder_result ? 'finalGrade', false)
        and private.wheel_football_grade_total(challenge.id, challenge.creator_id) is not null
        and private.wheel_football_grade_total(challenge.id, challenge.recipient_id) is not null
      then jsonb_build_object(
        'creator_final_grade', (challenge.creator_result ->> 'finalGrade')::numeric,
        'recipient_final_grade', (challenge.responder_result ->> 'finalGrade')::numeric,
        'winner_profile_id', case
          when private.wheel_football_grade_total(challenge.id, challenge.creator_id)
            > private.wheel_football_grade_total(challenge.id, challenge.recipient_id)
            then challenge.creator_id
          when private.wheel_football_grade_total(challenge.id, challenge.recipient_id)
            > private.wheel_football_grade_total(challenge.id, challenge.creator_id)
            then challenge.recipient_id
          else null
        end,
        'is_tie',
          private.wheel_football_grade_total(challenge.id, challenge.creator_id)
          = private.wheel_football_grade_total(challenge.id, challenge.recipient_id)
      )
      else null
    end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  where challenge.id = p_challenge_id;
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
  v_eligible_team_codes text[];
  v_dead_pending boolean := false;
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

  if v_match.current_turn_profile_id <> v_user_id then
    raise exception 'It is not your spin';
  end if;

  if v_match.phase = 'pick' and v_match.pending_team_code is not null then
    v_dead_pending := not private.wheel_football_team_has_eligible_pick(
      v_challenge.id,
      v_user_id,
      v_match.pending_team_code
    );
  end if;

  if v_match.phase <> 'spin' and not v_dead_pending then
    raise exception 'It is not your spin';
  end if;

  v_last_team := case
    when v_user_id = v_challenge.creator_id then v_match.creator_last_team_code
    else v_match.recipient_last_team_code
  end;

  v_eligible_team_codes := private.wheel_football_eligible_team_codes(
    v_challenge.id,
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
  where match.challenge_id = v_challenge.id;

  return private.wheel_football_state_json(v_challenge.id);
end;
$$;

-- Existing live matches that happened to be parked on a newly recognized dead
-- pending team get the same free re-spin path immediately at rollout.
update private.wheel_football_matches match
set phase = 'spin',
    pending_team_code = null,
    updated_at = now()
from public.play_challenges challenge
where challenge.id = match.challenge_id
  and challenge.game_id = 'wheel-football'
  and challenge.completed_at is null
  and challenge.declined_at is null
  and match.phase = 'pick'
  and match.current_turn_profile_id is not null
  and match.pending_team_code is not null
  and not private.wheel_football_team_has_eligible_pick(
    challenge.id,
    match.current_turn_profile_id,
    match.pending_team_code
  );

revoke all on function private.wheel_football_team_in_pool(text,text,text)
from public, anon, authenticated;
revoke all on function private.wheel_football_team_has_eligible_pick(uuid,uuid,text)
from public, anon, authenticated;
revoke all on function private.wheel_football_eligible_team_codes(uuid,uuid,text,text)
from public, anon, authenticated;

comment on function private.wheel_football_team_has_eligible_pick(uuid,uuid,text) is
  'Returns true only when the team has an undrafted locked NFL/CFB option that can fill one of the participant''s remaining Superteam slots.';
comment on function private.wheel_football_eligible_team_codes(uuid,uuid,text,text) is
  'Canonical server-owned Wheel membership after pool, open-slot, and match-wide drafted-identity filtering.';
comment on function private.spin_wheel_football(text) is
  'Spins only among teams that can still fill an open slot. Avoids a back-to-back personal team when another eligible team exists and permits a free re-spin only for a dead pending team.';
