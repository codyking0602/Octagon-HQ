-- PR2: add Football to the one canonical Today’s Challenge backend.
-- Sport is a schedule namespace; attempts/progress remain keyed by the existing immutable
-- daily_challenge_id owner. Existing schedules are UFC by default and remain unchanged.

alter table private.daily_challenge_schedule_versions
  add column if not exists sport text not null default 'ufc';

alter table private.daily_challenge_schedule_versions
  drop constraint if exists daily_challenge_schedule_versions_sport_check;
alter table private.daily_challenge_schedule_versions
  add constraint daily_challenge_schedule_versions_sport_check
  check (sport in ('ufc', 'football'));

create index if not exists daily_challenge_schedule_sport_start
  on private.daily_challenge_schedule_versions(sport, starts_on desc, created_at desc);

create or replace function private.daily_challenge_schedule_for_day(
  p_day date,
  p_sport text
)
returns text
language sql
stable
set search_path = ''
as $$
  select schedule.version
  from private.daily_challenge_schedule_versions schedule
  where schedule.starts_on <= p_day
    and schedule.sport = p_sport
  order by schedule.starts_on desc, schedule.created_at desc, schedule.version desc
  limit 1;
$$;

revoke all on function private.daily_challenge_schedule_for_day(date, text)
  from public, anon, authenticated;

-- Preserve every existing one-argument caller as explicitly UFC-owned.
create or replace function private.daily_challenge_schedule_for_day(p_day date)
returns text
language sql
stable
set search_path = ''
as $$
  select private.daily_challenge_schedule_for_day(p_day, 'ufc');
$$;

revoke all on function private.daily_challenge_schedule_for_day(date)
  from public, anon, authenticated;

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle,
  sport
)
values (
  'football-daily-v1',
  'America/Chicago',
  date '2026-08-06',
  private.daily_challenge_central_day(now()),
  array[
    'keep_4_cut_4',
    'blind_resume',
    'hit_the_number',
    'find_leader',
    'wavelength'
  ]::text[],
  'football'
)
on conflict (version) do nothing;

-- Preserve the legacy service contract, but make its implicit sport ownership explicit.
create or replace function public.get_daily_challenge_materialization_request(
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_day date;
  v_schedule_version text;
  v_expected_game text;
  v_daily private.daily_challenges;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to resolve daily challenge materialization';
  end if;
  v_day := private.daily_challenge_central_day(p_at);
  v_schedule_version := private.daily_challenge_schedule_for_day(v_day, 'ufc');
  if v_schedule_version is null then
    raise exception 'no daily challenge schedule is active for %', v_day;
  end if;
  v_expected_game := private.daily_challenge_expected_game(v_schedule_version, v_day);
  select daily.* into v_daily
  from private.daily_challenges daily
  where daily.central_day = v_day
    and daily.schedule_version = v_schedule_version;
  return jsonb_build_object(
    'required', v_daily.id is null,
    'sport', 'ufc',
    'central_day', v_day,
    'schedule_version', v_schedule_version,
    'expected_game', v_expected_game,
    'daily_challenge_id', v_daily.id,
    'published_game', v_daily.game_type,
    'fallback_reason', v_daily.fallback_reason
  );
end;
$$;

revoke all on function public.get_daily_challenge_materialization_request(timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_daily_challenge_materialization_request(timestamptz)
  to service_role;

create or replace function public.get_daily_challenge_materialization_request(
  p_sport text,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_day date;
  v_schedule_version text;
  v_expected_game text;
  v_daily private.daily_challenges;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to resolve daily challenge materialization';
  end if;
  if p_sport not in ('ufc', 'football') then
    raise exception 'unsupported daily challenge sport %', p_sport;
  end if;
  v_day := private.daily_challenge_central_day(p_at);
  v_schedule_version := private.daily_challenge_schedule_for_day(v_day, p_sport);
  if v_schedule_version is null then
    raise exception 'no % daily challenge schedule is active for %', p_sport, v_day;
  end if;
  v_expected_game := private.daily_challenge_expected_game(v_schedule_version, v_day);
  select daily.* into v_daily
  from private.daily_challenges daily
  where daily.central_day = v_day
    and daily.schedule_version = v_schedule_version;
  return jsonb_build_object(
    'required', v_daily.id is null,
    'sport', p_sport,
    'central_day', v_day,
    'schedule_version', v_schedule_version,
    'expected_game', v_expected_game,
    'daily_challenge_id', v_daily.id,
    'published_game', v_daily.game_type,
    'fallback_reason', v_daily.fallback_reason
  );
end;
$$;

revoke all on function public.get_daily_challenge_materialization_request(text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_daily_challenge_materialization_request(text, timestamptz)
  to service_role;

-- Extend the same private runtime context with the schedule-owned sport discriminator.
create or replace function public.get_daily_challenge_runtime_context(
  p_daily_challenge_id uuid,
  p_profile_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_progress private.daily_challenge_progress;
  v_attempt private.daily_challenge_attempts;
  v_sport text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read private daily runtime context';
  end if;
  if p_daily_challenge_id is null or p_profile_id is null then
    raise exception 'daily runtime identity is required';
  end if;
  if not exists (select 1 from public.profiles where id = p_profile_id) then
    raise exception 'daily runtime profile not found';
  end if;

  select daily.* into v_daily
  from private.daily_challenges daily
  where daily.id = p_daily_challenge_id;
  if v_daily.id is null then raise exception 'daily challenge not found'; end if;

  select schedule.sport into v_sport
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = v_daily.schedule_version;

  select setup.* into v_setup
  from private.daily_challenge_setups setup
  where setup.id = v_daily.setup_id;

  select progress.* into v_progress
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily.id
    and progress.profile_id = p_profile_id;

  select attempt.* into v_attempt
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily.id
    and attempt.profile_id = p_profile_id
    and attempt.attempt_kind = 'official_first';

  return jsonb_build_object(
    'daily_challenge_id', v_daily.id,
    'sport', coalesce(v_sport, 'ufc'),
    'central_day', v_daily.central_day,
    'schedule_version', v_daily.schedule_version,
    'game_type', v_daily.game_type,
    'setup_key', v_setup.setup_key,
    'content_version', v_daily.content_version,
    'scoring_version', v_daily.scoring_version,
    'fallback_reason', v_daily.fallback_reason,
    'public_setup', v_setup.public_setup,
    'reveal_setup', v_setup.reveal_setup,
    'private_setup_evidence', v_setup.private_setup_evidence,
    'private_grading_evidence', v_setup.private_grading_evidence,
    'progress_revision', coalesce(v_progress.revision, 0),
    'submission_state', coalesce(v_progress.submission_state, '{}'::jsonb),
    'public_state', coalesce(v_progress.public_state, v_setup.public_setup->'initial_state', '{}'::jsonb),
    'official_attempt', case
      when v_attempt.id is null then null
      else jsonb_build_object(
        'attempt_kind', v_attempt.attempt_kind,
        'native_score', v_attempt.native_score,
        'normalized_score', v_attempt.normalized_score,
        'completed_at', v_attempt.completed_at,
        'content_version', v_attempt.content_version,
        'scoring_version', v_attempt.scoring_version,
        'public_result', v_attempt.public_result
      )
    end
  );
end;
$$;

revoke all on function public.get_daily_challenge_runtime_context(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.get_daily_challenge_runtime_context(uuid, uuid)
  to service_role;
