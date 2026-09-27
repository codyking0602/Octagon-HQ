-- Make Wavelength, Hit the Number, and Find the Leader two-game averaged
-- Daily Challenges for UFC and Football beginning September 27, 2026.

create table if not exists private.daily_two_game_cutover_carryover (
  sport text not null check (sport in ('ufc', 'football')),
  central_day date not null,
  profile_id uuid not null,
  game_type text not null check (game_type in ('find_leader', 'wavelength', 'hit_the_number')),
  legacy_daily_challenge_id uuid not null,
  legacy_revision integer,
  legacy_submission_state jsonb,
  legacy_public_state jsonb,
  legacy_native_score integer,
  legacy_normalized_score integer,
  legacy_public_result jsonb,
  legacy_submission_evidence jsonb,
  legacy_completed_at timestamptz,
  restored_daily_challenge_id uuid,
  restored_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (sport, central_day, profile_id)
);

revoke all on table private.daily_two_game_cutover_carryover from public, anon, authenticated;

create or replace function private.reject_daily_challenge_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_setting('octagon.daily_two_game_cutover', true) = 'on' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  raise exception 'official daily challenge records are immutable'
    using errcode = '55000';
end;
$$;


create or replace function public.prepare_daily_two_game_cutover(
  p_sport text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := private.daily_challenge_central_day(now());
  v_cutover constant date := date '2026-09-27';
  v_scoring constant text := 'daily-two-game-average-score-v1';
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_carried integer := 0;
begin
  if p_sport not in ('ufc', 'football') then
    raise exception 'two-game Daily cutover sport must be UFC or Football';
  end if;

  if v_today < v_cutover then
    return jsonb_build_object('status', 'before_cutover', 'sport', p_sport);
  end if;

  select daily.*
  into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = v_today
    and schedule.sport = p_sport
  order by daily.published_at desc
  limit 1;

  if v_daily.id is null then
    return jsonb_build_object('status', 'not_materialized', 'sport', p_sport);
  end if;

  if v_daily.game_type not in ('find_leader', 'wavelength', 'hit_the_number') then
    return jsonb_build_object(
      'status', 'not_target_game',
      'sport', p_sport,
      'game_type', v_daily.game_type
    );
  end if;

  if v_daily.scoring_version = v_scoring then
    return jsonb_build_object(
      'status', 'already_two_game',
      'sport', p_sport,
      'daily_challenge_id', v_daily.id
    );
  end if;

  select *
  into v_setup
  from private.daily_challenge_setups
  where id = v_daily.setup_id;

  if v_setup.id is null then
    raise exception 'two-game Daily cutover setup is missing';
  end if;

  insert into private.daily_two_game_cutover_carryover (
    sport,
    central_day,
    profile_id,
    game_type,
    legacy_daily_challenge_id,
    legacy_revision,
    legacy_submission_state,
    legacy_public_state,
    legacy_native_score,
    legacy_normalized_score,
    legacy_public_result,
    legacy_submission_evidence,
    legacy_completed_at
  )
  select
    p_sport,
    v_daily.central_day,
    profiles.profile_id,
    v_daily.game_type,
    v_daily.id,
    progress.revision,
    coalesce(
      progress.submission_state,
      case
        when attempt.id is not null then jsonb_build_object(
          'final_submission', attempt.submission_evidence
        )
        else '{}'::jsonb
      end
    ),
    coalesce(progress.public_state, v_setup.public_setup->'initial_state', '{}'::jsonb),
    attempt.native_score,
    attempt.normalized_score,
    attempt.public_result,
    attempt.submission_evidence,
    attempt.completed_at
  from (
    select progress.profile_id
    from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_daily.id
    union
    select attempt.profile_id
    from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_daily.id
      and attempt.attempt_kind = 'official_first'
  ) profiles
  left join private.daily_challenge_progress progress
    on progress.daily_challenge_id = v_daily.id
   and progress.profile_id = profiles.profile_id
  left join private.daily_challenge_attempts attempt
    on attempt.daily_challenge_id = v_daily.id
   and attempt.profile_id = profiles.profile_id
   and attempt.attempt_kind = 'official_first'
  on conflict (sport, central_day, profile_id) do update
  set
    legacy_revision = excluded.legacy_revision,
    legacy_submission_state = excluded.legacy_submission_state,
    legacy_public_state = excluded.legacy_public_state,
    legacy_native_score = excluded.legacy_native_score,
    legacy_normalized_score = excluded.legacy_normalized_score,
    legacy_public_result = excluded.legacy_public_result,
    legacy_submission_evidence = excluded.legacy_submission_evidence,
    legacy_completed_at = excluded.legacy_completed_at
  where private.daily_two_game_cutover_carryover.restored_at is null;

  get diagnostics v_carried = row_count;

  delete from private.daily_challenge_progress
  where daily_challenge_id = v_daily.id;

  perform set_config('octagon.daily_two_game_cutover', 'on', true);

  delete from private.daily_challenge_attempts
  where daily_challenge_id = v_daily.id;

  delete from private.daily_challenges
  where id = v_daily.id;

  return jsonb_build_object(
    'status', 'reset_for_two_game',
    'sport', p_sport,
    'game_type', v_daily.game_type,
    'legacy_daily_challenge_id', v_daily.id,
    'carried_profiles', v_carried
  );
end;
$$;

revoke all on function public.prepare_daily_two_game_cutover(text)
  from public, anon, authenticated;
grant execute on function public.prepare_daily_two_game_cutover(text)
  to service_role;
