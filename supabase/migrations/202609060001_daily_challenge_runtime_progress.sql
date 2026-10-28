-- Today’s Challenge runtime prerequisite for PR 8.
-- Extends the PR 7 canonical owner with private cross-device progress, safe public
-- restoration, a service-only materialization contract, and one shared hourly wake-up.

create table if not exists private.daily_challenge_progress (
  daily_challenge_id uuid not null references private.daily_challenges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  revision integer not null default 1 check (revision > 0),
  submission_state jsonb not null default '{}'::jsonb
    check (jsonb_typeof(submission_state) = 'object'),
  public_state jsonb not null default '{}'::jsonb
    check (jsonb_typeof(public_state) = 'object'),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (daily_challenge_id, profile_id)
);

create index if not exists daily_challenge_progress_profile_updated
  on private.daily_challenge_progress(profile_id, updated_at desc);

alter table private.daily_challenge_progress enable row level security;
revoke all on private.daily_challenge_progress from public, anon, authenticated;

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
  v_schedule_version := private.daily_challenge_schedule_for_day(v_day);
  if v_schedule_version is null then
    raise exception 'no daily challenge schedule is active for %', v_day;
  end if;
  v_expected_game := private.daily_challenge_expected_game(v_schedule_version, v_day);

  select daily.*
  into v_daily
  from private.daily_challenges daily
  where daily.central_day = v_day
    and daily.schedule_version = v_schedule_version;

  return jsonb_build_object(
    'required', v_daily.id is null,
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

  select daily.*
  into v_daily
  from private.daily_challenges daily
  where daily.id = p_daily_challenge_id;
  if v_daily.id is null then
    raise exception 'daily challenge not found';
  end if;

  select setup.*
  into v_setup
  from private.daily_challenge_setups setup
  where setup.id = v_daily.setup_id;

  select progress.*
  into v_progress
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily.id
    and progress.profile_id = p_profile_id;

  select attempt.*
  into v_attempt
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily.id
    and attempt.profile_id = p_profile_id
    and attempt.attempt_kind = 'official_first';

  return jsonb_build_object(
    'daily_challenge_id', v_daily.id,
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
    'public_state', coalesce(
      v_progress.public_state,
      v_setup.public_setup->'initial_state',
      '{}'::jsonb
    ),
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

create or replace function public.save_daily_challenge_runtime_progress(
  p_daily_challenge_id uuid,
  p_profile_id uuid,
  p_expected_revision integer,
  p_submission_state jsonb,
  p_public_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_daily private.daily_challenges;
  v_progress private.daily_challenge_progress;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to save private daily runtime progress';
  end if;
  if p_daily_challenge_id is null or p_profile_id is null
    or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'complete daily runtime identity and revision are required';
  end if;
  if jsonb_typeof(p_submission_state) is distinct from 'object'
    or jsonb_typeof(p_public_state) is distinct from 'object' then
    raise exception 'daily runtime progress must use object payloads';
  end if;
  if octet_length(p_submission_state::text) > 65536
    or octet_length(p_public_state::text) > 65536 then
    raise exception 'daily runtime progress exceeds the 64KB safety limit';
  end if;
  if not exists (select 1 from public.profiles where id = p_profile_id) then
    raise exception 'daily runtime profile not found';
  end if;

  select daily.*
  into v_daily
  from private.daily_challenges daily
  where daily.id = p_daily_challenge_id;
  if v_daily.id is null then
    raise exception 'daily challenge not found';
  end if;
  if v_daily.central_day <> private.daily_challenge_central_day(now()) then
    raise exception 'official daily progress is writable only for the current Central-time day';
  end if;
  if exists (
    select 1
    from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_daily.id
      and attempt.profile_id = p_profile_id
      and attempt.attempt_kind = 'official_first'
  ) then
    raise exception 'official daily progress is immutable after completion';
  end if;

  if p_expected_revision = 0 then
    insert into private.daily_challenge_progress (
      daily_challenge_id,
      profile_id,
      revision,
      submission_state,
      public_state
    )
    values (
      v_daily.id,
      p_profile_id,
      1,
      p_submission_state,
      p_public_state
    )
    on conflict (daily_challenge_id, profile_id) do nothing
    returning * into v_progress;
  else
    update private.daily_challenge_progress progress
    set revision = progress.revision + 1,
        submission_state = p_submission_state,
        public_state = p_public_state,
        updated_at = now()
    where progress.daily_challenge_id = v_daily.id
      and progress.profile_id = p_profile_id
      and progress.revision = p_expected_revision
    returning * into v_progress;
  end if;

  if v_progress.daily_challenge_id is null then
    raise exception 'daily runtime progress revision is stale'
      using errcode = '40001';
  end if;

  return jsonb_build_object(
    'daily_challenge_id', v_progress.daily_challenge_id,
    'revision', v_progress.revision,
    'public_state', v_progress.public_state,
    'updated_at', v_progress.updated_at
  );
end;
$$;

revoke all on function public.save_daily_challenge_runtime_progress(
  uuid,
  uuid,
  integer,
  jsonb,
  jsonb
) from public, anon, authenticated;
grant execute on function public.save_daily_challenge_runtime_progress(
  uuid,
  uuid,
  integer,
  jsonb,
  jsonb
) to service_role;

create or replace function public.get_my_daily_challenge_progress(
  p_daily_challenge_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_progress private.daily_challenge_progress;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  select daily.*
  into v_daily
  from private.daily_challenges daily
  where daily.id = p_daily_challenge_id;
  if v_daily.id is null then
    raise exception 'daily challenge not found';
  end if;

  select setup.*
  into v_setup
  from private.daily_challenge_setups setup
  where setup.id = v_daily.setup_id;

  select progress.*
  into v_progress
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily.id
    and progress.profile_id = v_profile;

  return jsonb_build_object(
    'daily_challenge_id', v_daily.id,
    'revision', coalesce(v_progress.revision, 0),
    'public_state', coalesce(
      v_progress.public_state,
      v_setup.public_setup->'initial_state',
      '{}'::jsonb
    ),
    'updated_at', v_progress.updated_at
  );
end;
$$;

revoke all on function public.get_my_daily_challenge_progress(uuid) from public, anon;
grant execute on function public.get_my_daily_challenge_progress(uuid) to authenticated;

-- Extend the canonical public projection rather than creating a second Today repository.
create or replace function public.get_today_challenge_public()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_day date := private.daily_challenge_central_day(now());
  v_schedule_version text;
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_progress private.daily_challenge_progress;
  v_attempt private.daily_challenge_attempts;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  v_schedule_version := private.daily_challenge_schedule_for_day(v_day);

  select daily.*
  into v_daily
  from private.daily_challenges daily
  where daily.central_day = v_day
    and daily.schedule_version = v_schedule_version;

  if v_daily.id is null then
    return jsonb_build_object(
      'available', false,
      'central_day', v_day,
      'schedule_version', v_schedule_version
    );
  end if;

  select setup.*
  into v_setup
  from private.daily_challenge_setups setup
  where setup.id = v_daily.setup_id;

  select progress.*
  into v_progress
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily.id
    and progress.profile_id = v_profile;

  select attempt.*
  into v_attempt
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily.id
    and attempt.profile_id = v_profile
    and attempt.attempt_kind = 'official_first';

  return jsonb_build_object(
    'available', true,
    'id', v_daily.id,
    'central_day', v_daily.central_day,
    'schedule_version', v_daily.schedule_version,
    'game_type', v_daily.game_type,
    'setup_id', v_daily.setup_id,
    'setup_key', v_setup.setup_key,
    'content_version', v_daily.content_version,
    'scoring_version', v_daily.scoring_version,
    'fallback_reason', v_daily.fallback_reason,
    'public_setup', v_setup.public_setup,
    'progress_revision', coalesce(v_progress.revision, 0),
    'public_state', coalesce(
      v_progress.public_state,
      v_setup.public_setup->'initial_state',
      '{}'::jsonb
    ),
    'reveal_setup', case
      when v_attempt.id is null then null
      else v_setup.reveal_setup
    end,
    'official_attempt', case
      when v_attempt.id is null then null
      else jsonb_build_object(
        'native_score', v_attempt.native_score,
        'normalized_score', v_attempt.normalized_score,
        'completed_at', v_attempt.completed_at,
        'public_result', v_attempt.public_result
      )
    end
  );
end;
$$;

revoke all on function public.get_today_challenge_public() from public, anon;
grant execute on function public.get_today_challenge_public() to authenticated;

-- Reuse the one trusted hourly database wake-up. The existing Picks monitoring scheduler
-- remains the scheduler owner; this migration extends its command to call the one official
-- daily runtime materializer before the existing monitoring function.
select cron.schedule(
  'octagon-hq-pick-monitoring',
  '7 * * * *',
  $job$
    select
      net.http_post(
        url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/daily-challenge-runtime',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-octagon-scheduler-token', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'octagon_pick_monitoring_scheduler_token'
          )
        ),
        body := '{"mode":"scheduled"}'::jsonb,
        timeout_milliseconds := 60000
      ) as daily_challenge_request_id,
      net.http_post(
        url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/run-pick-monitoring',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-octagon-scheduler-token', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'octagon_pick_monitoring_scheduler_token'
          )
        ),
        body := '{"mode":"scheduled"}'::jsonb,
        timeout_milliseconds := 60000
      ) as pick_monitoring_request_id;
  $job$
);

select cron.alter_job(
  (select jobid from cron.job where jobname = 'octagon-hq-pick-monitoring'),
  active := false
);

create or replace function public.get_pick_monitoring_scheduler_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_job cron.job;
  v_last_run cron.job_run_details;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to inspect pick monitoring scheduler';
  end if;

  select job.* into v_job
  from cron.job job
  where job.jobname = 'octagon-hq-pick-monitoring';

  if v_job.jobid is not null then
    select run.* into v_last_run
    from cron.job_run_details run
    where run.jobid = v_job.jobid
    order by run.start_time desc
    limit 1;
  end if;

  return jsonb_build_object(
    'job_id', v_job.jobid,
    'job_name', v_job.jobname,
    'schedule', v_job.schedule,
    'active', coalesce(v_job.active, false),
    'token_configured', exists (
      select 1 from vault.secrets where name = 'octagon_pick_monitoring_scheduler_token'
    ),
    'function_name', 'run-pick-monitoring',
    'daily_function_name', 'daily-challenge-runtime',
    'command_configured', coalesce(
      v_job.command like '%/functions/v1/daily-challenge-runtime%'
      and v_job.command like '%/functions/v1/run-pick-monitoring%'
      and v_job.command like '%octagon_pick_monitoring_scheduler_token%'
      and v_job.command like '%"mode":"scheduled"%'
      and v_job.command like '%timeout_milliseconds := 60000%',
      false
    ),
    'last_run_status', v_last_run.status,
    'last_run_started_at', v_last_run.start_time,
    'last_run_finished_at', v_last_run.end_time
  );
end;
$$;

revoke all on function public.get_pick_monitoring_scheduler_health() from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_scheduler_health() to service_role;
