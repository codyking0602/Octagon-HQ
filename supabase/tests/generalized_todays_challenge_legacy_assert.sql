do $$
declare
  v_one uuid := '72000000-0000-4000-8000-000000000001';
  v_two uuid := '72000000-0000-4000-8000-000000000002';
  v_row public.find_leader_history;
  v_history jsonb;
  v_board jsonb;
begin
  if (
    select count(*)
    from private.daily_challenges
    where central_day = date '2026-07-01'
      and schedule_version = 'find-leader-v1'
      and game_type = 'find_leader'
  ) <> 1 then
    raise exception 'legacy migration did not create exactly one generalized daily row';
  end if;

  if (
    select count(*)
    from private.daily_challenge_attempts attempt
    join private.daily_challenges daily
      on daily.id = attempt.daily_challenge_id
    where daily.central_day = date '2026-07-01'
      and daily.schedule_version = 'find-leader-v1'
      and attempt.attempt_kind = 'official_first'
  ) <> 2 then
    raise exception 'legacy migration duplicated or lost official attempts';
  end if;

  if not exists (
    select 1
    from private.daily_challenge_attempts attempt
    join private.daily_challenges daily
      on daily.id = attempt.daily_challenge_id
    where daily.central_day = date '2026-07-01'
      and attempt.profile_id = v_one
      and attempt.native_score = 4
      and attempt.normalized_score = 40
      and attempt.content_version = 'legacy-find-leader-content-v1'
      and attempt.scoring_version = 'play-official-score-v1'
      and attempt.completed_at = timestamptz '2026-07-01 18:00:00+00'
      and (attempt.public_result->>'best_score')::integer = 9
      and (attempt.public_result->>'attempts')::integer = 3
  ) then
    raise exception 'legacy native/normalized/version/first-attempt evidence changed during migration';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_one::text, true);

  select *
  into v_row
  from public.list_my_find_leader_history()
  where day = date '2026-07-01';

  if v_row.official_score <> 4
    or v_row.best_score <> 9
    or v_row.attempts <> 3
    or v_row.completed_at <> timestamptz '2026-07-01 18:00:00+00'
    or v_row.updated_at <> timestamptz '2026-07-01 18:05:00+00' then
    raise exception 'legacy Find the Leader compatibility projection changed historical values: %', row_to_json(v_row);
  end if;

  v_history := public.list_my_daily_challenge_history();
  if jsonb_array_length(v_history) <> 1
    or (v_history->0->>'native_score')::integer <> 4
    or (v_history->0->>'normalized_score')::integer <> 40
    or v_history->0->>'content_version' <> 'legacy-find-leader-content-v1'
    or v_history->0->>'scoring_version' <> 'play-official-score-v1' then
    raise exception 'generalized history did not preserve legacy result/version snapshots: %', v_history;
  end if;

  v_board := public.get_find_leader_daily_leaderboard(date '2026-07-01');
  if v_board->>'unlocked' <> 'true'
    or (v_board->>'player_count')::integer <> 2
    or (
      select count(*)
      from jsonb_array_elements(v_board->'entries') entry
      where (entry->>'official_score')::integer in (4, 7)
    ) <> 2 then
    raise exception 'legacy daily leaderboard eligibility or native scores changed: %', v_board;
  end if;

  update public.find_leader_history
  set best_score = 10,
      attempts = 4,
      updated_at = timestamptz '2026-07-01 18:10:00+00'
  where profile_id = v_one
    and day = date '2026-07-01';

  select *
  into v_row
  from public.list_my_find_leader_history()
  where day = date '2026-07-01';

  if v_row.official_score <> 4
    or v_row.best_score <> 10
    or v_row.attempts <> 4
    or v_row.updated_at <> timestamptz '2026-07-01 18:10:00+00' then
    raise exception 'temporary PR 8 compatibility writes no longer preserve official-first integrity: %', row_to_json(v_row);
  end if;
end
$$;
