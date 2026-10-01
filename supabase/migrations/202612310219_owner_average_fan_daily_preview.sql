-- Owner-only, isolated preview support for a future Average Fan Daily.
-- Preview progress is server-owned in a dedicated private table; official Daily progress,
-- attempts, streaks, and leaderboards remain untouched.


create table if not exists private.owner_average_fan_daily_preview_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  central_day date not null,
  sport text not null check (sport in ('ufc', 'football')),
  revision integer not null check (revision > 0),
  submission_state jsonb not null default '{}'::jsonb
    check (jsonb_typeof(submission_state) = 'object'),
  public_state jsonb not null default '{}'::jsonb
    check (jsonb_typeof(public_state) = 'object'),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, central_day, sport)
);

alter table private.owner_average_fan_daily_preview_progress enable row level security;
revoke all on private.owner_average_fan_daily_preview_progress from public, anon, authenticated;

create or replace function public.get_owner_average_fan_daily_preview_progress(
  p_profile_id uuid,
  p_day date,
  p_sport text,
  p_initial_state jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_progress private.owner_average_fan_daily_preview_progress;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for owner Daily preview progress';
  end if;
  if p_profile_id is null
    or not public.is_pick_control_owner(p_profile_id) then
    raise exception 'owner Daily preview progress is not authorized';
  end if;
  if p_day is null or p_sport not in ('ufc', 'football') then
    raise exception 'owner Daily preview progress identity is invalid';
  end if;
  if jsonb_typeof(p_initial_state) is distinct from 'object' then
    raise exception 'owner Daily preview initial state must be an object';
  end if;

  select progress.*
  into v_progress
  from private.owner_average_fan_daily_preview_progress progress
  where progress.profile_id = p_profile_id
    and progress.central_day = p_day
    and progress.sport = p_sport;

  return jsonb_build_object(
    'revision', coalesce(v_progress.revision, 0),
    'submission_state', coalesce(v_progress.submission_state, '{}'::jsonb),
    'public_state', coalesce(v_progress.public_state, p_initial_state),
    'updated_at', v_progress.updated_at
  );
end;
$$;

revoke all on function public.get_owner_average_fan_daily_preview_progress(uuid, date, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.get_owner_average_fan_daily_preview_progress(uuid, date, text, jsonb)
  to service_role;

create or replace function public.save_owner_average_fan_daily_preview_progress(
  p_profile_id uuid,
  p_day date,
  p_sport text,
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
  v_progress private.owner_average_fan_daily_preview_progress;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for owner Daily preview progress';
  end if;
  if p_profile_id is null
    or not public.is_pick_control_owner(p_profile_id) then
    raise exception 'owner Daily preview progress is not authorized';
  end if;
  if p_day is null or p_sport not in ('ufc', 'football')
    or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'owner Daily preview progress identity is invalid';
  end if;
  if jsonb_typeof(p_submission_state) is distinct from 'object'
    or jsonb_typeof(p_public_state) is distinct from 'object' then
    raise exception 'owner Daily preview progress must use object payloads';
  end if;
  if octet_length(p_submission_state::text) > 65536
    or octet_length(p_public_state::text) > 65536 then
    raise exception 'owner Daily preview progress exceeds the 64KB safety limit';
  end if;

  if p_expected_revision = 0 then
    insert into private.owner_average_fan_daily_preview_progress (
      profile_id,
      central_day,
      sport,
      revision,
      submission_state,
      public_state
    )
    values (
      p_profile_id,
      p_day,
      p_sport,
      1,
      p_submission_state,
      p_public_state
    )
    on conflict (profile_id, central_day, sport) do nothing
    returning * into v_progress;
  else
    update private.owner_average_fan_daily_preview_progress progress
    set revision = progress.revision + 1,
        submission_state = p_submission_state,
        public_state = p_public_state,
        updated_at = now()
    where progress.profile_id = p_profile_id
      and progress.central_day = p_day
      and progress.sport = p_sport
      and progress.revision = p_expected_revision
    returning * into v_progress;
  end if;

  if v_progress.profile_id is null then
    raise exception 'owner Daily preview progress revision is stale'
      using errcode = '40001';
  end if;

  return jsonb_build_object(
    'revision', v_progress.revision,
    'submission_state', v_progress.submission_state,
    'public_state', v_progress.public_state,
    'updated_at', v_progress.updated_at
  );
end;
$$;

revoke all on function public.save_owner_average_fan_daily_preview_progress(
  uuid, date, text, integer, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.save_owner_average_fan_daily_preview_progress(
  uuid, date, text, integer, jsonb, jsonb
) to service_role;

create or replace function public.get_owner_average_fan_daily_preview_descriptor(
  p_profile_id uuid,
  p_day date,
  p_sport text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_schedule_version text;
  v_expected_game text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for owner Daily preview';
  end if;
  if p_profile_id is null
    or not public.is_pick_control_owner(p_profile_id) then
    raise exception 'owner Daily preview is not authorized';
  end if;
  if p_day is null then
    raise exception 'owner Daily preview day is required';
  end if;
  if p_sport not in ('ufc', 'football') then
    raise exception 'owner Daily preview sport must be UFC or Football';
  end if;

  v_schedule_version := private.daily_challenge_schedule_for_day(p_day, p_sport);
  if v_schedule_version is null then
    raise exception 'no Daily schedule is active for % %', p_sport, p_day;
  end if;

  v_expected_game := private.daily_challenge_expected_game(v_schedule_version, p_day);

  return jsonb_build_object(
    'central_day', p_day,
    'sport', p_sport,
    'schedule_version', v_schedule_version,
    'expected_game', v_expected_game
  );
end;
$$;

revoke all on function public.get_owner_average_fan_daily_preview_descriptor(uuid, date, text)
  from public, anon, authenticated;
grant execute on function public.get_owner_average_fan_daily_preview_descriptor(uuid, date, text)
  to service_role;

create or replace function public.grade_owner_average_fan_daily_preview(
  p_profile_id uuid,
  p_scoring_version text,
  p_submission jsonb,
  p_grading_evidence jsonb
)
returns table (
  native_score integer,
  normalized_score integer,
  public_result jsonb,
  grading_snapshot jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for owner Daily preview grading';
  end if;
  if p_profile_id is null
    or not public.is_pick_control_owner(p_profile_id) then
    raise exception 'owner Daily preview grading is not authorized';
  end if;

  return query
  select grade.native_score, grade.normalized_score, grade.public_result, grade.grading_snapshot
  from private.grade_daily_challenge_pre_combo(
    'average_fan',
    p_scoring_version,
    p_submission,
    p_grading_evidence
  ) grade;
end;
$$;

revoke all on function public.grade_owner_average_fan_daily_preview(uuid, text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.grade_owner_average_fan_daily_preview(uuid, text, jsonb, jsonb)
  to service_role;

notify pgrst, 'reload schema';
