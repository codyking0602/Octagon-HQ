-- PR 7: canonical generalized Today's Challenge backend.
-- Official setup, grading, attempt, history, streak, and leaderboard state is server-owned.
create schema if not exists private;

create table if not exists private.daily_challenge_schedule_versions (
  version text primary key,
  time_zone text not null default 'America/Chicago'
    check (time_zone = 'America/Chicago'),
  anchor_day date not null,
  starts_on date not null,
  game_cycle text[] not null
    check (coalesce(array_length(game_cycle, 1), 0) > 0),
  created_at timestamptz not null default now(),
  check (
    game_cycle <@ array[
      'find_leader',
      'blind_resume',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    ]::text[]
  )
);

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle
)
values (
  'find-leader-v1',
  'America/Chicago',
  date '2026-07-16',
  date '1993-11-12',
  array['find_leader']::text[]
)
on conflict (version) do nothing;

create table if not exists private.daily_challenge_setups (
  id uuid primary key default extensions.gen_random_uuid(),
  game_type text not null check (
    game_type in (
      'find_leader',
      'blind_resume',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    )
  ),
  setup_key text not null,
  content_version text not null,
  scoring_version text not null,
  public_setup jsonb not null default '{}'::jsonb,
  reveal_setup jsonb not null default '{}'::jsonb,
  private_setup_evidence jsonb not null default '{}'::jsonb,
  private_grading_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (game_type, setup_key, content_version, scoring_version)
);

create table if not exists private.daily_challenges (
  id uuid primary key default extensions.gen_random_uuid(),
  central_day date not null,
  schedule_version text not null references private.daily_challenge_schedule_versions(version),
  game_type text not null check (
    game_type in (
      'find_leader',
      'blind_resume',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    )
  ),
  setup_id uuid not null references private.daily_challenge_setups(id),
  content_version text not null,
  scoring_version text not null,
  fallback_reason text,
  published_at timestamptz not null default now(),
  unique (schedule_version, central_day)
);

create table if not exists private.daily_challenge_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  daily_challenge_id uuid not null references private.daily_challenges(id),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  attempt_kind text not null check (attempt_kind in ('official_first', 'replay')),
  native_score integer not null,
  normalized_score integer not null check (normalized_score between 0 and 100),
  completed_at timestamptz not null default now(),
  content_version text not null,
  scoring_version text not null,
  public_result jsonb not null default '{}'::jsonb,
  submission_evidence jsonb not null default '{}'::jsonb,
  grading_evidence_snapshot jsonb not null default '{}'::jsonb,
  legacy_find_leader_day date,
  created_at timestamptz not null default now()
);

create unique index if not exists daily_challenge_one_official_attempt
  on private.daily_challenge_attempts(daily_challenge_id, profile_id)
  where attempt_kind = 'official_first';

create index if not exists daily_challenge_attempts_profile_completed
  on private.daily_challenge_attempts(profile_id, completed_at desc);

alter table private.daily_challenge_schedule_versions enable row level security;
alter table private.daily_challenge_setups enable row level security;
alter table private.daily_challenges enable row level security;
alter table private.daily_challenge_attempts enable row level security;

revoke all on private.daily_challenge_schedule_versions from public, anon, authenticated;
revoke all on private.daily_challenge_setups from public, anon, authenticated;
revoke all on private.daily_challenges from public, anon, authenticated;
revoke all on private.daily_challenge_attempts from public, anon, authenticated;

create or replace function private.reject_daily_challenge_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'official daily challenge records are immutable'
    using errcode = '55000';
end;
$$;

revoke all on function private.reject_daily_challenge_mutation()
  from public, anon, authenticated;

drop trigger if exists daily_schedule_versions_immutable
  on private.daily_challenge_schedule_versions;
create trigger daily_schedule_versions_immutable
before update or delete on private.daily_challenge_schedule_versions
for each row execute function private.reject_daily_challenge_mutation();

drop trigger if exists daily_challenge_setups_immutable
  on private.daily_challenge_setups;
create trigger daily_challenge_setups_immutable
before update or delete on private.daily_challenge_setups
for each row execute function private.reject_daily_challenge_mutation();

drop trigger if exists daily_challenges_immutable
  on private.daily_challenges;
create trigger daily_challenges_immutable
before update or delete on private.daily_challenges
for each row execute function private.reject_daily_challenge_mutation();

drop trigger if exists daily_challenge_attempts_immutable
  on private.daily_challenge_attempts;
create trigger daily_challenge_attempts_immutable
before update or delete on private.daily_challenge_attempts
for each row execute function private.reject_daily_challenge_mutation();

create or replace function private.daily_challenge_central_day(
  p_at timestamptz default now()
)
returns date
language sql
stable
set search_path = ''
as $$
  select (p_at at time zone 'America/Chicago')::date;
$$;

revoke all on function private.daily_challenge_central_day(timestamptz)
  from public, anon, authenticated;

create or replace function private.daily_challenge_schedule_for_day(p_day date)
returns text
language sql
stable
set search_path = ''
as $$
  select schedule.version
  from private.daily_challenge_schedule_versions schedule
  where schedule.starts_on <= p_day
  order by schedule.starts_on desc, schedule.created_at desc, schedule.version desc
  limit 1;
$$;

revoke all on function private.daily_challenge_schedule_for_day(date)
  from public, anon, authenticated;

create or replace function private.daily_challenge_expected_game(
  p_schedule_version text,
  p_day date
)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_schedule private.daily_challenge_schedule_versions;
  v_length integer;
  v_offset integer;
begin
  select *
  into v_schedule
  from private.daily_challenge_schedule_versions
  where version = p_schedule_version;

  if v_schedule.version is null then
    raise exception 'unknown daily schedule version %', p_schedule_version;
  end if;

  v_length := array_length(v_schedule.game_cycle, 1);
  v_offset := (((p_day - v_schedule.anchor_day) % v_length) + v_length) % v_length;

  return v_schedule.game_cycle[v_offset + 1];
end;
$$;

revoke all on function private.daily_challenge_expected_game(text, date)
  from public, anon, authenticated;

create or replace function private.daily_challenge_text_array(
  p_value jsonb,
  p_label text,
  p_expected_length integer,
  p_require_unique boolean default true
)
returns text[]
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_values text[];
begin
  if p_value is null or jsonb_typeof(p_value) <> 'array' then
    raise exception '% must be an array', p_label;
  end if;

  select coalesce(array_agg(item.value order by item.ordinality), array[]::text[])
  into v_values
  from jsonb_array_elements_text(p_value) with ordinality as item(value, ordinality);

  if p_expected_length is not null
    and coalesce(array_length(v_values, 1), 0) <> p_expected_length then
    raise exception '% must contain exactly % values', p_label, p_expected_length;
  end if;

  if p_require_unique
    and (
      select count(*)
      from unnest(v_values) value
    ) <> (
      select count(distinct value)
      from unnest(v_values) value
    ) then
    raise exception '% must not contain duplicate values', p_label;
  end if;

  return v_values;
end;
$$;

revoke all on function private.daily_challenge_text_array(jsonb, text, integer, boolean)
  from public, anon, authenticated;

create or replace function private.grade_daily_challenge(
  p_game_type text,
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
immutable
set search_path = ''
as $$
declare
  v_board text[];
  v_submitted text[];
  v_expected text[];
  v_cuts text[];
  v_guesses text[];
  v_leader text;
  v_target integer;
  v_tolerance integer;
  v_count integer := 0;
  v_i integer;
  v_j integer;
  v_left_rating integer;
  v_right_rating integer;
begin
  if p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;

  if jsonb_typeof(p_submission) <> 'object'
    or jsonb_typeof(p_grading_evidence) <> 'object' then
    raise exception 'daily submission and grading evidence must be objects';
  end if;

  if p_game_type = 'find_leader' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'candidate_ids',
      'Find the Leader candidate ids',
      10,
      true
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'eliminated_ids',
      'Find the Leader eliminated ids',
      null,
      true
    );
    v_leader := p_grading_evidence->>'leader_id';

    if v_leader is null or not (v_leader = any(v_board)) then
      raise exception 'Find the Leader grading evidence is invalid';
    end if;
    if coalesce(array_length(v_submitted, 1), 0) < 1
      or array_length(v_submitted, 1) > 9 then
      raise exception 'Find the Leader completion must contain one through nine eliminations';
    end if;
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
    ) then
      raise exception 'Find the Leader submission contains an unknown fighter';
    end if;

    if v_leader = any(v_submitted) then
      if v_submitted[array_length(v_submitted, 1)] <> v_leader then
        raise exception 'Find the Leader run must end when the leader is eliminated';
      end if;
      native_score := array_length(v_submitted, 1);
    else
      if array_length(v_submitted, 1) <> 9 then
        raise exception 'Find the Leader perfect run must eliminate all nine non-leaders';
      end if;
      native_score := 10;
    end if;

    normalized_score := native_score * 10;
    public_result := jsonb_build_object(
      'eliminated_ids', to_jsonb(v_submitted),
      'perfect', native_score = 10
    );

  elsif p_game_type = 'blind_resume' then
    v_expected := private.daily_challenge_text_array(
      p_grading_evidence->'correct_choices',
      'Blind Resume correct choices',
      5,
      false
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'choices',
      'Blind Resume choices',
      5,
      false
    );

    for v_i in 1..5 loop
      if v_submitted[v_i] = v_expected[v_i] then
        v_count := v_count + 1;
      end if;
    end loop;

    native_score := v_count;
    normalized_score := v_count * 20;
    public_result := jsonb_build_object(
      'choices', to_jsonb(v_submitted),
      'correct_picks', v_count
    );

  elsif p_game_type = 'wavelength' then
    v_guesses := private.daily_challenge_text_array(
      p_submission->'guesses',
      'Wavelength guesses',
      4,
      false
    );

    if coalesce(p_grading_evidence->>'target', '') !~ '^[0-9]+$' then
      raise exception 'Wavelength target is invalid';
    end if;
    v_target := (p_grading_evidence->>'target')::integer;
    if v_target < 1 or v_target > 100 then
      raise exception 'Wavelength target must be from 1 through 100';
    end if;

    for v_i in 1..4 loop
      if v_guesses[v_i] !~ '^[0-9]+$'
        or v_guesses[v_i]::integer < 1
        or v_guesses[v_i]::integer > 100 then
        raise exception 'Wavelength guesses must be integers from 1 through 100';
      end if;
    end loop;

    native_score := greatest(0, 100 - abs(v_guesses[4]::integer - v_target));
    normalized_score := native_score;
    public_result := jsonb_build_object(
      'guesses', to_jsonb(v_guesses),
      'distance', abs(v_guesses[4]::integer - v_target)
    );

  elsif p_game_type = 'blind_rank_5' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'fighter_ids',
      'Blind Rank fighter ids',
      5,
      true
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'ordered_ids',
      'Blind Rank ordered ids',
      5,
      true
    );

    if jsonb_typeof(p_grading_evidence->'ratings') <> 'object'
      or jsonb_object_length(p_grading_evidence->'ratings') <> 5 then
      raise exception 'Blind Rank ratings are invalid';
    end if;
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
        or not ((p_grading_evidence->'ratings') ? submitted)
    ) then
      raise exception 'Blind Rank submission does not match the official board';
    end if;

    v_tolerance := coalesce((p_grading_evidence->>'tolerance')::integer, 1);
    if v_tolerance < 0 then
      raise exception 'Blind Rank tolerance is invalid';
    end if;

    for v_i in 1..4 loop
      for v_j in (v_i + 1)..5 loop
        v_left_rating := (p_grading_evidence->'ratings'->>v_submitted[v_i])::integer;
        v_right_rating := (p_grading_evidence->'ratings'->>v_submitted[v_j])::integer;
        if v_left_rating >= v_right_rating - v_tolerance then
          v_count := v_count + 1;
        end if;
      end loop;
    end loop;

    native_score := v_count;
    normalized_score := v_count * 10;
    public_result := jsonb_build_object(
      'ordered_ids', to_jsonb(v_submitted),
      'correct_comparisons', v_count
    );

  elsif p_game_type = 'keep_4_cut_4' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'fighter_ids',
      'Keep 4 Cut 4 fighter ids',
      8,
      true
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'kept_ids',
      'Keep 4 Cut 4 kept ids',
      4,
      true
    );

    if jsonb_typeof(p_grading_evidence->'ratings') <> 'object'
      or jsonb_object_length(p_grading_evidence->'ratings') <> 8 then
      raise exception 'Keep 4 Cut 4 ratings are invalid';
    end if;
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
        or not ((p_grading_evidence->'ratings') ? submitted)
    ) then
      raise exception 'Keep 4 Cut 4 submission does not match the official board';
    end if;

    select array_agg(board_id order by ordinality)
    into v_cuts
    from unnest(v_board) with ordinality as board(board_id, ordinality)
    where not (board_id = any(v_submitted));

    v_tolerance := coalesce((p_grading_evidence->>'tolerance')::integer, 1);
    if v_tolerance < 0 then
      raise exception 'Keep 4 Cut 4 tolerance is invalid';
    end if;

    for v_i in 1..4 loop
      for v_j in 1..4 loop
        v_left_rating := (p_grading_evidence->'ratings'->>v_submitted[v_i])::integer;
        v_right_rating := (p_grading_evidence->'ratings'->>v_cuts[v_j])::integer;
        if v_left_rating >= v_right_rating - v_tolerance then
          v_count := v_count + 1;
        end if;
      end loop;
    end loop;

    native_score := v_count;
    normalized_score := round(v_count * 100.0 / 16.0)::integer;
    public_result := jsonb_build_object(
      'kept_ids', to_jsonb(v_submitted),
      'correct_comparisons', v_count
    );

  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;

  grading_snapshot := p_grading_evidence;
  return next;
end;
$$;

revoke all on function private.grade_daily_challenge(text, text, jsonb, jsonb)
  from public, anon, authenticated;

create or replace function public.publish_daily_challenge_setup(
  p_central_day date,
  p_schedule_version text,
  p_game_type text,
  p_setup_key text,
  p_content_version text,
  p_scoring_version text,
  p_public_setup jsonb default '{}'::jsonb,
  p_reveal_setup jsonb default '{}'::jsonb,
  p_private_setup_evidence jsonb default '{}'::jsonb,
  p_private_grading_evidence jsonb default '{}'::jsonb,
  p_fallback_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected_game text;
  v_setup private.daily_challenge_setups;
  v_daily private.daily_challenges;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required to publish daily challenge setup';
  end if;

  if p_central_day is null
    or nullif(trim(p_schedule_version), '') is null
    or nullif(trim(p_setup_key), '') is null
    or nullif(trim(p_content_version), '') is null
    or nullif(trim(p_scoring_version), '') is null then
    raise exception 'complete daily identity is required';
  end if;

  v_expected_game := private.daily_challenge_expected_game(
    p_schedule_version,
    p_central_day
  );

  if p_game_type <> v_expected_game
    and not (
      p_game_type = 'find_leader'
      and nullif(trim(p_fallback_reason), '') is not null
    ) then
    raise exception 'game % does not match schedule % for %',
      p_game_type,
      p_schedule_version,
      p_central_day;
  end if;

  if p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;

  insert into private.daily_challenge_setups (
    game_type,
    setup_key,
    content_version,
    scoring_version,
    public_setup,
    reveal_setup,
    private_setup_evidence,
    private_grading_evidence
  )
  values (
    p_game_type,
    p_setup_key,
    p_content_version,
    p_scoring_version,
    coalesce(p_public_setup, '{}'::jsonb),
    coalesce(p_reveal_setup, '{}'::jsonb),
    coalesce(p_private_setup_evidence, '{}'::jsonb),
    coalesce(p_private_grading_evidence, '{}'::jsonb)
  )
  on conflict (game_type, setup_key, content_version, scoring_version)
  do nothing
  returning * into v_setup;

  if v_setup.id is null then
    select *
    into v_setup
    from private.daily_challenge_setups
    where game_type = p_game_type
      and setup_key = p_setup_key
      and content_version = p_content_version
      and scoring_version = p_scoring_version;

    if v_setup.public_setup <> coalesce(p_public_setup, '{}'::jsonb)
      or v_setup.reveal_setup <> coalesce(p_reveal_setup, '{}'::jsonb)
      or v_setup.private_setup_evidence <> coalesce(p_private_setup_evidence, '{}'::jsonb)
      or v_setup.private_grading_evidence <> coalesce(p_private_grading_evidence, '{}'::jsonb) then
      raise exception 'setup identity already exists with different immutable evidence';
    end if;
  end if;

  insert into private.daily_challenges (
    central_day,
    schedule_version,
    game_type,
    setup_id,
    content_version,
    scoring_version,
    fallback_reason
  )
  values (
    p_central_day,
    p_schedule_version,
    p_game_type,
    v_setup.id,
    p_content_version,
    p_scoring_version,
    nullif(trim(p_fallback_reason), '')
  )
  on conflict (schedule_version, central_day)
  do nothing
  returning * into v_daily;

  if v_daily.id is null then
    select *
    into v_daily
    from private.daily_challenges
    where schedule_version = p_schedule_version
      and central_day = p_central_day;

    if v_daily.game_type <> p_game_type
      or v_daily.setup_id <> v_setup.id
      or v_daily.content_version <> p_content_version
      or v_daily.scoring_version <> p_scoring_version
      or v_daily.fallback_reason is distinct from nullif(trim(p_fallback_reason), '') then
      raise exception 'daily identity already exists with different immutable evidence';
    end if;
  end if;

  return jsonb_build_object(
    'id', v_daily.id,
    'central_day', v_daily.central_day,
    'schedule_version', v_daily.schedule_version,
    'game_type', v_daily.game_type,
    'setup_id', v_daily.setup_id,
    'setup_key', v_setup.setup_key,
    'content_version', v_daily.content_version,
    'scoring_version', v_daily.scoring_version,
    'fallback_reason', v_daily.fallback_reason
  );
end;
$$;

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
  v_attempt private.daily_challenge_attempts;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  v_schedule_version := private.daily_challenge_schedule_for_day(v_day);

  select *
  into v_daily
  from private.daily_challenges
  where central_day = v_day
    and schedule_version = v_schedule_version;

  if v_daily.id is null then
    return jsonb_build_object(
      'available', false,
      'central_day', v_day,
      'schedule_version', v_schedule_version
    );
  end if;

  select *
  into v_setup
  from private.daily_challenge_setups
  where id = v_daily.setup_id;

  select *
  into v_attempt
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily.id
    and profile_id = v_profile
    and attempt_kind = 'official_first';

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

create or replace function public.submit_my_daily_challenge_attempt(
  p_daily_challenge_id uuid,
  p_submission jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_grade record;
  v_official private.daily_challenge_attempts;
  v_replay private.daily_challenge_attempts;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  select *
  into v_daily
  from private.daily_challenges
  where id = p_daily_challenge_id;

  if v_daily.id is null then
    raise exception 'daily challenge not found';
  end if;
  if v_daily.central_day <> v_today then
    raise exception 'official daily submissions are accepted only for the current Central-time day';
  end if;

  select *
  into v_setup
  from private.daily_challenge_setups
  where id = v_daily.setup_id;

  select *
  into v_grade
  from private.grade_daily_challenge(
    v_daily.game_type,
    v_daily.scoring_version,
    coalesce(p_submission, '{}'::jsonb),
    v_setup.private_grading_evidence
  );

  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    content_version,
    scoring_version,
    public_result,
    submission_evidence,
    grading_evidence_snapshot
  )
  values (
    v_daily.id,
    v_profile,
    'official_first',
    v_grade.native_score,
    v_grade.normalized_score,
    v_daily.content_version,
    v_daily.scoring_version,
    v_grade.public_result,
    coalesce(p_submission, '{}'::jsonb),
    v_grade.grading_snapshot
  )
  on conflict (daily_challenge_id, profile_id)
    where attempt_kind = 'official_first'
  do nothing
  returning * into v_official;

  if v_official.id is not null then
    return jsonb_build_object(
      'attempt_kind', 'official_first',
      'native_score', v_official.native_score,
      'normalized_score', v_official.normalized_score,
      'completed_at', v_official.completed_at,
      'content_version', v_official.content_version,
      'scoring_version', v_official.scoring_version,
      'public_result', v_official.public_result
    );
  end if;

  select *
  into v_official
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily.id
    and profile_id = v_profile
    and attempt_kind = 'official_first';

  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    content_version,
    scoring_version,
    public_result,
    submission_evidence,
    grading_evidence_snapshot
  )
  values (
    v_daily.id,
    v_profile,
    'replay',
    v_grade.native_score,
    v_grade.normalized_score,
    v_daily.content_version,
    v_daily.scoring_version,
    v_grade.public_result,
    coalesce(p_submission, '{}'::jsonb),
    v_grade.grading_snapshot
  )
  returning * into v_replay;

  return jsonb_build_object(
    'attempt_kind', 'replay',
    'official_native_score', v_official.native_score,
    'official_normalized_score', v_official.normalized_score,
    'replay_native_score', v_replay.native_score,
    'replay_normalized_score', v_replay.normalized_score,
    'completed_at', v_replay.completed_at,
    'content_version', v_official.content_version,
    'scoring_version', v_official.scoring_version,
    'public_result', v_replay.public_result
  );
end;
$$;

-- Existing Find the Leader rows are copied into the immutable generalized store.
-- The canonical projection also includes later compatibility writes until PR 8 moves the
-- current frontend adapter to submit_my_daily_challenge_attempt.
insert into private.daily_challenge_setups (
  game_type,
  setup_key,
  content_version,
  scoring_version,
  public_setup,
  reveal_setup,
  private_setup_evidence,
  private_grading_evidence
)
select distinct
  'find_leader',
  'legacy-find-leader:' || history.day::text,
  'legacy-find-leader-content-v1',
  'play-official-score-v1',
  jsonb_build_object('legacy', true, 'day', history.day),
  jsonb_build_object('legacy', true),
  '{}'::jsonb,
  jsonb_build_object('legacy_import', true)
from public.find_leader_history history
on conflict (game_type, setup_key, content_version, scoring_version)
do nothing;

insert into private.daily_challenges (
  central_day,
  schedule_version,
  game_type,
  setup_id,
  content_version,
  scoring_version,
  fallback_reason
)
select
  history.day,
  'find-leader-v1',
  'find_leader',
  setup.id,
  setup.content_version,
  setup.scoring_version,
  'legacy_find_leader_history'
from (
  select distinct day
  from public.find_leader_history
) history
join private.daily_challenge_setups setup
  on setup.game_type = 'find_leader'
 and setup.setup_key = 'legacy-find-leader:' || history.day::text
 and setup.content_version = 'legacy-find-leader-content-v1'
 and setup.scoring_version = 'play-official-score-v1'
on conflict (schedule_version, central_day)
do nothing;

insert into private.daily_challenge_attempts (
  daily_challenge_id,
  profile_id,
  attempt_kind,
  native_score,
  normalized_score,
  completed_at,
  content_version,
  scoring_version,
  public_result,
  submission_evidence,
  grading_evidence_snapshot,
  legacy_find_leader_day
)
select
  daily.id,
  history.profile_id,
  'official_first',
  history.official_score,
  history.official_score * 10,
  history.completed_at,
  daily.content_version,
  daily.scoring_version,
  jsonb_build_object(
    'legacy_find_leader', true,
    'best_score', history.best_score,
    'attempts', history.attempts,
    'updated_at', history.updated_at
  ),
  '{}'::jsonb,
  jsonb_build_object('legacy_import', true),
  history.day
from public.find_leader_history history
join private.daily_challenges daily
  on daily.central_day = history.day
 and daily.schedule_version = 'find-leader-v1'
 and daily.game_type = 'find_leader'
on conflict (daily_challenge_id, profile_id)
  where attempt_kind = 'official_first'
do nothing;

create or replace view private.daily_challenge_history as
select
  daily.id as daily_challenge_id,
  attempt.profile_id,
  daily.central_day,
  daily.schedule_version,
  daily.game_type,
  attempt.native_score,
  attempt.normalized_score,
  attempt.completed_at,
  attempt.content_version,
  attempt.scoring_version,
  attempt.public_result,
  'generalized'::text as source
from private.daily_challenge_attempts attempt
join private.daily_challenges daily
  on daily.id = attempt.daily_challenge_id
where attempt.attempt_kind = 'official_first'

union all

select
  null::uuid as daily_challenge_id,
  legacy.profile_id,
  legacy.day as central_day,
  'find-leader-v1'::text as schedule_version,
  'find_leader'::text as game_type,
  legacy.official_score::integer as native_score,
  (legacy.official_score * 10)::integer as normalized_score,
  legacy.completed_at,
  'legacy-find-leader-content-v1'::text as content_version,
  'play-official-score-v1'::text as scoring_version,
  jsonb_build_object(
    'legacy_find_leader', true,
    'best_score', legacy.best_score,
    'attempts', legacy.attempts,
    'updated_at', legacy.updated_at
  ) as public_result,
  'legacy_find_leader'::text as source
from public.find_leader_history legacy
where not exists (
  select 1
  from private.daily_challenge_attempts attempt
  join private.daily_challenges daily
    on daily.id = attempt.daily_challenge_id
  where attempt.attempt_kind = 'official_first'
    and attempt.profile_id = legacy.profile_id
    and daily.central_day = legacy.day
    and daily.game_type = 'find_leader'
);

revoke all on private.daily_challenge_history from public, anon, authenticated;

create or replace function public.list_my_daily_challenge_history()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'day', history.central_day,
        'schedule_version', history.schedule_version,
        'game_type', history.game_type,
        'native_score', history.native_score,
        'normalized_score', history.normalized_score,
        'completed_at', history.completed_at,
        'content_version', history.content_version,
        'scoring_version', history.scoring_version,
        'public_result', history.public_result
      )
      order by history.central_day desc
    )
    from (
      select *
      from private.daily_challenge_history
      where profile_id = v_profile
      order by central_day desc
      limit 365
    ) history
  ), '[]'::jsonb);
end;
$$;

create or replace function public.get_daily_challenge_leaderboard(
  p_day date,
  p_schedule_version text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_entries jsonb;
  v_count integer;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_day is null or nullif(trim(p_schedule_version), '') is null then
    raise exception 'daily leaderboard identity required';
  end if;

  if not exists (
    select 1
    from private.daily_challenge_history history
    where history.profile_id = v_profile
      and history.central_day = p_day
      and history.schedule_version = p_schedule_version
  ) then
    return jsonb_build_object(
      'unlocked', false,
      'player_count', 0,
      'entries', '[]'::jsonb
    );
  end if;

  with ranked as (
    select
      history.profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      history.game_type,
      history.native_score,
      history.normalized_score,
      rank() over (order by history.normalized_score desc)::integer as score_rank
    from private.daily_challenge_history history
    join public.profiles profile
      on profile.id = history.profile_id
    left join public.profile_preferences preference
      on preference.profile_id = history.profile_id
    where history.central_day = p_day
      and history.schedule_version = p_schedule_version
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'rank', ranked.score_rank,
          'display_name', ranked.display_name,
          'initials', ranked.initials,
          'avatar_photo_data', ranked.avatar_photo_data,
          'game_type', ranked.game_type,
          'native_score', ranked.native_score,
          'normalized_score', ranked.normalized_score,
          'official_score', case
            when ranked.game_type = 'find_leader' then ranked.native_score
            else ranked.normalized_score
          end,
          'is_current_user', ranked.profile_id = v_profile
        )
        order by ranked.score_rank, ranked.display_name
      ),
      '[]'::jsonb
    )
  into v_count, v_entries
  from ranked;

  return jsonb_build_object(
    'unlocked', true,
    'player_count', coalesce(v_count, 0),
    'entries', coalesce(v_entries, '[]'::jsonb)
  );
end;
$$;

create or replace function public.get_my_daily_challenge_streak()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_day date;
  v_previous date;
  v_expected date;
  v_run integer := 0;
  v_best integer := 0;
  v_current integer := 0;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  for v_day in
    select distinct central_day
    from private.daily_challenge_history
    where profile_id = v_profile
    order by central_day
  loop
    if v_previous is null or v_day = v_previous + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    v_best := greatest(v_best, v_run);
    v_previous := v_day;
  end loop;

  if exists (
    select 1
    from private.daily_challenge_history
    where profile_id = v_profile
      and central_day = v_today
  ) then
    v_expected := v_today;
  else
    v_expected := v_today - 1;
  end if;

  for v_day in
    select distinct central_day
    from private.daily_challenge_history
    where profile_id = v_profile
      and central_day <= v_expected
    order by central_day desc
  loop
    exit when v_day <> v_expected;
    v_current := v_current + 1;
    v_expected := v_expected - 1;
  end loop;

  return jsonb_build_object(
    'current_streak', v_current,
    'best_streak', v_best
  );
end;
$$;

create or replace function public.list_my_find_leader_history()
returns setof public.find_leader_history
language sql
stable
security definer
set search_path = ''
as $$
  with official as (
    select *
    from private.daily_challenge_history
    where profile_id = auth.uid()
      and game_type = 'find_leader'
  )
  select
    history.profile_id,
    history.central_day as day,
    history.native_score::smallint as official_score,
    greatest(
      history.native_score,
      coalesce(legacy.best_score::integer, history.native_score),
      coalesce((history.public_result->>'best_score')::integer, history.native_score),
      coalesce((
        select max(attempt.native_score)
        from private.daily_challenge_attempts attempt
        where attempt.daily_challenge_id = history.daily_challenge_id
          and attempt.profile_id = history.profile_id
      ), history.native_score)
    )::smallint as best_score,
    greatest(
      1,
      coalesce(legacy.attempts, 1),
      coalesce((history.public_result->>'attempts')::integer, 1),
      coalesce((
        select count(*)::integer
        from private.daily_challenge_attempts attempt
        where attempt.daily_challenge_id = history.daily_challenge_id
          and attempt.profile_id = history.profile_id
      ), 1)
    )::integer as attempts,
    history.completed_at,
    coalesce(
      legacy.updated_at,
      (history.public_result->>'updated_at')::timestamptz,
      history.completed_at
    ) as updated_at
  from official history
  left join public.find_leader_history legacy
    on legacy.profile_id = history.profile_id
   and legacy.day = history.central_day
  order by history.central_day desc
  limit 180;
$$;

create or replace function public.get_find_leader_daily_leaderboard(p_day date)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_daily_challenge_leaderboard(
    p_day,
    'find-leader-v1'
  );
$$;

revoke all on function public.publish_daily_challenge_setup(
  date,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  text
) from public, anon, authenticated;
grant execute on function public.publish_daily_challenge_setup(
  date,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  text
) to service_role;

revoke all on function public.get_today_challenge_public() from public, anon;
grant execute on function public.get_today_challenge_public() to authenticated;

revoke all on function public.submit_my_daily_challenge_attempt(uuid, jsonb)
  from public, anon;
grant execute on function public.submit_my_daily_challenge_attempt(uuid, jsonb)
  to authenticated;

revoke all on function public.list_my_daily_challenge_history()
  from public, anon;
grant execute on function public.list_my_daily_challenge_history()
  to authenticated;

revoke all on function public.get_daily_challenge_leaderboard(date, text)
  from public, anon;
grant execute on function public.get_daily_challenge_leaderboard(date, text)
  to authenticated;

revoke all on function public.get_my_daily_challenge_streak()
  from public, anon;
grant execute on function public.get_my_daily_challenge_streak()
  to authenticated;

revoke all on function public.list_my_find_leader_history()
  from public, anon;
grant execute on function public.list_my_find_leader_history()
  to authenticated;

revoke all on function public.get_find_leader_daily_leaderboard(date)
  from public, anon;
grant execute on function public.get_find_leader_daily_leaderboard(date)
  to authenticated;
