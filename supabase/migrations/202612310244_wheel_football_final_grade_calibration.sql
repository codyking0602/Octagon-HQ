-- Wheel of Football final-grade calibration v2.
-- User-approved behavior:
--   * 2.5x separation below the elite 95 raw-team anchor.
--   * Elite tail stays monotonic instead of flattening multiple teams at 100.
--   * Final grades render to one decimal.
--   * Winner/tie is determined from the exact seven-pick hidden-grade total, never a rounded display grade.
-- Individual player/coach grades and exact totals remain private.

create or replace function private.wheel_football_raw_grade(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when count(*) = 7 and count(pick.hidden_grade) = 7
      then avg(pick.hidden_grade)::numeric
    else null
  end
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_football_grade_total(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when count(*) = 7 and count(pick.hidden_grade) = 7
      then sum(pick.hidden_grade)::numeric
    else null
  end
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_football_final_grade_v2(p_raw_grade numeric)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when p_raw_grade is null then null
    when p_raw_grade <= 95
      then round(greatest(0::numeric, 95 + (2.5 * (p_raw_grade - 95))), 1)
    else round(least(100::numeric, p_raw_grade), 1)
  end;
$$;

create or replace function private.enrich_completed_wheel_football_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_forfeited_at timestamptz;
  v_creator_raw numeric;
  v_recipient_raw numeric;
  v_creator_final numeric;
  v_recipient_final numeric;
begin
  if new.game_id <> 'wheel-football' or new.completed_at is null then
    return new;
  end if;

  if coalesce(new.creator_result ->> 'wheelGradeRuntimeVersion', '') = 'nfl-wheel-locked-grades-v2'
    and coalesce(new.responder_result ->> 'wheelGradeRuntimeVersion', '') = 'nfl-wheel-locked-grades-v2' then
    return new;
  end if;

  select match.forfeited_at
    into v_forfeited_at
  from private.wheel_football_matches match
  where match.challenge_id = new.id;

  if v_forfeited_at is not null then
    return new;
  end if;

  v_creator_raw := private.wheel_football_raw_grade(new.id, new.creator_id);
  v_recipient_raw := private.wheel_football_raw_grade(new.id, new.recipient_id);

  if v_creator_raw is null or v_recipient_raw is null then
    return new;
  end if;

  v_creator_final := private.wheel_football_final_grade_v2(v_creator_raw);
  v_recipient_final := private.wheel_football_final_grade_v2(v_recipient_raw);

  update public.play_challenges challenge
  set creator_result = coalesce(challenge.creator_result, '{}'::jsonb) || jsonb_build_object(
        'finalGrade', v_creator_final,
        'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v2'
      ),
      responder_result = coalesce(challenge.responder_result, '{}'::jsonb) || jsonb_build_object(
        'finalGrade', v_recipient_final,
        'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v2'
      )
  where challenge.id = new.id;

  return new;
end;
$$;

-- If a Wheel game happened to complete between the v1 rollout and this calibration
-- migration, convert only that graded runtime result. Pre-grading legacy completions
-- still have no finalGrade and remain untouched.
update public.play_challenges challenge
set creator_result = coalesce(challenge.creator_result, '{}'::jsonb) || jsonb_build_object(
      'finalGrade', private.wheel_football_final_grade_v2(
        private.wheel_football_raw_grade(challenge.id, challenge.creator_id)
      ),
      'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v2'
    ),
    responder_result = coalesce(challenge.responder_result, '{}'::jsonb) || jsonb_build_object(
      'finalGrade', private.wheel_football_final_grade_v2(
        private.wheel_football_raw_grade(challenge.id, challenge.recipient_id)
      ),
      'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v2'
    )
from private.wheel_football_matches match
where challenge.id = match.challenge_id
  and challenge.game_id = 'wheel-football'
  and challenge.completed_at is not null
  and match.forfeited_at is null
  and coalesce(challenge.creator_result ->> 'wheelGradeRuntimeVersion', '') = 'nfl-wheel-locked-grades-v1'
  and coalesce(challenge.responder_result ->> 'wheelGradeRuntimeVersion', '') = 'nfl-wheel-locked-grades-v1'
  and private.wheel_football_raw_grade(challenge.id, challenge.creator_id) is not null
  and private.wheel_football_raw_grade(challenge.id, challenge.recipient_id) is not null;

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

revoke all on function private.wheel_football_grade_total(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_football_final_grade_v2(numeric) from public, anon, authenticated;
revoke all on function private.wheel_football_raw_grade(uuid,uuid) from public, anon, authenticated;
revoke all on function private.enrich_completed_wheel_football_result() from public, anon, authenticated;

comment on function private.wheel_football_grade_total(uuid,uuid) is
  'Exact private seven-pick grade total used only for winner/tie resolution. Never exposed to clients.';
comment on function private.wheel_football_final_grade_v2(numeric) is
  'Wheel final presentation grade: 2.5x separation through the 95 raw anchor, monotonic elite tail, one decimal, 0-100.';
