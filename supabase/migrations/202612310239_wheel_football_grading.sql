-- Wheel of Football hidden current-ability grading.
-- Stacked on the challenge-only Wheel v1 implementation.
-- Grades are server-owned, frozen onto each pick, and revealed only after both
-- seven-slot Superteams are complete.

create or replace function private.wheel_football_name_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '', 'g');
$$;

create table if not exists private.wheel_football_grade_authority (
  name_key text primary key,
  display_name text not null,
  position_group text not null check (
    position_group in ('QB','RB','WR','TE','Front Seven','Secondary','Head Coach')
  ),
  hidden_grade numeric(4,1) not null check (hidden_grade between 0 and 100),
  basis text not null,
  updated_at timestamptz not null default now()
);

alter table private.wheel_football_grade_authority enable row level security;
revoke all on private.wheel_football_grade_authority from public, anon, authenticated;

create or replace function private.resolve_wheel_football_hidden_grade(
  p_display_name text,
  p_position_abbreviation text
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select authority.hidden_grade
      from private.wheel_football_grade_authority authority
      where authority.name_key = private.wheel_football_name_key(p_display_name)
      limit 1
    ),
    case upper(trim(coalesce(p_position_abbreviation, '')))
      when 'QB' then 82.0
      when 'RB' then 80.0
      when 'WR' then 80.0
      when 'TE' then 80.0
      when 'HC' then 85.0
      when 'DE' then 80.0
      when 'DT' then 80.0
      when 'NT' then 80.0
      when 'DL' then 80.0
      when 'LB' then 80.0
      when 'ILB' then 80.0
      when 'OLB' then 80.0
      when 'EDGE' then 80.0
      when 'CB' then 80.0
      when 'S' then 80.0
      when 'FS' then 80.0
      when 'SS' then 80.0
      when 'DB' then 80.0
      else 78.0
    end
  )::numeric(4,1);
$$;

alter table private.wheel_football_picks
  add column if not exists hidden_grade numeric(4,1);

update private.wheel_football_picks pick
set hidden_grade = private.resolve_wheel_football_hidden_grade(
  pick.display_name,
  pick.position_abbreviation
)
where pick.hidden_grade is null;

alter table private.wheel_football_picks
  alter column hidden_grade set not null;

alter table private.wheel_football_picks
  drop constraint if exists wheel_football_pick_hidden_grade_range;

alter table private.wheel_football_picks
  add constraint wheel_football_pick_hidden_grade_range
  check (hidden_grade between 0 and 100);

create or replace function private.assign_wheel_football_hidden_grade()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.hidden_grade := private.resolve_wheel_football_hidden_grade(
    new.display_name,
    new.position_abbreviation
  );
  return new;
end;
$$;

drop trigger if exists wheel_football_assign_hidden_grade on private.wheel_football_picks;
create trigger wheel_football_assign_hidden_grade
before insert on private.wheel_football_picks
for each row execute function private.assign_wheel_football_hidden_grade();

create or replace function private.wheel_football_raw_score(
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
    when count(*) = 7 then round(avg(pick.hidden_grade)::numeric, 1)
    else null
  end
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_football_display_score(
  p_raw_score numeric
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_raw_score is null then null
    else greatest(0, least(100, round((p_raw_score * 2) - 100)::integer))
  end;
$$;

create or replace function private.wheel_football_result_roster(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'turnNumber', pick.turn_number,
      'teamCode', pick.team_code,
      'rosterSlot', pick.roster_slot,
      'athleteId', pick.athlete_id,
      'displayName', pick.display_name,
      'position', pick.position_abbreviation,
      'grade', pick.hidden_grade
    )
    order by pick.turn_number
  ), '[]'::jsonb)
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
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
          'headshot_url', pick.headshot_url,
          'grade', case when match.phase = 'complete' then pick.hidden_grade else null end
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
          'headshot_url', pick.headshot_url,
          'grade', case when match.phase = 'complete' then pick.hidden_grade else null end
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'creator_raw_score', case when match.phase = 'complete' then creator_score.raw_score else null end,
    'recipient_raw_score', case when match.phase = 'complete' then recipient_score.raw_score else null end,
    'creator_score', case when match.phase = 'complete'
      then private.wheel_football_display_score(creator_score.raw_score) else null end,
    'recipient_score', case when match.phase = 'complete'
      then private.wheel_football_display_score(recipient_score.raw_score) else null end,
    'winner_profile_id', case
      when match.phase <> 'complete' then null
      when creator_score.raw_score > recipient_score.raw_score then challenge.creator_id
      when recipient_score.raw_score > creator_score.raw_score then challenge.recipient_id
      else null
    end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at
  )
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  left join lateral (
    select private.wheel_football_raw_score(challenge.id, challenge.creator_id) as raw_score
  ) creator_score on true
  left join lateral (
    select private.wheel_football_raw_score(challenge.id, challenge.recipient_id) as raw_score
  ) recipient_score on true
  where challenge.id = p_challenge_id;
$$;

create or replace function private.enrich_completed_wheel_football_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_raw numeric;
  v_recipient_raw numeric;
  v_creator_score integer;
  v_recipient_score integer;
begin
  if new.game_id <> 'wheel-football'
    or new.completed_at is null
    or coalesce(new.creator_result ->> 'wheelScoreVersion', '') = 'current-ability-v1'
  then
    return new;
  end if;

  v_creator_raw := private.wheel_football_raw_score(new.id, new.creator_id);
  v_recipient_raw := private.wheel_football_raw_score(new.id, new.recipient_id);
  v_creator_score := private.wheel_football_display_score(v_creator_raw);
  v_recipient_score := private.wheel_football_display_score(v_recipient_raw);

  update public.play_challenges challenge
  set creator_result = coalesce(challenge.creator_result, '{}'::jsonb) || jsonb_build_object(
        'complete', true,
        'score', v_creator_score,
        'rawScore', v_creator_raw,
        'wheelScoreVersion', 'current-ability-v1',
        'roster', private.wheel_football_result_roster(new.id, new.creator_id)
      ),
      responder_result = coalesce(challenge.responder_result, '{}'::jsonb) || jsonb_build_object(
        'complete', true,
        'score', v_recipient_score,
        'rawScore', v_recipient_raw,
        'wheelScoreVersion', 'current-ability-v1',
        'roster', private.wheel_football_result_roster(new.id, new.recipient_id)
      )
  where challenge.id = new.id;

  return new;
end;
$$;

drop trigger if exists wheel_football_enrich_completed_result on public.play_challenges;
create trigger wheel_football_enrich_completed_result
after update of completed_at on public.play_challenges
for each row
when (new.game_id = 'wheel-football' and new.completed_at is not null)
execute function private.enrich_completed_wheel_football_result();

revoke all on function private.wheel_football_name_key(text) from public, anon, authenticated;
revoke all on function private.resolve_wheel_football_hidden_grade(text,text) from public, anon, authenticated;
revoke all on function private.assign_wheel_football_hidden_grade() from public, anon, authenticated;
revoke all on function private.wheel_football_raw_score(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_football_display_score(numeric) from public, anon, authenticated;
revoke all on function private.wheel_football_result_roster(uuid,uuid) from public, anon, authenticated;
revoke all on function private.enrich_completed_wheel_football_result() from public, anon, authenticated;

comment on table private.wheel_football_grade_authority is
  'Server-owned Wheel of Football current-ability grades. The live picker never receives these values.';
comment on function private.wheel_football_display_score(numeric) is
  'Presentation score for the wider NFL grade scale: raw 75/80/85/90/95/100 maps to 50/60/70/80/90/100.';
