-- Activate the approved five-slot 60-day Daily Challenge mix and make the low-frequency
-- Keep 4, Cut 4 slot a two-stage Blind Rank 5 -> Keep 4, Cut 4 official challenge.
-- The canonical Daily grader remains the only scoring entry point; the pre-combo implementation
-- is retained as its private delegate so historical scoring versions remain immutable.
do $$
begin
  if to_regprocedure('private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)') is null then
    if to_regprocedure('private.grade_daily_challenge(text,text,jsonb,jsonb)') is null then
      raise exception 'canonical Daily Challenge grader is missing';
    end if;

    alter function private.grade_daily_challenge(text, text, jsonb, jsonb)
      rename to grade_daily_challenge_pre_combo;
  end if;
end
$$;

revoke all on function private.grade_daily_challenge_pre_combo(text, text, jsonb, jsonb)
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
  v_blind_rank record;
  v_keep_cut record;
  v_combo_score integer;
begin
  if p_game_type = 'keep_4_cut_4'
    and p_scoring_version = 'play-official-score-v4' then
    if jsonb_typeof(p_submission) <> 'object'
      or jsonb_typeof(p_grading_evidence) <> 'object'
      or p_grading_evidence->>'combo_version' <> 'daily-rank-keep-combo-v1' then
      raise exception 'Daily Rank/Keep combo evidence is invalid';
    end if;

    if jsonb_typeof(p_submission->'blind_rank') <> 'object'
      or jsonb_typeof(p_submission->'keep_cut') <> 'object'
      or jsonb_typeof(p_grading_evidence->'blind_rank') <> 'object'
      or jsonb_typeof(p_grading_evidence->'keep_cut') <> 'object' then
      raise exception 'Daily Rank/Keep combo requires both completed stages';
    end if;

    select *
    into v_blind_rank
    from private.grade_daily_challenge_pre_combo(
      'blind_rank_5',
      'play-official-score-v1',
      p_submission->'blind_rank',
      p_grading_evidence->'blind_rank'
    );

    select *
    into v_keep_cut
    from private.grade_daily_challenge_pre_combo(
      'keep_4_cut_4',
      'play-official-score-v1',
      p_submission->'keep_cut',
      p_grading_evidence->'keep_cut'
    );

    v_combo_score := round(
      (v_blind_rank.normalized_score + v_keep_cut.normalized_score) / 2.0
    )::integer;

    native_score := v_combo_score;
    normalized_score := v_combo_score;
    public_result := jsonb_build_object(
      'combo_version', 'daily-rank-keep-combo-v1',
      'blind_rank', v_blind_rank.public_result || jsonb_build_object(
        'normalized_score', v_blind_rank.normalized_score
      ),
      'keep_cut', v_keep_cut.public_result || jsonb_build_object(
        'normalized_score', v_keep_cut.normalized_score
      )
    );
    grading_snapshot := p_grading_evidence;
    return next;
    return;
  end if;

  return query
  select *
  from private.grade_daily_challenge_pre_combo(
    p_game_type,
    p_scoring_version,
    p_submission,
    p_grading_evidence
  );
end;
$$;

revoke all on function private.grade_daily_challenge(text, text, jsonb, jsonb)
  from public, anon, authenticated;

-- Same-day release: August 20 was already materialized as a standalone Keep 4, Cut 4 under
-- play-rotation-v3. Replace only that official day, then let the existing runtime materialize
-- it again under play-rotation-v4 as the new two-stage combo.
do $$
declare
  v_target_day constant date := date '2026-08-20';
  v_source_version constant text := 'play-rotation-v3';
  v_replacement_version constant text := 'play-rotation-v4';
  v_central_today date := private.daily_challenge_central_day(now());
  v_source_starts_on date;
  v_replacement_starts_on date;
  v_active_version text;
  v_expected_game text;
  v_existing_daily_id uuid;
  v_existing_game text;
begin
  select schedule.starts_on
  into v_source_starts_on
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = v_source_version;

  if v_source_starts_on is null then
    raise exception 'source Daily Challenge schedule % is missing', v_source_version;
  end if;

  v_replacement_starts_on := greatest(v_target_day, v_source_starts_on);
  v_expected_game := private.daily_challenge_expected_game(v_source_version, v_target_day);
  if v_expected_game is distinct from 'keep_4_cut_4' then
    raise exception 'expected standalone Keep 4, Cut 4 on %, found %',
      v_target_day,
      coalesce(v_expected_game, '<none>');
  end if;

  select daily.id, daily.game_type
  into v_existing_daily_id, v_existing_game
  from private.daily_challenges daily
  where daily.schedule_version = v_source_version
    and daily.central_day = v_target_day;

  if v_source_starts_on <= v_target_day then
    if v_central_today <> v_target_day then
      raise exception 'August 20 Daily combo replacement is only safe on %, current Central day is %',
        v_target_day,
        v_central_today;
    end if;

    v_active_version := private.daily_challenge_schedule_for_day(v_target_day);
    if v_active_version is distinct from v_source_version then
      raise exception 'expected active Daily Challenge schedule % for %, found %',
        v_source_version,
        v_target_day,
        coalesce(v_active_version, '<none>');
    end if;

    if v_existing_daily_id is null then
      raise exception 'expected an already-published Daily Challenge for % under %',
        v_target_day,
        v_source_version;
    end if;

    if v_existing_game is distinct from 'keep_4_cut_4' then
      raise exception 'refusing to replace unexpected published Daily Challenge game % on %',
        v_existing_game,
        v_target_day;
    end if;
  elsif v_existing_daily_id is not null then
    raise exception 'fresh database replay unexpectedly contains historical Daily Challenge % for %',
      v_existing_daily_id,
      v_target_day;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  values (
    v_replacement_version,
    'America/Chicago',
    date '2026-08-06',
    v_replacement_starts_on,
    array[
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'keep_4_cut_4',
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'find_leader',
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'wavelength',
      'find_leader',
      'blind_resume',
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'keep_4_cut_4',
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'find_leader',
      'hit_the_number',
      'blind_resume',
      'wavelength',
      'find_leader',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'wavelength',
      'find_leader',
      'blind_resume',
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'keep_4_cut_4',
      'hit_the_number',
      'find_leader',
      'wavelength',
      'blind_resume',
      'find_leader',
      'hit_the_number',
      'blind_resume',
      'wavelength',
      'find_leader',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'wavelength',
      'find_leader',
      'blind_resume'
    ]::text[]
  )
  on conflict (version) do nothing;

  if v_source_starts_on <= v_target_day then
    alter table private.daily_challenge_attempts
      disable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      disable trigger daily_challenges_immutable;

    delete from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_existing_daily_id;

    delete from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_existing_daily_id;

    delete from private.daily_challenges daily
    where daily.id = v_existing_daily_id
      and daily.schedule_version = v_source_version
      and daily.central_day = v_target_day;

    alter table private.daily_challenge_attempts
      enable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      enable trigger daily_challenges_immutable;
  end if;
end
$$;